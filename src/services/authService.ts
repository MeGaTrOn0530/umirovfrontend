import { api } from "@/lib/api";
import type { UserPublic, Role } from "@/types";

type LoginResult = {
  user: UserPublic;
  mustChangePassword: boolean;
  accessToken: string;
  refreshToken: string;
};

export const authService = {
  async login(username: string, password: string): Promise<LoginResult> {
    const { data } = await api.post("/auth/login", { username, password });
    return data as LoginResult;
  },

  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await api.post("/auth/change-password", {
      oldPassword,
      newPassword,
    });
  },

  async updateProfile(
    userId: string,
    payload: Partial<{ firstName: string; lastName: string; username: string }>
  ): Promise<UserPublic> {
    const { data } = await api.put("/student/profile", payload);
    return data as UserPublic;
  },

  async getUser(userId: string): Promise<UserPublic | null> {
    const { data } = await api.get("/me");
    return data as UserPublic;
  },

  async listUsersByRole(role: Role): Promise<UserPublic[]> {
    if (role === "STUDENT") {
      const { data } = await api.get("/teacher/students");
      return data as UserPublic[];
    }
    const { data } = await api.get("/me");
    return data ? [data as UserPublic] : [];
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post("/auth/logout", { refreshToken });
  },
};
