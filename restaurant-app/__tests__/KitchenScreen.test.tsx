import React from "react";
import { render, waitFor } from "@testing-library/react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { KitchenScreen } from "../src/screens/kitchen/KitchenScreen";

const server = setupServer(
  rest.get("http://localhost:8080/kitchen/orders", (_req, res, ctx) =>
    res(
      ctx.json([
        {
          id: "1",
          table_id: "table-1",
          table_number: 3,
          waiter_id: "waiter-1",
          status: "sent",
          notes: "",
          created_at: "2026-01-01T00:00:00Z",
          updated_at: "2026-01-01T00:00:00Z",
          items: [
            {
              id: "item-1",
              order_id: "1",
              product_id: "prod-1",
              product_name: "Burger",
              quantity: 2,
              unit_price: 12.5,
              notes: "",
              status: "pending",
              created_at: "2026-01-01T00:00:00Z",
              updated_at: "2026-01-01T00:00:00Z"
            }
          ]
        }
      ])
    )
  )
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

it("displays pending orders from API", async () => {
  const queryClient = new QueryClient();

  const { getByText } = render(
    <QueryClientProvider client={queryClient}>
      <KitchenScreen />
    </QueryClientProvider>
  );

  await waitFor(() => {
    expect(getByText("Table 3")).toBeTruthy();
  });
});
