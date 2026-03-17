import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { OrderScreen } from "../screens/waiter/OrderScreen";
import { TablesScreen } from "../screens/waiter/TablesScreen";

const Stack = createNativeStackNavigator();

export function WaiterStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="WaiterTables" component={TablesScreen} options={{ title: "Tables" }} />
      <Stack.Screen name="Order" component={OrderScreen} />
    </Stack.Navigator>
  );
}
