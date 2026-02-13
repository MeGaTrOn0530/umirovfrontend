"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { studentService } from "@/services/studentService";
import { authService } from "@/services/authService";
import { getSession } from "@/lib/auth";
import { validatePasswordStrength } from "@/lib/validators";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";
import type { Group } from "@/types";

export default function StudentProfilePage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const [loading, setLoading] = React.useState(true);
  const [profile, setProfile] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
  });
  const [groups, setGroups] = React.useState<Group[]>([]);
  const [passwords, setPasswords] = React.useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  React.useEffect(() => {
    const load = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const data = await studentService.getProfile(session.userId);
        if (data) {
          setProfile({
            firstName: data.firstName,
            lastName: data.lastName,
            username: data.username,
          });
          setGroups(data.groups ?? []);
        }
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t(locale, "toast.loadFailed")
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [session]);

  const handleSaveProfile = async () => {
    if (!session) return;
    try {
      await studentService.updateProfile(session.userId, profile);
      toast.success(t(locale, "toast.profileUpdated"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.updateFailed")
      );
    }
  };

  const strength = validatePasswordStrength(passwords.newPassword);

  const handleChangePassword = async () => {
    if (!session) return;
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (!strength.valid) {
      toast.error("Password does not meet strength requirements.");
      return;
    }
    try {
      await authService.changePassword(
        session.userId,
        passwords.oldPassword,
        passwords.newPassword
      );
      toast.success(t(locale, "toast.passwordUpdated"));
      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.updateFailed")
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.profileTitle")}
        description={t(locale, "pages.profileDesc")}
        icon={<User className="h-4 w-4" />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "pages.profileDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="min-h-[220px] space-y-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <>
                {groups.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {groups.map((group) => (
                      <Badge key={group.id} variant="secondary">
                        {group.name}
                      </Badge>
                    ))}
                  </div>
                ) : null}
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t(locale, "pages.firstName")}</label>
                  <Input
                    value={profile.firstName}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, firstName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t(locale, "pages.lastName")}</label>
                  <Input
                    value={profile.lastName}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, lastName: event.target.value }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t(locale, "auth.username")}</label>
                  <Input
                    value={profile.username}
                    onChange={(event) =>
                      setProfile((prev) => ({ ...prev, username: event.target.value }))
                    }
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile}>{t(locale, "pages.saveChanges")}</Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
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
          <CardContent className="min-h-[220px] space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t(locale, "auth.currentPassword")}</label>
              <Input
                type="password"
                value={passwords.oldPassword}
                onChange={(event) =>
                  setPasswords((prev) => ({ ...prev, oldPassword: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t(locale, "auth.newPassword")}</label>
              <Input
                type="password"
                value={passwords.newPassword}
                onChange={(event) =>
                  setPasswords((prev) => ({ ...prev, newPassword: event.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t(locale, "auth.confirmPassword")}</label>
              <Input
                type="password"
                value={passwords.confirmPassword}
                onChange={(event) =>
                  setPasswords((prev) => ({
                    ...prev,
                    confirmPassword: event.target.value,
                  }))
                }
              />
            </div>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword}>{t(locale, "auth.updatePassword")}</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
