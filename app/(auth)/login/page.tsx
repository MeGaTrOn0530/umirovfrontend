"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";

import { setSession, setTokens } from "@/lib/auth";
import { authService } from "@/services/authService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";
import { LogoMark } from "@/components/branding/logo-mark";

export default function LoginPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      const result = await authService.login(username.trim(), password);
      setTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      setSession({
        userId: result.user.id,
        role: result.user.role,
        username: result.user.username,
      });
      toast.success(`${t(locale, "toast.loginSuccess")}, ${result.user.username}!`);
      if (result.mustChangePassword) {
        router.push("/change-password");
        return;
      }
      router.push(
        result.user.role === "TEACHER"
          ? "/teacher/dashboard"
          : "/student/dashboard"
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : t(locale, "toast.loginFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid w-full gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card className="border-0 bg-transparent shadow-none">
        <CardHeader className="space-y-4">
          <div className="flex items-center gap-3">
            <LogoMark className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground" />
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">
                {t(locale, "auth.appName")}
              </p>
              <h1 className="text-3xl font-semibold">
                {t(locale, "auth.appExtension")}
              </h1>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {t(locale, "auth.tagline")}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{t(locale, "pages.loginBadgePremium")}</Badge>
            <Badge variant="secondary">{t(locale, "pages.loginBadgeRole")}</Badge>
            <Badge variant="secondary">{t(locale, "pages.loginBadgeTheme")}</Badge>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t(locale, "auth.signIn")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t(locale, "auth.username")}
              </label>
              <Input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Foydalanuvchi nomi"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t(locale, "auth.password")}
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? t(locale, "auth.signingIn") : t(locale, "common.continue")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
