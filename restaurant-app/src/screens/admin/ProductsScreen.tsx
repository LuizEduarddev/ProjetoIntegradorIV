import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../api/products";
import { LoadingSpinner } from "../../components/LoadingSpinner";

export function ProductsScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [available, setAvailable] = useState(true);

  // Mutations
  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => Alert.alert("Error", "Could not create product"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => Alert.alert("Error", "Could not update product"),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      closeModal();
    },
    onError: () => Alert.alert("Error", "Could not delete product"),
  });

  const openModal = (product?: any) => {
    if (product) {
      setEditingProduct(product);
      setName(product.name);
      setDescription(product.description || "");
      setPrice(product.price.toString());
      setCategory(product.category || "");
      setAvailable(product.available);
    } else {
      setEditingProduct(null);
      setName("");
      setDescription("");
      setPrice("");
      setCategory("");
      setAvailable(true);
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingProduct(null);
  };

  const handleSave = () => {
    if (!name || !price) {
      Alert.alert("Validation Error", "Name and Price are required.");
      return;
    }

    const productData = {
      name,
      description,
      price: parseFloat(price.replace(",", ".")),
      category,
      available,
    };

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, data: productData });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleDelete = () => {
    if (!editingProduct) return;
    deleteMutation.mutate(editingProduct.id);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Products</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{products.length} Total</Text>
          </View>
        </View>

        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardContent}>
                <View style={styles.productInfo}>
                  <Text style={styles.name}>{item.name}</Text>
                  {item.category ? (
                    <Text style={styles.category}>{item.category}</Text>
                  ) : null}
                  <View style={styles.priceRow}>
                    <Text style={styles.price}>${item.price.toFixed(2)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: item.available
                            ? "#D1FAE5"
                            : "#FEE2E2",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: item.available ? "#065F46" : "#991B1B" },
                        ]}
                      >
                        {item.available ? "AVAILABLE" : "UNAVAILABLE"}
                      </Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openModal(item)}
                >
                  <Feather name="edit-2" size={20} color="#4B5563" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />

        <TouchableOpacity style={styles.fab} onPress={() => openModal()}>
          <Feather name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <BlurView intensity={40} tint="dark" style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.keyboardView}
          >
            <TouchableOpacity
              style={styles.modalDismissArea}
              onPress={closeModal}
              activeOpacity={1}
            />
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingProduct ? "Edit Product" : "New Product"}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Name *</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Classic Burger"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 12 }]}>
                    <Text style={styles.label}>Price *</Text>
                    <TextInput
                      style={styles.input}
                      value={price}
                      onChangeText={setPrice}
                      placeholder="0.00"
                      keyboardType="decimal-pad"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Category</Text>
                    <TextInput
                      style={styles.input}
                      value={category}
                      onChangeText={setCategory}
                      placeholder="e.g. Mains"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Description</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Brief description of the product"
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                  />
                </View>

                <View style={styles.switchRow}>
                  <Text style={styles.switchLabel}>Available in Menu</Text>
                  <Switch
                    value={available}
                    onValueChange={setAvailable}
                    trackColor={{ false: "#D1D5DB", true: "#10B981" }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                {editingProduct && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={isPending}
                  >
                    <Feather name="trash-2" size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.saveButton, isPending && styles.saveButtonDisabled]}
                  onPress={handleSave}
                  disabled={isPending}
                >
                  {isPending ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.saveButtonText}>
                      {editingProduct ? "Save Changes" : "Create Product"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111827",
  },
  badge: {
    backgroundColor: "#E5E7EB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
  },
  listContent: {
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  productInfo: {
    flex: 1,
    paddingRight: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  category: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "800",
    color: "#2563EB",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  editButton: {
    width: 44,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 20,
    width: 64,
    height: 64,
    backgroundColor: "#111827",
    borderRadius: 32,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  keyboardView: {
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
  formContainer: {
    marginBottom: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
  },
  modalActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  deleteButton: {
    width: 56,
    height: 56,
    backgroundColor: "#FEE2E2",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#2563EB",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  saveButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});