import React from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { useKitchenOrders } from "../../hooks/useKitchenOrders";
import { useTables } from "../../hooks/useTables";
import { useAuthStore } from "../../store/authStore";

export function DashboardScreen({ navigation }: { navigation: any }): React.JSX.Element {
  const { data: tables = [] } = useTables();
  const { data: kitchenOrders = [] } = useKitchenOrders();
  const logout = useAuthStore((state) => state.logout);

  const occupiedTables = tables.filter(
    (t) => t.status === "occupied" || t.status === "waiting"
  ).length;
  const openOrders = kitchenOrders.length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.title}>Admin Dashboard</Text>
          </View>
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Feather name="log-out" size={20} color="#EF4444" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Overview</Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: "#DBEAFE" }]}>
              <Feather name="users" size={24} color="#2563EB" />
            </View>
            <Text style={styles.statValue}>{occupiedTables}</Text>
            <Text style={styles.statLabel}>Active Tables</Text>
          </View>

          <View style={styles.statCard}>
            <View style={[styles.iconWrapper, { backgroundColor: "#FEF3C7" }]}>
              <Feather name="clock" size={24} color="#D97706" />
            </View>
            <Text style={styles.statValue}>{openOrders}</Text>
            <Text style={styles.statLabel}>Kitchen Orders</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Management</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Tables")}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBg, { backgroundColor: "#F3F4F6" }]}>
                <Feather name="grid" size={20} color="#4B5563" />
              </View>
              <Text style={styles.actionTitle}>Manage Tables</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Products")}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBg, { backgroundColor: "#F3F4F6" }]}>
                <Feather name="package" size={20} color="#4B5563" />
              </View>
              <Text style={styles.actionTitle}>Manage Products</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Users")}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBg, { backgroundColor: "#F3F4F6" }]}>
                <Feather name="user-check" size={20} color="#4B5563" />
              </View>
              <Text style={styles.actionTitle}>Manage Users</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "600",
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  logoutButton: {
    width: 44,
    height: 44,
    backgroundColor: "#FEE2E2",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  actionsContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  actionCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
  },
});