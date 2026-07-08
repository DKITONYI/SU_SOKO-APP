import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { approveProduct, getPendingProducts, rejectProduct, SellerProduct } from "../../services/productService";
import { useBackNavigation } from "../../hooks/useBackNavigation";

export default function AdminListings() {
  const goBack = useBackNavigation("AdminDashboard");
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState("");

  const loadProducts = async () => {
    setLoading(true);
    try {
      setProducts(await getPendingProducts());
    } catch (error: any) {
      Alert.alert("Listings Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleApprove = async (productId: string) => {
    setActionId(productId);

    try {
      await approveProduct(productId);
      Alert.alert("Listing Approved", "The product is now active and visible to buyers.");
      await loadProducts();
    } catch (error: any) {
      Alert.alert("Approval Failed", error.message);
    } finally {
      setActionId("");
    }
  };

  const handleReject = async (productId: string) => {
    setActionId(productId);

    try {
      await rejectProduct(productId, "Rejected by admin");
      Alert.alert("Listing Rejected", "The product was removed from pending listings.");
      await loadProducts();
    } catch (error: any) {
      Alert.alert("Rejection Failed", error.message);
    } finally {
      setActionId("");
    }
  };

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView>
        <Text style={styles.title}>Pending Listings</Text>
        {products.length === 0 ? (
          <Text style={styles.empty}>No pending listings.</Text>
        ) : products.map((product) => (
          <View key={product.id} style={styles.card}>
            <Text style={styles.cardTitle}>{product.title}</Text>
            <Text style={styles.text}>{product.category}</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.approve, actionId === product.id && styles.disabled]}
                disabled={actionId === product.id}
                onPress={() => handleApprove(product.id)}
              >
                <Text style={styles.buttonText}>
                  {actionId === product.id ? "Working..." : "Approve"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.reject, actionId === product.id && styles.disabled]}
                disabled={actionId === product.id}
                onPress={() => handleReject(product.id)}
              >
                <Text style={styles.buttonText}>Reject</Text>
              </TouchableOpacity>
            </View>
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
  empty: { color: Colors.gray },
  card: { backgroundColor: Colors.white, borderRadius: 8, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { color: Colors.black, fontSize: 18, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 4 },
  row: { flexDirection: "row", gap: 10, marginTop: 14 },
  approve: { flex: 1, backgroundColor: Colors.success, borderRadius: 10, padding: 12, alignItems: "center" },
  reject: { flex: 1, backgroundColor: Colors.danger, borderRadius: 10, padding: 12, alignItems: "center" },
  disabled: { opacity: 0.7 },
  buttonText: { color: Colors.white, fontWeight: "bold" },
});
