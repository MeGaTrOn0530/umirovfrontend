"use client";

import * as React from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { UserMenu } from "@/components/app-shell/user-menu";
import { localeLabels, t } from "@/lib/i18n";
import { useLocale } from "@/components/providers/locale-provider";

export type TopbarProps = {
  onOpenSidebar?: () => void;
};

export function Topbar({ onOpenSidebar }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { locale, setLocale } = useLocale();

  return (
      <div className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b bg-background/80 px-4 py-3 backdrop-blur-lg lg:px-8">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onOpenSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(isDark ? "light" : "dark")}
              >
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{t(locale, "topbar.toggleTheme")}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <UserMenu />
      </div>
    </div>
  );
}
