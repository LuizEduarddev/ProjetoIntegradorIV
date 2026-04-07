import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons"; 
import type { Table } from "../types";

interface TableCardProps {
  table: Table;
  scale?: (size: number) => number;
  onPress?: () => void;
}

const defaultScale = (size: number) => size;

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

export function TableCard({ table, scale = defaultScale, onPress }: TableCardProps): React.JSX.Element {
  const colors = getStatusStyles(table.status);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        { 
          backgroundColor: colors.bg, 
          borderColor: colors.border,
          borderRadius: scale(20),
          padding: scale(16),
        },
        pressed && styles.cardPressed
      ]}
      onPress={onPress}
    >
      <View style={{ marginBottom: scale(12) }}>
        <MaterialCommunityIcons 
          name="table-furniture" 
          size={scale(36)} // Scaling the icon specifically
          color={colors.text} 
        />
      </View>
      <Text style={[styles.number, { color: colors.text, fontSize: scale(18), marginBottom: scale(8) }]}>
        Table {table.number}
      </Text>
      <View style={[styles.badge, { backgroundColor: colors.border, borderRadius: scale(12), paddingHorizontal: scale(10), paddingVertical: scale(4) }]}>
        <Text style={[styles.statusText, { color: colors.text, fontSize: scale(10) }]}>
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
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
    // Shadows don't need scaling as they handle depth, not layout dimensions
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3, 
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }], // Keeping the interaction bounce untouched
  },
  number: {
    fontWeight: "800",
    letterSpacing: 0.3,
  },
  badge: {
    // Layout handled inline with scale()
  },
  statusText: {
    fontWeight: "700",
    letterSpacing: 0.5,
  }
});