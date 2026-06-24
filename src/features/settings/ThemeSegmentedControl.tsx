import { Moon, Sun } from "lucide-react";
import { cn } from "@/components/ui/utils";
import { useTheme, type ThemePreference } from "@/theme/theme";

const themeOptions: Array<{
  value: ThemePreference;
  label: string;
  icon: typeof Moon;
}> = [
  { value: "dark", label: "Escuro", icon: Moon },
  { value: "light", label: "Claro", icon: Sun },
];

export function ThemeSegmentedControl() {
  const { setTheme, theme } = useTheme();

  return (
    <fieldset className="grid grid-cols-2 rounded-lg border border-border bg-secondary p-1">
      <legend className="sr-only">Escolher tema</legend>
      {themeOptions.map((option) => {
        const isSelected = option.value === theme;
        const Icon = option.icon;

        return (
          <label className="cursor-pointer" key={option.value}>
            <input
              checked={isSelected}
              className="peer sr-only"
              name="theme-preference"
              onChange={() => setTheme(option.value)}
              type="radio"
              value={option.value}
            />
            <span
              className={cn(
                "flex h-11 items-center justify-center gap-2 rounded-md text-sm font-semibold transition-colors peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                isSelected
                  ? "bg-card text-foreground shadow-sm hover:bg-card"
                  : "bg-transparent text-muted-foreground hover:bg-muted",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {option.label}
            </span>
          </label>
        );
      })}
    </fieldset>
  );
}
