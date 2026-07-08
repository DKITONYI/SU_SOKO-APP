import React, { useState } from "react";

import { loginUser } from "../../services/authService";

import {
  isEmpty,
  isStrathmoreEmail,
} from "../../utils/validators";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";

import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useNavigation } from "@react-navigation/native";

import { AuthStackParamList } from "../../navigation/AuthNavigator";

import Colors from "../../constants/Colors";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

const getFriendlyErrorMessage = (errorCode: string) => {
  switch (errorCode) {
    case "auth/invalid-email":
      return "That email address looks invalid.";
    case "auth/user-not-found":
      return "No account found with that email.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Incorrect email or password.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again later.";
    case "auth/network-request-failed":
      return "Network error. Check your internet connection.";
    default:
      return "Something went wrong. Please try again.";
  }
};

const getLoginErrorMessage = (error: any) => {
  if (error?.code) {
    return getFriendlyErrorMessage(error.code);
  }

  return error?.message ?? "Something went wrong. Please try again.";
};

export default function LoginScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleLogin = async () => {
    setFeedback(null);

    if (isEmpty(email) || isEmpty(password)) {
      setFeedback({ type: "error", message: "Please enter both email and password." });
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    if (!isStrathmoreEmail(email)) {
      setFeedback({ type: "error", message: "Please use your Strathmore email address." });
      Alert.alert("Invalid Email", "Please use your Strathmore email address.");
      return;
    }

    setLoading(true);
    try {
      const user = await loginUser(email, password);
      console.log("Login success:", user?.uid);
      setFeedback({ type: "success", message: "Login successful. Taking you to your dashboard..." });
      Alert.alert("Login Successful", "Taking you to your dashboard.");
      // No navigation call here on purpose — if your root navigator
      // uses onAuthStateChanged to switch between Auth/App stacks,
      // it will redirect automatically once Firebase confirms the session.
    } catch (error: any) {
      console.log("Login error:", error.code, error.message);
      const message = getLoginErrorMessage(error);
      setFeedback({ type: "error", message });
      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
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
          title={loading ? "LOGGING IN..." : "LOGIN"}
          onPress={handleLogin}
          disabled={loading}
        />

        {feedback && (
          <Text
            style={[
              styles.feedback,
              feedback.type === "success" ? styles.successFeedback : styles.errorFeedback,
            ]}
          >
            {feedback.message}
          </Text>
        )}

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

  feedback: {
    borderRadius: 8,
    fontWeight: "700",
    marginTop: 12,
    padding: 10,
    textAlign: "center",
  },

  successFeedback: {
    backgroundColor: "#E8F8EF",
    color: Colors.success,
  },

  errorFeedback: {
    backgroundColor: "#FDECEC",
    color: Colors.danger,
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
