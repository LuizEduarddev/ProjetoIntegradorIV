import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useAuthStore } from "../../store/authStore";

export function LoginScreen(): React.JSX.Element {
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = useState("admin");
  const [password, setPassword] = useState("Oidudu2235.");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch {
      setError("Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <View style={styles.iconContainer}>
              <Feather name="coffee" size={48} color="#111827" />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to manage your restaurant</Text>
          </View>

          <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <Feather name="alert-circle" size={18} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Feather name="mail" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  autoCapitalize="none"
                  keyboardType="email-address"
                  onChangeText={(text) => {
                    setEmail(text);
                    setError(null);
                  }}
                  placeholder="admin@restaurant.local"
                  placeholderTextColor="#9CA3AF"
                  style={styles.input}
                  value={email}
                  editable={!loading}
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <Feather name="lock" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <TextInput
                  onChangeText={(text) => {
                    setPassword(text);
                    setError(null);
                  }}
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  style={styles.input}
                  value={password}
                  editable={!loading}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Feather
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.loginButton, loading && styles.loginButtonDisabled]}
              disabled={loading}
              onPress={handleLogin}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "center",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  iconContainer: {
    width: 96,
    height: 96,
    backgroundColor: "#F3F4F6",
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    color: "#EF4444",
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    height: "100%",
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
  },
  loginButton: {
    backgroundColor: "#111827",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: "#9CA3AF",
    shadowOpacity: 0,
    elevation: 0,
  },
  loginButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});