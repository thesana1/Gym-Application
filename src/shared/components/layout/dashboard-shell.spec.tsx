import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/records' }));
vi.mock('@/features/auth/hooks/use-logout', () => ({ useLogout: () => ({ logout: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));
vi.mock('next-themes', () => ({ useTheme: () => ({ resolvedTheme: 'light', setTheme: vi.fn() }) }));

import { DashboardShell } from '@/shared/components/layout/dashboard-shell';
import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS } from '@/shared/const/navigation.const';

describe('DashboardShell mobile navigation', () => {
  it('shows the four main sections in the bottom bar and keeps sub-pages highlighted', () => {
    render(<DashboardShell><p>Today content</p></DashboardShell>);
    const bar = screen.getAllByRole('navigation', { name: 'Main menu' }).find((nav) => nav.className.includes('bottom-0'));
    const links = within(bar as HTMLElement).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(MAIN_NAV_ITEMS.map(({ href }) => href));
    expect(within(bar as HTMLElement).getByRole('link', { name: 'Progress' })).toHaveAttribute('aria-current', 'page');
  });

  it('keeps every other feature in the More sheet and restores focus when it closes', async () => {
    render(<DashboardShell><p>Today content</p></DashboardShell>);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const more = screen.getByRole('button', { name: 'More' });
    fireEvent.click(more);
    const dialog = await screen.findByRole('dialog', { name: 'More' });
    const links = within(dialog).getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual(MORE_NAV_ITEMS.map(({ href }) => href));
    expect(within(dialog).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: 'Dark mode' })).toBeInTheDocument();
    fireEvent.keyDown(dialog, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(more).toHaveFocus());
  });
});
