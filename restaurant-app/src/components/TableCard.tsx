import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Table } from "../types";
import { StatusBadge } from "./StatusBadge";

interface TableCardProps {
  table: Table;
  onPress?: () => void;
}

export function TableCard({ table, onPress }: TableCardProps): React.JSX.Element {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View>
        <Text style={styles.number}>Table {table.number}</Text>
        <StatusBadge status={table.status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 12,
    padding: 14
  },
  number: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8
  }
});
