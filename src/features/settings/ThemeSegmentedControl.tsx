import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
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
    <div
      aria-label="Escolher tema"
      className="grid grid-cols-2 rounded-lg border border-border bg-secondary p-1"
      role="radiogroup"
    >
      {themeOptions.map((option) => {
        const isSelected = option.value === theme;
        const Icon = option.icon;

        return (
          <Button
            aria-checked={isSelected}
            className={cn(
              "h-11 gap-2 rounded-md border-0 text-sm",
              isSelected
                ? "bg-card text-foreground shadow-sm hover:bg-card"
                : "bg-transparent text-muted-foreground hover:bg-muted",
            )}
            key={option.value}
            onClick={() => setTheme(option.value)}
            role="radio"
            type="button"
            variant="ghost"
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {option.label}
          </Button>
        );
      })}
    </div>
  );
}
