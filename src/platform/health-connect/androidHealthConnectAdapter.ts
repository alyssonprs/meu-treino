import { registerPlugin } from "@capacitor/core";

import type {
  HealthConnectAdapter,
  HealthConnectExportResult,
  HealthConnectStatus,
  HealthConnectWorkoutExport,
} from "./healthConnectAdapter";

type NativeHealthConnectStatusResult =
  | HealthConnectStatus
  | {
      status?: unknown;
    };

type NativeHealthConnectPlugin = {
  getStatus(): Promise<NativeHealthConnectStatusResult>;
  requestPermissions(): Promise<NativeHealthConnectStatusResult>;
  openSettings(): Promise<void>;
  exportWorkoutSession(
    input: HealthConnectWorkoutExport,
  ): Promise<HealthConnectExportResult>;
};

const healthConnectPlugin =
  registerPlugin<NativeHealthConnectPlugin>("HealthConnect");

export const androidHealthConnectAdapter: HealthConnectAdapter = {
  async getStatus() {
    return normalizeNativeHealthConnectStatus(await healthConnectPlugin.getStatus());
  },
  async requestPermissions() {
    return normalizeNativeHealthConnectStatus(
      await healthConnectPlugin.requestPermissions(),
    );
  },
  async openSettings() {
    await healthConnectPlugin.openSettings();
  },
  async exportWorkoutSession(input) {
    return healthConnectPlugin.exportWorkoutSession(input);
  },
};

export function normalizeNativeHealthConnectStatus(
  result: NativeHealthConnectStatusResult,
): HealthConnectStatus {
  if (isHealthConnectStatus(result)) {
    return result;
  }

  if (
    result &&
    typeof result === "object" &&
    "status" in result &&
    isHealthConnectStatus(result.status)
  ) {
    return result.status;
  }

  throw new Error("Resposta invalida do Health Connect.");
}

function isHealthConnectStatus(value: unknown): value is HealthConnectStatus {
  return (
    value === "unsupported-platform" ||
    value === "unavailable" ||
    value === "requires-install" ||
    value === "available" ||
    value === "permission-missing" ||
    value === "ready"
  );
}
