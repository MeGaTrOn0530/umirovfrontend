import { api } from "@/lib/api";
import type { Group, UserPublic } from "@/types";

export const groupService = {
  async list(): Promise<Group[]> {
    const { data } = await api.get("/teacher/groups");
    return data as Group[];
  },

  async create(payload: { name: string; code: string }): Promise<Group> {
    const { data } = await api.post("/teacher/groups", payload);
    return data as Group;
  },

  async update(groupId: string, payload: { name: string; code: string }): Promise<Group> {
    const { data } = await api.put(`/teacher/groups/${groupId}`, payload);
    return data as Group;
  },

  async remove(groupId: string): Promise<void> {
    await api.delete(`/teacher/groups/${groupId}`);
  },

  async listMembers(groupId: string): Promise<UserPublic[]> {
    const { data } = await api.get(`/teacher/groups/${groupId}/members`);
    return data as UserPublic[];
  },

  async addMember(groupId: string, studentId: string): Promise<void> {
    await api.post(`/teacher/groups/${groupId}/members`, { studentId });
  },

  async removeMember(groupId: string, studentId: string): Promise<void> {
    await api.delete(`/teacher/groups/${groupId}/members/${studentId}`);
  },
};
