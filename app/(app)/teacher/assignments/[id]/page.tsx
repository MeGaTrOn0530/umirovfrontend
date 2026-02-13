"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { assignmentService } from "@/services/assignmentService";
import { subjectService } from "@/services/subjectService";
import { teacherService } from "@/services/teacherService";
import { getSession } from "@/lib/auth";
import type { Assignment, FileAttachment, Grade, Submission, Subject, UserPublic } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";
import { WordEditor } from "@/components/editors/word-editor";
import { LuckysheetEditor } from "@/components/editors/luckysheet-editor";

type LabPreview =
  | {
      kind: "word";
      studentName: string;
      contentHtml: string;
    }
  | {
      kind: "excel";
      studentName: string;
      sheetJson: unknown;
    };

export default function TeacherAssignmentDetail() {
  const session = React.useMemo(() => getSession(), []);
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const { locale } = useLocale();
  const [assignment, setAssignment] = React.useState<Assignment | null>(null);
  const [subject, setSubject] = React.useState<Subject | null>(null);
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [students, setStudents] = React.useState<UserPublic[]>([]);
  const [grades, setGrades] = React.useState<Grade[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [gradeTarget, setGradeTarget] = React.useState<Submission | null>(null);
  const [score, setScore] = React.useState("");
  const [labPreview, setLabPreview] = React.useState<LabPreview | null>(null);

  const renderAttachment = (file: FileAttachment) => (
    <div key={file.id} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
      <div>
        <p className="font-medium">{file.name}</p>
        <p className="text-xs text-muted-foreground">
          {Math.round(file.sizeKb)} KB
        </p>
      </div>
      <div className="flex items-center gap-2">
        {file.url ? (
          <a
            href={file.url}
            className="text-xs font-medium text-primary hover:underline"
            download
            target="_blank"
            rel="noreferrer"
          >
            {t(locale, "common.download")}
          </a>
        ) : null}
        <Badge variant="secondary">{t(locale, "labels.material")}</Badge>
      </div>
    </div>
  );

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      setLoading(true);
      try {
        const [assignmentData, submissionsData, subjectData, studentsData, gradesData] =
          await Promise.all([
            assignmentService.get(id),
            assignmentService.listSubmissions(id),
            subjectService.list(),
            teacherService.listStudents(),
            assignmentService.listGrades(id),
          ]);
        setAssignment(assignmentData);
        setSubmissions(submissionsData);
        setStudents(studentsData);
        const subjectMatch =
          assignmentData && subjectData.find((item) => item.id === assignmentData.subjectId);
        setSubject(subjectMatch ?? null);
        setGrades(gradesData);
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

  const studentMap = React.useMemo(
    () => new Map(students.map((student) => [student.id, student])),
    [students]
  );

  const gradeMap = React.useMemo(() => {
    const map = new Map<string, Grade>();
    grades.forEach((grade) => {
      map.set(`${grade.assignmentId}:${grade.studentId}`, grade);
    });
    return map;
  }, [grades]);

  const handleGrade = async () => {
    if (!gradeTarget || !session) return;
    const numeric = Number(score);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      toast.error("Score must be between 0 and 100.");
      return;
    }
    try {
      const result = await assignmentService.gradeSubmission({
        assignmentId: gradeTarget.assignmentId,
        studentId: gradeTarget.studentId,
        score: numeric,
        teacherId: session.userId,
      });
      setGrades((prev) => [
        ...prev.filter(
          (item) =>
            !(item.assignmentId === result.assignmentId && item.studentId === result.studentId)
        ),
        result,
      ]);
      toast.success(t(locale, "toast.gradeSaved"));
      setGradeTarget(null);
      setScore("");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.saveFailed")
      );
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-between gap-3">
            <CardTitle>
              {loading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                assignment?.title ?? "Assignment"
              )}
            </CardTitle>
            {!loading && assignment?.teacherName ? (
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground whitespace-nowrap">
                {t(locale, "pages.assignedBy")}: {assignment.teacherName}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{subject?.name ?? t(locale, "labels.subject")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {assignment?.description ?? "-"}
          </p>
          {assignment?.attachments?.length ? (
            <div className="space-y-2">
              <p className="text-sm font-medium">{t(locale, "labels.attachments")}</p>
              <div className="grid gap-2 md:grid-cols-2">
                {assignment.attachments.map(renderAttachment)}
              </div>
            </div>
          ) : null}
          <Separator />
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                {t(locale, "labels.due")}
              </p>
              <p className="text-sm font-medium">
                {assignment ? new Date(assignment.deadline).toLocaleString() : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                {t(locale, "labels.submissions")}
              </p>
              <p className="text-sm font-medium">{submissions.length}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">
                {t(locale, "labels.maxScore")}
              </p>
              <p className="text-sm font-medium">100</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="min-h-[240px] p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t(locale, "nav.students")}</TableHead>
                <TableHead>{t(locale, "labels.submitted")}</TableHead>
                <TableHead>{t(locale, "labels.attachments")}</TableHead>
                <TableHead>{t(locale, "labels.late")}</TableHead>
                <TableHead>{t(locale, "labels.score")}</TableHead>
                <TableHead>{t(locale, "labels.grade")}</TableHead>
                <TableHead className="text-right">{t(locale, "common.actions")}</TableHead>
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
                        <Skeleton className="h-4 w-24" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-16" />
                      </TableCell>
                      <TableCell>
                        <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-10" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="ml-auto h-8 w-20" />
                    </TableCell>
                  </TableRow>
                ))
              ) : submissions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-sm text-muted-foreground">
                    {t(locale, "pages.noSubmissions")}
                  </TableCell>
                </TableRow>
              ) : (
                submissions.map((submission) => {
                  const student = studentMap.get(submission.studentId);
                  const studentName = `${student?.firstName ?? ""} ${student?.lastName ?? ""}`.trim() || "Student";
                  const grade = gradeMap.get(
                    `${submission.assignmentId}:${submission.studentId}`
                  );
                  const hasWordLab =
                    typeof submission.contentHtml === "string" &&
                    submission.contentHtml.trim().length > 0;
                  const hasExcelLab = submission.sheetJson != null;
                  return (
                    <TableRow key={submission.id}>
                      <TableCell>
                        {student?.firstName} {student?.lastName}
                      </TableCell>
                      <TableCell>
                        {new Date(submission.submittedAt).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {submission.files?.map((item) =>
                            item.url ? (
                              <a
                                key={item.id}
                                href={item.url}
                                className="block text-xs font-medium text-primary hover:underline"
                                download
                                target="_blank"
                                rel="noreferrer"
                              >
                                {item.name}
                              </a>
                            ) : (
                              <span key={item.id} className="block text-xs text-muted-foreground">
                                {item.name}
                              </span>
                            )
                          )}
                          {hasWordLab ? (
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs"
                              onClick={() => {
                                if (!submission.contentHtml) return;
                                setLabPreview({
                                  kind: "word",
                                  studentName,
                                  contentHtml: submission.contentHtml,
                                });
                              }}
                            >
                              Word editorda ko'rish
                            </Button>
                          ) : null}
                          {hasExcelLab ? (
                            <Button
                              type="button"
                              variant="link"
                              className="h-auto p-0 text-xs"
                              onClick={() => {
                                setLabPreview({
                                  kind: "excel",
                                  studentName,
                                  sheetJson: submission.sheetJson ?? [],
                                });
                              }}
                            >
                              Excel editorda ko'rish
                            </Button>
                          ) : null}
                          {!submission.files?.length && !hasWordLab && !hasExcelLab ? (
                            <span className="block text-xs text-muted-foreground">-</span>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell>
                        {submission.isLate ? (
                          <Badge variant="destructive">{t(locale, "labels.late")}</Badge>
                        ) : (
                          <Badge>{t(locale, "labels.onTime")}</Badge>
                        )}
                      </TableCell>
                      <TableCell>{grade?.score ?? "-"}</TableCell>
                      <TableCell>
                        {grade ? <Badge variant="secondary">{grade.grade}</Badge> : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setGradeTarget(submission);
                            setScore(grade?.score?.toString() ?? "");
                          }}
                        >
                          {t(locale, "labels.grade")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!gradeTarget} onOpenChange={(value) => !value && setGradeTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(locale, "labels.grade")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t(locale, "labels.score")} (0-100)</label>
            <Input
              value={score}
              onChange={(event) => setScore(event.target.value)}
              type="number"
              min={0}
              max={100}
            />
          </div>
          <DialogFooter>
            <Button onClick={handleGrade}>{t(locale, "common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!labPreview} onOpenChange={(value) => !value && setLabPreview(null)}>
        <DialogContent className="max-w-6xl">
          <DialogHeader>
            <DialogTitle>
              {labPreview?.kind === "excel"
                ? `Excel topshiriq: ${labPreview.studentName}`
                : `Word topshiriq: ${labPreview?.studentName ?? ""}`}
            </DialogTitle>
          </DialogHeader>
          {labPreview?.kind === "excel" ? (
            <LuckysheetEditor
              value={Array.isArray(labPreview.sheetJson) ? labPreview.sheetJson : undefined}
              readOnly
            />
          ) : labPreview?.kind === "word" ? (
            <WordEditor value={labPreview.contentHtml} onChange={() => {}} readOnly />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
