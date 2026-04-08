type AuthRole = "ADMIN" | "SELLER";

const ADMIN_ROUTE_PREFIXES = ["/dashboard", "/lots", "/users", "/settings"];

function normalizeRole(role: string): AuthRole | string {
  return role.toUpperCase();
}

export function hasRole(roles: string[], expectedRole: AuthRole): boolean {
  return roles.some((role) => normalizeRole(role) === expectedRole);
}

export function getRoleLandingPath(roles: string[]): string {
  if (hasRole(roles, "ADMIN")) {
    return "/dashboard";
  }

  if (hasRole(roles, "SELLER")) {
    return "/seller";
  }

  return "/auctions";
}

export function canAccessPath(roles: string[], path: string): boolean {
  if (path.startsWith("/profile")) {
    return true;
  }

  if (path.startsWith("/seller")) {
    return hasRole(roles, "SELLER");
  }

  if (ADMIN_ROUTE_PREFIXES.some((prefix) => path.startsWith(prefix))) {
    return hasRole(roles, "ADMIN");
  }

  return true;
}

export function resolvePostAuthPath(roles: string[], nextPath: string): string {
  if (nextPath && canAccessPath(roles, nextPath)) {
    return nextPath;
  }

  return getRoleLandingPath(roles);
}
