"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AIChatPanel } from "@/components/ai-chat-panel";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/layout/Topbar";
import { ChatWidget } from "@/components/chat/chat-widget";
import { getT } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import {
  clearAuthRole,
  readAuthRole,
  subscribeAuthRole,
  writeAuthRole,
} from "@/lib/auth-session";
import { getUserProfile } from "@/lib/user-data";
import type { CurrentUser, Lang, Role } from "@/types";

interface AppShellContextValue {
  lang: Lang;
  role: Role;
  currentUser: CurrentUser;
  authReady: boolean;
  isAuthenticated: boolean;
  toggleLang: () => void;
  loginAs: (role: Role) => void;
  logout: () => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>("th");
  const authRole = React.useSyncExternalStore(
    subscribeAuthRole,
    readAuthRole,
    () => null,
  );
  const role = authRole ?? "manager";
  const isAuthenticated = authRole !== null;
  const authReady = true;

  const currentUser = React.useMemo<CurrentUser>(() => {
    const tx = getT(lang);
    const profile = getUserProfile(role, lang);
    return {
      name: profile.name,
      initials: profile.initials,
      email: profile.email,
      employeeId: profile.employeeId,
      role: tx.role[role],
    };
  }, [lang, role]);

  const toggleLang = React.useCallback(() => {
    setLang((value) => (value === "th" ? "en" : "th"));
  }, []);

  const loginAs = React.useCallback((nextRole: Role) => {
    writeAuthRole(nextRole);
  }, []);

  const logout = React.useCallback(() => {
    clearAuthRole();
  }, []);

  const value = React.useMemo(
    () => ({
      lang,
      role,
      currentUser,
      authReady,
      isAuthenticated,
      toggleLang,
      loginAs,
      logout,
    }),
    [lang, role, currentUser, authReady, isAuthenticated, toggleLang, loginAs, logout],
  );

  return (
    <AppShellContext.Provider value={value}>
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const context = React.useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within AppShellProvider");
  }
  return context;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { lang, role, currentUser, toggleLang, logout } = useAppShell();
  const [sbOpen, setSbOpen] = React.useState(false);
  const [sbCollapsed, setSbCollapsed] = React.useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = React.useState(true);
  const aiChatT = getT(lang).aiChat;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        pathname={pathname}
        lang={lang}
        role={role}
        sbOpen={sbOpen}
        setSbOpen={setSbOpen}
        sbCollapsed={sbCollapsed}
        setSbCollapsed={setSbCollapsed}
        currentUser={currentUser}
        onSignOut={() => {
          logout();
          router.replace("/login");
        }}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          lang={lang}
          toggleLang={toggleLang}
          showSearch
          currentUser={currentUser}
          onOpenSidebar={() => setSbOpen(true)}
          right={
            <Button
              size="sm"
              variant={isAIChatOpen ? "secondary" : "outline"}
              aria-expanded={isAIChatOpen}
              aria-controls="app-ai-chat"
              onClick={() => setIsAIChatOpen((value) => !value)}
            >
              <Sparkles />
              <span className="hidden sm:inline">
                {isAIChatOpen ? aiChatT.closePanel : aiChatT.openPanel}
              </span>
            </Button>
          }
        />

        <main className="flex-1 max-w-full p-3.5 md:p-5.5">
          <div
            className={cn(
              "grid gap-4 transition-[grid-template-columns] duration-300 ease-out xl:items-start",
              isAIChatOpen
                ? "xl:grid-cols-[minmax(0,1fr)_400px]"
                : "xl:grid-cols-[minmax(0,1fr)_0px]",
            )}
          >
            <div className="min-w-0">{children}</div>

            <aside
              id="app-ai-chat"
              aria-hidden={!isAIChatOpen}
              inert={!isAIChatOpen}
              className={cn(
                "min-w-0 overflow-hidden transition-all duration-300 ease-out",
                isAIChatOpen
                  ? "max-h-[760px] translate-x-0 opacity-100 xl:sticky xl:top-20 xl:h-[calc(100vh-6.5rem)] xl:max-h-none"
                  : "pointer-events-none max-h-0 translate-x-5 opacity-0 xl:h-[calc(100vh-6.5rem)] xl:max-h-none",
              )}
            >
              <div
                className={cn(
                  "transition-transform duration-300 ease-out",
                  isAIChatOpen ? "translate-x-0" : "translate-x-full",
                )}
              >
                <AIChatPanel lang={lang} role={role} />
              </div>
            </aside>
          </div>
        </main>
      </div>

      <ChatWidget />
    </div>
  );
}
