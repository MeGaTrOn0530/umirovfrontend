"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { CalendarCheck2, Plus } from "lucide-react";
import { lessonService } from "@/services/lessonService";
import { groupService } from "@/services/groupService";
import { subjectService } from "@/services/subjectService";
import { teacherService } from "@/services/teacherService";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { AttendanceStatus, Lesson, Subject, UserPublic } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

const statuses: AttendanceStatus[] = ["ABSENT", "ONTIME", "LATE"];

export default function TeacherLessonsPage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [students, setStudents] = React.useState<UserPublic[]>([]);
  const [groups, setGroups] = React.useState<Array<{ id: string; name: string }>>([]);
  const [groupId, setGroupId] = React.useState<string>("all");
  const [loading, setLoading] = React.useState(true);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [attendanceLessonId, setAttendanceLessonId] = React.useState<string>("");
  const [attendance, setAttendance] = React.useState<Record<string, AttendanceStatus>>({});
  const [form, setForm] = React.useState({
    subjectId: "",
    dateTime: "",
    topic: "",
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [lessonData, subjectData, studentData, groupData] = await Promise.all([
        lessonService.list(),
        subjectService.list(),
        teacherService.listStudents(groupId === "all" ? undefined : groupId),
        groupService.list(),
      ]);
      setLessons(lessonData);
      setSubjects(subjectData);
      setStudents(studentData);
      setGroups(groupData.map((group) => ({ id: group.id, name: group.name })));
      if (lessonData[0]?.id) {
        setAttendanceLessonId(lessonData[0].id);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.loadFailed")
      );
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!session) return;
    try {
      const created = await lessonService.create({
        subjectId: form.subjectId,
        teacherId: session.userId,
        dateTime: new Date(form.dateTime).toISOString(),
        topic: form.topic,
      });
      setLessons((prev) => [created, ...prev]);
      toast.success(t(locale, "toast.lessonCreated"));
      setCreateOpen(false);
      setForm({ subjectId: "", dateTime: "", topic: "" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.createFailed")
      );
    }
  };

  const handleSaveAttendance = async () => {
    if (!attendanceLessonId) return;
    try {
      const payload = students.map((student) => ({
        studentId: student.id,
        status: attendance[student.id] || "ONTIME",
      }));
      await teacherService.updateAttendance(attendanceLessonId, payload);
      toast.success(t(locale, "toast.attendanceSaved"));
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.saveFailed")
      );
    }
  };

  const subjectMap = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.lessonsTitle")}
        description={t(locale, "pages.lessonsDesc")}
        icon={<CalendarCheck2 className="h-4 w-4" />}
        actions={
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t(locale, "pages.createLesson")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t(locale, "pages.createLesson")}</DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
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
                  value={form.dateTime}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, dateTime: event.target.value }))
                  }
                />
                <Input
                  placeholder={t(locale, "pages.lessonTopic")}
                  value={form.topic}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, topic: event.target.value }))
                  }
                />
              </div>
              <DialogFooter>
                <Button onClick={handleCreate}>{t(locale, "common.create")}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card>
        <CardContent className="min-h-[220px] p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "labels.subject")}</TableHead>
                <TableHead>{t(locale, "labels.topic")}</TableHead>
                <TableHead>{t(locale, "labels.date")}</TableHead>
                <TableHead>{t(locale, "common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <TableRow key={`sk-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    {t(locale, "pages.noLessons")}
                  </TableCell>
                </TableRow>
              ) : (
                lessons.map((lesson) => {
                  const subject = subjectMap.get(lesson.subjectId);
                  const isUpcoming = new Date(lesson.dateTime).getTime() > Date.now();
                  return (
                    <TableRow key={lesson.id}>
                      <TableCell>{subject?.name ?? t(locale, "labels.subject")}</TableCell>
                      <TableCell>{lesson.topic}</TableCell>
                      <TableCell>{new Date(lesson.dateTime).toLocaleString()}</TableCell>
                      <TableCell>
                        {isUpcoming ? (
                          <Badge variant="secondary">{t(locale, "pages.upcoming")}</Badge>
                        ) : (
                          <Badge>{t(locale, "labels.completed")}</Badge>
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

      <Card>
        <CardContent className="space-y-4 p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-semibold">{t(locale, "pages.markAttendance")}</p>
              <p className="text-sm text-muted-foreground">
                {t(locale, "pages.attendanceDesc")}
              </p>
            </div>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <Select value={groupId} onValueChange={setGroupId}>
                <SelectTrigger className="md:w-60">
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
              <Select
                value={attendanceLessonId}
                onValueChange={(value) => setAttendanceLessonId(value)}
              >
                <SelectTrigger className="md:w-72">
                  <SelectValue placeholder={t(locale, "pages.selectLesson")} />
                </SelectTrigger>
                <SelectContent>
                  {lessons.map((lesson) => (
                    <SelectItem key={lesson.id} value={lesson.id}>
                      {subjectMap.get(lesson.subjectId)?.name ?? t(locale, "labels.subject")} •{" "}
                      {new Date(lesson.dateTime).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "nav.students")}</TableHead>
                <TableHead>{t(locale, "common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    {student.firstName} {student.lastName}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={attendance[student.id] || "ONTIME"}
                      onValueChange={(value) =>
                        setAttendance((prev) => ({
                          ...prev,
                          [student.id]: value as AttendanceStatus,
                        }))
                      }
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status === "ABSENT"
                              ? t(locale, "attendance.absent")
                              : status === "LATE"
                              ? t(locale, "attendance.late")
                              : t(locale, "attendance.ontime")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-end">
            <Button onClick={handleSaveAttendance}>{t(locale, "pages.saveAttendance")}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

