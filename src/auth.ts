import type { AuthenticatedUser, UserRole } from "./domain.js";

const ROLES = new Set<UserRole>(["admin", "ta", "student"]);

export function authenticate(
  authorization: string | undefined,
): AuthenticatedUser | null {
  if (!authorization?.startsWith("Bearer ")) {
    return null;
  }

  const token = authorization.slice("Bearer ".length);
  const separator = token.indexOf(":");
  if (separator < 1) {
    return null;
  }

  const role = token.slice(0, separator);
  const id = token.slice(separator + 1);
  if (!ROLES.has(role as UserRole) || id.length === 0) {
    return null;
  }

  return { id, role: role as UserRole };
}
