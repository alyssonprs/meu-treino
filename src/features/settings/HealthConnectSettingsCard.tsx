import { Activity, ExternalLink, RefreshCw, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/components/ui/utils";
import type {
  HealthConnectAdapter,
  HealthConnectStatus,
} from "@/platform/health-connect";

type HealthConnectSettingsCardProps = {
  adapter: HealthConnectAdapter;
  getAutoExportEnabled: () => Promise<boolean>;
  setAutoExportEnabled: (enabled: boolean) => Promise<void>;
};

type LoadState = "loading" | "ready" | "error";

const statusContent: Record<
  HealthConnectStatus,
  {
    label: string;
    title: string;
    description: string;
  }
> = {
  "unsupported-platform": {
    label: "Indisponivel",
    title: "Disponivel apenas no app Android",
    description:
      "No PWA, seus treinos continuam salvos localmente sem Health Connect.",
  },
  unavailable: {
    label: "Indisponivel",
    title: "Health Connect nao esta disponivel",
    description:
      "Use um Android compativel e mantenha o Health Connect atualizado para conectar.",
  },
  "requires-install": {
    label: "Acao necessaria",
    title: "Instale ou atualize o Health Connect",
    description:
      "Abra as configuracoes do Android para instalar, atualizar ou ativar o Health Connect.",
  },
  available: {
    label: "Nao conectado",
    title: "Permissao ainda nao concedida",
    description:
      "Conecte para permitir que o app envie treinos finalizados ao Health Connect.",
  },
  "permission-missing": {
    label: "Nao conectado",
    title: "Permissao ainda nao concedida",
    description:
      "Conecte para permitir que o app grave somente sessoes de musculacao.",
  },
  ready: {
    label: "Conectado",
    title: "Health Connect conectado",
    description:
      "Ao finalizar um treino, o app pode enviar a sessao para o Health Connect.",
  },
};

export function HealthConnectSettingsCard({
  adapter,
  getAutoExportEnabled,
  setAutoExportEnabled,
}: HealthConnectSettingsCardProps) {
  const [status, setStatus] =
    useState<HealthConnectStatus>("unsupported-platform");
  const [autoExportEnabled, setAutoExportEnabledState] = useState(false);
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  const [isSavingPreference, setIsSavingPreference] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHealthConnectState() {
      setLoadState("loading");

      try {
        const [currentStatus, currentAutoExportEnabled] = await Promise.all([
          adapter.getStatus(),
          getAutoExportEnabled(),
        ]);

        if (!isMounted) {
          return;
        }

        setStatus(currentStatus);
        setAutoExportEnabledState(currentAutoExportEnabled);
        setMessage(null);
        setLoadState("ready");
      } catch {
        if (!isMounted) {
          return;
        }

        setLoadState("error");
        setMessage("Nao foi possivel carregar o status do Health Connect.");
      }
    }

    void loadHealthConnectState();

    return () => {
      isMounted = false;
    };
  }, [adapter, getAutoExportEnabled]);

  const content = statusContent[status] ?? statusContent.unavailable;
  const canRequestPermission =
    status === "available" || status === "permission-missing";
  const canOpenSettings =
    status === "ready" || status === "requires-install" || status === "unavailable";
  const isConnected = status === "ready";

  async function requestPermissions() {
    setIsRequestingPermission(true);
    setMessage(null);

    try {
      const nextStatus = await adapter.requestPermissions();
      setStatus(nextStatus);

      if (nextStatus === "ready") {
        try {
          await setAutoExportEnabled(true);
          setAutoExportEnabledState(true);
          setMessage("Health Connect conectado. Envio automatico ativado.");
        } catch {
          setMessage(
            "Health Connect conectado, mas nao foi possivel ativar o envio automatico.",
          );
        }
      } else {
        setMessage(
          (statusContent[nextStatus] ?? statusContent.unavailable).description,
        );
      }
    } catch {
      setMessage("Nao foi possivel abrir a permissao do Health Connect.");
    } finally {
      setIsRequestingPermission(false);
    }
  }

  async function toggleAutoExport() {
    const nextValue = !autoExportEnabled;
    setIsSavingPreference(true);
    setMessage(null);

    try {
      await setAutoExportEnabled(nextValue);
      setAutoExportEnabledState(nextValue);
      setMessage(
        nextValue
          ? "Envio automatico ativado."
          : "Envio automatico desativado.",
      );
    } catch {
      setMessage("Nao foi possivel salvar a preferencia neste dispositivo.");
    } finally {
      setIsSavingPreference(false);
    }
  }

  async function openSettings() {
    setMessage(null);

    try {
      await adapter.openSettings();
      const nextStatus = await adapter.getStatus();
      setStatus(nextStatus);
    } catch {
      setMessage("Nao foi possivel abrir as configuracoes do Health Connect.");
    }
  }

  return (
    <Card className="mt-5" padding="lg" variant="outlined">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
          <Activity className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-medium text-info">Health Connect</p>
          <h3 className="text-xl font-semibold">Integracao Android</h3>
        </div>
      </div>

      <div className="mt-4 rounded-md bg-muted p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold">{content.title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {content.description}
            </p>
          </div>
          <span
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold",
              isConnected
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground",
            )}
          >
            {loadState === "loading" ? "Carregando" : content.label}
          </span>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-muted-foreground">
        Ao finalizar um treino, o app envia a sessao para o Health Connect.
        Frequencia cardiaca e calorias do relogio ficam para uma etapa futura.
      </p>

      {isConnected ? (
        <Switch
            checked={autoExportEnabled}
          className="mt-4 rounded-md border border-md-outline-variant bg-md-surface-container-lowest p-3"
            disabled={isSavingPreference}
          label="Enviar treinos automaticamente"
            onChange={() => {
              void toggleAutoExport();
            }}
        />
      ) : null}

      <div className="mt-4 grid gap-3">
        {canRequestPermission ? (
          <Button
            className="h-12 justify-start gap-3"
            disabled={isRequestingPermission || loadState === "loading"}
            onClick={() => {
              void requestPermissions();
            }}
            type="button"
          >
            <ShieldCheck className="h-5 w-5" aria-hidden="true" />
            {isRequestingPermission
              ? "Abrindo permissao..."
              : "Conectar ao Health Connect"}
          </Button>
        ) : null}

        {canOpenSettings ? (
          <Button
            className="h-12 justify-start gap-3"
            onClick={() => {
              void openSettings();
            }}
            type="button"
            variant={isConnected ? "secondary" : "default"}
          >
            <ExternalLink className="h-5 w-5" aria-hidden="true" />
            {isConnected ? "Gerenciar permissoes" : "Abrir Health Connect"}
          </Button>
        ) : null}

        <Button
          className="h-12 justify-start gap-3"
          disabled={loadState === "loading"}
          onClick={() => {
            void refreshStatus(adapter, setStatus, setLoadState, setMessage);
          }}
          type="button"
          variant="ghost"
        >
          <RefreshCw className="h-5 w-5" aria-hidden="true" />
          Atualizar status
        </Button>
      </div>

      {message ? (
        <Notice
          className="mt-3"
          tone={loadState === "error" ? "danger" : "info"}
        >
          {message}
        </Notice>
      ) : null}
    </Card>
  );
}

async function refreshStatus(
  adapter: HealthConnectAdapter,
  setStatus: (status: HealthConnectStatus) => void,
  setLoadState: (state: LoadState) => void,
  setMessage: (message: string | null) => void,
) {
  setLoadState("loading");
  setMessage(null);

  try {
    setStatus(await adapter.getStatus());
    setLoadState("ready");
  } catch {
    setLoadState("error");
    setMessage("Nao foi possivel atualizar o status do Health Connect.");
  }
}
