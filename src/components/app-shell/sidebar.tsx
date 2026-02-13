"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/branding/logo-mark";

import type { NavItem } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export type SidebarProps = {
  items: NavItem[];
  roleLabel: string;
  onNavigate?: () => void;
};

export function Sidebar({ items, roleLabel, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { locale } = useLocale();

  const labelForHref = (href: string, fallback: string) => {
    const map: Record<string, string> = {
      "/teacher/dashboard": "nav.dashboard",
      "/teacher/students": "nav.students",
      "/teacher/groups": "nav.groups",
      "/teacher/subjects": "nav.subjects",
      "/teacher/lessons": "nav.lessons",
      "/teacher/assignments": "nav.assignments",
      "/student/dashboard": "nav.dashboard",
      "/student/profile": "nav.profile",
      "/student/assignments": "nav.assignments",
      "/student/grades": "nav.grades",
    };
    return t(locale, map[href] ?? fallback);
  };

  return (
    <div className="flex h-full flex-col gap-6 p-6">
      <div className="flex items-center gap-3">
        <LogoMark />
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
            {t(locale, "sidebar.brandTop")}
          </p>
          <p className="text-lg font-semibold">{t(locale, "sidebar.brandBottom")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-3 py-3">
        <div>
          <p className="text-xs text-muted-foreground">{t(locale, "sidebar.role")}</p>
          <p className="text-sm font-medium">{roleLabel}</p>
        </div>
        <Badge variant="secondary">{t(locale, "sidebar.active")}</Badge>
      </div>

      <Separator />

      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              onClick={onNavigate}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {labelForHref(item.href, item.title)}
              </span>
              {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
            </Link>
          );
        })}
      </nav>

    </div>
  );
}
