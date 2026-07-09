import React from "react";
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "../../components/CustomButton";
import Colors from "../../constants/Colors";
import { SellerStackParamList } from "../../navigation/SellerNavigator";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

export default function EditProduct() {
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
        <Text style={styles.title}>Edit Product</Text>
        <Text style={styles.text}>
          Select a product from My Products to edit its details.
        </Text>

        <CustomButton
          title="GO TO MY PRODUCTS"
          onPress={() => navigation.navigate("MyProducts")}
        />
        <CustomButton
          title="BACK"
          onPress={goBack}
          color={Colors.gray}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
    justifyContent: "center",
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
  text: {
    color: Colors.gray,
    fontSize: 15,
  },
});
