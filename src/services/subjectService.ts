import { api } from "@/lib/api";
import type { Subject } from "@/types";

export const subjectService = {
  async list(): Promise<Subject[]> {
    const { data } = await api.get("/subjects");
    return data as Subject[];
  },

  async create(payload: Omit<Subject, "id" | "createdAt">): Promise<Subject> {
    const { data } = await api.post("/subjects", payload);
    return data as Subject;
  },

  async update(subjectId: string, payload: Partial<Subject>): Promise<Subject> {
    const { data } = await api.put(`/subjects/${subjectId}`, payload);
    return data as Subject;
  },

  async remove(subjectId: string): Promise<void> {
    await api.delete(`/subjects/${subjectId}`);
  },
};
