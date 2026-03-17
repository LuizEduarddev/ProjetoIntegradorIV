import { client } from "./client";
import type { Table, TableStatus } from "../types";

export async function getTables(): Promise<Table[]> {
  const response = await client.get<Table[]>("/tables");
  return response.data;
}

export async function createTable(number: number): Promise<Table> {
  const response = await client.post<Table>("/tables", { number });
  return response.data;
}

export async function updateTableStatus(id: string, status: TableStatus): Promise<Table> {
  const response = await client.patch<Table>(`/tables/${id}/status`, { status });
  return response.data;
}
