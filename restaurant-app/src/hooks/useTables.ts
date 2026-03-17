import { useQuery } from "@tanstack/react-query";

import { getTables } from "../api/tables";

export function useTables() {
  return useQuery({
    queryKey: ["tables"],
    queryFn: getTables,
    refetchInterval: 10000
  });
}
