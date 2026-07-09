import React, { useEffect, useState } from "react";
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
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import CustomButton from "../../components/CustomButton";
import { auth } from "../../firebase/firebaseConfig";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import {
  getMessagesForConversation,
  markConversationAsRead,
  sendMessage,
} from "../../services/messageService";
import { getUserProfileById } from "../../services/userService";
import { Message } from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;
type ScreenRoute = RouteProp<BuyerStackParamList, "Chat">;

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ScreenRoute>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [sellerName, setSellerName] = useState("Seller");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("BuyerInbox");
  };

  const loadMessages = async () => {
    setLoading(true);

    try {
      if (route.params?.productId && route.params?.sellerId) {
        await markConversationAsRead(route.params.productId, route.params.sellerId);
        setMessages(
          await getMessagesForConversation(route.params.productId, route.params.sellerId)
        );
      } else {
        setMessages([]);
      }
    } catch (error: any) {
      Alert.alert("Messages Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [route.params?.productId, route.params?.sellerId]);

  useEffect(() => {
    const loadSellerName = async () => {
      if (!route.params?.sellerId) {
        setSellerName("Seller");
        return;
      }

      const seller = await getUserProfileById(route.params.sellerId).catch(() => null);
      setSellerName(seller?.fullName || seller?.email || "Seller");
    };

    loadSellerName();
  }, [route.params?.sellerId]);

  const handleReply = async () => {
    const productId = route.params?.productId;
    const receiverId = route.params?.sellerId;

    if (!productId || !receiverId) {
      Alert.alert("Reply Unavailable", "Open a product first to message its seller.");
      return;
    }

    setSending(true);

    try {
      await sendMessage(productId, receiverId, reply);
      setReply("");
      await loadMessages();
    } catch (error: any) {
      Alert.alert("Message Failed", error.message);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{route.params?.sellerId ? sellerName : "Messages"}</Text>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Open a product or inbox chat to start messaging.</Text>
          </View>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === auth.currentUser?.uid;

            return (
              <View
                key={message.id}
                style={[styles.bubble, mine ? styles.mine : styles.theirs]}
              >
                <Text style={[styles.bubbleMeta, mine && styles.mineMeta]}>
                  {mine ? "You" : sellerName}
                </Text>
                <Text style={[styles.bubbleText, mine && styles.mineText]}>
                  {message.body}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {route.params?.productId && route.params?.sellerId ? (
        <View style={styles.replyCard}>
          <TextInput
            style={styles.replyInput}
            placeholder="Write a reply..."
            placeholderTextColor={Colors.gray}
            value={reply}
            onChangeText={setReply}
          />
          <CustomButton
            title="SEND"
            onPress={handleReply}
            loading={sending}
          />
        </View>
      ) : null}
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
  list: { flex: 1, minHeight: 0 },
  listContent: { paddingBottom: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 18, elevation: 3 },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  emptyText: { color: Colors.gray, marginTop: 6 },
  bubble: { borderRadius: 12, marginBottom: 10, maxWidth: "88%", padding: 12 },
  mine: { alignSelf: "flex-end", backgroundColor: Colors.primary },
  theirs: { alignSelf: "flex-start", backgroundColor: Colors.white },
  bubbleMeta: { color: Colors.gray, fontSize: 12, marginBottom: 4 },
  bubbleText: { color: Colors.black },
  mineMeta: { color: Colors.lightGray },
  mineText: { color: Colors.white },
  replyCard: { backgroundColor: Colors.white, borderRadius: 12, elevation: 3, padding: 12 },
  replyInput: {
    borderColor: Colors.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.black,
    minHeight: 48,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
});
