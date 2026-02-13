import { AppShell } from "@/components/app-shell/app-shell";
import { RoleGuard } from "@/components/guards/role-guard";

export default function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <RoleGuard role="TEACHER">
      <AppShell role="TEACHER">
        {children}
      </AppShell>
    </RoleGuard>
  );
}
