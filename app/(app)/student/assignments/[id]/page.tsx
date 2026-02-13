"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { assignmentService } from "@/services/assignmentService";
import { studentService } from "@/services/studentService";
import { subjectService } from "@/services/subjectService";
import { fileService } from "@/services/fileService";
import { getSession } from "@/lib/auth";
import type { Assignment, FileAttachment, Grade, Submission, Subject } from "@/types";
import { useLocale } from "@/components/providers/locale-provider";
import { t } from "@/lib/i18n";
import { WordEditor } from "@/components/editors/word-editor";
import { LuckysheetEditor, LuckysheetApi } from "@/components/editors/luckysheet-editor";

export default function StudentAssignmentDetail() {
  const session = React.useMemo(() => getSession(), []);
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id ?? "";
  const { locale } = useLocale();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  const [assignment, setAssignment] = React.useState<Assignment | null>(null);
  const [submission, setSubmission] = React.useState<Submission | null>(null);
  const [subject, setSubject] = React.useState<Subject | null>(null);
  const [text, setText] = React.useState("");
  const [files, setFiles] = React.useState<FileAttachment[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [grade, setGrade] = React.useState<Grade | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [labHtml, setLabHtml] = React.useState("");
  const [sheetInitial, setSheetInitial] = React.useState<unknown[] | null>(null);
  const sheetRef = React.useRef<LuckysheetApi | null>(null);

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      if (!session) return;
      setLoading(true);
      try {
        const [assignmentData, submissionsData, subjectsData, gradesData] = await Promise.all([
          assignmentService.get(id),
          studentService.listSubmissions(session.userId),
          subjectService.list(),
          studentService.listGrades(session.userId),
        ]);
        setAssignment(assignmentData);
        const existing = submissionsData.find((item) => item.assignmentId === id) ?? null;
        setSubmission(existing);
        setText(existing?.text ?? "");
        setFiles(existing?.files ?? []);
        setLabHtml(existing?.contentHtml ?? "");
        setSheetInitial(
          Array.isArray(existing?.sheetJson) ? existing?.sheetJson : null
        );
        const subjectMatch =
          assignmentData && subjectsData.find((item) => item.id === assignmentData.subjectId);
        setSubject(subjectMatch ?? null);
        setGrade(gradesData.find((item) => item.assignmentId === id) ?? null);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : t(locale, "toast.loadFailed")
        );
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, session]);

  const handleSubmit = async () => {
    if (!session) return;
    try {
      const payload: Parameters<typeof studentService.submitAssignment>[2] = {
        text,
        files: files.length ? files : undefined,
      };
      if (assignment?.isLab) {
        if (assignment.labEditor === "word") {
          payload.contentHtml = labHtml;
        } else if (assignment.labEditor === "excel") {
          payload.sheetJson =
            sheetRef.current?.getLuckysheetfile?.() ?? sheetInitial ?? [];
        }
      }
      const result = await studentService.submitAssignment(session.userId, id, payload);
      setSubmission(result);
      setFiles(result.files ?? []);
      setLabHtml(result.contentHtml ?? "");
      setSheetInitial(
        Array.isArray(result.sheetJson) ? result.sheetJson : null
      );
      window.dispatchEvent(new Event("assignment-updated"));
      toast.success(
        result.isLate ? t(locale, "toast.submissionLate") : t(locale, "toast.submissionSuccess")
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t(locale, "toast.submitFailed")
      );
    }
  };

  const isLate =
    assignment && new Date(assignment.deadline).getTime() < Date.now() && !submission;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle>
              {loading ? <Skeleton className="h-6 w-48" /> : assignment?.title}
            </CardTitle>
            {!loading && assignment?.teacherName ? (
              <p className="text-[0.65rem] tracking-[0.35em] uppercase text-muted-foreground whitespace-nowrap">
                {t(locale, "pages.assignedBy")}: {assignment.teacherName}
              </p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
            <Badge variant="secondary">{subject?.name ?? t(locale, "labels.subject")}</Badge>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-3">
          {loading ? (
            <Skeleton className="h-4 w-full" />
          ) : (
            <>
              <p>{assignment?.description}</p>
              <p>
                {t(locale, "labels.deadline")}:{" "}
                {assignment ? new Date(assignment.deadline).toLocaleString() : "-"}
              </p>
              {assignment?.attachments?.length ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    {t(locale, "labels.attachments")}
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {assignment.attachments.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-md border bg-background px-3 py-2"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {Math.round(item.sizeKb)} KB
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.url ? (
                            <a
                              href={item.url}
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
                    ))}
                  </div>
                </div>
              ) : null}
              {grade ? (
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">
                    {t(locale, "labels.grade")}: {grade.grade}
                  </Badge>
                  <Badge variant="outline">
                    {t(locale, "labels.score")}: {grade.score}/100
                  </Badge>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t(locale, "pages.submitWork")}</CardTitle>
        </CardHeader>
          <CardContent className="space-y-4">
            {assignment?.isLab ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{t(locale, "pages.labEditorLabel")}</p>
                {assignment.labEditor === "excel" ? (
                  <p className="text-sm text-muted-foreground">
                    {t(locale, "pages.labEditorHintExcel")}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t(locale, "pages.labEditorHintWord")}
                  </p>
                )}
                {assignment.labEditor === "excel" ? (
                  <LuckysheetEditor
                    value={sheetInitial ?? undefined}
                    onInit={(api) => {
                      sheetRef.current = api;
                    }}
                  />
                ) : (
                  <WordEditor value={labHtml} onChange={setLabHtml} />
                )}
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t(locale, "pages.response")}</label>
                  <Input
                    placeholder={t(locale, "pages.responsePlaceholder")}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">{t(locale, "pages.fileUpload")}</label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,video/*,application/zip,application/x-zip-compressed"
                    multiple
                    ref={fileInputRef}
                    onChange={async (event) => {
                      const picked = Array.from(event.target.files ?? []);
                      if (!picked.length) return;
                      const input = fileInputRef.current;
                      setUploading(true);
                      try {
                        const uploaded = await Promise.all(
                          picked.map((item) => fileService.upload(item))
                        );
                        setFiles((prev) => [...prev, ...uploaded]);
                      } finally {
                        setUploading(false);
                        if (input) input.value = "";
                      }
                    }}
                  />
                  {files.length ? (
                    <div className="space-y-1 text-xs text-muted-foreground">
                      {files.map((item) => (
                        <div key={item.id}>
                          {item.name} ({Math.round(item.sizeKb)} KB)
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </>
            )}
          {submission ? (
            <Badge variant={submission.isLate ? "destructive" : "secondary"}>
              {submission.isLate
                ? t(locale, "pages.submissionStatusLate")
                : t(locale, "pages.submissionStatusOnTime")}
            </Badge>
          ) : isLate ? (
            <Badge variant="destructive">{t(locale, "pages.markLateWarning")}</Badge>
          ) : null}
          {submission?.files?.length ? (
            <div className="text-xs text-muted-foreground">
              <div>{t(locale, "labels.attachments")}:</div>
              <div className="space-y-1">
                {submission.files.map((item) => (
                  <div key={item.id}>
                    {item.name}{" "}
                    {item.url ? (
                      <a
                        href={item.url}
                        className="ml-2 text-xs font-medium text-primary hover:underline"
                        download
                        target="_blank"
                        rel="noreferrer"
                      >
                        {t(locale, "common.download")}
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={!assignment || uploading}>
              <Upload className="mr-2 h-4 w-4" />
              {uploading ? t(locale, "pages.uploading") : t(locale, "pages.submitNow")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
