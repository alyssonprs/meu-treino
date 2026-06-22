import { registerPlugin } from "@capacitor/core";

import type { HealthConnectAdapter } from "./healthConnectAdapter";

const healthConnectPlugin = registerPlugin<HealthConnectAdapter>("HealthConnect");

export const androidHealthConnectAdapter: HealthConnectAdapter = healthConnectPlugin;
