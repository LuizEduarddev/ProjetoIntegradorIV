import { client } from "./client";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "waiter" | "kitchen";
  active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUsers(): Promise<AppUser[]> {
  const response = await client.get<AppUser[]>("/users");
  return response.data;
}

export async function createUser(data: Partial<AppUser> & { password?: string }): Promise<AppUser> {
  const response = await client.post<AppUser>("/users", data);
  return response.data;
}

export async function updateUser(id: string, data: Partial<AppUser>): Promise<AppUser> {
  const response = await client.patch<AppUser>(`/users/${id}`, data);
  return response.data;
}

export async function deactivateUser(id: string): Promise<void> {
  await client.patch(`/users/${id}/deactivate`);
}