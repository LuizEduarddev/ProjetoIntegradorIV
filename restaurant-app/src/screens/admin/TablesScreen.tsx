import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { TableCard } from "../../components/TableCard";
import { useTables } from "../../hooks/useTables";

export function TablesScreen(): React.JSX.Element {
  const { data: tables = [], isLoading } = useTables();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.title}>Tables</Text>}
        renderItem={({ item }) => <TableCard table={item} />}
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
  }
});
