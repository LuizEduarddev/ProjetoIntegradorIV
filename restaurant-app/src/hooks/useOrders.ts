import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addOrderItem,
  createOrder,
  getOrder,
  removeOrderItem,
  updateOrderItem,
  updateOrderStatus
} from "../api/orders";
import type { OrderStatus } from "../types";

export function useOrder(orderId: string | null) {
  return useQuery({
    queryKey: ["order", orderId],
    queryFn: () => getOrder(orderId as string),
    enabled: Boolean(orderId)
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ tableId, notes }: { tableId: string; notes?: string }) => createOrder(tableId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tables"] });
    }
  });
}

export function useAddOrderItem(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { product_id: string; quantity: number; notes?: string }) => addOrderItem(orderId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    }
  });
}

export function useUpdateOrderItem(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity, notes }: { itemId: string; quantity?: number; notes?: string }) =>
      updateOrderItem(orderId, itemId, { quantity, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    }
  });
}

export function useRemoveOrderItem(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => removeOrderItem(orderId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
    }
  });
}

export function useUpdateOrderStatus(orderId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(orderId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order", orderId] });
      queryClient.invalidateQueries({ queryKey: ["tables"] });
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
    }
  });
}
