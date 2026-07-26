import {
  Database,
  Download,
  FileInput,
  Info,
  Settings,
  Trash2,
  Upload,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRef, useState } from "react";
import { ConfirmationDialog } from "@/components/ConfirmationDialog";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { PromptCopyButton } from "@/features/import-export/PromptCopyButton";
import type { HealthConnectAdapter } from "@/platform/health-connect";
import type { ActiveWorkoutPlanSnapshot } from "@/storage/workoutPlanRepository";
import { HealthConnectSettingsCard } from "./HealthConnectSettingsCard";
import { ThemeSegmentedControl } from "./ThemeSegmentedControl";

type BackupActionResult = {
  success: boolean;
  message: string;
  details?: string[];
};

type SettingsScreenProps = {
  activePlan: ActiveWorkoutPlanSnapshot | null;
  appVersion: string;
  healthConnectAdapter: HealthConnectAdapter;
  isClearingLocalData: boolean;
  getHealthConnectAutoExportEnabled: () => Promise<boolean>;
  onChooseImportFile: () => void;
  onClearLocalData: () => Promise<void>;
  onExportLocalBackup: () => Promise<BackupActionResult>;
  onRestoreLocalBackupFile: (file: File) => Promise<BackupActionResult>;
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
  onExportLocalBackup,
  onRestoreLocalBackupFile,
  setHealthConnectAutoExportEnabled,
}: SettingsScreenProps) {
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [activeDialog, setActiveDialog] = useState<
    "clear" | "feedback" | "restore" | null
  >(null);
  const [pendingBackupFile, setPendingBackupFile] = useState<File | null>(null);
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupFeedback, setBackupFeedback] =
    useState<BackupActionResult | null>(null);

  async function handleExportBackup() {
    setIsExportingBackup(true);
    setBackupFeedback(null);

    try {
      setBackupFeedback(await onExportLocalBackup());
      setActiveDialog("feedback");
    } finally {
      setIsExportingBackup(false);
    }
  }

  async function handleRestoreBackup(file: File) {
    setIsRestoringBackup(true);
    setBackupFeedback(null);

    try {
      setBackupFeedback(await onRestoreLocalBackupFile(file));
      setActiveDialog("feedback");
    } finally {
      setIsRestoringBackup(false);

      if (backupFileInputRef.current) {
        backupFileInputRef.current.value = "";
      }
    }
  }

  async function confirmRestoreBackup() {
    if (!pendingBackupFile) {
      return;
    }

    await handleRestoreBackup(pendingBackupFile);
    setPendingBackupFile(null);
  }

  async function confirmClearLocalData() {
    await onClearLocalData();
    setActiveDialog(null);
  }

  return (
    <>
      <section className="mt-4 space-y-5">
      <PageHeader
        icon={Settings}
        label="Ajustes"
        title="Preferências locais"
      />

      <Card padding="lg" variant="outlined">

        <div className="mt-5">
          <h3 className="font-medium">Tema do app</h3>
          <p className="mt-1 text-body-md leading-6 text-md-on-surface-variant">
            A preferencia fica salva neste dispositivo e muda sem reiniciar.
          </p>
          <div className="mt-3">
            <ThemeSegmentedControl />
          </div>
        </div>
      </Card>

      <HealthConnectSettingsCard
        adapter={healthConnectAdapter}
        getAutoExportEnabled={getHealthConnectAutoExportEnabled}
        setAutoExportEnabled={setHealthConnectAutoExportEnabled}
      />

      {activePlan ? (
        <Card className="mt-5" padding="lg" variant="outlined">
          <SectionHeader
            icon={FileInput}
            label="Treino e JSON"
            title="Plano ativo"
          />
          <p className="mt-4 text-body-md leading-6 text-md-on-surface-variant">
            Substitua o treino atual por outro JSON validado ou copie o prompt
            pronto para gerar um novo plano com IA.
          </p>
          <div className="mt-4 rounded-md bg-md-surface-container-high p-3">
            <p className="text-body-md text-md-on-surface-variant">Plano atual</p>
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
        </Card>
      ) : null}

      <Card className="mt-5" padding="lg" variant="outlined">
        <SectionHeader
          icon={Database}
          label="Dados locais"
          title="Armazenamento"
        />
        <div className="mt-4 rounded-md bg-md-surface-container-high p-3">
          <p className="text-sm font-semibold">Backup local</p>
          <p className="mt-1 text-body-md leading-6 text-md-on-surface-variant">
            Baixe um arquivo com plano ativo, sessoes, cargas e preferencias.
            Ao restaurar, os dados atuais deste dispositivo serao substituidos.
          </p>
          <div className="mt-4 grid gap-3">
            <Button
              className="h-12 justify-start gap-3"
              disabled={isExportingBackup || isRestoringBackup}
              onClick={() => {
                void handleExportBackup();
              }}
              type="button"
            >
              <Download className="h-5 w-5" aria-hidden="true" />
              {isExportingBackup ? "Gerando backup..." : "Baixar backup"}
            </Button>
            <Button
              className="h-12 justify-start gap-3"
              disabled={isExportingBackup || isRestoringBackup}
              onClick={() => backupFileInputRef.current?.click()}
              type="button"
              variant="secondary"
            >
              <Upload className="h-5 w-5" aria-hidden="true" />
              {isRestoringBackup ? "Restaurando..." : "Restaurar backup"}
            </Button>
          </div>
          <input
            accept="application/json,.json"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];

              if (file) {
                setPendingBackupFile(file);
                setActiveDialog("restore");
              }
            }}
            ref={backupFileInputRef}
            type="file"
          />
        </div>

        <Button
          className="mt-4 h-12 w-full justify-start gap-3 border-md-error text-md-error hover:bg-md-error-container"
          onClick={() => setActiveDialog("clear")}
          type="button"
          variant="secondary"
        >
          <Trash2 className="h-5 w-5" aria-hidden="true" />
          Apagar dados locais
        </Button>
      </Card>

      <Card className="mt-5" padding="lg" variant="outlined">
        <SectionHeader icon={Info} label="App" title="Informacoes" />
        <dl className="mt-4 grid gap-3">
          <InfoRow label="Versao" value={appVersion} />
          <InfoRow label="Armazenamento" value="Local no dispositivo" />
          <InfoRow label="Modo" value="PWA offline-first" />
        </dl>
      </Card>

      </section>

      <ConfirmationDialog
        cancelLabel="Cancelar"
        confirmLabel={isRestoringBackup ? "Restaurando..." : "Restaurar backup"}
        isDestructive
        isOpen={activeDialog === "restore"}
        isPending={isRestoringBackup}
        onCancel={() => {
          setPendingBackupFile(null);
          setActiveDialog(null);
          if (backupFileInputRef.current) {
            backupFileInputRef.current.value = "";
          }
        }}
        onConfirm={() => {
          void confirmRestoreBackup();
        }}
        title="Restaurar este backup?"
        tone="warning"
      >
        Os dados atuais deste dispositivo serão substituídos pelo conteúdo de
        <span className="font-medium text-md-on-surface"> {pendingBackupFile?.name ?? "o arquivo selecionado"}</span>.
      </ConfirmationDialog>

      <ConfirmationDialog
        cancelLabel="Cancelar"
        confirmLabel={isClearingLocalData ? "Apagando..." : "Apagar dados"}
        isDestructive
        isOpen={activeDialog === "clear"}
        isPending={isClearingLocalData}
        onCancel={() => setActiveDialog(null)}
        onConfirm={() => {
          void confirmClearLocalData();
        }}
        title="Apagar todos os dados de treino?"
        tone="danger"
      >
        Isso remove o plano ativo, o progresso, o histórico de treinos e as
        cargas salvas neste dispositivo.
      </ConfirmationDialog>

      <ConfirmationDialog
        confirmLabel="Entendi"
        isOpen={activeDialog === "feedback" && backupFeedback !== null}
        onConfirm={() => {
          setBackupFeedback(null);
          setActiveDialog(null);
        }}
        title={backupFeedback?.success ? "Ação concluída" : "Não foi possível concluir"}
        tone={backupFeedback?.success ? "success" : "danger"}
      >
        <p>{backupFeedback?.message}</p>
        {backupFeedback?.details?.length ? (
          <ul className="mt-3 list-disc space-y-1 pl-5">
            {backupFeedback.details.map((detail) => (
              <li key={detail}>{detail}</li>
            ))}
          </ul>
        ) : null}
      </ConfirmationDialog>
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
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-md-secondary-container text-md-on-secondary-container">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div>
        <p className="text-label-lg font-medium text-md-secondary">{label}</p>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-md-surface-container-high p-3">
      <dt className="text-body-md text-md-on-surface-variant">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  );
}
