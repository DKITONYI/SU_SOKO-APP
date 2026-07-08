import React, { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { getPendingReports, markReportReviewed } from "../../services/reportService";
import { Report } from "../../types/marketplace";

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReports = async () => {
    setLoading(true);
    try {
      setReports(await getPendingReports());
    } catch (error: any) {
      Alert.alert("Reports Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  if (loading) return <Loading />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Reports</Text>
        {reports.length === 0 ? (
          <Text style={styles.empty}>No pending reports.</Text>
        ) : reports.map((report) => (
          <View key={report.id} style={styles.card}>
            <Text style={styles.cardTitle}>{report.reason}</Text>
            <Text style={styles.text}>Product: {report.product_id}</Text>
            <TouchableOpacity style={styles.button} onPress={async () => { await markReportReviewed(report.id); loadReports(); }}>
              <Text style={styles.buttonText}>Mark Reviewed</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold", marginBottom: 16 },
  empty: { color: Colors.gray },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 16, marginBottom: 12, elevation: 3 },
  cardTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 6 },
  button: { backgroundColor: Colors.primary, borderRadius: 10, padding: 12, marginTop: 12, alignItems: "center" },
  buttonText: { color: Colors.white, fontWeight: "bold" },
});
