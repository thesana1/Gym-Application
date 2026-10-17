import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  replace: vi.fn(),
  setError: vi.fn(),
  setLoading: vi.fn(),
  setUser: vi.fn(),
  signIn: vi.fn(),
}));

vi.mock('next-auth/react', () => ({
  getSession: mocks.getSession,
  signIn: mocks.signIn,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mocks.replace }),
}));

vi.mock('@/features/auth/hooks/useAuthStore', () => ({
  useAuthStore: () => ({
    setError: mocks.setError,
    setLoading: mocks.setLoading,
    setUser: mocks.setUser,
  }),
}));

import { useLogin } from '@/features/auth/hooks/use-login';

describe('useLogin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends a successfully signed-in member to the dashboard', async () => {
    mocks.signIn.mockResolvedValueOnce({ ok: true, error: null });
    mocks.getSession.mockResolvedValueOnce({
      user: {
        id: 'user-id',
        name: 'Member',
        email: 'member@example.com',
        role: 'user',
      },
    });
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login({
        email: 'member@example.com',
        password: 'password123',
      });
    });

    expect(mocks.setUser).toHaveBeenCalledWith({
      id: 'user-id',
      name: 'Member',
      email: 'member@example.com',
      role: 'user',
      avatar: '',
    });
    expect(mocks.replace).toHaveBeenCalledWith('/dashboard');
  });

  it('shows an error if Auth.js reports a configuration failure', async () => {
    mocks.signIn.mockResolvedValueOnce({ ok: false, error: 'Configuration' });
    const { result } = renderHook(() => useLogin());

    await act(async () => {
      await result.current.login({
        email: 'member@example.com',
        password: 'password123',
      });
    });

    expect(mocks.setError).toHaveBeenCalledWith(
      'Sign-in is temporarily unavailable. Check the server Auth.js and database configuration.'
    );
    expect(mocks.replace).not.toHaveBeenCalled();
  });
});
