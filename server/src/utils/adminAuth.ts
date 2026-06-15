import { env } from "../config/env";

export function isValidAdminCredentials(login: string, password: string): boolean {
  return login === env.adminLogin && password === env.adminPassword;
}

export function parseBasicAuth(
  header: string | undefined,
): { login: string; password: string } | null {
  if (!header?.startsWith("Basic ")) {
    return null;
  }

  try {
    const decoded = Buffer.from(header.slice(6), "base64").toString("utf8");
    const colon = decoded.indexOf(":");

    if (colon === -1) {
      return null;
    }

    return {
      login: decoded.slice(0, colon),
      password: decoded.slice(colon + 1),
    };
  } catch {
    return null;
  }
}
