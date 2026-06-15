import {
  CalendarCheck2,
  Download,
  Dumbbell,
  FileInput,
  History,
  Home,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const nextSteps = [
  {
    title: "Importar treino",
    description: "Escolha um JSON validado antes de salvar no dispositivo.",
    icon: FileInput,
  },
  {
    title: "Baixar modelo",
    description: "Use o arquivo base para gerar um plano compativel.",
    icon: Download,
  },
];

export function App() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pb-24 pt-4">
        <header className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Dados locais
            </p>
            <h1 className="text-2xl font-semibold">Meu Treino</h1>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary">
            <Dumbbell className="h-5 w-5" aria-hidden="true" />
          </div>
        </header>

        <section className="mt-6 rounded-lg border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-info">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Offline pronto
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm text-muted-foreground">Nenhum plano ativo</p>
            <h2 className="text-3xl font-semibold leading-tight">
              Importe seu treino para comecar
            </h2>
            <p className="text-base leading-7 text-muted-foreground">
              O app guarda treino, cargas e progresso no proprio dispositivo.
            </p>
          </div>

          <div className="mt-6 grid gap-3">
            <Button className="h-14 justify-start gap-3 text-base">
              <FileInput className="h-5 w-5" aria-hidden="true" />
              Importar JSON
            </Button>
            <Button variant="secondary" className="h-14 justify-start gap-3 text-base">
              <Download className="h-5 w-5" aria-hidden="true" />
              Baixar modelo
            </Button>
          </div>
        </section>

        <section className="mt-5 grid gap-3">
          {nextSteps.map((item) => (
            <article
              className="rounded-lg border border-border bg-card p-4"
              key={item.title}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-secondary text-info">
                  <item.icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-medium">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>

      </div>

      <nav className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2">
          <NavItem active icon={Home} label="Inicio" />
          <NavItem icon={CalendarCheck2} label="Treino" />
          <NavItem icon={History} label="Historico" />
          <NavItem icon={Settings} label="Ajustes" />
        </div>
      </nav>
    </main>
  );
}

type NavItemProps = {
  active?: boolean;
  icon: typeof Home;
  label: string;
};

function NavItem({ active = false, icon: Icon, label }: NavItemProps) {
  return (
    <button
      className={[
        "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
        active ? "text-primary" : "text-muted-foreground",
      ].join(" ")}
      type="button"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
