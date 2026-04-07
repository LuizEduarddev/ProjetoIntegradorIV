import React from "react";
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from "react-native";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { TableCard } from "../../components/TableCard";
import { useTables } from "../../hooks/useTables";

const BASE_WIDTH = 375;
const MAX_SCALE_WIDTH = 800; 

export function TablesScreen(): React.JSX.Element {
  const { data: tables = [], isLoading } = useTables();
  const { width } = useWindowDimensions();

  const currentWidth = Math.min(width, MAX_SCALE_WIDTH);
  const scale = (size: number) => (currentWidth / BASE_WIDTH) * size;

  const scaledMinCardWidth = scale(140); 
  const scaledPadding = scale(16);
  const numColumns = Math.max(1, Math.floor((width - (scaledPadding * 2)) / scaledMinCardWidth));

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[styles.container, { padding: scaledPadding }]}>
      <FlatList
        key={`grid-${numColumns}`}
        data={tables}
        numColumns={numColumns}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <Text style={[styles.title, { fontSize: scale(22), marginBottom: scale(16) }]}>
            Tables
          </Text>
        }
        columnWrapperStyle={numColumns > 1 ? { gap: scale(16), marginBottom: scale(16) } : undefined}
        renderItem={({ item }) => <TableCard table={item} scale={scale} />}
        contentContainerStyle={{ paddingBottom: scale(24) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontWeight: "700",
  }
});