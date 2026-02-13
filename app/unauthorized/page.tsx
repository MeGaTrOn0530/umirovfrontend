"use client";

import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function UnauthorizedPage() {
  const { locale } = useLocale();

  return (
    <div className="min-h-screen bg-app-gradient px-6 py-16">
      <div className="mx-auto w-full max-w-2xl">
        <EmptyState
          icon={ShieldAlert}
          title={t(locale, "unauthorized.title")}
          description={t(locale, "unauthorized.description")}
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href="/login">{t(locale, "unauthorized.backToLogin")}</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/">{t(locale, "unauthorized.goHome")}</Link>
              </Button>
            </div>
          }
        />
      </div>
    </div>
  );
}
