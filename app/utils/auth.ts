export type AuthSession = {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  accessToken: string;
  refreshToken: string;
};

const STORAGE_KEY = "auth";

export function getSession(): AuthSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? (JSON.parse(stored) as AuthSession) : null;
}

export async function login(username: string, password: string) {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_AUTH_LOGIN_URL}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        expiresInMins: 30,
      }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Login failed");
  }

  const session = (await response.json()) as AuthSession;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session;
}

export async function fetchCurrentUser() {
  const session = getSession();

  if (!session) {
    throw new Error("Not logged in");
  }

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_AUTH_USER_URL}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.accessToken}`,
      },
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch user");
  }

  return response.json();
}

export async function refreshSession() {
  const session = getSession();

  const response = await fetch(
    `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_AUTH_REFRESH_URL}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...(session?.refreshToken && { refreshToken: session.refreshToken }),
        expiresInMins: 30,
      }),
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error("Refresh failed");
  }

  const tokens = await response.json();
  const updated = { ...session, ...tokens } as AuthSession;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}
