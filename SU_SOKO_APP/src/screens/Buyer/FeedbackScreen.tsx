import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;

export default function FeedbackScreen() {
  const navigation = useNavigation<NavigationProp>();
  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Home");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Feedback</Text>
        <Text style={styles.text}>Reviews and ratings will be submitted here.</Text>
      </View>
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
  card: { backgroundColor: Colors.white, borderRadius: 12, padding: 20, elevation: 3 },
  title: { color: Colors.primary, fontSize: 28, fontWeight: "bold" },
  text: { color: Colors.gray, marginTop: 8 },
});
