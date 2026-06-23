import { describe, expect, it } from "vitest";

import { normalizeNativeHealthConnectStatus } from "./androidHealthConnectAdapter";

describe("androidHealthConnectAdapter", () => {
  it("normalizes Capacitor status objects returned by the native plugin", () => {
    expect(normalizeNativeHealthConnectStatus({ status: "ready" })).toBe(
      "ready",
    );
    expect(
      normalizeNativeHealthConnectStatus({ status: "permission-missing" }),
    ).toBe("permission-missing");
  });

  it("keeps string statuses for compatibility with test doubles", () => {
    expect(normalizeNativeHealthConnectStatus("unavailable")).toBe(
      "unavailable",
    );
  });

  it("rejects unexpected native responses before they reach the UI", () => {
    expect(() =>
      normalizeNativeHealthConnectStatus({ status: "connected" }),
    ).toThrow("Resposta invalida do Health Connect.");
  });
});
