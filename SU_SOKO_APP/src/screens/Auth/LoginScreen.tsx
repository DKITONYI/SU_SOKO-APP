import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { AuthStackParamList } from "../../navigation/AuthNavigator";

import Colors from "../../constants/Colors";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = () => {
    console.log("Login Pressed");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>SU</Text>
        </View>

        <Text style={styles.title}>SU SOKO</Text>

        <Text style={styles.subtitle}>
          Buy • Sell • Connect
        </Text>
      </View>

      {/* Login Form */}
      <View style={styles.form}>
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
          label="Password"
          placeholder="Enter Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={hidePassword}
          leftIcon="lock-closed-outline"
          rightIcon={hidePassword ? "eye-off-outline" : "eye-outline"}
          onRightIconPress={() => setHidePassword(!hidePassword)}
        />

        <TouchableOpacity
          onPress={() => navigation.navigate("ForgotPassword")}
        >
          <Text style={styles.forgot}>
            Forgot Password?
          </Text>
        </TouchableOpacity>

        <CustomButton
          title="LOGIN"
          onPress={handleLogin}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Don't have an account?
          </Text>

          <TouchableOpacity
            onPress={() => navigation.navigate("Register")}
          >
            <Text style={styles.register}>
              Register
            </Text>
          </TouchableOpacity>
        </View>
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

  header: {
    alignItems: "center",
    marginBottom: 40,
  },

  logo: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
  },

  logoText: {
    color: Colors.white,
    fontSize: 34,
    fontWeight: "bold",
  },

  title: {
    fontSize: 34,
    fontWeight: "bold",
    color: Colors.primary,
  },

  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    marginTop: 6,
  },

  form: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
  },

  forgot: {
    color: Colors.primary,
    textAlign: "right",
    marginBottom: 15,
    marginTop: -5,
    fontWeight: "600",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },

  footerText: {
    color: Colors.gray,
  },

  register: {
    color: Colors.primary,
    fontWeight: "bold",
    marginLeft: 5,
  },
});