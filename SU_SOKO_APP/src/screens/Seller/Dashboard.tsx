import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { collection, onSnapshot, query, where } from "firebase/firestore";

import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/firebaseConfig";
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
  { label: "Sales Report", icon: "bar-chart-outline", route: "SellerSalesReport" },
  { label: "Subscription", icon: "card-outline", route: "Subscription" },
  { label: "Profile", icon: "person-outline", route: "SellerProfile" },
  { label: "Sign Out", icon: "log-out-outline", route: "SellerSignOut" },
];

export default function SellerDashboard() {
  const navigation = useNavigation<NavigationProp>();
  const { profile, user } = useAuth();
  const [activeProductCount, setActiveProductCount] = useState(0);
  const [countLoading, setCountLoading] = useState(true);
  const [countError, setCountError] = useState("");
  const [messageCount, setMessageCount] = useState(0);
  const [messageCountLoading, setMessageCountLoading] = useState(true);
  const [messageCountError, setMessageCountError] = useState("");
  const firstName = profile?.fullName?.split(" ")[0] || "Seller";

  useEffect(() => {
    if (!user?.uid) {
      setActiveProductCount(0);
      setCountLoading(false);
      return;
    }

    setCountLoading(true);
    setCountError("");

    const productsQuery = query(
      collection(db, "products"),
      where("seller_id", "==", user.uid),
      where("status", "==", "active")
    );

    const unsubscribe = onSnapshot(
      productsQuery,
      (snapshot) => {
        setActiveProductCount(snapshot.size);
        setCountLoading(false);
      },
      (error) => {
        console.log("Failed to load active product count:", error);
        setCountError("Unable to load products");
        setCountLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) {
      setMessageCount(0);
      setMessageCountLoading(false);
      return;
    }

    setMessageCountLoading(true);
    setMessageCountError("");

    const messagesQuery = query(
      collection(db, "messages"),
      where("receiver_id", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        setMessageCount(snapshot.size);
        setMessageCountLoading(false);
      },
      (error) => {
        console.log("Failed to load received message count:", error);
        setMessageCountError("Unable to load messages");
        setMessageCountLoading(false);
      }
    );

    return unsubscribe;
  }, [user?.uid]);

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
              {countLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.number}>{activeProductCount}</Text>
              )}
              <Text style={styles.label}>Active Products</Text>
              {countError ? <Text style={styles.errorText}>{countError}</Text> : null}
             </View>

            <View style={styles.card}>
              {messageCountLoading ? (
                <ActivityIndicator color={Colors.primary} />
              ) : (
                <Text style={styles.number}>{messageCount}</Text>
              )}
              <Text style={styles.label}>Messages</Text>
              {messageCountError ? (
                <Text style={styles.errorText}>{messageCountError}</Text>
              ) : null}
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
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
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
