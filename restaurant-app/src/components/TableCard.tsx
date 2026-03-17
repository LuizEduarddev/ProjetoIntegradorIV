// TableCard.tsx
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import type { Table } from "../types";

interface TableCardProps {
  table: Table;
  onPress?: () => void;
}

const getStatusStyles = (status: string) => {
  switch (status.toLowerCase()) {
    case "free":
      return { bg: "#D1FAE5", text: "#065F46", border: "#A7F3D0" };
    case "occupied":
    case "in progress":
      return { bg: "#FEF9C3", text: "#854D0E", border: "#FEF08A" };
    case "attention":
    case "waiting":
    case "delayed":
      return { bg: "#FEE2E2", text: "#991B1B", border: "#FECACA" };
    default:
      return { bg: "#F3F4F6", text: "#374151", border: "#E5E7EB" };
  }
};

export function TableCard({ table, onPress }: TableCardProps): React.JSX.Element {
  const colors = getStatusStyles(table.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.bg, borderColor: colors.border },
        pressed && styles.cardPressed
      ]}
      onPress={onPress}
    >
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="table-furniture" size={36} color={colors.text} />
      </View>
      <Text style={[styles.number, { color: colors.text }]}>Table {table.number}</Text>
      <View style={[styles.badge, { backgroundColor: colors.border }]}>
        <Text style={[styles.statusText, { color: colors.text }]}>
          {table.status.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    aspectRatio: 1, 
    borderRadius: 20,
    borderWidth: 1,
    margin: 8,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, 
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  iconContainer: {
    marginBottom: 12,
  },
  number: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 8,
    letterSpacing: 0.3,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  }
});