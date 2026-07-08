import React, { useCallback, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { SellerStackParamList } from "../../navigation/SellerNavigator";
import { getMyProducts, SellerProduct } from "../../services/productService";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

export default function MyProducts() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("SellerDashboard");
  };

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      setProducts(await getMyProducts());
    } catch (error: any) {
      Alert.alert("Products Failed", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProducts();
    }, [loadProducts])
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>My Products</Text>
        <Text style={styles.subtitle}>Manage listings you have submitted.</Text>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("AddProduct")}
        >
          <Text style={styles.primaryButtonText}>Add New Product</Text>
        </TouchableOpacity>

        {products.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No products yet</Text>
            <Text style={styles.emptyText}>Create your first listing to see it here.</Text>
          </View>
        ) : (
          products.map((product) => (
            <View key={product.id} style={styles.productCard}>
              {product.imageUrl ? (
                <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
              ) : null}
              <Text style={styles.productTitle}>{product.title}</Text>
              <Text style={styles.productMeta}>{product.category}</Text>
              <Text style={styles.productPrice}>KES {product.price}</Text>
              <Text style={styles.status}>Status: {product.status ?? "Pending"}</Text>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() =>
                  navigation.navigate("EditProduct", { productId: product.id })
                }
              >
                <Text style={styles.editButtonText}>Edit Product</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  backButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  backText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: "bold",
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 15,
    marginBottom: 16,
    marginTop: 4,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
    marginBottom: 16,
  },
  primaryButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  emptyTitle: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyText: {
    color: Colors.gray,
    marginTop: 6,
  },
  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  productImage: {
    borderRadius: 10,
    height: 150,
    marginBottom: 12,
    width: "100%",
  },
  productTitle: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: "bold",
  },
  productMeta: {
    color: Colors.gray,
    marginTop: 4,
  },
  productPrice: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: "bold",
    marginTop: 6,
  },
  status: {
    color: Colors.gray,
    marginTop: 6,
  },
  editButton: {
    borderColor: Colors.primary,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: "center",
    marginTop: 12,
    padding: 12,
  },
  editButtonText: {
    color: Colors.primary,
    fontWeight: "bold",
  },
});
