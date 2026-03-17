import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { KitchenScreen } from "../screens/kitchen/KitchenScreen";

const Stack = createNativeStackNavigator();

export function KitchenStack(): React.JSX.Element {
  return (
    <Stack.Navigator>
      <Stack.Screen name="KitchenOrders" component={KitchenScreen} options={{ title: "Kitchen Orders" }} />
    </Stack.Navigator>
  );
}
