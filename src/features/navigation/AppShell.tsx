import { CalendarCheck2, Dumbbell, History, Home, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ScreenIdentifier } from "@/components/ScreenIdentifier";
import type { AppScreen, MainTabScreen, NavItemDefinition } from "./appNavigation";

const mainNavItems: NavItemDefinition[] = [
  { screen: "home", label: "Início", icon: Home },
  { screen: "workout", label: "Treino", icon: CalendarCheck2 },
  { screen: "history", label: "Histórico", icon: History },
  { screen: "settings", label: "Ajustes", icon: Settings },
];

const screensWithoutBottomNav: AppScreen[] = [
  "active-workout",
  "workout-finished",
  "import-preview",
  "import-error",
];

const screenIdentifierByScreen: Record<AppScreen, `UX-${string}`> = {
  "active-workout": "UX-0003",
  "import-error": "UX-0008",
  "import-preview": "UX-0007",
  "workout-finished": "UX-0004",
  history: "UX-0005",
  home: "UX-0001",
  settings: "UX-0006",
  workout: "UX-0002",
};

type AppShellProps = {
  activeScreen: AppScreen;
  children: ReactNode;
  onNavigate: (screen: MainTabScreen) => void;
};

export function AppShell({
  activeScreen,
  children,
  onNavigate,
}: AppShellProps) {
  const showBottomNav = !screensWithoutBottomNav.includes(activeScreen);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div
        className={[
          "mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-4",
          showBottomNav ? "pb-24" : "pb-6",
        ].join(" ")}
      >
        {activeScreen === "active-workout" ? null : <AppHeader />}
        {children}
        <ScreenIdentifier code={screenIdentifierByScreen[activeScreen]} />
      </div>

      {showBottomNav ? (
        <nav
          aria-label="Navegação principal"
          className="fixed inset-x-0 bottom-0 border-t border-border bg-card/95 backdrop-blur"
        >
          <div className="mx-auto grid h-16 max-w-md grid-cols-4 px-2">
            {mainNavItems.map((item) => (
              <NavItem
                active={activeScreen === item.screen}
                icon={item.icon}
                key={item.screen}
                label={item.label}
                onClick={() => onNavigate(item.screen)}
              />
            ))}
          </div>
        </nav>
      ) : null}
    </main>
  );
}

function AppHeader() {
  return (
    <header className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-medium text-muted-foreground">Dados locais</p>
        <h1 className="text-2xl font-semibold">Meu Treino</h1>
      </div>
      <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-card text-primary">
        <Dumbbell className="h-5 w-5" aria-hidden="true" />
      </div>
    </header>
  );
}

type NavItemProps = {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
};

function NavItem({ active, icon: Icon, label, onClick }: NavItemProps) {
  return (
    <button
      aria-current={active ? "page" : undefined}
      className={[
        "flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium",
        active ? "text-primary" : "text-muted-foreground",
      ].join(" ")}
      onClick={onClick}
      type="button"
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
}
