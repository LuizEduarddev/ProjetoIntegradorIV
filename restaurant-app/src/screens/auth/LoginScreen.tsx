import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";

import { useAuthStore } from "../../store/authStore";

export function LoginScreen(): React.JSX.Element {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("admin@restaurant.local");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError("Invalid credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Login</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        placeholder="Email"
        style={styles.input}
        value={email}
      />
      <TextInput
        onChangeText={setPassword}
        placeholder="Password"
        secureTextEntry
        style={styles.input}
        value={password}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Button disabled={loading} onPress={handleLogin} title={loading ? "Logging in..." : "Login"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 12,
    justifyContent: "center",
    padding: 20
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center"
  },
  input: {
    borderColor: "#D1D5DB",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12
  },
  error: {
    color: "#B91C1C",
    textAlign: "center"
  }
});
