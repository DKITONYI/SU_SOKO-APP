import React, { useCallback, useState } from "react";
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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import {
  getBuyerReviewableProducts,
  getBuyerReviews,
  getRatingLabel,
  ReviewRating,
  submitProductReview,
} from "../../services/reviewService";
import { SellerProduct } from "../../services/productService";
import { ProductReview } from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;

const ratings: ReviewRating[] = [1, 2, 3];

export default function FeedbackScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [reviewsByProduct, setReviewsByProduct] = useState(
    new Map<string, ProductReview>()
  );
  const [loading, setLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Home");
  };

  const loadFeedback = useCallback(async () => {
    setLoading(true);

    try {
      const [soldProducts, reviews] = await Promise.all([
        getBuyerReviewableProducts(),
        getBuyerReviews(),
      ]);

      setProducts(soldProducts);
      setReviewsByProduct(
        new Map(reviews.map((review) => [review.product_id, review]))
      );
    } catch (error: any) {
      Alert.alert("Feedback Failed", error.message ?? "Unable to load feedback.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadFeedback();
    }, [loadFeedback])
  );

  const handleRating = async (productId: string, rating: ReviewRating) => {
    setSavingProductId(productId);

    try {
      await submitProductReview(productId, rating);
      await loadFeedback();
      Alert.alert("Feedback Saved", "Your product quality feedback was sent to the seller.");
    } catch (error: any) {
      Alert.alert("Review Failed", error.message ?? "Unable to save review.");
    } finally {
      setSavingProductId(null);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Product Reviews</Text>
      <Text style={styles.subtitle}>Rate products you bought: 1 low, 3 high.</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {products.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No sold products to review</Text>
            <Text style={styles.emptyText}>
              Products you buy will appear here after payment is completed.
            </Text>
          </View>
        ) : (
          products.map((product) => {
            const savedReview = reviewsByProduct.get(product.id);

            return (
              <View key={product.id} style={styles.card}>
                <Text style={styles.productTitle}>{product.title ?? "Product"}</Text>
                <Text style={styles.productMeta}>
                  KES {product.price ?? 0}
                  {product.product_number ? ` - Product ${product.product_number}` : ""}
                </Text>

                {savedReview ? (
                  <Text style={styles.savedText}>
                    Current review: {savedReview.rating} - {getRatingLabel(savedReview.rating)}
                  </Text>
                ) : (
                  <Text style={styles.helpText}>Choose a product quality rating.</Text>
                )}

                <View style={styles.ratingRow}>
                  {ratings.map((rating) => {
                    const selected = savedReview?.rating === rating;

                    return (
                      <TouchableOpacity
                        key={rating}
                        style={[
                          styles.ratingButton,
                          selected && styles.ratingButtonSelected,
                        ]}
                        onPress={() => handleRating(product.id, rating)}
                        disabled={savingProductId === product.id}
                      >
                        <Text
                          style={[
                            styles.ratingNumber,
                            selected && styles.ratingNumberSelected,
                          ]}
                        >
                          {rating}
                        </Text>
                        <Text
                          style={[
                            styles.ratingLabel,
                            selected && styles.ratingLabelSelected,
                          ]}
                        >
                          {getRatingLabel(rating)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
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
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
  },
  backText: { color: Colors.primary, fontSize: 15, fontWeight: "bold" },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold" },
  subtitle: { color: Colors.gray, fontSize: 15, marginBottom: 16, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  emptyText: { color: Colors.gray, marginTop: 6 },
  productTitle: { color: Colors.black, fontSize: 18, fontWeight: "bold" },
  productMeta: { color: Colors.gray, marginTop: 4 },
  helpText: { color: Colors.gray, marginTop: 12 },
  savedText: { color: Colors.primary, fontWeight: "700", marginTop: 12 },
  ratingRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  ratingButton: {
    alignItems: "center",
    borderColor: Colors.lightGray,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 74,
    padding: 10,
  },
  ratingButtonSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  ratingNumber: { color: Colors.primary, fontSize: 18, fontWeight: "bold" },
  ratingNumberSelected: { color: Colors.white },
  ratingLabel: { color: Colors.gray, fontSize: 12, marginTop: 4, textAlign: "center" },
  ratingLabelSelected: { color: Colors.white },
});
