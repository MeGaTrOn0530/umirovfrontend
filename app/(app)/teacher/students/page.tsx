"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal, RefreshCcw, UserPlus, Users } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { teacherService } from "@/services/teacherService";
import { groupService } from "@/services/groupService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { UserPublic } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

const PAGE_SIZE = 5;

function generateTempPassword() {
  return `Temp${Math.floor(1000 + Math.random() * 9000)}!`;
}

export default function TeacherStudentsPage() {
  const { locale } = useLocale();
  const [students, setStudents] = React.useState<UserPublic[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [filter, setFilter] = React.useState<"all" | "force">("all");
  const [groupFilter, setGroupFilter] = React.useState<string>("all");
  const [groups, setGroups] = React.useState<Array<{ id: string; name: string }>>([]);
  const [page, setPage] = React.useState(1);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [resetTarget, setResetTarget] = React.useState<UserPublic | null>(null);
  const [resetPassword, setResetPassword] = React.useState(generateTempPassword());
  const [form, setForm] = React.useState({
    firstName: "",
    lastName: "",
    username: "",
    tempPassword: generateTempPassword(),
  });

  const fetchStudents = React.useCallback(async () => {
    setLoading(true);
    try {
      const [data, groupData] = await Promise.all([
        teacherService.listStudents(groupFilter === "all" ? undefined : groupFilter),
        groupService.list(),
      ]);
      setStudents(data);
      setGroups(groupData.map((group) => ({ id: group.id, name: group.name })));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.loadFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [groupFilter]);

  React.useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  const filtered = students.filter((student) => {
    const match =
      student.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.username.toLowerCase().includes(search.toLowerCase());
    if (filter === "force") {
      return match && student.mustChangePassword;
    }
    return match;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleCreate = async () => {
    try {
      const created = await teacherService.createStudent({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        password: form.tempPassword,
      });
      setStudents((prev) => [created, ...prev]);
      toast.success(t(locale, "toast.studentCreated"));
      setCreateOpen(false);
      setForm({
        firstName: "",
        lastName: "",
        username: "",
        tempPassword: generateTempPassword(),
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.createFailed")
      );
    }
  };

  const handleResetPassword = async () => {
    if (!resetTarget) return;
    try {
      const updated = await teacherService.resetStudentPassword(
        resetTarget.id,
        resetPassword
      );
      setStudents((prev) =>
        prev.map((student) => (student.id === resetTarget.id ? updated : student))
      );
      toast.success(t(locale, "toast.passwordReset"));
      setResetTarget(null);
      setResetPassword(generateTempPassword());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.resetFailed")
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.studentsTitle")}
        description={t(locale, "pages.studentsDesc")}
        icon={<Users className="h-4 w-4" />}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                {t(locale, "pages.inviteStudent")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t(locale, "pages.createStudent")}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-3">
                <Input
                  placeholder={t(locale, "pages.firstName")}
                  value={form.firstName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, firstName: event.target.value }))
                  }
                />
                <Input
                  placeholder={t(locale, "pages.lastName")}
                  value={form.lastName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, lastName: event.target.value }))
                  }
                />
                <Input
                  placeholder={t(locale, "auth.username")}
                  value={form.username}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, username: event.target.value }))
                  }
                />
                <div className="flex gap-2">
                  <Input
                    placeholder={t(locale, "pages.tempPassword")}
                    value={form.tempPassword}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        tempPassword: event.target.value,
                      }))
                    }
                  />
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        tempPassword: generateTempPassword(),
                      }))
                    }
                  >
                    {t(locale, "common.generate")}
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>{t(locale, "common.create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as typeof filter)}>
          <TabsList>
            <TabsTrigger value="all">{t(locale, "common.all")}</TabsTrigger>
            <TabsTrigger value="force">{t(locale, "pages.mustChangePassword")}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2">
          <Select value={groupFilter} onValueChange={setGroupFilter}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder={t(locale, "pages.allGroups")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(locale, "pages.allGroups")}</SelectItem>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="md:w-64"
            placeholder={`${t(locale, "common.search")}...`}
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <Button variant="outline" onClick={fetchStudents}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {t(locale, "common.refresh")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="min-h-[260px] p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "labels.name")}</TableHead>
                <TableHead>{t(locale, "labels.username")}</TableHead>
                <TableHead>{t(locale, "common.status")}</TableHead>
                <TableHead className="text-right">{t(locale, "common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 4 }).map((_, index) => (
                    <TableRow key={`sk-${index}`}>
                      <TableCell>
                        <Skeleton className="h-4 w-32" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-20" />
                      </TableCell>
                      <TableCell className="text-right">
                        <Skeleton className="ml-auto h-8 w-8" />
                      </TableCell>
                    </TableRow>
                  ))
                : paged.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">
                        {student.firstName} {student.lastName}
                      </TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>
                        {student.mustChangePassword ? (
                          <Badge variant="secondary">
                            {t(locale, "pages.mustChangePassword")}
                          </Badge>
                        ) : (
                          <Badge>{t(locale, "labels.active")}</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/teacher/students/${student.id}`}>
                                {t(locale, "common.viewDetails")}
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setResetTarget(student);
                                setResetPassword(generateTempPassword());
                              }}
                            >
                              {t(locale, "common.resetPassword")}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
          {!loading && paged.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t(locale, "pages.noStudents")}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t(locale, "common.page")} {page} {t(locale, "common.of")} {totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
          >
            {t(locale, "common.previous")}
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
          >
            {t(locale, "common.next")}
          </Button>
        </div>
      </div>

      <Dialog open={!!resetTarget} onOpenChange={(value) => !value && setResetTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, "common.resetPassword")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {t(locale, "pages.resetPasswordHint").replace(
                "{name}",
                `${resetTarget?.firstName ?? ""} ${resetTarget?.lastName ?? ""}`.trim()
              )}
            </p>
            <div className="flex gap-2">
              <Input
                value={resetPassword}
                onChange={(event) => setResetPassword(event.target.value)}
              />
              <Button
                variant="outline"
                type="button"
                onClick={() => setResetPassword(generateTempPassword())}
              >
                {t(locale, "common.generate")}
              </Button>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleResetPassword}>{t(locale, "common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
