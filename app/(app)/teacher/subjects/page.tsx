"use client";

import * as React from "react";
import { toast } from "sonner";
import { BookOpen, MoreHorizontal, Plus } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { PageHeader } from "@/components/common/page-header";
import { subjectService } from "@/services/subjectService";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Subject } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function TeacherSubjectsPage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Subject | null>(null);
  const [form, setForm] = React.useState({ name: "", code: "" });
  const [open, setOpen] = React.useState(false);

  const loadSubjects = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await subjectService.list();
      setSubjects(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.loadFailed")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const handleSave = async () => {
    if (!session) return;
    try {
      if (editing) {
        const updated = await subjectService.update(editing.id, form);
        setSubjects((prev) =>
          prev.map((subject) => (subject.id === updated.id ? updated : subject))
        );
        toast.success(t(locale, "toast.subjectUpdated"));
      } else {
        const created = await subjectService.create({
          ...form,
          teacherId: session.userId,
        });
        setSubjects((prev) => [created, ...prev]);
        toast.success(t(locale, "toast.subjectCreated"));
      }
      setOpen(false);
      setEditing(null);
      setForm({ name: "", code: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.saveFailed")
      );
    }
  };

  const handleDelete = async (subjectId: string) => {
    try {
      await subjectService.remove(subjectId);
      setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
      toast.success(t(locale, "toast.subjectDeleted"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.deleteFailed")
      );
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.subjectsTitle")}
        description={t(locale, "pages.subjectsDesc")}
        icon={<BookOpen className="h-4 w-4" />}
        actions={
          <Dialog
            open={open}
            onOpenChange={(value) => {
              setOpen(value);
              if (!value) {
                setEditing(null);
                setForm({ name: "", code: "" });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t(locale, "pages.createSubject")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editing ? t(locale, "pages.editSubject") : t(locale, "pages.createSubject")}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t(locale, "pages.subjectName")}
                  value={form.name}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, name: event.target.value }))
                  }
                />
                <Input
                  placeholder={t(locale, "pages.subjectCode")}
                  value={form.code}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, code: event.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button onClick={handleSave}>
                  {editing ? t(locale, "common.update") : t(locale, "common.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <Card key={`sk-${index}`}>
              <CardContent className="min-h-[96px] space-y-2 p-6">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : subjects.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title={t(locale, "pages.createSubjectEmptyTitle")}
          description={t(locale, "pages.createSubjectEmptyDesc")}
          action={<Button onClick={() => setOpen(true)}>{t(locale, "pages.createSubject")}</Button>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {subjects.map((subject) => (
            <Card key={subject.id}>
              <CardContent className="min-h-[96px] flex items-center justify-between p-6">
                <div>
                  <p className="text-lg font-semibold">{subject.name}</p>
                  <p className="text-sm text-muted-foreground">{subject.code}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditing(subject);
                        setForm({ name: subject.name, code: subject.code });
                        setOpen(true);
                      }}
                    >
                      {t(locale, "common.edit")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(subject.id)}>
                      {t(locale, "common.delete")}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
