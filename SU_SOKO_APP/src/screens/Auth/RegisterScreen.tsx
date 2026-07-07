import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import Colors from "../../constants/Colors";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import { AuthStackParamList } from "../../navigation/AuthNavigator";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function RegisterScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [role, setRole] = useState<"Buyer" | "Seller">("Buyer");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [hidePassword, setHidePassword] = useState(true);
  const [hideConfirmPassword, setHideConfirmPassword] = useState(true);

  const handleRegister = () => {
    console.log("Register");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        <View style={styles.logo}>
          <Text style={styles.logoText}>SU</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>

        <Text style={styles.subtitle}>
          Join the Strathmore Marketplace
        </Text>

        <View style={styles.card}>
          <CustomInput
            label="Full Name"
            placeholder="Enter your full name"
            value={fullName}
            onChangeText={setFullName}
            leftIcon="person-outline"
          />

          <CustomInput
            label="University Email"
            placeholder="student@strathmore.edu"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
          />

          <CustomInput
            label="Phone Number"
            placeholder="07XXXXXXXX"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            leftIcon="call-outline"
          />

          <Text style={styles.roleTitle}>Select Role</Text>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "Buyer" && styles.selectedRole,
              ]}
              onPress={() => setRole("Buyer")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "Buyer" && styles.selectedRoleText,
                ]}
              >
                Buyer
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "Seller" && styles.selectedRole,
              ]}
              onPress={() => setRole("Seller")}
            >
              <Text
                style={[
                  styles.roleText,
                  role === "Seller" && styles.selectedRoleText,
                ]}
              >
                Seller
              </Text>
            </TouchableOpacity>
          </View>

          <CustomInput
            label="Password"
            placeholder="Enter password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={hidePassword}
            leftIcon="lock-closed-outline"
            rightIcon={
              hidePassword ? "eye-off-outline" : "eye-outline"
            }
            onRightIconPress={() =>
              setHidePassword(!hidePassword)
            }
          />

          <CustomInput
            label="Confirm Password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={hideConfirmPassword}
            leftIcon="lock-closed-outline"
            rightIcon={
              hideConfirmPassword
                ? "eye-off-outline"
                : "eye-outline"
            }
            onRightIconPress={() =>
              setHideConfirmPassword(!hideConfirmPassword)
            }
          />

          <CustomButton
            title="CREATE ACCOUNT"
            onPress={handleRegister}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Already have an account?
            </Text>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
            >
              <Text style={styles.loginText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 20,
    marginBottom: 15,
  },

  logoText: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: "bold",
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: Colors.primary,
    textAlign: "center",
  },

  subtitle: {
    textAlign: "center",
    color: Colors.gray,
    marginTop: 6,
    marginBottom: 25,
    fontSize: 16,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: {
      width: 0,
      height: 3,
    },
  },

  roleTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
    marginBottom: 10,
    marginTop: 10,
  },

  roleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.lightGray,
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 5,
    alignItems: "center",
    backgroundColor: Colors.white,
  },

  selectedRole: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  roleText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.black,
  },

  selectedRoleText: {
    color: Colors.white,
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    color: Colors.gray,
  },

  loginText: {
    color: Colors.primary,
    fontWeight: "bold",
    marginLeft: 5,
  },
});