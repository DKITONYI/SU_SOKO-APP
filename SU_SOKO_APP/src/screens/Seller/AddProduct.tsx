import React, { useState } from "react";
import { addProduct } from "../../services/productService";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";

import Colors from "../../constants/Colors";

export default function AddProductScreen() {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");

  const handlePost =async () => {
    if (
      !title ||
      !price ||
      !category ||
      !description
    ) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields."
      );
      return;
    }

    await addProduct(
      title,
      price,
      category,
      description
    );
    Alert.alert(
      "Success",
      "Product ready to be successfully uploaded."
    );
      // Clear the form
    setTitle("");
    setPrice("");
    setCategory("");
    setDescription("");

  } catch (error: any) {
    Alert.alert(
      "Error",
      error.message
    );
  }
};
  

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>

        <Text style={styles.title}>
          Add Product
        </Text>

        <TextInput
          placeholder="Product Name"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={styles.input}
        />

        <TextInput
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
          style={styles.input}
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          style={[
            styles.input,
            { height: 120 }
          ]}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={handlePost}
        >
          <Text style={styles.buttonText}>
            Post Product
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.primary,
    marginBottom: 25,
  },

  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },

  button: {
    backgroundColor: Colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: "bold",
  },
});