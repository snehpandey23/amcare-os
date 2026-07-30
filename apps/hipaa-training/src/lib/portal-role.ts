/** Portal account role from hipaa-training-api (`admin` | `trainee`). */

export function portalRoleLabel(role: string | undefined | null): string {
  if (!role) return "Staff";
  if (role === "admin") return "Admin";
  if (role === "trainee") return "Staff";
  return role.charAt(0).toUpperCase() + role.slice(1);
}

export function isPortalAdmin(role: string | undefined | null): boolean {
  return role === "admin";
}
