import React, { useEffect, useState } from "react";
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

import Loading from "../../components/Loading";
import Colors from "../../constants/Colors";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import {
  SellerSaleReport,
  subscribeToSellerSalesReport,
} from "../../services/reportingService";

export default function SellerSalesReport() {
  const goBack = useBackNavigation("SellerDashboard");
  const [report, setReport] = useState<SellerSaleReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeToSellerSalesReport(
      (liveReport) => {
        setReport(liveReport);
        setLoading(false);
      },
      (error: any) => {
        Alert.alert("Report Failed", error.message ?? "Unable to load report.");
        setLoading(false);
      }
    );

    return unsubscribe;
  }, []);

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
        <Text style={styles.title}>Goods Purchased Report</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{report?.itemCount ?? 0}</Text>
            <Text style={styles.summaryLabel}>Goods Sold</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>KES {report?.totalAmount ?? 0}</Text>
            <Text style={styles.summaryLabel}>Total Collected</Text>
          </View>
        </View>

        {report?.items.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No purchases yet</Text>
            <Text style={styles.text}>
              Paid purchases for your products will appear here.
            </Text>
          </View>
        ) : (
          report?.items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.cardTitle}>{item.product_title}</Text>
              <Text style={styles.text}>Amount: KES {item.amount}</Text>
              <Text style={styles.text}>Buyer: {item.buyer_name}</Text>
            </View>
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
  summaryRow: { gap: 12, marginBottom: 14 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    padding: 16,
  },
  summaryNumber: { color: Colors.primary, fontSize: 24, fontWeight: "bold" },
  summaryLabel: { color: Colors.gray, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  cardTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 6 },
});
