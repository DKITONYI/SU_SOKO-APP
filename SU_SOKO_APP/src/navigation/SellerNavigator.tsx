import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SellerDashboard from "../screens/Seller/Dashboard";

export type SellerStackParamList = {
  SellerDashboard: undefined;
};

const Stack = createNativeStackNavigator<SellerStackParamList>();

export default function SellerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
    </Stack.Navigator>
  );
}