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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "../../components/CustomButton";
import Loading from "../../components/Loading";
import Colors from "../../constants/Colors";
import { auth } from "../../firebase/firebaseConfig";
import { SellerStackParamList } from "../../navigation/SellerNavigator";
import { getMyMessages, sendMessage } from "../../services/messageService";
import { Message } from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

export default function SellerMessages() {
  const navigation = useNavigation<NavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeMessage, setActiveMessage] = useState<Message | null>(null);
  const [newProductId, setNewProductId] = useState("");
  const [newReceiverId, setNewReceiverId] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("SellerDashboard");
  };

  const loadMessages = async () => {
    setLoading(true);

    try {
      setMessages(await getMyMessages());
    } catch (error: any) {
      Alert.alert("Messages Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const handleReply = async () => {
    if (!activeMessage) {
      return;
    }

    const currentUid = auth.currentUser?.uid;
    const receiverId =
      activeMessage.sender_id === currentUid
        ? activeMessage.receiver_id
        : activeMessage.sender_id;

    setSending(true);

    try {
      await sendMessage(activeMessage.product_id, receiverId, reply);
      setReply("");
      setActiveMessage(null);
      await loadMessages();
    } catch (error: any) {
      Alert.alert("Reply Failed", error.message);
    } finally {
      setSending(false);
    }
  };

  const handleStartNewChat = async () => {
    setSending(true);

    try {
      await sendMessage(newProductId, newReceiverId, newMessage);
      setNewMessage("");
      await loadMessages();
      Alert.alert("Message Sent", "Your new chat has been started.");
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

      <Text style={styles.title}>Messages</Text>

      <View style={styles.startCard}>
        <Text style={styles.replyTitle}>Start New Chat</Text>
        <TextInput
          style={styles.replyInput}
          placeholder="Product ID"
          placeholderTextColor={Colors.gray}
          value={newProductId}
          onChangeText={setNewProductId}
        />
        <TextInput
          style={styles.replyInput}
          placeholder="Buyer user ID"
          placeholderTextColor={Colors.gray}
          value={newReceiverId}
          onChangeText={setNewReceiverId}
        />
        <TextInput
          style={styles.replyInput}
          placeholder="Message"
          placeholderTextColor={Colors.gray}
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <CustomButton title="START CHAT" onPress={handleStartNewChat} loading={sending} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {messages.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No messages yet</Text>
            <Text style={styles.emptyText}>Buyer inquiries will appear here.</Text>
          </View>
        ) : (
          messages.map((message) => {
            const mine = message.sender_id === auth.currentUser?.uid;

            return (
              <TouchableOpacity
                key={message.id}
                style={styles.card}
                onPress={() => setActiveMessage(message)}
              >
                <Text style={styles.messageMeta}>{mine ? "You replied" : "Buyer inquiry"}</Text>
                <Text style={styles.messageBody}>{message.body}</Text>
                <Text style={styles.productId}>Product: {message.product_id}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {activeMessage ? (
        <View style={styles.replyCard}>
          <Text style={styles.replyTitle}>Reply</Text>
          <TextInput
            style={styles.replyInput}
            placeholder="Write your reply..."
            placeholderTextColor={Colors.gray}
            value={reply}
            onChangeText={setReply}
          />
          <CustomButton title="SEND REPLY" onPress={handleReply} loading={sending} />
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
  startCard: { backgroundColor: Colors.white, borderRadius: 12, elevation: 3, padding: 12, marginBottom: 14 },
  card: { backgroundColor: Colors.white, borderRadius: 12, elevation: 3, marginBottom: 12, padding: 16 },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  emptyText: { color: Colors.gray, marginTop: 6 },
  messageMeta: { color: Colors.primary, fontSize: 13, fontWeight: "bold" },
  messageBody: { color: Colors.black, fontSize: 15, marginTop: 6 },
  productId: { color: Colors.gray, fontSize: 12, marginTop: 8 },
  replyCard: { backgroundColor: Colors.white, borderRadius: 12, elevation: 3, padding: 12 },
  replyTitle: { color: Colors.primary, fontSize: 16, fontWeight: "bold", marginBottom: 8 },
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
