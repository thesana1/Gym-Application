'use client';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpType } from '@/features/auth/validations/auth.validation';
import { AUTH_ERROR_MESSAGES } from '@/shared/const/auth.const';
import { http } from '@/shared/lib/http';
import { getAuthRedirect } from '@/shared/utils/auth-redirect';

export const useRegister = (redirectTo?: string) => {
  const { setLoading, setError } = useAuthStore();
  const router = useRouter();

  const register = async (data: SignUpType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/auth/register', data);
      const query = new URLSearchParams({ registered: '1', callbackUrl: getAuthRedirect(redirectTo) });
      router.push(`/sign-in?${query}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      setError(AUTH_ERROR_MESSAGES[message] ?? AUTH_ERROR_MESSAGES.REGISTER_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return { register };
};
