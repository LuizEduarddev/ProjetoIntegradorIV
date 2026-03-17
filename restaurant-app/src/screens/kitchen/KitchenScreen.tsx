import React from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";

import { LoadingSpinner } from "../../components/LoadingSpinner";
import { useKitchenOrders, useUpdateKitchenItemStatus } from "../../hooks/useKitchenOrders";
import { useAuthStore } from "../../store/authStore";
import type { ItemStatus } from "../../types";

function getNextStatus(status: ItemStatus): ItemStatus | null {
  if (status === "pending") {
    return "preparing";
  }
  if (status === "preparing") {
    return "ready";
  }
  return null;
}

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case "pending":
      return {
        bg: "#FEE2E2",
        text: "#991B1B",
        icon: "clock",
        label: "PENDING",
        actionText: "Start Prep",
        actionBg: "#EF4444",
      };
    case "preparing":
      return {
        bg: "#FEF3C7",
        text: "#92400E",
        icon: "loader",
        label: "PREPARING",
        actionText: "Mark Ready",
        actionBg: "#F59E0B",
      };
    case "ready":
      return {
        bg: "#D1FAE5",
        text: "#065F46",
        icon: "check-circle",
        label: "READY",
        actionText: "Done",
        actionBg: "#10B981",
      };
    default:
      return {
        bg: "#F3F4F6",
        text: "#374151",
        icon: "info",
        label: status.toUpperCase(),
        actionText: "Advance",
        actionBg: "#6B7280",
      };
  }
};

export function KitchenScreen(): React.JSX.Element {
  const { data: orders = [], isLoading } = useKitchenOrders();
  const updateItemStatus = useUpdateKitchenItemStatus();
  const logout = useAuthStore((state) => state.logout);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  async function handleUpdateItem(orderId: string, itemId: string, status: ItemStatus) {
    const nextStatus = getNextStatus(status);
    if (!nextStatus) {
      return;
    }
    try {
      await updateItemStatus.mutateAsync({ orderId, itemId, status: nextStatus });
    } catch {
      Alert.alert("Error", "Could not update item status");
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Kitchen Orders</Text>
            <View style={styles.activeOrdersBadge}>
              <Text style={styles.activeOrdersText}>{orders.length} Active</Text>
            </View>
          </View>
          
          <TouchableOpacity onPress={logout} style={styles.logoutButton}>
            <Feather name="log-out" size={16} color="#991B1B" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <View style={styles.cardHeader}>
                <View style={styles.tableBadge}>
                  <Feather name="hash" size={16} color="#111827" />
                  <Text style={styles.tableText}>{item.table_number ?? "-"}</Text>
                </View>
                <Text style={styles.orderIdText}>Order #{item.id.slice(0, 6)}</Text>
              </View>

              <View style={styles.itemsContainer}>
                {item.items.map((orderItem, index) => {
                  const statusConfig = getStatusConfig(orderItem.status);
                  const isReady = orderItem.status === "ready";
                  const isLastItem = index === item.items.length - 1;

                  return (
                    <View
                      key={orderItem.id}
                      style={[styles.itemRow, !isLastItem && styles.itemRowBorder]}
                    >
                      <View style={styles.itemInfo}>
                        <View style={styles.quantityBadge}>
                          <Text style={styles.quantityText}>{orderItem.quantity}x</Text>
                        </View>
                        <View style={styles.itemDetails}>
                          <Text style={styles.itemName}>
                            {orderItem.product_name ?? orderItem.product_id}
                          </Text>
                          <View
                            style={[
                              styles.statusBadge,
                              { backgroundColor: statusConfig.bg },
                            ]}
                          >
                            <Feather
                              name={statusConfig.icon as any}
                              size={12}
                              color={statusConfig.text}
                            />
                            <Text
                              style={[
                                styles.statusText,
                                { color: statusConfig.text },
                              ]}
                            >
                              {statusConfig.label}
                            </Text>
                          </View>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          { backgroundColor: statusConfig.actionBg },
                          isReady && styles.actionButtonDisabled,
                        ]}
                        disabled={isReady || updateItemStatus.isPending}
                        onPress={() =>
                          handleUpdateItem(item.id, orderItem.id, orderItem.status)
                        }
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.actionButtonText,
                            isReady && styles.actionButtonTextDisabled,
                          ]}
                        >
                          {statusConfig.actionText}
                        </Text>
                        {!isReady && (
                          <Feather name="chevron-right" size={16} color="#FFFFFF" />
                        )}
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="check-circle" size={48} color="#D1D5DB" />
              <Text style={styles.emptyText}>No active orders</Text>
              <Text style={styles.emptySubtext}>The kitchen is all caught up!</Text>
            </View>
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 8,
  },
  activeOrdersBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: "flex-start",
  },
  activeOrdersText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    gap: 6,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#991B1B",
  },
  listContent: {
    paddingBottom: 24,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tableBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 2,
  },
  tableText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  orderIdText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  itemsContainer: {
    padding: 16,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  itemRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingRight: 16,
  },
  quantityBadge: {
    width: 36,
    height: 36,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 6,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
    minWidth: 100,
  },
  actionButtonDisabled: {
    backgroundColor: "#F3F4F6",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  actionButtonTextDisabled: {
    color: "#9CA3AF",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B5563",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#9CA3AF",
  },
});