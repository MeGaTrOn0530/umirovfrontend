"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getSession } from "@/lib/auth";
import { authService } from "@/services/authService";
import { validatePasswordStrength } from "@/lib/validators";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const [oldPassword, setOldPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showOldPassword, setShowOldPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const session = getSession();

  React.useEffect(() => {
    if (!session) {
      router.replace("/login");
    }
  }, [router, session]);

  const strength = validatePasswordStrength(newPassword);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session) return;

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    if (!strength.valid) {
      toast.error("Password does not meet strength requirements.");
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(session.userId, oldPassword, newPassword);
      toast.success(t(locale, "toast.passwordUpdated"));
      router.push(
        session.role === "TEACHER" ? "/teacher/dashboard" : "/student/dashboard"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.updateFailed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="space-y-2">
        <CardTitle>{t(locale, "auth.changePassword")}</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{t(locale, "auth.ruleMin")}</Badge>
          <Badge variant="secondary">{t(locale, "auth.ruleUpper")}</Badge>
          <Badge variant="secondary">{t(locale, "auth.ruleLower")}</Badge>
          <Badge variant="secondary">{t(locale, "auth.ruleNumber")}</Badge>
          <Badge variant="secondary">{t(locale, "auth.ruleSymbol")}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t(locale, "auth.currentPassword")}
            </label>
            <div className="relative">
              <Input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(event) => setOldPassword(event.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showOldPassword ? "Hide password" : "Show password"}
              >
                {showOldPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t(locale, "auth.newPassword")}
            </label>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showNewPassword ? "Hide password" : "Show password"}
              >
                {showNewPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t(locale, "auth.confirmPassword")}
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="••••••••"
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={loading}>
              {loading ? t(locale, "auth.updating") : t(locale, "auth.updatePassword")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
