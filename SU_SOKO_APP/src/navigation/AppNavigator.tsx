import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import BuyerNavigator from "./BuyerNavigator";
import SellerNavigator from "./SellerNavigator";
import AdminNavigator from "./AdminNavigator";
import Loading from "../components/Loading";
import { useAuth } from "../context/AuthContext";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const { user, role, loading } = useAuth();

  if (loading) {
    return <Loading />;
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user || !role ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : role === "buyer" ? (
        <Stack.Screen name="Buyer" component={BuyerNavigator} />
      ) : role === "seller" ? (
        <Stack.Screen name="Seller" component={SellerNavigator} />
      ) : role === "admin" ? (
        <Stack.Screen name="Admin" component={AdminNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
