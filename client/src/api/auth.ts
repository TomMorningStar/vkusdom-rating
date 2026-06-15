const CREDENTIALS_KEY = "admin_credentials";

interface AdminCredentials {
  login: string;
  password: string;
}

export function setCredentials(login: string, password: string) {
  sessionStorage.setItem(CREDENTIALS_KEY, JSON.stringify({ login, password }));
}

export function getCredentials(): AdminCredentials | null {
  const raw = sessionStorage.getItem(CREDENTIALS_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AdminCredentials;
  } catch {
    return null;
  }
}

export function getAuthHeader(): string | null {
  const credentials = getCredentials();
  if (!credentials) {
    return null;
  }

  return `Basic ${btoa(`${credentials.login}:${credentials.password}`)}`;
}

export function clearCredentials() {
  sessionStorage.removeItem(CREDENTIALS_KEY);
}

export function isAuthenticated(): boolean {
  return Boolean(getCredentials());
}
