import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { SellerStackParamList } from "../../navigation/SellerNavigator";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;
type MenuRoute = keyof SellerStackParamList;

const menuItems: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: MenuRoute;
}> = [
  { label: "Dashboard", icon: "grid-outline", route: "SellerDashboard" },
  { label: "New Product", icon: "add-circle-outline", route: "AddProduct" },
  { label: "My Products", icon: "cube-outline", route: "MyProducts" },
  { label: "Edit Product", icon: "create-outline", route: "EditProduct" },
  { label: "Messages", icon: "chatbubble-outline", route: "SellerMessages" },
  { label: "Subscription", icon: "card-outline", route: "Subscription" },
  { label: "Profile", icon: "person-outline", route: "SellerProfile" },
  { label: "Sign Out", icon: "log-out-outline", route: "SellerSignOut" },
];

export default function SellerDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const firstName = profile?.fullName?.split(" ")[0] || "Seller";

  const goTo = (route: MenuRoute) => {
    navigation.navigate(route as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layout}>
        <View style={styles.sidebar}>
          <Text style={styles.brand}>SU SOKO</Text>
          <Text style={styles.sideTitle}>Seller</Text>

          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.route}
              style={styles.navButton}
              onPress={() => goTo(item.route)}
            >
              <Ionicons name={item.icon} size={19} color={Colors.white} />
              <Text style={styles.navText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.welcome}>Hey {firstName}</Text>
            <Text style={styles.title}>Seller Dashboard</Text>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.card}>
              <Text style={styles.number}>0</Text>
              <Text style={styles.label}>Products Listed</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.number}>0</Text>
              <Text style={styles.label}>Messages</Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.number}>0</Text>
              <Text style={styles.label}>Saved by Buyers</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Seller Tools</Text>
            <Text style={styles.infoText}>
              Use the sidebar to add listings, manage products, view your profile, and sign out.
            </Text>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  layout: {
    flex: 1,
    flexDirection: "row",
  },
  sidebar: {
    width: 132,
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 22,
  },
  brand: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  sideTitle: {
    color: Colors.secondary,
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 20,
    marginTop: 4,
  },
  navButton: {
    minHeight: 44,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  navText: {
    color: Colors.white,
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 18,
  },
  header: {
    marginBottom: 18,
  },
  welcome: {
    color: Colors.gray,
    fontSize: 16,
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 4,
  },
  statsGrid: {
    gap: 12,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    elevation: 3,
  },
  number: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
  },
  label: {
    color: Colors.gray,
    fontSize: 15,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    elevation: 3,
    marginTop: 14,
  },
  infoTitle: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: "bold",
  },
  infoText: {
    color: Colors.gray,
    fontSize: 15,
    marginTop: 6,
  },
});
