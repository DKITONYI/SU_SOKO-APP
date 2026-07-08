import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import { searchActiveProducts, SellerProduct } from "../../services/productService";
import { Category, PRODUCT_CATEGORIES } from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;
type CategoryFilter = Category | "all";

export default function SearchScreen() {
  const navigation = useNavigation<NavigationProp>();
  const goBack = useBackNavigation("Home");
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setLoading(true);

      try {
        setProducts(await searchActiveProducts(keyword, category));
      } catch (error: any) {
        Alert.alert("Search Failed", error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, [category, keyword]);

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Browse Products</Text>

      <View style={styles.searchRow}>
        <Ionicons name="search-outline" size={20} color={Colors.gray} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, category, details"
          placeholderTextColor={Colors.gray}
          value={keyword}
          onChangeText={setKeyword}
        />
      </View>

      <TouchableOpacity
        style={styles.dropdown}
        onPress={() => setMenuOpen((current) => !current)}
      >
        <Text style={styles.dropdownText}>
          {category === "all" ? "All Categories" : category.replace("_", " ")}
        </Text>
        <Ionicons
          name={menuOpen ? "chevron-up" : "chevron-down"}
          size={18}
          color={Colors.primary}
        />
      </TouchableOpacity>

      {menuOpen && (
        <View style={styles.menu}>
          {(["all", ...PRODUCT_CATEGORIES] as CategoryFilter[]).map((item) => (
            <TouchableOpacity
              key={item}
              style={styles.menuItem}
              onPress={() => {
                setCategory(item);
                setMenuOpen(false);
              }}
            >
              <Text style={styles.menuText}>
                {item === "all" ? "All Categories" : item.replace("_", " ")}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading ? (
        <Loading />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {products.length === 0 ? (
            <View style={styles.card}>
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptyText}>Try another search or category.</Text>
            </View>
          ) : (
            products.map((product) => (
              <TouchableOpacity
                key={product.id}
                style={styles.card}
                onPress={() =>
                  navigation.navigate("ProductDetails", {
                    productId: product.id,
                    sellerId: product.seller_id,
                  })
                }
              >
                <Text style={styles.productTitle}>{product.title}</Text>
                <Text style={styles.productMeta}>{product.category}</Text>
                <Text style={styles.price}>KES {product.price ?? 0}</Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      )}
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
  searchRow: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  searchInput: { color: Colors.black, flex: 1, height: 50, fontSize: 15 },
  dropdown: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 14,
  },
  dropdownText: {
    color: Colors.primary,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  menu: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 14,
    overflow: "hidden",
  },
  menuItem: { padding: 14, borderBottomColor: Colors.lightGray, borderBottomWidth: 1 },
  menuText: { color: Colors.black, textTransform: "capitalize" },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  productTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  productMeta: { color: Colors.gray, marginTop: 4, textTransform: "capitalize" },
  price: { color: Colors.primary, fontWeight: "bold", marginTop: 6 },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  emptyText: { color: Colors.gray, marginTop: 6 },
});
