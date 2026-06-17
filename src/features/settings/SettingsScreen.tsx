import { Settings } from "lucide-react";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

export function SettingsScreen() {
  return (
    <section className="mt-6 rounded-lg border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <Settings className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-info">Ajustes</p>
          <h2 className="text-2xl font-semibold">Preferencias locais</h2>
        </div>
      </div>

      <div className="mt-5">
        <h3 className="font-medium">Tema do app</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          A preferencia fica salva neste dispositivo.
        </p>
        <div className="mt-3">
          <ThemeSegmentedControl />
        </div>
      </div>
    </section>
  );
}

