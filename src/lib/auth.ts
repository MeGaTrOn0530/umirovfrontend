import type { Role } from "@/types";

export type Session = {
  userId: string;
  role: Role;
  username: string;
};

const STORAGE_KEY = "ts-platform-session";
const TOKEN_KEY = "ts-platform-tokens";

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Session;
    if (!parsed?.userId || !parsed?.role || !parsed?.username) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export function getTokens(): AuthTokens | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthTokens;
    if (!parsed?.accessToken || !parsed?.refreshToken) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
}

export function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function requireRole(role: Role) {
  const session = getSession();
  if (!session) {
    return { session: null, allowed: false, reason: "no-session" as const };
  }
  if (session.role !== role) {
    return { session, allowed: false, reason: "forbidden" as const };
  }
  return { session, allowed: true as const };
}
