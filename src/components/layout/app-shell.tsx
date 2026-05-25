"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { STORE } from "@/lib/mock/data";
import { getT } from "@/lib/i18n";
import type { CurrentUser, Lang, Role } from "@/types";

interface AppShellContextValue {
  lang: Lang;
  role: Role;
  currentUser: CurrentUser;
  toggleLang: () => void;
}

const AppShellContext = React.createContext<AppShellContextValue | null>(null);

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = React.useState<Lang>("th");
  const [role, setRole] = React.useState<Role>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("mock_user") : null;
      if (raw) {
        const parsed = JSON.parse(raw);
        const r = parsed?.role;
        if (r === "manager" || r === "staff") return r;
        if (r === "employee") return "staff";
      }
    } catch {}
    return "manager";
  });

  const currentUser = React.useMemo<CurrentUser>(() => {
    const tx = getT(lang);
    return {
      name: role === "manager" ? STORE.manager[lang] : STORE.staff[lang],
      initials:
        role === "manager" ? STORE.managerInitials : STORE.staffInitials,
      email:
        role === "manager"
          ? "parinya.t@minibigc.example"
          : "nattawut.s@minibigc.example",
      employeeId: role === "manager" ? "EMP-0421-M" : "EMP-0421-S",
      role: tx.role[role],
    };
  }, [lang, role]);

  const toggleLang = React.useCallback(() => {
    setLang((value) => (value === "th" ? "en" : "th"));
  }, []);

  React.useEffect(() => {
    const handler = () => {
      try {
        const raw = localStorage.getItem("mock_user");
        if (raw) {
          const parsed = JSON.parse(raw);
          const r = parsed?.role;
          if (r === "manager" || r === "staff") setRole(r);
          else if (r === "employee") setRole("staff");
        }
      } catch {}
    };

    window.addEventListener("storage", handler);
    // also run once in case login just set it
    handler();
    return () => window.removeEventListener("storage", handler);
  }, []);

  const value = React.useMemo(
    () => ({ lang, role, currentUser, toggleLang }),
    [lang, role, currentUser, toggleLang],
  );

  return (
    <AppShellContext.Provider value={value}>{children}</AppShellContext.Provider>
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
  const { lang, role, currentUser, toggleLang } = useAppShell();
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
        onSignOut={() => router.push("/login")}
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
    </div>
  );
}
