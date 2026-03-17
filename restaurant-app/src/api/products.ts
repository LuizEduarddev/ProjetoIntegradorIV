import { client } from "./client";
import type { Product } from "../types";

export async function getProducts(): Promise<Product[]> {
  const response = await client.get<Product[]>("/products");
  return response.data;
}

export async function createProduct(payload: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product> {
  const response = await client.post<Product>("/products", payload);
  return response.data;
}

export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const response = await client.patch<Product>(`/products/${id}`, payload);
  return response.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await client.delete(`/products/${id}`);
}
