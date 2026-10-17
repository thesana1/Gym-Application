'use client';
import { useRouter } from 'next/navigation';

import { useAuthStore } from '@/features/auth/hooks/useAuthStore';
import { SignUpType } from '@/features/auth/validations/auth.validation';
import { http } from '@/shared/lib/http';

export const useRegister = () => {
  const { setLoading, setError } = useAuthStore();
  const router = useRouter();

  const register = async (data: SignUpType) => {
    setLoading(true);
    setError(null);
    try {
      await http.post('/auth/register', data);
      router.push('/sign-in');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      setError(
        message === 'DATABASE_NOT_CONFIGURED'
          ? 'Account creation is unavailable until the server MongoDB connection is configured.'
          : message
      );
    } finally {
      setLoading(false);
    }
  };

  return { register };
};
