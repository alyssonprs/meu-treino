import { History } from "lucide-react";
import { LoadHistoryPanel } from "./LoadHistoryPanel";
import type { ExerciseLoadSummary } from "@/services/progressService";

export function ProgressScreen({
  loadSummaries,
}: {
  loadSummaries: ExerciseLoadSummary[];
}) {
  return (
    <>
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <History className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-info">Historico</p>
            <h2 className="text-2xl font-semibold">Progresso local</h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-6 text-muted-foreground">
          Esta tela concentra o historico fora da home. As consultas detalhadas
          de sessoes e exercicios entram na execucao dedicada de historico.
        </p>
      </section>

      <LoadHistoryPanel summaries={loadSummaries} />
    </>
  );
}

