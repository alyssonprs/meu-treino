export type HealthConnectStatus =
  | "unsupported-platform"
  | "unavailable"
  | "requires-install"
  | "available"
  | "permission-missing"
  | "ready";

export type HealthConnectWorkoutExport = {
  sessionId: string;
  clientRecordId: string;
  clientRecordVersion: number;
  title: string;
  notes: string | null;
  startedAt: string;
  completedAt: string;
  exerciseType: "weightlifting";
  segments: HealthConnectWorkoutSegment[];
};

export type HealthConnectWorkoutSegment = {
  exerciseName: string;
  startedAt: string;
  completedAt: string;
  repetitions: number | null;
  weightKg: number | null;
  setIndex: number | null;
};

export type HealthConnectExportResult = {
  success: boolean;
  recordIds?: string[];
  message?: string;
};

export type HealthConnectAdapter = {
  getStatus(): Promise<HealthConnectStatus>;
  requestPermissions(): Promise<HealthConnectStatus>;
  openSettings(): Promise<void>;
  exportWorkoutSession(
    input: HealthConnectWorkoutExport,
  ): Promise<HealthConnectExportResult>;
};
