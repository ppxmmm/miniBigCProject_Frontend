import { AppShell } from "@/components/layout/app-shell";
import { BranchDataProvider } from "@/providers/branch-data-provider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BranchDataProvider>
      <AppShell>{children}</AppShell>
    </BranchDataProvider>
  );
}
