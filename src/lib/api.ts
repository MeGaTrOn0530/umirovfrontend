import axios, { AxiosError } from "axios";
import { clearTokens, getTokens, setTokens } from "@/lib/auth";
import { decrementRequest, incrementRequest } from "@/lib/request-progress";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api",
});

api.interceptors.request.use((config) => {
  incrementRequest();
  const tokens = getTokens();
  if (tokens?.accessToken) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string) => void> = [];

api.interceptors.response.use(
  (response) => {
    decrementRequest();
    return response;
  },
  async (error: AxiosError) => {
    decrementRequest();
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }
    const tokens = getTokens();
    if (!tokens?.refreshToken) {
      clearTokens();
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise((resolve) => {
        refreshQueue.push((token) => {
          const cfg = error.config;
          if (!cfg) return resolve(Promise.reject(error));
          cfg.headers = cfg.headers ?? {};
          cfg.headers.Authorization = `Bearer ${token}`;
          resolve(api(cfg));
        });
      });
    }

    isRefreshing = true;
    try {
      const response = await axios.post(
        `${api.defaults.baseURL}/auth/refresh`,
        { refreshToken: tokens.refreshToken }
      );
      const accessToken = response.data?.accessToken as string;
      const refreshToken = response.data?.refreshToken as string | undefined;
      setTokens({ accessToken, refreshToken: refreshToken ?? tokens.refreshToken });
      refreshQueue.forEach((cb) => cb(accessToken));
      refreshQueue = [];
      if (error.config) {
        error.config.headers = error.config.headers ?? {};
        error.config.headers.Authorization = `Bearer ${accessToken}`;
        return api(error.config);
      }
      return Promise.reject(error);
    } catch (refreshErr) {
      clearTokens();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export { api };
