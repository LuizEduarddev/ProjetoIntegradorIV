import React from "react";

import { useAuthStore } from "../store/authStore";
import { AdminStack } from "./AdminStack";
import { AuthStack } from "./AuthStack";
import { KitchenStack } from "./KitchenStack";
import { WaiterStack } from "./WaiterStack";

export function AppNavigator(): React.JSX.Element {
  const user = useAuthStore((state) => state.user);

  if (!user) {
    return <AuthStack />;
  }

  switch (user.role) {
    case "admin":
      return <AdminStack />;
    case "waiter":
      return <WaiterStack />;
    case "kitchen":
      return <KitchenStack />;
    default:
      return <AuthStack />;
  }
}
