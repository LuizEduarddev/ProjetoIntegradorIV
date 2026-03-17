import React from "react";
import { StyleSheet, Text, View } from "react-native";

import type { ItemStatus, OrderStatus, TableStatus } from "../types";

type Status = ItemStatus | OrderStatus | TableStatus;

const STATUS_COLORS: Record<string, string> = {
  free: "#2E7D32",
  occupied: "#1565C0",
  waiting: "#EF6C00",
  closed: "#616161",
  open: "#1565C0",
  sent: "#6A1B9A",
  cancelled: "#B71C1C",
  pending: "#EF6C00",
  preparing: "#6A1B9A",
  ready: "#2E7D32"
};

interface StatusBadgeProps {
  status: Status;
}

export function StatusBadge({ status }: StatusBadgeProps): React.JSX.Element {
  return (
    <View style={[styles.badge, { backgroundColor: STATUS_COLORS[status] ?? "#616161" }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  text: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600"
  }
});
