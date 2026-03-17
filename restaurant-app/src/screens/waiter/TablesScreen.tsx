// TablesScreen.tsx
import React from "react";
import { Alert, FlatList, StyleSheet, Text, View, TouchableOpacity } from "react-native";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { TableCard } from "../../components/TableCard";
import { useCreateOrder } from "../../hooks/useOrders";
import { useTables } from "../../hooks/useTables";
import { useAuthStore } from "@/store/authStore";

export function TablesScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const { data: tables = [], isLoading } = useTables();
  const logout = useAuthStore((state) => state.logout);
  const createOrder = useCreateOrder();

  async function handleTablePress(tableId: string) {
    try {
      const order = await createOrder.mutateAsync({ tableId });
      navigation.navigate("Order", { orderId: order.id });
    } catch (error) {
      Alert.alert("Error", "Could not create order");
    }
  }

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Overview</Text>
          <Text style={styles.title}>Select a Table</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        numColumns={2} 
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TableCard onPress={() => handleTablePress(item.id)} table={item} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB", 
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#111827",
  },
  logoutButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 32,
  },
  row: {
    justifyContent: "space-between",
  },
});