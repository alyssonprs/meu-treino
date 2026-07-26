import { ArrowLeft, CalendarCheck2, History, Home, Settings } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { ScreenIdentifier } from "@/components/ScreenIdentifier";
import { Button } from "@/components/ui/button";
import { NavigationBar, NavigationBarItem } from "@/components/ui/navigation-bar";
import { TopAppBar } from "@/components/ui/top-app-bar";
import type { AppScreen, MainTabScreen, NavItemDefinition } from "./appNavigation";

const mainNavItems: NavItemDefinition[] = [
  { screen: "home", label: "Início", icon: Home },
  { screen: "workout", label: "Treino", icon: CalendarCheck2 },
  { screen: "history", label: "Histórico", icon: History },
  { screen: "settings", label: "Ajustes", icon: Settings },
];

const screenIdentifierByScreen: Record<AppScreen, `UX-${string}`> = {
  "active-exercise": "UX-0009",
  "active-workout": "UX-0003",
  "history-detail": "UX-0005",
  "import-error": "UX-0008",
  "import-preview": "UX-0007",
  "workout-finished": "UX-0004",
  history: "UX-0005",
  home: "UX-0001",
  settings: "UX-0006",
  workout: "UX-0002",
};

const mainScreens: AppScreen[] = ["home", "workout", "history", "settings"];

type ContextualHeader = {
  backLabel?: string;
  label?: string;
  meta?: ReactNode;
  onBack?: () => void;
  title: string;
};

type AppShellProps = {
  activeScreen: AppScreen;
  bottomAction?: ReactNode;
  children: ReactNode;
  contextualHeader?: ContextualHeader;
  floatingOverlay?: ReactNode;
  onNavigate: (screen: MainTabScreen) => void;
};

export function AppShell({
  activeScreen,
  bottomAction,
  children,
  contextualHeader,
  floatingOverlay,
  onNavigate,
}: AppShellProps) {
  const showBottomNav = mainScreens.includes(activeScreen);
  const hasBottomAction = Boolean(bottomAction);
  const isContextual = !showBottomNav;

  return (
    <main className="min-h-dvh bg-md-background text-md-on-background">
      <div
        className={[
          "mx-auto flex min-h-dvh w-full max-w-md flex-col px-4",
          getContentBottomPadding({ floatingOverlay: Boolean(floatingOverlay), hasBottomAction, showBottomNav }),
        ].join(" ")}
      >
        {isContextual ? (
          <ContextualAppHeader header={contextualHeader ?? getFallbackContextualHeader(activeScreen)} />
        ) : null}
        {children}
        <ScreenIdentifier
          code={screenIdentifierByScreen[activeScreen]}
        />
      </div>

      {hasBottomAction ? (
        <div className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md border-t border-md-outline-variant bg-md-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
          {bottomAction}
        </div>
      ) : null}

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
      {floatingOverlay}
    </main>
  );
}

function ContextualAppHeader({ header }: { header: ContextualHeader }) {
  return (
    <TopAppBar
      actions={header.meta}
      className="-mx-4 mb-2 px-4 pt-[max(0.5rem,env(safe-area-inset-top))]"
      navigationIcon={
        header.onBack ? (
          <Button
            aria-label={header.backLabel ?? "Voltar"}
            className="h-11 w-11 p-0"
            onClick={header.onBack}
            type="button"
            variant="text"
          >
            <ArrowLeft className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : undefined
      }
      title={
        <div className="min-w-0 text-center">
          {header.label ? (
            <p className="truncate text-label-md font-medium text-md-on-surface-variant">
              {header.label}
            </p>
          ) : null}
          <h1 className="truncate text-title-lg font-medium text-md-on-surface">
            {header.title}
          </h1>
        </div>
      }
    />
  );
}

function getFallbackContextualHeader(activeScreen: AppScreen): ContextualHeader {
  if (activeScreen === "workout-finished") {
    return { label: "Resultado", title: "Treino concluido" };
  }

  if (activeScreen === "import-preview") {
    return { label: "Importacao", title: "Preview do JSON" };
  }

  if (activeScreen === "import-error") {
    return { label: "Importacao", title: "JSON nao importado" };
  }

  if (activeScreen === "history-detail") {
    return { label: "Historico", title: "Detalhe do exercicio" };
  }

  return { title: "Meu Treino" };
}

function getContentBottomPadding({
  floatingOverlay,
  hasBottomAction,
  showBottomNav,
}: {
  floatingOverlay: boolean;
  hasBottomAction: boolean;
  showBottomNav: boolean;
}) {
  if (showBottomNav) {
    return floatingOverlay ? "pb-44" : "pb-28";
  }

  if (hasBottomAction) {
    return floatingOverlay ? "pb-40" : "pb-28";
  }

  return floatingOverlay ? "pb-20" : "pb-4";
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
