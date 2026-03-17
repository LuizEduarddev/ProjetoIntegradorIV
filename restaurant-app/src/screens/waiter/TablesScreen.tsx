import React from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { TableCard } from "../../components/TableCard";
import { useCreateOrder } from "../../hooks/useOrders";
import { useTables } from "../../hooks/useTables";

export function TablesScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const { data: tables = [], isLoading } = useTables();
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
      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.title}>Select a Table</Text>}
        renderItem={({ item }) => <TableCard onPress={() => handleTablePress(item.id)} table={item} />}
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
