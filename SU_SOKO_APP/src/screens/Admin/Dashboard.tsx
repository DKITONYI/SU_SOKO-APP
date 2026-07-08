import React from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import { AdminStackParamList } from "../../navigation/AdminNavigator";
import { logoutUser } from "../../services/authService";

type NavigationProp = NativeStackNavigationProp<AdminStackParamList>;
type AdminRoute = keyof AdminStackParamList;

const adminLinks: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: AdminRoute;
}> = [
  { label: "Dashboard", icon: "grid-outline", route: "AdminDashboard" },
  { label: "Users", icon: "people-outline", route: "AdminUsers" },
  { label: "Listings", icon: "list-outline", route: "AdminListings" },
  { label: "Reports", icon: "flag-outline", route: "AdminReports" },
  { label: "Payments", icon: "card-outline", route: "AdminSubscriptions" },
];

export default function AdminDashboard() {
  const navigation = useNavigation<NavigationProp>();

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (error: any) {
      Alert.alert("Logout Failed", error.message ?? "Please try again.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.sidebar}>
        <Text style={styles.brand}>SU SOKO</Text>
        <Text style={styles.sideTitle}>Admin</Text>

        {adminLinks.map((link) => (
          <TouchableOpacity
            key={link.route}
            style={[
              styles.navButton,
              link.route === "AdminDashboard" && styles.navButtonActive,
            ]}
            onPress={() => navigation.navigate(link.route)}
          >
            <Ionicons name={link.icon} size={18} color={Colors.white} />
            <Text style={styles.navText}>{link.label}</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color={Colors.white} />
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>Manage SU SOKO activity</Text>

        <View style={styles.grid}>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminUsers")}>
            <Ionicons name="people-outline" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Users</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminListings")}>
            <Ionicons name="list-outline" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Listings</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminReports")}>
            <Ionicons name="flag-outline" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate("AdminSubscriptions")}>
            <Ionicons name="card-outline" size={24} color={Colors.primary} />
            <Text style={styles.cardTitle}>Subscriptions</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, flexDirection: "row" },
  sidebar: {
    width: 132,
    backgroundColor: Colors.primary,
    paddingHorizontal: 12,
    paddingTop: 24,
    paddingBottom: 16,
  },
  brand: { color: Colors.white, fontSize: 18, fontWeight: "bold" },
  sideTitle: { color: Colors.white, opacity: 0.75, marginTop: 2, marginBottom: 20 },
  navButton: {
    alignItems: "center",
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  navButtonActive: { backgroundColor: "rgba(255,255,255,0.18)" },
  navText: { color: Colors.white, flexShrink: 1, fontSize: 13, fontWeight: "700" },
  spacer: { flex: 1 },
  logoutButton: {
    alignItems: "center",
    backgroundColor: Colors.danger,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  content: { flex: 1, padding: 20 },
  title: { color: Colors.primary, fontSize: 30, fontWeight: "bold", marginTop: 30 },
  subtitle: { color: Colors.gray, fontSize: 16, marginTop: 6, marginBottom: 20 },
  grid: { gap: 12 },
  card: { backgroundColor: Colors.white, borderRadius: 8, padding: 20, elevation: 3, gap: 8 },
  cardTitle: { color: Colors.black, fontSize: 18, fontWeight: "bold" },
});
