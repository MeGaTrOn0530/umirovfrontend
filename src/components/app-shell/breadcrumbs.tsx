"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

function toLabel(locale: "en" | "uz" | "ru", segment: string) {
  const map: Record<string, string> = {
    teacher: "breadcrumbs.teacher",
    student: "breadcrumbs.student",
    dashboard: "nav.dashboard",
    students: "nav.students",
    subjects: "nav.subjects",
    lessons: "nav.lessons",
    assignments: "nav.assignments",
    profile: "nav.profile",
    grades: "nav.grades",
    "change-password": "auth.changePassword",
  };
  const key = map[segment];
  if (key) return t(locale, key);
  return segment.replace(/[-_]/g, " ").replace(/^./, (s) => s.toUpperCase());
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const { locale } = useLocale();

  if (segments.length === 0) return null;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
      <Link href="/" className="hover:text-foreground">
        {t(locale, "breadcrumbs.home")}
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label =
          segment.length > 18 ? t(locale, "breadcrumbs.details") : toLabel(locale, segment);

        return (
          <span key={href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4" />
            {isLast ? (
              <span className="text-foreground">{label}</span>
            ) : (
              <Link href={href} className="hover:text-foreground">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
