export type UserRole = "admin" | "waiter" | "kitchen";

export interface User {
  user_id: string;
  email: string;
  role: UserRole;
}

export type TableStatus = "free" | "occupied" | "waiting" | "closed";

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  available: boolean;
  created_at: string;
  updated_at: string;
}

export type OrderStatus = "open" | "sent" | "closed" | "cancelled";
export type ItemStatus = "pending" | "preparing" | "ready";

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name?: string;
  quantity: number;
  unit_price: number;
  notes: string;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  table_id: string;
  table_number?: number;
  waiter_id: string;
  status: OrderStatus;
  notes: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  token: string;
}
