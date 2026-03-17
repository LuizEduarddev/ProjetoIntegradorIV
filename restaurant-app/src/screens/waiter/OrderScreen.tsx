import React from "react";
import { Alert, Button, FlatList, StyleSheet, Text, View } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { getProducts } from "../../api/products";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { OrderItemRow } from "../../components/OrderItem";
import { useAddOrderItem, useOrder, useUpdateOrderStatus } from "../../hooks/useOrders";

export function OrderScreen({ route }: { route: any }): React.JSX.Element {
  const orderId: string = route.params.orderId;
  const { data: order, isLoading } = useOrder(orderId);
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });

  const addItemMutation = useAddOrderItem(orderId);
  const updateStatusMutation = useUpdateOrderStatus(orderId);

  if (isLoading || !order) {
    return <LoadingSpinner />;
  }

  async function handleAddProduct(productId: string) {
    try {
      await addItemMutation.mutateAsync({
        product_id: productId,
        quantity: 1
      });
    } catch {
      Alert.alert("Error", "Could not add product");
    }
  }

  async function handleSendToKitchen() {
    try {
      await updateStatusMutation.mutateAsync("sent");
      Alert.alert("Success", "Order sent to kitchen");
    } catch {
      Alert.alert("Error", "Could not send order");
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Order #{order.id.slice(0, 8)}</Text>
      <Text style={styles.subtitle}>Table {order.table_number ?? "-"}</Text>

      <Text style={styles.section}>Items</Text>
      <FlatList
        data={order.items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <OrderItemRow item={item} />}
      />

      <Text style={styles.section}>Products</Text>
      <FlatList
        data={products.filter((p) => p.available)}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.productRow}>
            <Text>{item.name}</Text>
            <Button onPress={() => handleAddProduct(item.id)} title="Add" />
          </View>
        )}
      />

      <Button onPress={handleSendToKitchen} title="Send to Kitchen" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
  },
  title: {
    fontSize: 20,
    fontWeight: "700"
  },
  subtitle: {
    color: "#4B5563",
    marginBottom: 8
  },
  section: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 6,
    marginTop: 10
  },
  productRow: {
    alignItems: "center",
    borderColor: "#E5E7EB",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    padding: 10
  }
});
