import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthNavigator from "./AuthNavigator";
import BuyerNavigator from "./BuyerNavigator";
import SellerNavigator from "./SellerNavigator";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Auth"
        component={AuthNavigator}
      />

      <Stack.Screen
        name="Buyer"
        component={BuyerNavigator}
      />

      <Stack.Screen
        name="Seller"
        component={SellerNavigator}
      />
    </Stack.Navigator>
  );
}