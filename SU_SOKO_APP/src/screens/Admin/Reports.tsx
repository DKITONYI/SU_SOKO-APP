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

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { getPendingReports, markReportReviewed } from "../../services/reportService";
import {
  getSubscriptionRevenueReport,
  SubscriptionRevenueReport,
} from "../../services/reportingService";
import { getAllProductReviews, getRatingLabel } from "../../services/reviewService";
import { getSellerSubscriptions } from "../../services/subscriptionService";
import { ProductReview, Report, User } from "../../types/marketplace";
import { useBackNavigation } from "../../hooks/useBackNavigation";

export default function AdminReports() {
  const goBack = useBackNavigation("AdminDashboard");
  const [reports, setReports] = useState<Report[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [sellers, setSellers] = useState<User[]>([]);
  const [subscriptionReport, setSubscriptionReport] =
    useState<SubscriptionRevenueReport | null>(null);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);

    try {
      const [pendingReports, productReviews, sellerAccounts, revenueReport] =
        await Promise.all([
          getPendingReports(),
          getAllProductReviews(),
          getSellerSubscriptions(),
          getSubscriptionRevenueReport(),
        ]);

      setReports(pendingReports);
      setReviews(productReviews);
      setSellers(sellerAccounts);
      setSubscriptionReport(revenueReport);
    } catch (error: any) {
      Alert.alert("Reports Failed", error.message ?? "Unable to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) {
    return <Loading />;
  }

  const activeSellers = sellers.filter(
    (seller) => seller.subscription_status === "active"
  );
  const lowFeedback = reviews.filter((review) => review.rating === 1);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Reports</Text>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{reports.length}</Text>
            <Text style={styles.summaryLabel}>Pending Product Reports</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{reviews.length}</Text>
            <Text style={styles.summaryLabel}>Product Feedbacks</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>{activeSellers.length}</Text>
            <Text style={styles.summaryLabel}>Active Seller Accounts</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryNumber}>
              KES {subscriptionReport?.totalAmount ?? 0}
            </Text>
            <Text style={styles.summaryLabel}>Subscription Revenue</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Pending Product Reports</Text>
        {reports.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No pending reports</Text>
            <Text style={styles.text}>Reported products will appear here.</Text>
          </View>
        ) : (
          reports.map((report) => (
            <View key={report.id} style={styles.card}>
              <Text style={styles.cardTitle}>{report.product_title ?? "Product"}</Text>
              <Text style={styles.text}>Reporter: {report.reporter_name ?? "User"}</Text>
              <Text style={styles.text}>Seller: {report.seller_name ?? "Seller"}</Text>
              <Text style={styles.reason}>{report.reason}</Text>
              <TouchableOpacity
                style={styles.button}
                onPress={async () => {
                  await markReportReviewed(report.id);
                  await loadReports();
                }}
              >
                <Text style={styles.buttonText}>Mark Reviewed</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Buyer Product Feedback</Text>
        {reviews.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No feedback yet</Text>
            <Text style={styles.text}>Buyer product ratings will appear here.</Text>
          </View>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.card}>
              <Text style={styles.cardTitle}>{review.product_title}</Text>
              <Text style={styles.text}>Buyer: {review.buyer_name ?? "Buyer"}</Text>
              <Text
                style={[
                  styles.ratingText,
                  review.rating === 1 && styles.lowRatingText,
                ]}
              >
                Rating: {review.rating}/3 - {getRatingLabel(review.rating)}
              </Text>
              {review.rating === 1 ? (
                <Text style={styles.warningText}>
                  Low quality feedback. Review this seller account if complaints continue.
                </Text>
              ) : null}
            </View>
          ))
        )}

        <Text style={styles.sectionTitle}>Subscribed Seller Accounts</Text>
        {sellers.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No seller accounts yet</Text>
            <Text style={styles.text}>Seller subscription records will appear here.</Text>
          </View>
        ) : (
          sellers.map((seller) => {
            const sellerLowFeedbackCount = lowFeedback.filter(
              (review) => review.seller_id === seller.uid
            ).length;

            return (
              <View key={seller.uid} style={styles.card}>
                <Text style={styles.cardTitle}>
                  {seller.fullName ?? seller.email ?? "Seller"}
                </Text>
                <Text style={styles.text}>Email: {seller.email ?? "No email provided"}</Text>
                <Text style={styles.text}>Subscription: {seller.subscription_status}</Text>
                <Text style={styles.text}>
                  Low quality feedbacks: {sellerLowFeedbackCount}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  backText: { color: Colors.primary, fontWeight: "bold" },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  summaryRow: { gap: 12, marginBottom: 18 },
  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    padding: 16,
  },
  summaryNumber: { color: Colors.primary, fontSize: 24, fontWeight: "bold" },
  summaryLabel: { color: Colors.gray, marginTop: 4 },
  sectionTitle: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 6,
  },
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
  reason: { color: Colors.black, fontWeight: "600", marginTop: 8 },
  ratingText: { color: Colors.primary, fontWeight: "bold", marginTop: 8 },
  lowRatingText: { color: Colors.danger },
  warningText: { color: Colors.danger, fontWeight: "600", marginTop: 6 },
  button: {
    alignItems: "center",
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
  },
  buttonText: { color: Colors.white, fontWeight: "bold" },
});
