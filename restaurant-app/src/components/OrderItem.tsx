import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { OrderItem } from "../types";
import { StatusBadge } from "./StatusBadge";

interface OrderItemRowProps {
  item: OrderItem;
}

export function OrderItemRow({ item }: OrderItemRowProps): React.JSX.Element {
  return (
    <View style={styles.row}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {item.product_name ?? item.product_id} x{item.quantity}
        </Text>
        <Text style={styles.subtitle}>${item.unit_price.toFixed(2)}</Text>
        {item.notes ? <Text style={styles.notes}>Note: {item.notes}</Text> : null}
      </View>
      <StatusBadge status={item.status} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    marginBottom: 10,
    padding: 12
  },
  content: {
    marginBottom: 8
  },
  title: {
    fontSize: 16,
    fontWeight: "600"
  },
  subtitle: {
    color: "#4B5563"
  },
  notes: {
    color: "#6B7280",
    marginTop: 4
  }
});
