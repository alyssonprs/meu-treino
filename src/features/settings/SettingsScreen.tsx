import {
  Database,
  FileInput,
  Info,
  Settings,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PromptCopyButton } from "@/features/import-export/PromptCopyButton";
import type { HealthConnectAdapter } from "@/platform/health-connect";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";
import { HealthConnectSettingsCard } from "./HealthConnectSettingsCard";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

type SettingsScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  appVersion: string;
  healthConnectAdapter: HealthConnectAdapter;
  isClearingLocalData: boolean;
  getHealthConnectAutoExportEnabled: () => Promise<boolean>;
  onChooseImportFile: () => void;
  onClearLocalData: () => Promise<void>;
  setHealthConnectAutoExportEnabled: (enabled: boolean) => Promise<void>;
};

export function SettingsScreen({
  activePlan,
  appVersion,
  healthConnectAdapter,
  isClearingLocalData,
  getHealthConnectAutoExportEnabled,
  onChooseImportFile,
  onClearLocalData,
  setHealthConnectAutoExportEnabled,
}: SettingsScreenProps) {
  const [showClearConfirmation, setShowClearConfirmation] = useState(false);

  return (
    <>
      <section className="mt-6 rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
            <Settings className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm font-medium text-info">Ajustes</p>
            <h2 className="text-2xl font-semibold">Preferências locais</h2>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="font-medium">Tema do app</h3>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            A preferência fica salva neste dispositivo e muda sem reiniciar.
          </p>
          <div className="mt-3">
            <ThemeSegmentedControl />
          </div>
        </div>
      </section>

      <HealthConnectSettingsCard
        adapter={healthConnectAdapter}
        getAutoExportEnabled={getHealthConnectAutoExportEnabled}
        setAutoExportEnabled={setHealthConnectAutoExportEnabled}
      />

      {activePlan ? (
        <section className="mt-5 rounded-lg border border-border bg-card p-5">
          <SectionHeader
            icon={FileInput}
            label="Treino e JSON"
            title="Plano ativo"
          />
          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            Substitua o treino atual por outro JSON validado ou copie o prompt
            pronto para gerar um novo plano com IA.
          </p>
          <div className="mt-4 rounded-md bg-muted p-3">
            <p className="text-sm text-muted-foreground">Plano atual</p>
            <p className="mt-1 font-semibold">{activePlan.plan.name}</p>
          </div>
          <div className="mt-4 grid gap-3">
            <Button
              className="h-12 justify-start gap-3"
              onClick={onChooseImportFile}
              type="button"
            >
              <FileInput className="h-5 w-5" aria-hidden="true" />
              Substituir treino atual
            </Button>
            <PromptCopyButton className="h-12 w-full justify-start gap-3" />
          </div>
        </section>
      ) : null}

      <section className="mt-5 rounded-lg border border-border bg-card p-5">
        <SectionHeader
          icon={Database}
          label="Dados locais"
          title="Armazenamento"
        />
        <div className="mt-4 rounded-md bg-muted p-3">
          <p className="text-sm font-semibold">Backup local</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">
            Planejado para uma etapa própria. Nenhuma ação de backup aparece
            como funcional até a exportação e a restauração serem implementadas.
          </p>
        </div>

        {showClearConfirmation ? (
          <div className="mt-4 rounded-lg border border-destructive bg-background p-4">
            <p className="font-semibold text-destructive">
              Apagar todos os dados de treino?
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Isso remove plano ativo, progresso, histórico de treinos e cargas
              salvas neste dispositivo.
            </p>
            <div className="mt-4 grid gap-2">
              <Button
                className="h-12 gap-2 bg-destructive text-white hover:brightness-95"
                disabled={isClearingLocalData}
                onClick={() => {
                  void onClearLocalData().then(() =>
                    setShowClearConfirmation(false),
                  );
                }}
                type="button"
              >
                <Trash2 className="h-5 w-5" aria-hidden="true" />
                {isClearingLocalData ? "Apagando..." : "Confirmar limpeza"}
              </Button>
              <Button
                className="h-12"
                disabled={isClearingLocalData}
                onClick={() => setShowClearConfirmation(false)}
                type="button"
                variant="secondary"
              >
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <Button
            className="mt-4 h-12 w-full justify-start gap-3 border-destructive text-destructive hover:bg-muted"
            onClick={() => setShowClearConfirmation(true)}
            type="button"
            variant="secondary"
          >
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            Apagar dados locais
          </Button>
        )}
      </section>

      <section className="mt-5 rounded-lg border border-border bg-card p-5">
        <SectionHeader icon={Info} label="App" title="Informações" />
        <dl className="mt-4 grid gap-3">
          <InfoRow label="Versão" value={appVersion} />
          <InfoRow label="Armazenamento" value="Local no dispositivo" />
          <InfoRow label="Modo" value="PWA offline-first" />
        </dl>
      </section>
    </>
  );
}

function SectionHeader({
  icon: Icon,
  label,
  title,
}: {
  icon: LucideIcon;
  label: string;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium text-info">{label}</p>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-muted p-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}
