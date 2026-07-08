import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AdminDashboard from "../screens/Admin/Dashboard";
import AdminUsers from "../screens/Admin/Users";
import AdminListings from "../screens/Admin/Listings";
import AdminReports from "../screens/Admin/Reports";
import AdminSubscriptions from "../screens/Admin/Subscriptions";

export type AdminStackParamList = {
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminListings: undefined;
  AdminReports: undefined;
  AdminSubscriptions: undefined;
};

const Stack = createNativeStackNavigator<AdminStackParamList>();

export default function AdminNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="AdminUsers" component={AdminUsers} />
      <Stack.Screen name="AdminListings" component={AdminListings} />
      <Stack.Screen name="AdminReports" component={AdminReports} />
      <Stack.Screen name="AdminSubscriptions" component={AdminSubscriptions} />
    </Stack.Navigator>
  );
}
