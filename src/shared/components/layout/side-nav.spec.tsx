import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mockPathname = vi.fn(() => '/dashboard/records');
vi.mock('next/navigation', () => ({ usePathname: () => mockPathname() }));
vi.mock('@/features/auth/hooks/use-logout', () => ({ useLogout: () => ({ logout: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

import { SideNav } from '@/shared/components/layout/side-nav';
import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS } from '@/shared/const/navigation.const';
import { ONBOARDING_ROUTES } from '@/shared/const/routes.const';

describe('SideNav', () => {
  it('lists the four main sections in order, then the smaller links, and keeps sub-pages highlighted', () => {
    render(<SideNav />);
    const nav = screen.getByRole('navigation', { name: 'Main menu' });
    const links = within(nav).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('href'))).toEqual([...MAIN_NAV_ITEMS, ...MORE_NAV_ITEMS].map(({ href }) => href));
    expect(within(nav).getByRole('link', { name: /My progress/ })).toHaveAttribute('aria-current', 'page');
    expect(within(nav).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(nav).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('stays hidden on the Premium offer page after onboarding', () => {
    mockPathname.mockReturnValueOnce(ONBOARDING_ROUTES.welcome);
    render(<SideNav />);
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});
