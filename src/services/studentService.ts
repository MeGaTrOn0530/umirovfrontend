import { api } from "@/lib/api";
import type {
  Assignment,
  AttendanceRecord,
  FileAttachment,
  Grade,
  Group,
  Submission,
  Subject,
  UserPublic,
} from "@/types";

export const studentService = {
  async getProfile(userId: string): Promise<(UserPublic & { groups?: Group[] }) | null> {
    const { data } = await api.get("/me");
    return data as UserPublic & { groups?: Group[] };
  },

  async updateProfile(
    userId: string,
    payload: Partial<{ firstName: string; lastName: string; username: string }>
  ): Promise<UserPublic> {
    const { data } = await api.put("/student/profile", payload);
    return data as UserPublic;
  },

  async listAssignments(): Promise<Assignment[]> {
    const { data } = await api.get("/student/assignments");
    return data as Assignment[];
  },

  async listSubjects(): Promise<Subject[]> {
    const { data } = await api.get("/subjects");
    return data as Subject[];
  },

  async listSubmissions(userId: string): Promise<Submission[]> {
    const { data } = await api.get("/student/submissions");
    return data as Submission[];
  },

  async submitAssignment(
    userId: string,
    assignmentId: string,
    payload: {
      text?: string;
      files?: FileAttachment[];
      contentHtml?: string;
      sheetJson?: unknown;
    }
  ): Promise<Submission> {
    const { data } = await api.post(`/student/assignments/${assignmentId}/submit`, payload);
    return data as Submission;
  },

  async listGrades(userId: string): Promise<Grade[]> {
    const { data } = await api.get("/student/grades");
    return data as Grade[];
  },

  async listAttendance(userId: string): Promise<AttendanceRecord[]> {
    const { data } = await api.get("/student/attendance");
    return data as AttendanceRecord[];
  },
};
