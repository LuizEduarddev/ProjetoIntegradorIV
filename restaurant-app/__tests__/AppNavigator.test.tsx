import React from "react";
import { act, render } from "@testing-library/react-native";

import { AppNavigator } from "../src/navigation/AppNavigator";
import { useAuthStore } from "../src/store/authStore";

jest.mock("../src/navigation/AuthStack", () => ({
  AuthStack: () => {
    const ReactLocal = require("react");
    const { Text } = require("react-native");
    return ReactLocal.createElement(Text, null, "AuthStack");
  }
}));

jest.mock("../src/navigation/AdminStack", () => ({
  AdminStack: () => {
    const ReactLocal = require("react");
    const { Text } = require("react-native");
    return ReactLocal.createElement(Text, null, "AdminStack");
  }
}));

jest.mock("../src/navigation/WaiterStack", () => ({
  WaiterStack: () => {
    const ReactLocal = require("react");
    const { Text } = require("react-native");
    return ReactLocal.createElement(Text, null, "WaiterStack");
  }
}));

jest.mock("../src/navigation/KitchenStack", () => ({
  KitchenStack: () => {
    const ReactLocal = require("react");
    const { Text } = require("react-native");
    return ReactLocal.createElement(Text, null, "KitchenStack");
  }
}));

describe("AppNavigator role routing", () => {
  afterEach(() => {
    act(() => {
      useAuthStore.setState({ user: null, token: null });
    });
  });

  it("shows auth stack when no user", () => {
    const { getByText } = render(<AppNavigator />);
    expect(getByText("AuthStack")).toBeTruthy();
  });

  it("shows waiter stack for waiter role", () => {
    act(() => {
      useAuthStore.setState({
        user: { user_id: "1", email: "w@test.com", role: "waiter" },
        token: "t"
      });
    });
    const { getByText } = render(<AppNavigator />);
    expect(getByText("WaiterStack")).toBeTruthy();
  });
});
