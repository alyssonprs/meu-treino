import type { LucideIcon } from "lucide-react";

export type AppScreen =
  | "home"
  | "workout"
  | "history"
  | "settings"
  | "active-workout"
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
