import { Moon, Sun } from "lucide-react";
import type { ReactNode } from "react";
import { SegmentedButton } from "@/components/ui/segmented-button";
import { useTheme, type ThemePreference } from "@/theme/theme";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: ReactNode;
}> = [
  { value: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
  { value: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
];

export function ThemeSegmentedControl() {
  const { setTheme, theme } = useTheme();

  return (
    <SegmentedButton
      aria-label="Escolher tema"
      className="grid w-full grid-cols-2"
      name="theme-preference"
      onValueChange={setTheme}
      options={themeOptions}
      value={theme}
    />
  );
}
