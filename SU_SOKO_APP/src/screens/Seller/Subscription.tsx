import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import Colors from "../../constants/Colors";
import { SellerStackParamList } from "../../navigation/SellerNavigator";
import { paySellerSubscription } from "../../services/paymentService";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

export default function Subscription() {
  const navigation = useNavigation<NavigationProp>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("SellerDashboard");
  };

  const handlePaySubscription = async () => {
    setLoading(true);

    try {
      await paySellerSubscription(phoneNumber);
      Alert.alert(
        "M-Pesa Prompt Sent",
        "Check your phone and enter your M-Pesa PIN. Your subscription will activate after payment confirmation."
      );
    } catch (error: any) {
      Alert.alert("Payment Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Subscription</Text>
        <Text style={styles.plan}>Basic Seller</Text>
        <Text style={styles.text}>
          Pay the seller subscription fee with M-Pesa to enable product listings.
        </Text>
        <Text style={styles.amount}>KES 500</Text>

        <CustomInput
          label="M-Pesa Phone Number"
          placeholder="0712345678"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          leftIcon="call-outline"
        />

        <CustomButton
          title="PAY WITH M-PESA"
          onPress={handlePaySubscription}
          loading={loading}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 14,
  },
  plan: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: "bold",
  },
  text: {
    color: Colors.gray,
    fontSize: 15,
    marginTop: 8,
  },
  amount: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    marginTop: 14,
  },
});
