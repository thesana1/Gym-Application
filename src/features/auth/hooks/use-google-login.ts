'use client';

import { signIn } from 'next-auth/react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { AUTH_ERROR_MESSAGES } from '@/shared/const/auth.const';
import { getAuthRedirect } from '@/shared/utils/auth-redirect';

export const useGoogleLogin = (redirectTo?: string) => {
  const { setLoading, setError } = useAuthStore();
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('google', { redirect: false, redirectTo: getAuthRedirect(redirectTo) });
      if (result.error || !result.url) {
        setError(AUTH_ERROR_MESSAGES[result.error ?? ''] ?? AUTH_ERROR_MESSAGES.OAuthSignin);
        return;
      }
      window.location.assign(result.url);
    } catch {
      setError(AUTH_ERROR_MESSAGES.OAuthSignin);
    } finally {
      setLoading(false);
    }
  };
  return { loginWithGoogle };
};
