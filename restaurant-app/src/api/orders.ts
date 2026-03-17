import { client } from "./client";
import type { ItemStatus, Order, OrderItem, OrderStatus } from "../types";

export async function createOrder(tableId: string, notes?: string): Promise<Order> {
  const response = await client.post<Order>("/orders", {
    table_id: tableId,
    notes
  });
  return response.data;
}

export async function getOrder(orderId: string): Promise<Order> {
  const response = await client.get<Order>(`/orders/${orderId}`);
  return response.data;
}

export async function addOrderItem(orderId: string, payload: {
  product_id: string;
  quantity: number;
  notes?: string;
}): Promise<OrderItem> {
  const response = await client.post<OrderItem>(`/orders/${orderId}/items`, payload);
  return response.data;
}

export async function updateOrderItem(orderId: string, itemId: string, payload: {
  quantity?: number;
  notes?: string;
}): Promise<OrderItem> {
  const response = await client.patch<OrderItem>(`/orders/${orderId}/items/${itemId}`, payload);
  return response.data;
}

export async function removeOrderItem(orderId: string, itemId: string): Promise<void> {
  await client.delete(`/orders/${orderId}/items/${itemId}`);
}

export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<Order> {
  const response = await client.patch<Order>(`/orders/${orderId}/status`, { status });
  return response.data;
}

export async function updateKitchenItemStatus(
  orderId: string,
  itemId: string,
  status: ItemStatus
): Promise<OrderItem> {
  const response = await client.patch<OrderItem>(
    `/kitchen/orders/${orderId}/items/${itemId}/status`,
    { status }
  );
  return response.data;
}
