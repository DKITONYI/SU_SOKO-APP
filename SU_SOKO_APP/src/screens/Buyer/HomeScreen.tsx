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
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { useAuth } from "../../context/AuthContext";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import { getActiveProducts, SellerProduct } from "../../services/productService";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;
type MenuRoute = keyof BuyerStackParamList;

const menuItems: Array<{
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  route: MenuRoute;
}> = [
  { label: "Dashboard", icon: "grid-outline", route: "Home" },
  { label: "Browse", icon: "search-outline", route: "Search" },
  { label: "Messages", icon: "chatbubble-outline", route: "Chat" },
  { label: "Feedback", icon: "star-outline", route: "Feedback" },
  { label: "Profile", icon: "person-outline", route: "Profile" },
  { label: "Sign Out", icon: "log-out-outline", route: "BuyerSignOut" },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { profile } = useAuth();
  const firstName = profile?.fullName?.split(" ")[0] || "Buyer";
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setProducts(await getActiveProducts());
      } catch (error: any) {
        Alert.alert("Products Failed", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const goTo = (route: MenuRoute) => {
    navigation.navigate(route as never);
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.layout}>
        <View style={styles.sidebar}>
          <Text style={styles.brand}>SU SOKO</Text>
          <Text style={styles.sideTitle}>Buyer</Text>

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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hey {firstName}</Text>
            <Text style={styles.title}>Buyer Dashboard</Text>
          </View>

          <TouchableOpacity
            style={styles.searchBox}
            onPress={() => navigation.navigate("Search")}
          >
            <Text style={styles.searchText}>Search products...</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Active Listings</Text>

          {products.length === 0 ? (
            <View style={styles.productCard}>
              <Text style={styles.productTitle}>No active products yet</Text>
              <Text style={styles.productText}>Approved listings will appear here.</Text>
            </View>
          ) : (
            products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    productId: product.id,
                    sellerId: product.seller_id,
                  })
                }
              >
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productText}>{product.category}</Text>
                <Text style={styles.price}>KES {product.price ?? 0}</Text>
              </TouchableOpacity>
            ))
          )}
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
  greeting: {
    fontSize: 16,
    color: Colors.gray,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 4,
  },
  searchBox: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 18,
    elevation: 3,
  },
  searchText: {
    color: Colors.gray,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: Colors.primary,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    marginBottom: 12,
    elevation: 3,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: Colors.black,
  },
  productText: {
    color: Colors.gray,
  },
  price: {
    color: Colors.primary,
    fontWeight: "bold",
    marginTop: 6,
  },
});
