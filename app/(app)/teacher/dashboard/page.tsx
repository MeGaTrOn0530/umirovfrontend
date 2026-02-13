"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { LayoutDashboard } from "lucide-react";
import { teacherService } from "@/services/teacherService";
import { lessonService } from "@/services/lessonService";
import { assignmentService } from "@/services/assignmentService";
import { subjectService } from "@/services/subjectService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";
import type { Lesson, Subject } from "@/types";

export default function TeacherDashboardPage() {
  const { locale } = useLocale();
  const [studentsCount, setStudentsCount] = React.useState(0);
  const [assignmentsCount, setAssignmentsCount] = React.useState(0);
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [students, assignments, lessonsData, subjectsData] = await Promise.all([
          teacherService.listStudents(),
          assignmentService.list(),
          lessonService.list(),
          subjectService.list(),
        ]);
        setStudentsCount(students.length);
        setAssignmentsCount(assignments.length);
        setLessons(
          lessonsData.filter(
            (lesson) =>
              new Date(lesson.dateTime).getTime() <=
              Date.now() + 7 * 24 * 60 * 60 * 1000
          )
        );
        setSubjects(subjectsData);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t(locale, "toast.loadFailed")
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const subjectMap = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={t(locale, "pages.teacherDashboardTitle")}
        description={t(locale, "pages.teacherDashboardDesc")}
        icon={<LayoutDashboard className="h-4 w-4" />}
        badge={<Badge variant="secondary">{t(locale, "labels.live")}</Badge>}
        actions={<Button>{t(locale, "pages.createLesson")}</Button>}
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t(locale, "pages.studentsCount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {loading ? <Skeleton className="h-8 w-16" /> : studentsCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t(locale, "pages.assignmentsCount")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {loading ? <Skeleton className="h-8 w-16" /> : assignmentsCount}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">
              {t(locale, "pages.upcomingLessons")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">
            {loading ? <Skeleton className="h-8 w-16" /> : lessons.length}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="min-h-[200px] p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "labels.subject")}</TableHead>
                <TableHead>{t(locale, "labels.topic")}</TableHead>
                <TableHead>{t(locale, "labels.date")}</TableHead>
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
                  </TableRow>
                ))
              ) : lessons.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    {t(locale, "pages.noLessons")}
                  </TableCell>
                </TableRow>
              ) : (
                lessons.map((lesson) => (
                  <TableRow key={lesson.id}>
                    <TableCell>{subjectMap.get(lesson.subjectId)?.name ?? "Subject"}</TableCell>
                    <TableCell>{lesson.topic}</TableCell>
                    <TableCell>{new Date(lesson.dateTime).toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
