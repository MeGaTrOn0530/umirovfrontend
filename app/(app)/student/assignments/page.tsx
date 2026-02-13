"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { PageHeader } from "@/components/common/page-header";
import { ClipboardList } from "lucide-react";
import { studentService } from "@/services/studentService";
import { subjectService } from "@/services/subjectService";
import { getSession } from "@/lib/auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Assignment, Grade, Submission, Subject } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";

type StatusTab = "all" | "upcoming" | "submitted" | "late";

export default function StudentAssignmentsPage() {
  const session = React.useMemo(() => getSession(), []);
  const { locale } = useLocale();
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [subjects, setSubjects] = React.useState<Subject[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const load = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const [assignmentData, submissionData, subjectData, gradeData] = await Promise.all([
          studentService.listAssignments(),
          studentService.listSubmissions(session.userId),
          subjectService.list(),
          studentService.listGrades(session.userId),
        ]);
        setAssignments(assignmentData);
        setSubmissions(submissionData);
        setSubjects(subjectData);
        setGrades(gradeData);
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

  const submissionMap = React.useMemo(() => {
    const map = new Map<string, Submission>();
    submissions.forEach((submission) => map.set(submission.assignmentId, submission));
    return map;
  }, [submissions]);

  const subjectMap = React.useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );

  const gradeMap = React.useMemo(() => {
    const map = new Map<string, Grade>();
    grades.forEach((grade) => map.set(grade.assignmentId, grade));
    return map;
  }, [grades]);

  const filterAssignments = (tab: StatusTab) => {
    if (tab === "all") return assignments;
    if (tab === "submitted") {
      return assignments.filter((assignment) => submissionMap.has(assignment.id));
    }
    if (tab === "late") {
      return assignments.filter((assignment) => submissionMap.get(assignment.id)?.isLate);
    }
    return assignments.filter(
      (assignment) =>
        !submissionMap.has(assignment.id) &&
        new Date(assignment.deadline).getTime() >= Date.now()
    );
  };

  const renderCards = (items: Assignment[]) => (
    <div className="grid gap-4 md:grid-cols-2">
      {loading ? (
        Array.from({ length: 2 }).map((_, index) => (
          <Card key={`sk-${index}`}>
            <CardContent className="min-h-[152px] space-y-3 p-6">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="min-h-[152px] p-6 text-center text-sm text-muted-foreground">
            {t(locale, "pages.noAssignments")}
          </CardContent>
        </Card>
      ) : (
        items.map((assignment) => {
          const submission = submissionMap.get(assignment.id);
          const subject = subjectMap.get(assignment.subjectId);
          const isLate = submission?.isLate;
          const isSubmitted = !!submission;
          const grade = gradeMap.get(assignment.id);
          const isUpcoming = new Date(assignment.deadline).getTime() >= Date.now();
          return (
            <Card key={assignment.id}>
              <CardContent className="min-h-[152px] space-y-3 p-6">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/student/assignments/${assignment.id}`}
                    className="text-lg font-semibold hover:underline"
                  >
                    {assignment.title}
                  </Link>
                  {grade ? (
                    <Badge variant="secondary">
                      {t(locale, "labels.grade")}: {grade.grade}
                    </Badge>
                  ) : isLate ? (
                    <Badge variant="destructive">{t(locale, "labels.late")}</Badge>
                  ) : isSubmitted ? (
                    <Badge variant="secondary">{t(locale, "labels.submitted")}</Badge>
                  ) : isUpcoming ? (
                    <Badge>{t(locale, "pages.upcoming")}</Badge>
                  ) : (
                    <Badge variant="outline">{t(locale, "labels.closed")}</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {subject?.name ?? t(locale, "labels.subject")} •{" "}
                  {new Date(assignment.deadline).toLocaleDateString()}
                </p>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {submission ? (
                    <span>
                      {submission.isLate
                        ? t(locale, "pages.submissionStatusLate")
                        : t(locale, "pages.submissionStatusOnTime")}
                    </span>
                  ) : (
                    <span>
                      {isUpcoming ? t(locale, "labels.pending") : t(locale, "labels.closed")}
                    </span>
                  )}
                  {grade ? (
                    <span>
                      {t(locale, "labels.score")}: {grade.score}/100
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {assignment.description}
                </p>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title={t(locale, "pages.assignmentsTitle")}
        description={t(locale, "pages.assignmentsDesc")}
        icon={<ClipboardList className="h-4 w-4" />}
      />
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">{t(locale, "common.all")}</TabsTrigger>
          <TabsTrigger value="upcoming">{t(locale, "pages.upcoming")}</TabsTrigger>
          <TabsTrigger value="submitted">{t(locale, "labels.submitted")}</TabsTrigger>
          <TabsTrigger value="late">{t(locale, "labels.late")}</TabsTrigger>
        </TabsList>
        <TabsContent value="all">{renderCards(filterAssignments("all"))}</TabsContent>
        <TabsContent value="upcoming">
          {renderCards(filterAssignments("upcoming"))}
        </TabsContent>
        <TabsContent value="submitted">
          {renderCards(filterAssignments("submitted"))}
        </TabsContent>
        <TabsContent value="late">{renderCards(filterAssignments("late"))}</TabsContent>
      </Tabs>
    </div>
  );
}

