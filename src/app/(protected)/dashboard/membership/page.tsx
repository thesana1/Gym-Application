import { MembershipPage } from '@/features/membership/components/membership-page';
import { dodoPayments } from '@/shared/lib/dodo-payments';

export default async function Page({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const { checkout } = await searchParams;
  return <MembershipPage checkoutStatus={checkout} testMode={dodoPayments.config.environment === 'test_mode'} />;
}
