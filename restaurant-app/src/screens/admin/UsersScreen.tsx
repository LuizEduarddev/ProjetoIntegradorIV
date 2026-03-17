import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import {
  getUsers,
  createUser,
  updateUser,
  deactivateUser,
} from "../../api/users";
import { LoadingSpinner } from "../../components/LoadingSpinner";

const ROLES = ["admin", "waiter", "kitchen"] as const;
type Role = typeof ROLES[number];

const getRoleConfig = (role: string) => {
  switch (role.toLowerCase()) {
    case "admin":
      return { bg: "#EDE9FE", text: "#6D28D9", icon: "shield" };
    case "kitchen":
      return { bg: "#FFEDD5", text: "#C2410C", icon: "coffee" };
    default:
      return { bg: "#DBEAFE", text: "#1D4ED8", icon: "user" };
  }
};

export function UsersScreen(): React.JSX.Element {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("waiter");

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: deactivateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      closeModal();
    },
  });

  const openModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setName(user.name);
      setEmail(user.email);
      setRole(user.role);
      setPassword("");
    } else {
      setEditingUser(null);
      setName("");
      setEmail("");
      setPassword("");
      setRole("waiter");
    }
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingUser(null);
  };

  const handleSave = () => {
    if (!name || !email || (!editingUser && !password)) {
      return;
    }

    if (editingUser) {
      updateMutation.mutate({
        id: editingUser.id,
        data: { name, email, role },
      });
    } else {
      createMutation.mutate({ name, email, password, role });
    }
  };

  const handleDeactivate = () => {
    if (!editingUser) return;
    deactivateMutation.mutate(editingUser.id);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    deactivateMutation.isPending;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Team Members</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{users.length} Users</Text>
          </View>
        </View>

        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const roleConfig = getRoleConfig(item.role);
            const initials = item.name
              ? item.name.substring(0, 2).toUpperCase()
              : "U";

            return (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.avatarContainer}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.email}>{item.email}</Text>
                    <View
                      style={[
                        styles.roleBadge,
                        { backgroundColor: roleConfig.bg },
                      ]}
                    >
                      <Feather
                        name={roleConfig.icon as any}
                        size={12}
                        color={roleConfig.text}
                      />
                      <Text
                        style={[
                          styles.roleText,
                          { color: roleConfig.text },
                        ]}
                      >
                        {item.role.toUpperCase()}
                      </Text>
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
            );
          }}
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
                  {editingUser ? "Edit User" : "New User"}
                </Text>
                <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                  <Feather name="x" size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <View style={styles.formContainer}>
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="John Doe"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email Address</Text>
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="john@restaurant.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {!editingUser && (
                  <View style={styles.inputGroup}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                      style={styles.input}
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Minimum 6 characters"
                      secureTextEntry
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Role</Text>
                  <View style={styles.roleSelectionContainer}>
                    {ROLES.map((r) => {
                      const isSelected = role === r;
                      return (
                        <TouchableOpacity
                          key={r}
                          style={[
                            styles.roleOption,
                            isSelected && styles.roleOptionSelected,
                          ]}
                          onPress={() => setRole(r)}
                        >
                          <Text
                            style={[
                              styles.roleOptionText,
                              isSelected && styles.roleOptionTextSelected,
                            ]}
                          >
                            {r.charAt(0).toUpperCase() + r.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>

              <View style={styles.modalActions}>
                {editingUser && (
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDeactivate}
                    disabled={isPending}
                  >
                    <Feather name="user-x" size={20} color="#EF4444" />
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
                      {editingUser ? "Save Changes" : "Create User"}
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
    borderRadius: 20,
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
    padding: 16,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B5563",
    letterSpacing: 1,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 8,
    fontWeight: "500",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  editButton: {
    width: 44,
    height: 44,
    backgroundColor: "#F9FAFB",
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
  roleSelectionContainer: {
    flexDirection: "row",
    gap: 8,
  },
  roleOption: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  roleOptionSelected: {
    backgroundColor: "#111827",
    borderColor: "#111827",
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  roleOptionTextSelected: {
    color: "#FFFFFF",
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