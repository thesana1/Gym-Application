'use client';
import { useRouter } from 'next/navigation';
import { getSession, signIn } from 'next-auth/react';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { User } from '@/features/auth/types/auth.types';
import { LoginType } from '@/features/auth/validations/auth.validation';


export const useLogin = () => {
  const { setUser, setLoading, setError } = useAuthStore();
  const router = useRouter();

  const handleSession = async (setUserFn: typeof setUser) => {
    const session = await getSession();
    const sessionUser = session?.user as User | undefined;
    if (!sessionUser) {
      setError('Your account session could not be loaded. Please try again.');
      return;
    }

    setUserFn({
      id: sessionUser.id ?? '',
      name: sessionUser.name ?? '',
      email: sessionUser.email ?? '',
      role: sessionUser.role ?? 'user',
      avatar: sessionUser.avatar ?? '',
    });

    router.replace('/dashboard');
  };

  const login = async (data: LoginType) => {
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError(
          result.error === 'Configuration'
            ? 'Sign-in is temporarily unavailable. Check the server Auth.js and database configuration.'
            : 'Invalid email or password'
        );
        return;
      }

      if (result?.ok) {
        await handleSession(setUser);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return { login };
};
