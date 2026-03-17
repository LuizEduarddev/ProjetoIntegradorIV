import React from "react";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useKitchenOrders, useUpdateKitchenItemStatus } from "../../hooks/useKitchenOrders";
import type { ItemStatus } from "../../types";

function getNextStatus(status: ItemStatus): ItemStatus | null {
  if (status === "pending") {
    return "preparing";
  }
  if (status === "preparing") {
    return "ready";
  }
  return null;
}

export function KitchenScreen(): React.JSX.Element {
  const { data: orders = [], isLoading } = useKitchenOrders();
  const updateItemStatus = useUpdateKitchenItemStatus();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  async function handleUpdateItem(orderId: string, itemId: string, status: ItemStatus) {
    const nextStatus = getNextStatus(status);
    if (!nextStatus) {
      return;
    }
    try {
      await updateItemStatus.mutateAsync({ orderId, itemId, status: nextStatus });
    } catch {
      Alert.alert("Error", "Could not update item status");
    }
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.title}>Kitchen Orders</Text>}
        renderItem={({ item }) => (
          <View style={styles.orderCard}>
            <Text style={styles.tableText}>Table {item.table_number ?? "-"}</Text>
            {item.items.map((orderItem) => (
              <View key={orderItem.id} style={styles.itemRow}>
                <View style={styles.itemInfo}>
                  <Text>
                    {orderItem.product_name ?? orderItem.product_id} x{orderItem.quantity}
                  </Text>
                  <Text style={styles.itemStatus}>{orderItem.status}</Text>
                </View>
                <Button
                  disabled={orderItem.status === "ready"}
                  onPress={() => handleUpdateItem(item.id, orderItem.id, orderItem.status)}
                  title={orderItem.status === "ready" ? "Done" : "Advance"}
                />
              </View>
            ))}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12
  },
  orderCard: {
    borderColor: "#E5E7EB",
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12
  },
  tableText: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  },
  itemRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  itemInfo: {
    flexShrink: 1
  },
  itemStatus: {
    color: "#6B7280"
  }
});
