import { Capacitor } from "@capacitor/core";

import { androidHealthConnectAdapter } from "./androidHealthConnectAdapter";
import { webHealthConnectAdapter } from "./webHealthConnectAdapter";

export type {
  HealthConnectAdapter,
  HealthConnectExportResult,
  HealthConnectStatus,
  HealthConnectWorkoutExport,
  HealthConnectWorkoutSegment,
} from "./healthConnectAdapter";
export { androidHealthConnectAdapter } from "./androidHealthConnectAdapter";
export { webHealthConnectAdapter } from "./webHealthConnectAdapter";

export const healthConnectAdapter =
  Capacitor.getPlatform() === "android"
    ? androidHealthConnectAdapter
    : webHealthConnectAdapter;
