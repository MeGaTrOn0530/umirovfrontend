"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { teacherService } from "@/services/teacherService";
import { assignmentService } from "@/services/assignmentService";
import { subjectService } from "@/services/subjectService";
import type { Assignment, Grade, Submission, Subject, UserPublic } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function TeacherStudentDetail() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const { locale } = useLocale();
  const [student, setStudent] = React.useState<UserPublic | null>(null);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [stats, setStats] = React.useState({ missing: 0, onTime: 0, late: 0 });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [studentData, attendance, submissionsData, gradesData, assignmentsData, subjectsData, studentGroups] =
          await Promise.all([
            teacherService.getStudentDetail(id),
            teacherService.listStudentAttendance(id),
            teacherService.listStudentSubmissions(id),
            teacherService.listStudentGrades(id),
            assignmentService.list(),
            subjectService.list(),
            teacherService.listStudentGroups(id),
          ]);
        setStudent(studentData);
        setSubmissions(submissionsData);
        setGrades(gradesData);
        setAssignments(assignmentsData);
        setSubjects(subjectsData);
        const onTimeCount = submissionsData.filter((item) => !item.isLate).length;
        const lateCount = submissionsData.filter((item) => item.isLate).length;
        const relevantAssignments = assignmentsData.filter((assignment) => {
          if (!assignment.targetType) return true;
          if (assignment.targetType === "STUDENT") return assignment.targetId === id;
          if (assignment.targetType === "GROUP") {
            return studentGroups.some((group) => group.id === (assignment.targetId ?? ""));
          }
          return true;
        });
        setStats({
          missing: Math.max(0, relevantAssignments.length - new Set(submissionsData.map((item) => item.assignmentId)).size),
          onTime: onTimeCount,
          late: lateCount,
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
  }, [id]);

  const assignmentMap = React.useMemo(
    () => new Map(assignments.map((item) => [item.id, item])),
    [assignments]
  );
  const subjectMap = React.useMemo(
    () => new Map(subjects.map((item) => [item.id, item])),
    [subjects]
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {loading ? (
              <Skeleton className="h-6 w-48" />
            ) : (
              `${student?.firstName ?? t(locale, "nav.students")} ${student?.lastName ?? ""}`
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {loading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <div className="space-y-1">
              <p>
                {t(locale, "auth.username")}: {student?.username}
              </p>
              <p>
                {t(locale, "sidebar.role")}: {student?.role}
              </p>
              <p>
                {t(locale, "common.status")}:{" "}
                {student?.mustChangePassword
                  ? t(locale, "pages.mustChangePassword")
                  : t(locale, "labels.active")}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { key: "missing", label: t(locale, "attendance.absent") },
          { key: "onTime", label: t(locale, "attendance.ontime") },
          { key: "late", label: t(locale, "attendance.late") },
        ].map((stat) => (
          <Card key={stat.key}>
            <CardHeader>
              <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">
              {loading ? (
                <Skeleton className="h-8 w-16" />
              ) : (
                stats[stat.key as keyof typeof stats]
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">{t(locale, "labels.submissions")}</TabsTrigger>
          <TabsTrigger value="grades">{t(locale, "nav.grades")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Card>
            <CardContent className="min-h-[200px] p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(locale, "pages.assignmentsTitle")}</TableHead>
                    <TableHead>{t(locale, "labels.submitted")}</TableHead>
                    <TableHead>{t(locale, "common.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`sk-${index}`}>
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
                  ) : submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                        {t(locale, "pages.noSubmissions")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    submissions.map((submission) => {
                      const assignment = assignmentMap.get(submission.assignmentId);
                      return (
                        <TableRow key={submission.id}>
                          <TableCell>{assignment?.title ?? t(locale, "pages.assignmentsTitle")}</TableCell>
                          <TableCell>
                            {new Date(submission.submittedAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {submission.isLate ? (
                              <Badge variant="destructive">{t(locale, "labels.late")}</Badge>
                            ) : (
                              <Badge>{t(locale, "labels.onTime")}</Badge>
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
        </TabsContent>
        <TabsContent value="grades">
          <Card>
            <CardContent className="min-h-[200px] p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t(locale, "pages.assignmentsTitle")}</TableHead>
                    <TableHead>{t(locale, "labels.subject")}</TableHead>
                    <TableHead>{t(locale, "labels.score")}</TableHead>
                    <TableHead>{t(locale, "labels.grade")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 3 }).map((_, index) => (
                      <TableRow key={`sk-${index}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-24" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-12" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-10" />
                        </TableCell>
                      </TableRow>
                    ))
                  ) : grades.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                        {t(locale, "pages.noGrades")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    grades.map((grade) => {
                      const assignment = assignmentMap.get(grade.assignmentId);
                      const subject = assignment
                        ? subjectMap.get(assignment.subjectId)
                        : undefined;
                      return (
                        <TableRow key={grade.id}>
                          <TableCell>{assignment?.title ?? t(locale, "pages.assignmentsTitle")}</TableCell>
                          <TableCell>{subject?.name ?? t(locale, "labels.subject")}</TableCell>
                          <TableCell>{grade.score}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{grade.grade}</Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
