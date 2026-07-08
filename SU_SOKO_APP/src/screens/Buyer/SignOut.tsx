import React, { useState } from "react";
import { Alert, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";
import { BuyerStackParamList } from "../../navigation/BuyerNavigator";
import { logoutUser } from "../../services/authService";

type NavigationProp = NativeStackNavigationProp<BuyerStackParamList>;

export default function BuyerSignOut() {
  const navigation = useNavigation<NavigationProp>();
  const [loading, setLoading] = useState(false);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("Home");
  };

  const handleSignOut = async () => {
    setLoading(true);

    try {
      await logoutUser();
    } catch (error: any) {
      Alert.alert("Sign Out Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Ionicons name="arrow-back" size={20} color={Colors.primary} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <Text style={styles.title}>Sign Out</Text>
        <Text style={styles.message}>You will be returned to the login screen.</Text>

        <CustomButton
          title="SIGN OUT"
          onPress={handleSignOut}
          loading={loading}
          color={Colors.danger}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: "center",
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
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 20,
    elevation: 3,
  },
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  message: {
    color: Colors.gray,
    fontSize: 16,
  },
});
