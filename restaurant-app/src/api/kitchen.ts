import { client } from "./client";
import type { Order } from "../types";

export async function getKitchenOrders(): Promise<Order[]> {
  const response = await client.get<Order[]>("/kitchen/orders");
  return response.data;
}
