import { AppShell } from "@/components/app-shell/app-shell";
import { RoleGuard } from "@/components/guards/role-guard";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard role="STUDENT">
      <AppShell role="STUDENT">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
