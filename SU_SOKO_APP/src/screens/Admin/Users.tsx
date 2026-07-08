import React from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";

import Colors from "../../constants/Colors";

export default function AdminUsers() {
  return (
    <SafeAreaView style={styles.container}>
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
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 20, elevation: 3 },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 8 },
});
