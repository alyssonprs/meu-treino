import type { WorkoutPlanPreview } from "@/services/workoutImportService";

export type ImportStatus =
  | {
      state: "idle";
      fileName: null;
      preview: null;
      errors: [];
    }
  | {
      state: "preview";
      fileName: string;
      preview: WorkoutPlanPreview;
      errors: [];
    }
  | {
      state: "error";
      fileName: string | null;
      preview: null;
      errors: { path: string; message: string }[];
    }
  | {
      state: "saving";
      fileName: string;
      preview: WorkoutPlanPreview;
      errors: [];
    }
  | {
      state: "saved";
      fileName: string;
      preview: WorkoutPlanPreview;
      errors: [];
    };

export const idleImportStatus: ImportStatus = {
  state: "idle",
  fileName: null,
  preview: null,
  errors: [],
};

