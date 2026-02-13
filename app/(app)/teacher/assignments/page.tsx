"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { ClipboardList, Plus, Paperclip } from "lucide-react";
import { assignmentService } from "@/services/assignmentService";
import { fileService } from "@/services/fileService";
import { groupService } from "@/services/groupService";
import { subjectService } from "@/services/subjectService";
import { teacherService } from "@/services/teacherService";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Assignment, FileAttachment, Subject } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function TeacherAssignmentsPage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [groups, setGroups] = React.useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = React.useState<Array<{ id: string; name: string }>>([]);
  const [filter, setFilter] = React.useState<"upcoming" | "past">("upcoming");
  const [loading, setLoading] = React.useState(true);
  const [open, setOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [form, setForm] = React.useState({
    title: "",
    subjectId: "",
    deadline: "",
    description: "",
    attachments: [] as FileAttachment[],
    targetType: "GROUP" as "GROUP" | "STUDENT" | "ALL",
    targetId: "",
  });
  const [assignmentKind, setAssignmentKind] = React.useState<"regular" | "lab">("regular");
  const [labEditor, setLabEditor] = React.useState<"word" | "excel">("word");

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [assignmentData, subjectData, groupData, studentData] = await Promise.all([
        assignmentService.list(),
        subjectService.list(),
        groupService.list(),
        teacherService.listStudents(),
      ]);
      setAssignments(assignmentData);
      setSubjects(subjectData);
      setGroups(groupData.map((group) => ({ id: group.id, name: group.name })));
      setStudents(
        studentData.map((student) => ({
          id: student.id,
          name: `${student.firstName} ${student.lastName}`,
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.loadFailed")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!session) return;
    try {
      const created = await assignmentService.create({
        title: form.title,
        subjectId: form.subjectId,
        deadline: new Date(form.deadline).toISOString(),
        description: form.description,
        maxScore: 100,
        attachments: form.attachments,
        teacherId: session.userId,
        targetType: form.targetType === "ALL" ? undefined : form.targetType,
        targetId: form.targetType === "ALL" ? null : form.targetId || null,
        isLab: assignmentKind === "lab",
        labEditor,
      });
      setAssignments((prev) => [created, ...prev]);
      toast.success(t(locale, "toast.assignmentCreated"));
      setOpen(false);
      setForm({
        title: "",
        subjectId: "",
        deadline: "",
        description: "",
        attachments: [],
        targetType: "GROUP",
        targetId: "",
      });
      setAssignmentKind("regular");
      setLabEditor("word");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.createFailed")
      );
    }
  };

  const filtered = assignments.filter((assignment) => {
    const isUpcoming = new Date(assignment.deadline).getTime() >= Date.now();
    return filter === "upcoming" ? isUpcoming : !isUpcoming;
  });

  const subjectMap = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.assignmentsTitle")}
        description={t(locale, "pages.assignmentsDesc")}
        icon={<ClipboardList className="h-4 w-4" />}
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t(locale, "pages.createAssignment")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t(locale, "pages.newAssignment")}</DialogTitle>
                <DialogDescription>
                  {t(locale, "pages.assignmentsDesc")}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input
                  placeholder={t(locale, "pages.assignmentTitle")}
                  value={form.title}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                />
                <Select
                  value={form.subjectId}
                  onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, subjectId: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t(locale, "labels.subject")} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, deadline: event.target.value }))
                  }
                />
                <Input
                  placeholder={t(locale, "pages.description")}
                  value={form.description}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, description: event.target.value }))
                  }
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    {t(locale, "pages.assignmentCategoryLabel")}
                  </label>
                  <Select
                    value={assignmentKind}
                    onValueChange={(value) => {
                      setAssignmentKind(value as "regular" | "lab");
                      if (value !== "lab") {
                        setLabEditor("word");
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t(locale, "pages.assignmentCategoryLabel")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="regular">
                        {t(locale, "pages.assignmentCategoryAssignment")}
                      </SelectItem>
                      <SelectItem value="lab">{t(locale, "pages.assignmentCategoryLab")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {assignmentKind === "lab" ? (
                  <div className="space-y-2 rounded-md border border-dashed border-border p-3">
                    <label className="text-sm font-medium text-muted-foreground">
                      {t(locale, "pages.labEditorLabel")}
                    </label>
                    <Select
                      value={labEditor}
                      onValueChange={(value) => setLabEditor(value as "word" | "excel")}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t(locale, "pages.labEditorLabel")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="word">{t(locale, "pages.labEditorWord")}</SelectItem>
                        <SelectItem value="excel">{t(locale, "pages.labEditorExcel")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">
                      {labEditor === "word"
                        ? t(locale, "pages.labEditorHintWord")
                        : t(locale, "pages.labEditorHintExcel")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {t(locale, "pages.labUploadHint")}
                    </p>
                  </div>
                ) : null}
                <div className="grid gap-3 md:grid-cols-2">
                <Select
                  value={form.targetType}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      targetType: value as "GROUP" | "STUDENT" | "ALL",
                      targetId: "",
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t(locale, "pages.assignmentTarget")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">{t(locale, "pages.targetAll")}</SelectItem>
                    <SelectItem value="GROUP">{t(locale, "pages.targetGroup")}</SelectItem>
                    <SelectItem value="STUDENT">{t(locale, "pages.targetStudent")}</SelectItem>
                  </SelectContent>
                </Select>
                {form.targetType === "GROUP" ? (
                  <Select
                    value={form.targetId}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, targetId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t(locale, "pages.selectGroup")} />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                {form.targetType === "STUDENT" ? (
                  <Select
                    value={form.targetId}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, targetId: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t(locale, "pages.selectStudent")} />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    {t(locale, "labels.attachments")}
                  </label>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.ppt,.pptx,video/*,application/zip,application/x-zip-compressed"
                    ref={fileInputRef}
                    onChange={async (event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (!files.length) return;
                      const input = fileInputRef.current;
                      setUploading(true);
                      try {
                        const uploaded: FileAttachment[] = [];
                        for (const file of files) {
                          const result = await fileService.upload(file);
                          uploaded.push(result);
                        }
                        setForm((prev) => ({
                          ...prev,
                          attachments: [...prev.attachments, ...uploaded],
                        }));
                      } finally {
                        setUploading(false);
                        if (input) input.value = "";
                      }
                    }}
                  />
                  {form.attachments.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.attachments.map((file) => (
                        <Badge key={file.id} variant="secondary">
                          {file.name}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} disabled={uploading}>
                  {uploading ? t(locale, "pages.uploading") : t(locale, "common.create")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
          >
            {t(locale, "pages.upcoming")}
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
          >
            {t(locale, "pages.past")}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="min-h-[220px] p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "labels.name")}</TableHead>
                <TableHead>{t(locale, "labels.subject")}</TableHead>
                <TableHead>{t(locale, "labels.deadline")}</TableHead>
                <TableHead>{t(locale, "common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`sk-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    {t(locale, "pages.noAssignments")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((assignment) => {
                  const subject = subjectMap.get(assignment.subjectId);
                  const isUpcoming = new Date(assignment.deadline).getTime() >= Date.now();
                  return (
                    <TableRow key={assignment.id}>
                      <TableCell className="font-medium">
                        <Link href={`/teacher/assignments/${assignment.id}`} className="hover:underline">
                          {assignment.title}
                        </Link>
                      </TableCell>
                      <TableCell>{subject?.name ?? t(locale, "labels.subject")}</TableCell>
                      <TableCell>
                        {new Date(assignment.deadline).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {isUpcoming ? (
                          <Badge variant="secondary">{t(locale, "pages.upcoming")}</Badge>
                        ) : (
                          <Badge>{t(locale, "labels.closed")}</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
