import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import { AdminStackParamList } from "../../navigation/AdminNavigator";

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;

export default function AdminDashboard() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text style={styles.subtitle}>Manage SU SOKO activity</Text>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminUsers")}>
          <Text style={styles.cardTitle}>Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminListings")}>
          <Text style={styles.cardTitle}>Listings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminReports")}>
          <Text style={styles.cardTitle}>Reports</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminSubscriptions")}>
          <Text style={styles.cardTitle}>Subscriptions</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  title: { color: Colors.primary, fontSize: 30, fontWeight: "bold", marginTop: 30 },
  subtitle: { color: Colors.gray, fontSize: 16, marginTop: 6, marginBottom: 20 },
  grid: { gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 20, elevation: 3 },
  cardTitle: { color: Colors.black, fontSize: 18, fontWeight: "bold" },
});
