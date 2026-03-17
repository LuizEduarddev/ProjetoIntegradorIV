import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { DashboardScreen } from "../screens/admin/DashboardScreen";
import { ProductsScreen } from "../screens/admin/ProductsScreen";
import { TablesScreen } from "../screens/admin/TablesScreen";
import { UsersScreen } from "../screens/admin/UsersScreen";

const Stack = createNativeStackNavigator();

export function AdminStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Dashboard" component={DashboardScreen} />
      <Stack.Screen name="Tables" component={TablesScreen} />
      <Stack.Screen name="Products" component={ProductsScreen} />
      <Stack.Screen name="Users" component={UsersScreen} />
    </Stack.Navigator>
  );
}
