import type {
  HealthConnectAdapter,
  HealthConnectExportResult,
  HealthConnectStatus,
} from "./healthConnectAdapter";

const unsupportedStatus: HealthConnectStatus = "unsupported-platform";

export const webHealthConnectAdapter: HealthConnectAdapter = {
  async getStatus() {
    return unsupportedStatus;
  },
  async requestPermissions() {
    return unsupportedStatus;
  },
  async openSettings() {
    return;
  },
  async exportWorkoutSession(): Promise<HealthConnectExportResult> {
    return {
      success: false,
      message: "Health Connect esta disponivel apenas no app Android.",
    };
  },
};
