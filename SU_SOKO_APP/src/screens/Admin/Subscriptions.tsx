import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { getSellerSubscriptions, updateSellerSubscriptionStatus } from "../../services/subscriptionService";
import { User } from "../../types/marketplace";
import { useBackNavigation } from "../../hooks/useBackNavigation";

export default function AdminSubscriptions() {
  const goBack = useBackNavigation("AdminDashboard");
  const [sellers, setSellers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadSellers = async () => {
    setLoading(true);
    try {
      setSellers(await getSellerSubscriptions());
    } catch (error: any) {
      Alert.alert("Subscriptions Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellers();
  }, []);

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView>
        <Text style={styles.title}>Seller Subscriptions</Text>
        {sellers.map((seller) => (
          <View key={seller.uid} style={styles.card}>
            <Text style={styles.cardTitle}>{seller.fullName ?? seller.email ?? seller.uid}</Text>
            <Text style={styles.text}>Status: {seller.subscription_status}</Text>
            <TouchableOpacity
              style={styles.button}
              onPress={async () => {
                await updateSellerSubscriptionStatus(
                  seller.uid,
                  seller.subscription_status === "active" ? "inactive" : "active"
                );
                loadSellers();
              }}
            >
              <Text style={styles.buttonText}>
                Set {seller.subscription_status === "active" ? "Inactive" : "Active"}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 16 },
  backText: { color: Colors.primary, fontWeight: "bold" },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 8, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 6 },
  button: { backgroundColor: Colors.primary, borderRadius: 10, padding: 12, marginTop: 12, alignItems: "center" },
  buttonText: { color: Colors.white, fontWeight: "bold" },
});
