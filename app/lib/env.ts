const API_URL = import.meta.env.VITE_API_URL ?? "https://dummyjson.com";
const AUTH_LOGIN_URL = import.meta.env.VITE_AUTH_LOGIN_URL ?? "/auth/login";
const AUTH_USER_URL = import.meta.env.VITE_AUTH_USER_URL ?? "/auth/me";
const AUTH_REFRESH_URL = import.meta.env.VITE_AUTH_REFRESH_URL ?? "/route/refresh";

export const env = {
  apiUrl: API_URL,
  authLoginUrl: AUTH_LOGIN_URL,
  authUserUrl: AUTH_USER_URL,
  authRefreshUrl: AUTH_REFRESH_URL,
} as const;
