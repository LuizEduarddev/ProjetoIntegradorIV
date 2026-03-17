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
