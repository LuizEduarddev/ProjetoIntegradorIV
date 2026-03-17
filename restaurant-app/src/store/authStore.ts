import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { loginAPI } from "../api/auth";
import type { User, UserRole } from "../types";

interface DecodedJWT {
  user_id: string;
  email: string;
  role: UserRole;
  exp: number;
  iat: number;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

function decodeUser(token: string): User {
  const payload = jwtDecode<DecodedJWT>(token);
  return {
    user_id: payload.user_id,
    email: payload.email,
    role: payload.role
  };
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: async (email: string, password: string) => {
        const response = await loginAPI(email, password);
        const user = decodeUser(response.token);
        set({ user, token: response.token });
      },
      logout: () => set({ user: null, token: null })
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => AsyncStorage)
    }
  )
);
