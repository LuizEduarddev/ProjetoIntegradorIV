import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { getProducts } from "../../api/products";
import { LoadingSpinner } from "../../components/LoadingSpinner";
import { OrderItemRow } from "../../components/OrderItem";
import {
  useAddOrderItem,
  useOrder,
  useRemoveOrderItem,
  useUpdateOrderStatus,
} from "../../hooks/useOrders";

export function OrderScreen({ route }: { route: any }): React.JSX.Element {
  const orderId: string = route.params.orderId;
  const { data: order, isLoading } = useOrder(orderId);
  const { data: products = [] } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const addItemMutation = useAddOrderItem(orderId);
  const removeItemMutation = useRemoveOrderItem(orderId);
  const updateStatusMutation = useUpdateOrderStatus(orderId);

  const [isCartVisible, setIsCartVisible] = useState(false);

  if (isLoading || !order) {
    return <LoadingSpinner />;
  }

  const canEditOrder = order.status === "open";
  const totalItems =
    order.items?.reduce((acc: number, item: any) => acc + (item.quantity || 1), 0) ?? 0;
  const canSendToKitchen = canEditOrder && totalItems > 0;

  function getApiErrorMessage(error: unknown, fallback: string): string {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error &&
      typeof (error as any).response?.data?.error === "string"
    ) {
      return (error as any).response?.data?.error ?? fallback;
    }
    return fallback;
  }

  async function handleAddProduct(productId: string) {
    if (!canEditOrder) {
      Alert.alert("Order locked", "This order is no longer open for edits.");
      return;
    }
    try {
      await addItemMutation.mutateAsync({
        product_id: productId,
        quantity: 1,
      });
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error, "Could not add product"));
    }
  }

  async function handleRemoveItem(itemId: string) {
    if (!canEditOrder) {
      Alert.alert("Order locked", "This order is no longer open for edits.");
      return;
    }
    try {
      await removeItemMutation.mutateAsync(itemId);
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error, "Could not remove item"));
    }
  }

  async function handleSendToKitchen() {
    if (!canSendToKitchen) {
      Alert.alert("Cannot send", "Add at least one item before sending to kitchen.");
      return;
    }
    try {
      await updateStatusMutation.mutateAsync("sent");
      setIsCartVisible(false);
      Alert.alert("Success", "Order sent to kitchen");
    } catch (error) {
      Alert.alert("Error", getApiErrorMessage(error, "Could not send order"));
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Order #{order.id.slice(0, 8)}</Text>
            <View style={styles.subtitleRow}>
              <View style={styles.tableBadge}>
                <Text style={styles.tableBadgeText}>
                  Table {order.table_number ?? "-"}
                </Text>
              </View>
              <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={styles.cartButton}
            onPress={() => setIsCartVisible(true)}
          >
            <Feather name="shopping-bag" size={24} color="#111827" />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Menu</Text>
        <FlatList
          data={products.filter((p) => p.available)}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.productCard}>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.productPrice}>Add to order</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.addButton,
                  (!canEditOrder || addItemMutation.isPending) &&
                    styles.addButtonDisabled,
                ]}
                disabled={!canEditOrder || addItemMutation.isPending}
                onPress={() => handleAddProduct(item.id)}
              >
                {addItemMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Feather name="plus" size={20} color="#FFFFFF" />
                )}
              </TouchableOpacity>
            </View>
          )}
        />
      </View>

      <Modal
        visible={isCartVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsCartVisible(false)}
      >
        <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalDismissArea}
            onPress={() => setIsCartVisible(false)}
            activeOpacity={1}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Your Cart</Text>
              <TouchableOpacity
                onPress={() => setIsCartVisible(false)}
                style={styles.closeButton}
              >
                <Feather name="x" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {totalItems === 0 ? (
              <View style={styles.emptyCart}>
                <Feather name="shopping-cart" size={48} color="#D1D5DB" />
                <Text style={styles.emptyCartText}>Your cart is empty</Text>
              </View>
            ) : (
              <FlatList
                data={order.items ?? []}
                keyExtractor={(item) => item.id}
                style={styles.modalList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View style={styles.cartItemWrapper}>
                    <View style={styles.cartItemContent}>
                      <OrderItemRow item={item} />
                    </View>
                    {canEditOrder && (
                      <TouchableOpacity
                        style={styles.removeButton}
                        onPress={() => handleRemoveItem(item.id)}
                        disabled={removeItemMutation.isPending}
                      >
                        {removeItemMutation.isPending ? (
                          <ActivityIndicator color="#EF4444" size="small" />
                        ) : (
                          <Feather name="trash-2" size={20} color="#EF4444" />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!canSendToKitchen || updateStatusMutation.isPending) &&
                    styles.sendButtonDisabled,
                ]}
                disabled={!canSendToKitchen || updateStatusMutation.isPending}
                onPress={handleSendToKitchen}
              >
                {updateStatusMutation.isPending ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Feather name="bell" size={20} color="#FFFFFF" />
                    <Text style={styles.sendButtonText}>
                      {canEditOrder ? "Send to Kitchen" : "Already Sent"}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tableBadge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  tableBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#10B981",
    letterSpacing: 0.5,
  },
  cartButton: {
    width: 48,
    height: 48,
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#EF4444",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#F9FAFB",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  addButton: {
    backgroundColor: "#2563EB",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalDismissArea: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111827",
  },
  closeButton: {
    width: 40,
    height: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  modalList: {
    marginBottom: 24,
  },
  cartItemWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 16,
    marginBottom: 12,
    paddingRight: 16,
  },
  cartItemContent: {
    flex: 1,
  },
  removeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  },
  emptyCart: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyCartText: {
    marginTop: 16,
    fontSize: 16,
    color: "#9CA3AF",
    fontWeight: "600",
  },
  modalFooter: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  sendButton: {
    backgroundColor: "#10B981",
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    gap: 12,
  },
  sendButtonDisabled: {
    backgroundColor: "#D1D5DB",
  },
  sendButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
});