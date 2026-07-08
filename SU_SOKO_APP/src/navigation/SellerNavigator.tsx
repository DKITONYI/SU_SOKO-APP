import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import SellerDashboard from "../screens/Seller/Dashboard";
import AddProduct from "../screens/Seller/AddProduct";
import EditProduct from "../screens/Seller/EditProduct";
import MyProducts from "../screens/Seller/MyProducts";
import SellerProfile from "../screens/Seller/SellerProfile";
import Subscription from "../screens/Seller/Subscription";
import SellerSignOut from "../screens/Seller/SignOut";
import SellerMessages from "../screens/Seller/Messages";
import SellerSalesReport from "../screens/Seller/SalesReport";

export type SellerStackParamList = {
  SellerDashboard: undefined;
  AddProduct: undefined;
  MyProducts: undefined;
  EditProduct: { productId?: string } | undefined;
  SellerProfile: undefined;
  SellerMessages: undefined;
  SellerSalesReport: undefined;
  Subscription: undefined;
  SellerSignOut: undefined;
};

const Stack = createNativeStackNavigator<SellerStackParamList>();

export default function SellerNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
      <Stack.Screen name="AddProduct" component={AddProduct} />
      <Stack.Screen name="MyProducts" component={MyProducts} />
      <Stack.Screen name="EditProduct" component={EditProduct} />
      <Stack.Screen name="SellerProfile" component={SellerProfile} />
      <Stack.Screen name="SellerMessages" component={SellerMessages} />
      <Stack.Screen name="SellerSalesReport" component={SellerSalesReport} />
      <Stack.Screen name="Subscription" component={Subscription} />
      <Stack.Screen name="SellerSignOut" component={SellerSignOut} />
    </Stack.Navigator>
  );
}
