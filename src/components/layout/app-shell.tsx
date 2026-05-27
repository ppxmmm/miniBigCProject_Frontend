"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { ChatWidget } from "@/components/chat/chat-widget";
import {
  clearAuthRole,
  readAuthRole,
  subscribeAuthRole,
  writeAuthRole,
} from "@/lib/auth-session";
import { getT } from "@/lib/i18n";
import {
  getServerProfileOverrides,
  readProfileOverrides,
  subscribeProfile,
} from "@/lib/profile-session";
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
  const profileOverrides = React.useSyncExternalStore(
    subscribeProfile,
    () => readProfileOverrides(role),
    getServerProfileOverrides,
  );

  const currentUser = React.useMemo<CurrentUser>(() => {
    const tx = getT(lang);
    const profile = getUserProfile(role, lang);
    return {
      name: profileOverrides.name ?? profile.name,
      initials: profileOverrides.initials ?? profile.initials,
      email: profileOverrides.email ?? profile.email,
      phone: profileOverrides.phone ?? profile.phone,
      employeeId: profile.employeeId,
      role: tx.role[role],
    };
  }, [lang, profileOverrides, role]);

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
    [
      lang,
      role,
      currentUser,
      authReady,
      isAuthenticated,
      toggleLang,
      loginAs,
      logout,
    ],
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
        />

        <main className="flex-1 max-w-full p-3.5 md:p-5.5">{children}</main>
      </div>

      <ChatWidget />
    </div>
  );
}
