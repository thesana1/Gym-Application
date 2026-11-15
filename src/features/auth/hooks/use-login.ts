'use client';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { User } from '@/features/auth/types/auth.types';
import { LoginType } from '@/features/auth/validations/auth.validation';
import { AUTH_ERROR_MESSAGES } from '@/shared/const/auth.const';
import { getAuthRedirect } from '@/shared/utils/auth-redirect';


export const useLogin = (redirectTo?: string) => {
  const destination = getAuthRedirect(redirectTo);
  const { setUser, setLoading, setError } = useAuthStore();
  const router = useRouter();

  const handleSession = async (setUserFn: typeof setUser) => {
    const session = await getSession();
    const sessionUser = session?.user as User | undefined;
    if (!sessionUser) {
      setError(AUTH_ERROR_MESSAGES.SESSION_FAILED);
      return;
    }

    setUserFn({
      id: sessionUser.id ?? '',
      name: sessionUser.name ?? '',
      email: sessionUser.email ?? '',
      role: sessionUser.role ?? 'user',
      avatar: sessionUser.avatar ?? '',
    });

    router.replace(destination);
  };

  const login = async (data: LoginType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
        redirectTo: destination,
      });

      if (result?.error) {
        setError(result.error === 'Configuration' ? AUTH_ERROR_MESSAGES.Configuration : AUTH_ERROR_MESSAGES.CredentialsSignin);
        return;
      }

      if (result?.ok) {
        await handleSession(setUser);
      }
    } catch {
      setError(AUTH_ERROR_MESSAGES.SESSION_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return { login };
};
