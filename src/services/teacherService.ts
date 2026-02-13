import { api } from "@/lib/api";
import type {
  AttendanceRecord,
  AttendanceStatus,
  Assignment,
  Grade,
  Submission,
  UserPublic,
} from "@/types";

export const teacherService = {
  async listStudents(groupId?: string): Promise<UserPublic[]> {
    const { data } = await api.get("/teacher/students", {
      params: groupId ? { groupId } : undefined,
    });
    return data as UserPublic[];
  },

  async createStudent(payload: {
    firstName: string;
    lastName: string;
    username: string;
    password: string;
  }): Promise<UserPublic> {
    const { data } = await api.post("/teacher/students", payload);
    return data as UserPublic;
  },

  async resetStudentPassword(studentId: string, tempPassword: string): Promise<UserPublic> {
    const { data } = await api.post(`/teacher/students/${studentId}/reset-password`, {
      password: tempPassword,
    });
    return data as UserPublic;
  },

  async getStudentDetail(studentId: string): Promise<UserPublic | null> {
    const { data } = await api.get(`/teacher/students/${studentId}`);
    return data as UserPublic;
  },

  async listStudentAttendance(studentId: string): Promise<AttendanceRecord[]> {
    const { data } = await api.get(`/teacher/students/${studentId}/attendance`);
    return data as AttendanceRecord[];
  },

  async listStudentSubmissions(studentId: string): Promise<Submission[]> {
    const { data } = await api.get(`/teacher/students/${studentId}/submissions`);
    return data as Submission[];
  },

  async listStudentGroups(studentId: string): Promise<{ id: string; name: string }[]> {
    const { data } = await api.get(`/teacher/students/${studentId}/groups`);
    return data as { id: string; name: string }[];
  },

  async listStudentGrades(studentId: string): Promise<Grade[]> {
    const { data } = await api.get(`/teacher/students/${studentId}/grades`);
    return data as Grade[];
  },

  async listAssignments(): Promise<Assignment[]> {
    const { data } = await api.get("/assignments");
    return data as Assignment[];
  },

  async listAttendanceByLesson(lessonId: string): Promise<AttendanceRecord[]> {
    const { data } = await api.get(`/lessons/${lessonId}/attendance`);
    return data as AttendanceRecord[];
  },

  async updateAttendance(
    lessonId: string,
    records: Array<{ studentId: string; status: AttendanceStatus }>
  ): Promise<AttendanceRecord[]> {
    const { data } = await api.post(`/lessons/${lessonId}/attendance`, records);
    return data as AttendanceRecord[];
  },
};
