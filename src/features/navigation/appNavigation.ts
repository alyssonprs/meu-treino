import type { LucideIcon } from "lucide-react";

export type AppScreen =
  | "home"
  | "workout"
  | "history"
  | "settings"
  | "history-detail"
  | "import-preview"
  | "import-error"
  | "active-workout"
  | "active-exercise"
  | "workout-finished";

export type MainTabScreen = Extract<
  AppScreen,
  "home" | "workout" | "history" | "settings"
>;

export type NavItemDefinition = {
  screen: MainTabScreen;
  label: string;
  icon: LucideIcon;
};

export const mainTabHashByScreen: Record<MainTabScreen, string> = {
  history: "#/historico",
  home: "#/",
  settings: "#/ajustes",
  workout: "#/treino",
};
