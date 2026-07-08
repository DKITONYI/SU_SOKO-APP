import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "../screens/Buyer/HomeScreen";
import SearchScreen from "../screens/Buyer/SearchScreen";
import ProductDetails from "../screens/Buyer/ProductDetails";
import ChatScreen from "../screens/Buyer/ChatScreen";
import FeedbackScreen from "../screens/Buyer/FeedbackScreen";
import ProfileScreen from "../screens/Buyer/ProfileScreen";
import BuyerSignOut from "../screens/Buyer/SignOut";

export type BuyerStackParamList = {
  Home: undefined;
  Search: undefined;
  ProductDetails: { productId: string; sellerId?: string } | undefined;
  Chat: { productId?: string; sellerId?: string } | undefined;
  Feedback: undefined;
  Profile: undefined;
  BuyerSignOut: undefined;
};

const Stack = createNativeStackNavigator<BuyerStackParamList>();

export default function BuyerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
      />
      <Stack.Screen name="Search" component={SearchScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetails} />
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Feedback" component={FeedbackScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="BuyerSignOut" component={BuyerSignOut} />
    </Stack.Navigator>
  );
}
