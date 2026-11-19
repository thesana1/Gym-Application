// Admins are listed by email in ADMIN_EMAILS (comma-separated), so access needs no database change.
export function isAdminEmail(email?: string | null, list = process.env.ADMIN_EMAILS ?? ''): boolean {
  if (!email) return false;
  const target = email.trim().toLowerCase();
  return list.split(',').some((entry) => entry.trim().toLowerCase() === target);
}
