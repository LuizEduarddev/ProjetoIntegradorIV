import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getKitchenOrders } from "../api/kitchen";
import { updateKitchenItemStatus } from "../api/orders";
import type { ItemStatus } from "../types";

export function useKitchenOrders() {
  return useQuery({
    queryKey: ["kitchen-orders"],
    queryFn: getKitchenOrders,
    refetchInterval: 4000,
    staleTime: 0
  });
}

export function useUpdateKitchenItemStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, itemId, status }: { orderId: string; itemId: string; status: ItemStatus }) =>
      updateKitchenItemStatus(orderId, itemId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen-orders"] });
      queryClient.invalidateQueries({ queryKey: ["order"] });
    }
  });
}
