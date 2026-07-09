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
import { useFocusEffect } from "@react-navigation/native";

import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { useBackNavigation } from "../../hooks/useBackNavigation";
import { getAllUsers } from "../../services/userService";
import { User } from "../../types/marketplace";

export default function AdminUsers() {
  const goBack = useBackNavigation("AdminDashboard");
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);

    try {
      setUsers(await getAllUsers());
    } catch (error: any) {
      Alert.alert("Users Failed", error.message ?? "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Users</Text>
      <Text style={styles.subtitle}>People who have logged into the system.</Text>

      <ScrollView showsVerticalScrollIndicator={false}>
        {users.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No users yet</Text>
            <Text style={styles.text}>User accounts will appear here after login.</Text>
          </View>
        ) : (
          users.map((user) => (
            <View key={user.uid} style={styles.card}>
              <View style={styles.row}>
                <View style={styles.iconCircle}>
                  <Ionicons name="person-outline" size={18} color={Colors.primary} />
                </View>
                <View style={styles.details}>
                  <Text style={styles.name}>{user.fullName || user.email || "User"}</Text>
                  <Text style={styles.text}>{user.email || "No email provided"}</Text>
                  {user.user_number ? (
                    <Text style={styles.text}>User #{user.user_number}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.chipRow}>
                <View style={styles.chip}>
                  <Text style={styles.chipText}>{user.role}</Text>
                </View>
                <View
                  style={[
                    styles.chip,
                    user.subscription_status === "active" && styles.activeChip,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      user.subscription_status === "active" && styles.activeChipText,
                    ]}
                  >
                    {user.subscription_status}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  backButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 6,
    marginBottom: 16,
  },
  backText: { color: Colors.primary, fontWeight: "bold" },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold" },
  subtitle: { color: Colors.gray, marginBottom: 14, marginTop: 4 },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    elevation: 3,
    marginBottom: 12,
    padding: 16,
  },
  row: { alignItems: "center", flexDirection: "row", gap: 10 },
  iconCircle: {
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 18,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  details: { flex: 1 },
  name: { color: Colors.black, fontSize: 16, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 4 },
  emptyTitle: { color: Colors.black, fontSize: 17, fontWeight: "bold" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 },
  chip: {
    backgroundColor: Colors.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  chipText: { color: Colors.primary, fontSize: 12, fontWeight: "bold", textTransform: "capitalize" },
  activeChip: { backgroundColor: "#E8F8EF" },
  activeChipText: { color: Colors.success },
});
