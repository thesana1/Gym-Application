export const getAuthRedirect = (value?: string): string => {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return '/dashboard';
  const url = new URL(value, 'https://local.invalid');
  if (url.pathname !== '/dashboard' && !url.pathname.startsWith('/dashboard/')) return '/dashboard';
  return url.pathname + url.search + url.hash;
};
