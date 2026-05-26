import { RequireAuth } from "@/components/auth/route-guard";
import { AppShell } from "@/components/layout/app-shell";
import { BranchDataProvider } from "@/providers/branch-data-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAuth>
      <BranchDataProvider>
        <AppShell>{children}</AppShell>
      </BranchDataProvider>
    </RequireAuth>
  );
}
