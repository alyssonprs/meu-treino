import { CalendarCheck2, Dumbbell, History, Home, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ScreenIdentifier } from "@/components/ScreenIdentifier";
import { NavigationBar, NavigationBarItem } from "@/components/ui/navigation-bar";
import { TopAppBar } from "@/components/ui/top-app-bar";
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
    <main className="min-h-screen bg-md-background text-md-on-background">
      <div
        className={[
          "mx-auto flex min-h-screen w-full max-w-md flex-col px-4",
          showBottomNav ? "pb-28" : "pb-6",
        ].join(" ")}
      >
        {activeScreen === "active-workout" ? null : <AppHeader />}
        {children}
        <ScreenIdentifier code={screenIdentifierByScreen[activeScreen]} />
      </div>

      {showBottomNav ? (
        <NavigationBar
          aria-label="Navegação principal"
          className="fixed inset-x-0 bottom-0 mx-auto max-w-md border-t border-md-outline-variant bg-md-surface-container/95 backdrop-blur"
        >
          {mainNavItems.map((item) => (
            <NavItem
              active={activeScreen === item.screen}
              icon={item.icon}
              key={item.screen}
              label={item.label}
              onClick={() => onNavigate(item.screen)}
            />
          ))}
        </NavigationBar>
      ) : null}
    </main>
  );
}

function AppHeader() {
  return (
    <TopAppBar
      actions={
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-md-primary-container text-md-on-primary-container">
          <Dumbbell className="h-5 w-5" aria-hidden="true" />
        </span>
      }
      className="-mx-4 mb-2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
      title={
        <div>
          <p className="text-label-lg font-medium text-md-on-surface-variant">
            Dados locais
          </p>
          <h1 className="truncate text-title-lg font-medium text-md-on-surface">
            Meu Treino
          </h1>
        </div>
      }
    />
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
    <NavigationBarItem
      active={active}
      icon={<Icon className="h-5 w-5" aria-hidden="true" />}
      label={label}
      onClick={onClick}
    />
  );
}
