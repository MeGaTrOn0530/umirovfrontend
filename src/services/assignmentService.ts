import { api } from "@/lib/api";
import type { Assignment, Grade, Submission } from "@/types";

export const assignmentService = {
  async list(): Promise<Assignment[]> {
    const { data } = await api.get("/assignments");
    return data as Assignment[];
  },

  async create(payload: Omit<Assignment, "id" | "createdAt">): Promise<Assignment> {
    const { data } = await api.post("/assignments", payload);
    return data as Assignment;
  },

  async get(assignmentId: string): Promise<Assignment | null> {
    const { data } = await api.get(`/assignments/${assignmentId}`);
    return data as Assignment;
  },

  async listSubmissions(assignmentId: string): Promise<Submission[]> {
    const { data } = await api.get(`/assignments/${assignmentId}/submissions`);
    return data as Submission[];
  },

  async listGrades(assignmentId: string): Promise<Grade[]> {
    const { data } = await api.get(`/assignments/${assignmentId}/grades`);
    return data as Grade[];
  },

  async gradeSubmission(
    payload: Omit<Grade, "id" | "grade" | "gradedAt">
  ): Promise<Grade> {
    const { data } = await api.post(`/assignments/${payload.assignmentId}/grade`, payload);
    return data as Grade;
  },
};
