"use client";

import * as React from "react";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { Award } from "lucide-react";
import { studentService } from "@/services/studentService";
import { subjectService } from "@/services/subjectService";
import { getSession } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Assignment, Grade, Subject } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

export default function StudentGradesPage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [filter, setFilter] = React.useState("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const [gradeData, assignmentData, subjectData] = await Promise.all([
          studentService.listGrades(session.userId),
          studentService.listAssignments(),
          subjectService.list(),
        ]);
        setGrades(gradeData);
        setAssignments(assignmentData);
        setSubjects(subjectData);
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

  const assignmentMap = React.useMemo(
    () => new Map(assignments.map((assignment) => [assignment.id, assignment])),
    [assignments]
  );
  const subjectMap = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  const filtered = grades.filter((grade) => {
    if (filter === "all") return true;
    const assignment = assignmentMap.get(grade.assignmentId);
    return assignment?.subjectId === filter;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.gradesTitle")}
        description={t(locale, "pages.gradesDesc")}
        icon={<Award className="h-4 w-4" />}
        actions={
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t(locale, "pages.filter")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t(locale, "common.all")}</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />
      <Card>
        <CardContent className="min-h-[220px] p-0">
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
                Array.from({ length: 4 }).map((_, index) => (
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
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    {t(locale, "pages.noGrades")}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((grade) => {
                  const assignment = assignmentMap.get(grade.assignmentId);
                  const subject = assignment ? subjectMap.get(assignment.subjectId) : undefined;
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
    </div>
  );
}
