import axios from "axios";

import type { LoginResponse } from "../types";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:8080";

export async function loginAPI(email: string, password: string): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${baseURL}/auth/login`,
    {
      email,
      password
    },
    {
      timeout: 10000
    }
  );

  return response.data;
}
