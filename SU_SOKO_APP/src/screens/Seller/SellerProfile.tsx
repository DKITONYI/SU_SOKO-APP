import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import { useAuth } from "../../context/AuthContext";
import { SellerStackParamList } from "../../navigation/SellerNavigator";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

export default function SellerProfile() {
  const { profile } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("SellerDashboard");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Seller Profile</Text>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>{profile?.fullName ?? "Seller"}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{profile?.email ?? "-"}</Text>
        <Text style={styles.label}>Phone</Text>
        <Text style={styles.value}>{profile?.phone ?? "-"}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
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
    marginBottom: 18,
  },
  label: {
    color: Colors.gray,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 12,
  },
  value: {
    color: Colors.black,
    fontSize: 16,
    marginTop: 4,
  },
});
