import React from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
} from "react-native";

import Colors from "../../constants/Colors";

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <View style={styles.header}>
          <Text style={styles.greeting}>👋 Welcome to</Text>
          <Text style={styles.title}>SU SOKO</Text>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Text style={styles.searchText}>
            🔍 Search products...
          </Text>
        </View>

        {/* Categories */}
        <Text style={styles.sectionTitle}>Categories</Text>

        <View style={styles.categories}>
          <View style={styles.category}>
            <Text style={styles.categoryEmoji}>📚</Text>
            <Text>Books</Text>
          </View>

          <View style={styles.category}>
            <Text style={styles.categoryEmoji}>💻</Text>
            <Text>Electronics</Text>
          </View>

          <View style={styles.category}>
            <Text style={styles.categoryEmoji}>👕</Text>
            <Text>Fashion</Text>
          </View>

          <View style={styles.category}>
            <Text style={styles.categoryEmoji}>🪑</Text>
            <Text>Furniture</Text>
          </View>
        </View>

        {/* Featured Products */}
        <Text style={styles.sectionTitle}>
          Featured Products
        </Text>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>
            Calculus Textbook
          </Text>

          <Text>KES 900</Text>
        </View>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>
            HP Laptop
          </Text>

          <Text>KES 28,000</Text>
        </View>

        <View style={styles.productCard}>
          <Text style={styles.productTitle}>
            Office Chair
          </Text>

          <Text>KES 4,500</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  header: {
    marginTop: 20,
    marginBottom: 25,
  },

  greeting: {
    fontSize: 18,
    color: Colors.gray,
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: Colors.primary,
  },

  searchBox: {
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 25,
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

  categories: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },

  category: {
    alignItems: "center",
  },

  categoryEmoji: {
    fontSize: 30,
    marginBottom: 8,
  },

  productCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },

  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
});