"use client";

import * as React from "react";
import { LogOut, Settings, Shield } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { clearSession, clearTokens, getSession, getTokens } from "@/lib/auth";
import { authService } from "@/services/authService";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export function UserMenu() {
  const router = useRouter();
  const { locale } = useLocale();
  const [username, setUsername] = React.useState<string>(t(locale, "userMenu.guest"));
  const [role, setRole] = React.useState<string>(t(locale, "userMenu.viewer"));

  React.useEffect(() => {
    const session = getSession();
    if (session) {
      setUsername(session.username);
      setRole(session.role);
    }
  }, []);

  React.useEffect(() => {
    const session = getSession();
    if (!session) {
      setUsername(t(locale, "userMenu.guest"));
      setRole(t(locale, "userMenu.viewer"));
    }
  }, [locale]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
            {username.slice(0, 1).toUpperCase()}
          </div>
          <div className="hidden text-left sm:block">
            <p className="text-sm font-medium leading-none">{username}</p>
            <p className="text-xs text-muted-foreground">{role}</p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t(locale, "userMenu.account")}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/change-password")}>
          <Settings className="mr-2 h-4 w-4" />
          {t(locale, "userMenu.changePassword")}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/unauthorized")}>
          <Shield className="mr-2 h-4 w-4" />
          {t(locale, "userMenu.permissions")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            const tokens = getTokens();
            if (tokens?.refreshToken) {
              authService.logout(tokens.refreshToken).catch(() => null);
            }
            clearSession();
            clearTokens();
            toast.success(t(locale, "toast.logout"));
            router.push("/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {t(locale, "userMenu.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
