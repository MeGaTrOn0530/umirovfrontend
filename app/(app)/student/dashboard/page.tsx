"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { LayoutDashboard } from "lucide-react";
import { studentService } from "@/services/studentService";
import { subjectService } from "@/services/subjectService";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import type { Assignment, Grade, Subject } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function StudentDashboardPage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [stats, setStats] = React.useState({ ABSENT: 0, ONTIME: 0, LATE: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const [assignmentData, gradeData, attendance, subjectData] = await Promise.all([
          studentService.listAssignments(),
          studentService.listGrades(session.userId),
          studentService.listAttendance(session.userId),
          subjectService.list(),
        ]);
        setAssignments(assignmentData);
        setGrades(gradeData);
        setSubjects(subjectData);
        setStats({
          ABSENT: attendance.filter((item) => item.status === "ABSENT").length,
          ONTIME: attendance.filter((item) => item.status === "ONTIME").length,
          LATE: attendance.filter((item) => item.status === "LATE").length,
        });
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

  const upcoming = assignments
    .filter((assignment) => new Date(assignment.deadline).getTime() >= Date.now())
    .slice(0, 4);

  const latestGrades = grades.slice(0, 4);

  const assignmentMap = React.useMemo(
    () => new Map(assignments.map((assignment) => [assignment.id, assignment])),
    [assignments]
  );

  const subjectMap = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title={t(locale, "pages.studentDashboardTitle")}
        description={t(locale, "pages.studentDashboardDesc")}
        icon={<LayoutDashboard className="h-4 w-4" />}
        actions={
          <Button asChild>
            <Link href="/student/assignments">{t(locale, "pages.viewAssignments")}</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        {(["ABSENT", "ONTIME", "LATE"] as const).map((key) => (
          <Card key={key}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {key === "ABSENT"
                  ? t(locale, "attendance.absent")
                  : key === "LATE"
                  ? t(locale, "attendance.late")
                  : t(locale, "attendance.ontime")}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {loading ? <Skeleton className="h-8 w-16" /> : stats[key]}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "pages.upcomingDeadlines")}</CardTitle>
          </CardHeader>
          <CardContent className="p-0 min-h-[172px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t(locale, "pages.assignmentsTitle")}</TableHead>
                  <TableHead>{t(locale, "labels.subject")}</TableHead>
                  <TableHead>{t(locale, "labels.due")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <TableRow key={`skeleton-${index}`}>
                      <TableCell colSpan={3}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : upcoming.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      {t(locale, "pages.noAssignments")}
                    </TableCell>
                  </TableRow>
                ) : (
                  upcoming.map((assignment) => (
                    <TableRow key={assignment.id}>
                      <TableCell>{assignment.title}</TableCell>
                      <TableCell>{subjectMap.get(assignment.subjectId)?.name ?? t(locale, "labels.subject")}</TableCell>
                      <TableCell>
                        {new Date(assignment.deadline).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t(locale, "pages.latestGrades")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 min-h-[172px]">
            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={`grade-skeleton-${index}`} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-6 w-10" />
                </div>
              ))
            ) : latestGrades.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t(locale, "pages.noGrades")}</p>
            ) : (
              latestGrades.map((grade) => {
                const assignment = assignmentMap.get(grade.assignmentId);
                return (
                <div key={grade.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      {assignment?.title ?? t(locale, "pages.assignmentsTitle")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(grade.gradedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant="secondary">{grade.grade}</Badge>
                </div>
              )})
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
