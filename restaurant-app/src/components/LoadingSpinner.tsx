import React from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingSpinner(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    padding: 16
  }
});
