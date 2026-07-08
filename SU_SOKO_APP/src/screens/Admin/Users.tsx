import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import Colors from "../../constants/Colors";
import { useBackNavigation } from "../../hooks/useBackNavigation";

export default function AdminUsers() {
  const goBack = useBackNavigation("AdminDashboard");

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Users</Text>
        <Text style={styles.text}>
          User suspension and deactivation management will be connected here.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  backButton: { alignItems: "center", flexDirection: "row", gap: 6, marginBottom: 16 },
  backText: { color: Colors.primary, fontWeight: "bold" },
  card: { backgroundColor: Colors.white, borderRadius: 8, padding: 20, elevation: 3 },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 8 },
});
