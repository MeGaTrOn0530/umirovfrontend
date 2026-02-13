import { api } from "@/lib/api";
import type { AttendanceRecord, AttendanceStatus, Lesson } from "@/types";

export const lessonService = {
  async list(): Promise<Lesson[]> {
    const { data } = await api.get("/lessons");
    return data as Lesson[];
  },

  async create(payload: Omit<Lesson, "id" | "createdAt">): Promise<Lesson> {
    const { data } = await api.post("/lessons", payload);
    return data as Lesson;
  },

  async setAttendance(
    lessonId: string,
    entries: Array<{ studentId: string; status: AttendanceStatus }>
  ): Promise<AttendanceRecord[]> {
    const { data } = await api.post(`/lessons/${lessonId}/attendance`, entries);
    return data as AttendanceRecord[];
  },
};
