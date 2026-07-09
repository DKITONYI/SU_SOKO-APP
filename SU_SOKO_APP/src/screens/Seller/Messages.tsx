import React, { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import Colors from "../../constants/Colors";
import { auth } from "../../firebase/firebaseConfig";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { SellerStackParamList } from "../../navigation/SellerNavigator";
import {
  getMessagesForConversation,
  getMyMessages,
  markConversationAsRead,
  sendMessage,
} from "../../services/messageService";
import { getProductById, SellerProduct } from "../../services/productService";
import { getUserProfileById } from "../../services/userService";
import { Message, User } from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

type Conversation = {
  key: string;
  productId: string;
  buyerId: string;
  buyerName: string;
  buyerNumber?: string;
  productTitle: string;
  productNumber?: number;
  lastMessage: string;
  updatedAt: number;
  unreadCount: number;
};

const getMessageTime = (message: Message) => message.created_at?.toMillis?.() ?? 0;

export default function SellerMessages() {
  const navigation = useNavigation<NavigationProp>();
  const goBack = useBackNavigation("SellerDashboard");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const loadInbox = useCallback(async () => {
    setLoading(true);

    try {
      const currentUid = auth.currentUser?.uid;

      if (!currentUid) {
        throw new Error("You must be logged in to view messages.");
      }

      const messages = await getMyMessages();
      const productCache = new Map<string, SellerProduct | null>();
      const buyerCache = new Map<string, User | null>();
      const grouped = new Map<string, Conversation>();

      for (const message of messages) {
        if (!productCache.has(message.product_id)) {
          const product = await getProductById(message.product_id).catch(() => null);
          productCache.set(message.product_id, product);
        }

        const product = productCache.get(message.product_id);

        if (product?.seller_id && product.seller_id !== currentUid) {
          continue;
        }

        const buyerId: string =
          message.sender_id === currentUid ? message.receiver_id : message.sender_id;

        if (!buyerId || buyerId === currentUid) {
          continue;
        }

        if (!buyerCache.has(buyerId)) {
          const buyer = await getUserProfileById(buyerId).catch(() => null);
          buyerCache.set(buyerId, buyer);
        }

        const buyer = buyerCache.get(buyerId);
        const key = `${message.product_id}:${buyerId}`;
        const messageTime = getMessageTime(message);
        const existing = grouped.get(key);
        const unreadIncrement =
          message.receiver_id === currentUid && !message.read ? 1 : 0;

        if (!existing || messageTime >= existing.updatedAt) {
          grouped.set(key, {
            key,
            productId: message.product_id,
            buyerId,
            buyerName: buyer?.fullName || buyer?.email || "Buyer",
            buyerNumber: buyer?.user_number,
            productTitle: product?.title || "Product",
            productNumber: product?.product_number,
            lastMessage: message.body,
            updatedAt: messageTime,
            unreadCount: (existing?.unreadCount ?? 0) + unreadIncrement,
          });
        } else if (unreadIncrement) {
          grouped.set(key, {
            ...existing,
            unreadCount: existing.unreadCount + unreadIncrement,
          });
        }
      }

      setConversations(
        Array.from(grouped.values()).sort(
          (first, second) => second.updatedAt - first.updatedAt
        )
      );
    } catch (error: any) {
      Alert.alert("Inbox Failed", error.message ?? "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, []);

  const openConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setConversationLoading(true);

    try {
      await markConversationAsRead(conversation.productId, conversation.buyerId);
      setConversationMessages(
        await getMessagesForConversation(conversation.productId, conversation.buyerId)
      );
      setSelectedConversation({ ...conversation, unreadCount: 0 });
      await loadInbox();
    } catch (error: any) {
      Alert.alert("Chat Failed", error.message ?? "Unable to open chat.");
    } finally {
      setConversationLoading(false);
    }
  };

  const handleReply = async () => {
    if (!selectedConversation) {
      return;
    }

    setSending(true);

    try {
      await sendMessage(
        selectedConversation.productId,
        selectedConversation.buyerId,
        reply
      );
      setReply("");
      await openConversation({ ...selectedConversation, unreadCount: 0 });
      await loadInbox();
    } catch (error: any) {
      Alert.alert("Reply Failed", error.message);
    } finally {
      setSending(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadInbox();
    }, [loadInbox])
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Messages</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No buyer chats yet</Text>
            <Text style={styles.emptyText}>Buyer inquiries will appear here.</Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.key}
              style={[
                styles.card,
                selectedConversation?.key === conversation.key && styles.activeCard,
              ]}
              onPress={() => openConversation(conversation)}
            >
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.personName}>
                    {conversation.buyerName}
                    {conversation.buyerNumber ? ` #${conversation.buyerNumber}` : ""}
                  </Text>
                  <Text style={styles.productTitle}>
                    {conversation.productTitle}
                    {conversation.productNumber
                      ? ` - Product ${conversation.productNumber}`
                      : ""}
                  </Text>
                </View>
                {conversation.unreadCount > 0 ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{conversation.unreadCount}</Text>
                  </View>
                ) : null}
              </View>

              <Text style={styles.preview} numberOfLines={2}>
                {conversation.lastMessage}
              </Text>
            </TouchableOpacity>
          ))
        )}

        {selectedConversation ? (
          <View style={styles.threadCard}>
            <Text style={styles.threadTitle}>
              Chat with {selectedConversation.buyerName}
            </Text>

            {conversationLoading ? (
              <Loading />
            ) : (
              conversationMessages.map((message) => {
                const mine = message.sender_id === auth.currentUser?.uid;

                return (
                  <View
                    key={message.id}
                    style={[styles.bubble, mine ? styles.mine : styles.theirs]}
                  >
                    <Text style={[styles.bubbleMeta, mine && styles.mineMeta]}>
                      {mine ? "You" : selectedConversation.buyerName}
                    </Text>
                    <Text style={[styles.bubbleText, mine && styles.mineText]}>
                      {message.body}
                    </Text>
                  </View>
                );
              })
            )}

            <TextInput
              style={styles.replyInput}
              placeholder="Write your reply..."
              placeholderTextColor={Colors.gray}
              value={reply}
              onChangeText={setReply}
            />
            <CustomButton
              title="SEND REPLY"
              onPress={handleReply}
              loading={sending}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: "bold" },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold", marginBottom: 14 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  activeCard: { borderColor: Colors.primary, borderWidth: 1 },
  row: { alignItems: "center", flexDirection: "row", gap: 10 },
  iconCircle: {
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  textBlock: { flex: 1 },
  personName: { color: Colors.black, fontSize: 16, fontWeight: "bold" },
  productTitle: { color: Colors.gray, fontSize: 13, marginTop: 2 },
  preview: { color: Colors.black, fontSize: 14, marginTop: 10 },
  badge: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 12,
    minWidth: 24,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },
  badgeText: { color: Colors.white, fontSize: 12, fontWeight: "bold" },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  emptyText: { color: Colors.gray, marginTop: 6 },
  threadCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    marginTop: 4,
    padding: 16,
  },
  threadTitle: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "bold",
    marginBottom: 12,
  },
  bubble: { borderRadius: 12, marginBottom: 10, maxWidth: "88%", padding: 12 },
  mine: { alignSelf: "flex-end", backgroundColor: Colors.primary },
  theirs: { alignSelf: "flex-start", backgroundColor: Colors.background },
  bubbleMeta: { color: Colors.gray, fontSize: 12, marginBottom: 4 },
  bubbleText: { color: Colors.black },
  mineMeta: { color: Colors.lightGray },
  mineText: { color: Colors.white },
  replyInput: {
    borderColor: Colors.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.black,
    minHeight: 48,
    marginTop: 8,
    paddingHorizontal: 12,
  },
});
