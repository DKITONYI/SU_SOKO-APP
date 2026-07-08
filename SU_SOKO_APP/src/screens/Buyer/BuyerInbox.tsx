import React, { useCallback, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Loading from "../../components/Loading";
import Colors from "../../constants/Colors";
import { auth } from "../../firebase/firebaseConfig";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import { getMyMessages } from "../../services/messageService";
import { getProductById, SellerProduct } from "../../services/productService";
import { getUserProfileById } from "../../services/userService";
import { Message, User } from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;

type Conversation = {
  key: string;
  productId: string;
  sellerId: string;
  sellerName: string;
  sellerNumber?: string;
  productTitle: string;
  productNumber?: number;
  lastMessage: string;
  updatedAt: number;
  unreadCount: number;
};

const getMessageTime = (message: Message) => message.created_at?.toMillis?.() ?? 0;

export default function BuyerInbox() {
  const navigation = useNavigation<NavigationProp>();
  const goBack = useBackNavigation("Home");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInbox = useCallback(async () => {
    setLoading(true);

    try {
      const currentUid = auth.currentUser?.uid;

      if (!currentUid) {
        throw new Error("You must be logged in to view messages.");
      }

      const messages = await getMyMessages();
      const productCache = new Map<string, SellerProduct | null>();
      const sellerCache = new Map<string, User | null>();
      const grouped = new Map<string, Conversation>();

      for (const message of messages) {
        if (!productCache.has(message.product_id)) {
          const product = await getProductById(message.product_id).catch(() => null);
          productCache.set(message.product_id, product);
        }

        const product = productCache.get(message.product_id);
        const sellerId =
          product?.seller_id ||
          (message.sender_id === currentUid ? message.receiver_id : message.sender_id);

        if (!sellerId) {
          continue;
        }

        if (!sellerCache.has(sellerId)) {
          const seller = await getUserProfileById(sellerId).catch(() => null);
          sellerCache.set(sellerId, seller);
        }

        const seller = sellerCache.get(sellerId);
        const key = `${message.product_id}:${sellerId}`;
        const messageTime = getMessageTime(message);
        const existing = grouped.get(key);
        const unreadIncrement =
          message.receiver_id === currentUid && !message.read ? 1 : 0;

        if (!existing || messageTime >= existing.updatedAt) {
          grouped.set(key, {
            key,
            productId: message.product_id,
            sellerId,
            sellerName: seller?.fullName || seller?.email || "Seller",
            sellerNumber: seller?.user_number,
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
      Alert.alert("Inbox Failed", error.message ?? "Unable to load inbox.");
    } finally {
      setLoading(false);
    }
  }, []);

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

      <Text style={styles.title}>Inbox</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {conversations.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptyText}>
              Open a product and message its seller to start a chat.
            </Text>
          </View>
        ) : (
          conversations.map((conversation) => (
            <TouchableOpacity
              key={conversation.key}
              style={styles.card}
              onPress={() =>
                navigation.navigate("Chat", {
                  productId: conversation.productId,
                  sellerId: conversation.sellerId,
                })
              }
            >
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.textBlock}>
                  <Text style={styles.sellerName}>
                    {conversation.sellerName}
                    {conversation.sellerNumber ? ` #${conversation.sellerNumber}` : ""}
                  </Text>
                  <Text style={styles.productTitle}>
                    {conversation.productTitle}
                    {conversation.productNumber ? ` - Product ${conversation.productNumber}` : ""}
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
  sellerName: { color: Colors.black, fontSize: 16, fontWeight: "bold" },
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
});
