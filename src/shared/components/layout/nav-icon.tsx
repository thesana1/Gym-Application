import {
  Apple,
  BadgeCheck,
  ChartNoAxesCombined,
  Dumbbell,
  House,
  Medal,
  MessageCircleQuestion,
  ShieldCheck,
  Trophy,
  UserRound,
  type LucideIcon,
} from 'lucide-react';

import type { NavIcon as NavIconName } from '@/shared/const/navigation.const';
import { cn } from '@/shared/lib/utils';

const NAV_ICONS: Record<NavIconName, LucideIcon> = {
  home: House,
  dumbbell: Dumbbell,
  apple: Apple,
  chart: ChartNoAxesCombined,
  message: MessageCircleQuestion,
  trophy: Trophy,
  'user-round': UserRound,
  'badge-check': BadgeCheck,
  shield: ShieldCheck,
  medal: Medal,
};

type NavIconProps = { name: NavIconName; className?: string };

export const NavIcon = ({ name, className }: NavIconProps) => {
  const Icon = NAV_ICONS[name];
  return <Icon className={cn('size-5 shrink-0', className)} aria-hidden="true" />;
};
