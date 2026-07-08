import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { doc, getDoc } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import Colors from "../../constants/Colors";
import Loading from "../../components/Loading";
import { auth, db } from "../../firebase/firebaseConfig";
import { SellerStackParamList } from "../../navigation/SellerNavigator";
import { addProduct, uploadProductImage } from "../../services/productService";
import {
  Category,
  PRODUCT_CATEGORIES,
  User,
} from "../../types/marketplace";

type NavigationProp = NativeStackNavigationProp<SellerStackParamList>;

export default function AddProduct() {
  const navigation = useNavigation<NavigationProp>();
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<Category | "">("");
  const [description, setDescription] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [profile, setProfile] = useState<User | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      setProfileLoading(true);
      setProfileError("");

      try {
        const currentUser = auth.currentUser;

        if (!currentUser) {
          throw new Error("You must be logged in to create a listing.");
        }

        const snapshot = await getDoc(doc(db, "users", currentUser.uid));

        if (!snapshot.exists()) {
          throw new Error("Your seller profile could not be found.");
        }

        if (mounted) {
          setProfile(snapshot.data() as User);
        }
      } catch (error: any) {
        if (mounted) {
          setProfileError(error.message || "Failed to load seller profile.");
        }
      } finally {
        if (mounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const goBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    navigation.navigate("SellerDashboard");
  };

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Needed", "Please allow photo access to upload a product image.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.75,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (profile?.subscription_status !== "active") {
      Alert.alert(
        "Account Disabled",
        "An active subscription is required to list products."
      );
      return;
    }

    if (!title.trim() || !price.trim() || !category || !description.trim()) {
      Alert.alert("Missing Details", "Please fill in all product fields.");
      return;
    }

    setLoading(true);

    try {
      const imageUrl = imageUri ? await uploadProductImage(imageUri) : "";

      await addProduct(title, price, category, description, imageUrl);
      Alert.alert("Product Submitted", "Your listing has been saved.", [
        { text: "OK", onPress: () => navigation.navigate("MyProducts") },
      ]);
    } catch (error: any) {
      Alert.alert("Save Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return <Loading />;
  }

  if (profileError) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockCard}>
          <Text style={styles.blockTitle}>Unable to Load Account</Text>
          <Text style={styles.blockText}>{profileError}</Text>
          <CustomButton title="BACK" onPress={goBack} color={Colors.gray} />
        </View>
      </SafeAreaView>
    );
  }

  if (profile?.subscription_status !== "active") {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockCard}>
          <Ionicons name="lock-closed-outline" size={36} color={Colors.danger} />
          <Text style={styles.blockTitle}>Account Disabled</Text>
          <Text style={styles.blockText}>
            Account Disabled. An active subscription is required to list products.
          </Text>
          <CustomButton title="BACK" onPress={goBack} color={Colors.gray} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>New Product</Text>
        <Text style={styles.subtitle}>Create a listing for the marketplace.</Text>

        <View style={styles.card}>
          <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={28} color={Colors.primary} />
                <Text style={styles.imageText}>Add Product Image</Text>
              </View>
            )}
          </TouchableOpacity>

          <CustomInput
            label="Product Name"
            placeholder="e.g. Calculus Textbook"
            value={title}
            onChangeText={setTitle}
            leftIcon="pricetag-outline"
          />
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryGrid}>
            {PRODUCT_CATEGORIES.map((item) => (
              <TouchableOpacity
                key={item}
                style={[
                  styles.categoryButton,
                  category === item && styles.selectedCategory,
                ]}
                onPress={() => setCategory(item)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    category === item && styles.selectedCategoryText,
                  ]}
                >
                  {item.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <CustomInput
            label="Price"
            placeholder="e.g. 900"
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
            leftIcon="cash-outline"
          />
          <CustomInput
            label="Description"
            placeholder="Describe condition and details"
            value={description}
            onChangeText={setDescription}
            leftIcon="document-text-outline"
          />

          <CustomButton
            title="SAVE PRODUCT"
            onPress={handleSave}
            loading={loading}
          />
          <CustomButton
            title="BACK"
            onPress={goBack}
            color={Colors.gray}
          />
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
  content: {
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
  title: {
    color: Colors.primary,
    fontSize: 28,
    fontWeight: "bold",
  },
  subtitle: {
    color: Colors.gray,
    fontSize: 15,
    marginBottom: 18,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 18,
    elevation: 3,
  },
  fieldLabel: {
    color: Colors.black,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  categoryButton: {
    borderColor: Colors.lightGray,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedCategory: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.black,
    fontSize: 13,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  selectedCategoryText: {
    color: Colors.white,
  },
  blockCard: {
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    elevation: 3,
    margin: 20,
    padding: 22,
  },
  blockTitle: {
    color: Colors.primary,
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
    textAlign: "center",
  },
  blockText: {
    color: Colors.gray,
    fontSize: 16,
    marginTop: 8,
    textAlign: "center",
  },
  imagePicker: {
    borderColor: Colors.lightGray,
    borderRadius: 12,
    borderWidth: 1,
    height: 170,
    marginBottom: 18,
    overflow: "hidden",
  },
  imagePlaceholder: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  imageText: {
    color: Colors.primary,
    fontWeight: "bold",
    marginTop: 8,
  },
  previewImage: {
    height: "100%",
    width: "100%",
  },
});
