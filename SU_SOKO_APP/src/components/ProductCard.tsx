import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import Colors from "../constants/Colors";
import { SellerProduct } from "../services/productService";
import { User } from "../types/marketplace";

type ProductCardProps = {
  product: SellerProduct;
  seller?: User | null;
  onPress?: () => void;
  onStartChat?: () => void;
};

export default function ProductCard({
  product,
  seller,
  onPress,
  onStartChat,
}: ProductCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      {product.imageUrl ? (
        <Image source={{ uri: product.imageUrl }} style={styles.image} />
      ) : null}

      <Text style={styles.title}>{product.title}</Text>
      {product.product_number ? (
        <Text style={styles.displayId}>Product {product.product_number}</Text>
      ) : null}
      <Text style={styles.meta}>{product.category?.replace("_", " ")}</Text>
      <Text style={styles.price}>KES {product.price ?? 0}</Text>

      {seller ? (
        <View style={styles.contactBox}>
          <Text style={styles.contactTitle}>Seller Contact</Text>
          {seller.user_number ? (
            <Text selectable style={styles.contactText}>
              Seller #{seller.user_number}
            </Text>
          ) : null}
          <Text selectable style={styles.contactText}>
            {seller.phone || "No phone provided"}
          </Text>
          <Text selectable style={styles.contactText}>
            {seller.email || "No email provided"}
          </Text>
        </View>
      ) : null}

      {onStartChat ? (
        <TouchableOpacity style={styles.chatButton} onPress={onStartChat}>
          <Text style={styles.chatText}>Start Chat</Text>
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  image: {
    borderRadius: 10,
    height: 150,
    marginBottom: 12,
    width: "100%",
  },
  title: {
    color: Colors.black,
    fontSize: 17,
    fontWeight: "bold",
  },
  meta: {
    color: Colors.gray,
    marginTop: 4,
    textTransform: "capitalize",
  },
  displayId: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
  price: {
    color: Colors.primary,
    fontWeight: "bold",
    marginTop: 6,
  },
  contactBox: {
    borderColor: Colors.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 12,
    padding: 10,
  },
  contactTitle: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 4,
  },
  contactText: {
    color: Colors.black,
    fontSize: 14,
    marginTop: 2,
  },
  chatButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    marginTop: 12,
    padding: 12,
    alignItems: "center",
  },
  chatText: {
    color: Colors.white,
    fontWeight: "bold",
  },
});
