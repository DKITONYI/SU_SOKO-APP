import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Colors from "../constants/Colors";

interface Props {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string;
}

export default function CustomButton({
  title,
  onPress,
  loading = false,
  disabled = false,
  color = Colors.primary,
}: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: color,
          opacity: disabled ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={Colors.white} />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 15,
  },

  text: {
    color: Colors.white,
    fontWeight: "bold",
    fontSize: 17,
  },
});