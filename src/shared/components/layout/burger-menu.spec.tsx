import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('next/navigation', () => ({ usePathname: () => '/dashboard/records' }));
vi.mock('@/features/auth/hooks/use-logout', () => ({ useLogout: () => ({ logout: vi.fn() }) }));
vi.mock('next-auth/react', () => ({ useSession: () => ({ data: null }) }));

import { BurgerMenu } from '@/shared/components/layout/burger-menu';
import { MAIN_NAV_ITEMS, MORE_NAV_ITEMS } from '@/shared/const/navigation.const';

describe('BurgerMenu', () => {
  it('lists the four main sections in order, then the smaller links, and keeps sub-pages highlighted', async () => {
    render(<BurgerMenu />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Open menu' }));
    const dialog = await screen.findByRole('dialog', { name: 'Menu' });
    const links = within(dialog).getAllByRole('link');

    expect(links.map((link) => link.getAttribute('href'))).toEqual([...MAIN_NAV_ITEMS, ...MORE_NAV_ITEMS].map(({ href }) => href));
    expect(MAIN_NAV_ITEMS.map(({ label }) => label)).toEqual(['Today’s workout', 'My progress', 'Ask AI', 'Everything about food']);
    expect(within(dialog).getByRole('link', { name: /My progress/ })).toHaveAttribute('aria-current', 'page');
    expect(within(dialog).getByRole('link', { name: 'Home' })).not.toHaveAttribute('aria-current');
    expect(within(dialog).getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('closes with Escape and gives focus back to the burger button', async () => {
    render(<BurgerMenu />);
    const trigger = screen.getByRole('button', { name: 'Open menu' });
    fireEvent.click(trigger);
    const dialog = await screen.findByRole('dialog', { name: 'Menu' });

    fireEvent.keyDown(dialog, { key: 'Escape' });

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
