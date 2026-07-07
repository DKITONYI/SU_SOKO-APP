import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";

import Colors from "../../constants/Colors";

export default function SellerHomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>Welcome Back 👋</Text>
          <Text style={styles.title}>Seller Dashboard</Text>
        </View>

        {/* Statistics */}
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

        {/* Quick Actions */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>➕ Add New Product</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>📦 My Products</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>💬 Messages</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>⚙️ Account Settings</Text>
        </TouchableOpacity>

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
    marginVertical: 20,
  },

  welcome: {
    fontSize: 18,
    color: Colors.gray,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.primary,
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.primary,
    marginVertical: 20,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    elevation: 3,
  },

  number: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.primary,
  },

  label: {
    marginTop: 5,
    color: Colors.gray,
    fontSize: 16,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    alignItems: "center",
  },

  buttonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: "bold",
  },
});