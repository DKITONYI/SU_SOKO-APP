import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
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
import ProductCard from "../../components/ProductCard";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { usePaymentStatus } from "../../hooks/usePaymentStatus";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import { getProductById, SellerProduct } from "../../services/productService";
import { sendMessage } from "../../services/messageService";
import { payForProduct } from "../../services/paymentService";
import { getUserProfileById } from "../../services/userService";
import { User } from "../../types/marketplace";

type ScreenRoute = RouteProp<BuyerStackParamList, "ProductDetails">;
type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;

export default function ProductDetails() {
  const navigation = useNavigation<NavigationProp>();
  const goBack = useBackNavigation("Home");
  const route = useRoute<ScreenRoute>();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [seller, setSeller] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const { status, failureReason } = usePaymentStatus(paymentId);

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const productId = route.params?.productId;

        if (!productId) {
          throw new Error("Product ID is missing.");
        }

        const loadedProduct = await getProductById(productId);
        setProduct(loadedProduct);

        if (loadedProduct.seller_id) {
          setSeller(await getUserProfileById(loadedProduct.seller_id));
        }
      } catch (error: any) {
        Alert.alert("Product Failed", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProduct();
  }, [route.params?.productId]);

  const handleSendMessage = async () => {
    if (!product?.seller_id) {
      Alert.alert("Message Failed", "Seller information is missing.");
      return;
    }

    setSending(true);

    try {
      await sendMessage(product.id, product.seller_id, message);
      setMessage("");
      Alert.alert("Message Sent", "Your message was sent to the seller.");
      navigation.navigate("Chat", {
        productId: product.id,
        sellerId: product.seller_id,
      });
    } catch (error: any) {
      Alert.alert("Message Failed", error.message);
    } finally {
      setSending(false);
    }
  };

  const handlePurchase = async () => {
    if (!product?.id || !product.seller_id) {
      Alert.alert("Purchase Failed", "Product details are incomplete.");
      return;
    }

    setPaying(true);

    try {
      const payment = await payForProduct(
        phoneNumber,
        Number(product.price ?? 0),
        product.id,
        product.seller_id
      );
      setPaymentId(payment.paymentId);
      Alert.alert(
        "M-Pesa Prompt Sent",
        "Check your phone and enter your M-Pesa PIN to complete the purchase."
      );
    } catch (error: any) {
      Alert.alert("Purchase Failed", error.message);
    } finally {
      setPaying(false);
    }
  };

  useEffect(() => {
    if (status === "paid") {
      Alert.alert(
        "Purchase Complete",
        "Payment received. The product has been marked as sold."
      );
      setPaymentId(null);
    }

    if (status === "failed") {
      Alert.alert(
        "Payment Failed",
        failureReason || "The M-Pesa payment was cancelled or failed."
      );
      setPaymentId(null);
    }
  }, [failureReason, status]);

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {product ? (
            <ProductCard
              product={product}
              seller={seller}
              onStartChat={() =>
                navigation.navigate("Chat", {
                  productId: product.id,
                  sellerId: product.seller_id,
                })
              }
            />
          ) : null}

          <Text style={styles.description}>
            {product?.description || "No description provided."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.messageTitle}>Complete Purchase</Text>
          <TextInput
            style={styles.phoneInput}
            placeholder="M-Pesa phone number e.g. 0712345678"
            placeholderTextColor={Colors.gray}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
          {status === "stk_sent" ? (
            <Text style={styles.statusText}>
              Waiting for M-Pesa confirmation...
            </Text>
          ) : null}
          <CustomButton
            title="BUY WITH M-PESA"
            onPress={handlePurchase}
            loading={paying}
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.messageTitle}>Message Seller</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Ask about price, availability, pickup..."
            placeholderTextColor={Colors.gray}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <CustomButton
            title="SEND MESSAGE"
            onPress={handleSendMessage}
            loading={sending}
          />
        </View>
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
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 18, elevation: 3, marginBottom: 14 },
  description: { color: Colors.black, fontSize: 15, lineHeight: 21, marginTop: 12 },
  messageTitle: { color: Colors.primary, fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  messageInput: {
    borderColor: Colors.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.black,
    minHeight: 90,
    padding: 12,
    textAlignVertical: "top",
  },
  phoneInput: {
    borderColor: Colors.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    color: Colors.black,
    minHeight: 48,
    paddingHorizontal: 12,
  },
  statusText: {
    color: Colors.success,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
  },
});
