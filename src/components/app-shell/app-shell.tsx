"use client";

import * as React from "react";

import { Breadcrumbs } from "@/components/app-shell/breadcrumbs";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { studentNav, teacherNav } from "@/lib/navigation";
import { studentService } from "@/services/studentService";
import { getSession } from "@/lib/auth";

export type AppShellProps = {
  role: "TEACHER" | "STUDENT";
  children: React.ReactNode;
};

export function AppShell({ role, children }: AppShellProps) {
  const [open, setOpen] = React.useState(false);
  const [navItems, setNavItems] = React.useState(
    role === "TEACHER" ? teacherNav : studentNav
  );

  const refreshStudentBadge = React.useCallback(async () => {
    const session = getSession();
    if (!session) return;
    try {
      const [assignments, submissions] = await Promise.all([
        studentService.listAssignments(),
        studentService.listSubmissions(session.userId),
      ]);
      const submitted = new Set(submissions.map((item) => item.assignmentId));
      const pendingCount = assignments.filter((item) => !submitted.has(item.id)).length;
      setNavItems((items) =>
        items.map((item) =>
          item.href === "/student/assignments"
            ? { ...item, badge: pendingCount > 0 ? String(pendingCount) : undefined }
            : item
        )
      );
    } catch {
      // silent fail for badge
    }
  }, []);

  React.useEffect(() => {
    setNavItems(role === "TEACHER" ? teacherNav : studentNav);
    if (role === "STUDENT") {
      refreshStudentBadge();
      const handler = () => refreshStudentBadge();
      window.addEventListener("assignment-updated", handler);
      return () => window.removeEventListener("assignment-updated", handler);
    }
  }, [role, refreshStudentBadge]);

  return (
    <div className="min-h-screen bg-app-gradient">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 flex-col border-r bg-background/80 backdrop-blur-lg lg:flex">
          <Sidebar items={navItems} roleLabel={role} />
        </aside>
        <div className="flex min-h-screen flex-1 flex-col">
          <Topbar onOpenSidebar={() => setOpen(true)} />
          <main className="flex-1 px-4 pb-10 pt-6 lg:px-8">
            <Breadcrumbs />
            <div className="mt-6">{children}</div>
          </main>
        </div>
      </div>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar
            items={navItems}
            roleLabel={role}
            onNavigate={() => setOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
