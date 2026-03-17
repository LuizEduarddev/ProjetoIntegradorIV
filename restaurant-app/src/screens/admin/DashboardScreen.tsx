import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

import { useKitchenOrders } from "../../hooks/useKitchenOrders";
import { useTables } from "../../hooks/useTables";
import { useAuthStore } from "../../store/authStore";

export function DashboardScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const { data: tables = [] } = useTables();
  const { data: kitchenOrders = [] } = useKitchenOrders();
  const logout = useAuthStore((state) => state.logout);

  const occupiedTables = tables.filter((t) => t.status === "occupied" || t.status === "waiting").length;
  const openOrders = kitchenOrders.length;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      <Text>Occupied/Waiting tables: {occupiedTables}</Text>
      <Text>Orders in kitchen: {openOrders}</Text>
      <View style={styles.actions}>
        <Button onPress={() => navigation.navigate("Tables")} title="Manage Tables" />
        <Button onPress={() => navigation.navigate("Products")} title="Manage Products" />
        <Button onPress={() => navigation.navigate("Users")} title="Manage Users" />
        <Button onPress={logout} title="Logout" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "700"
  },
  actions: {
    gap: 10,
    marginTop: 12
  }
});
