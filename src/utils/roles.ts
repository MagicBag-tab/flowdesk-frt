export const VALID_ROLES = ['superadmin', 'admin', 'manager', 'employee'] as const;
export type AppRole = typeof VALID_ROLES[number];

export function resolveHomeByRole(role: string | null): string {
  switch (role) {
    case 'superadmin': return '/superAdmin';
    case 'admin':
    case 'manager':
    case 'employee': return '/inventory';
    default: return '/login';
  }
}

export function isValidRole(role: string | null): role is AppRole {
  return VALID_ROLES.includes(role as AppRole);
}