import { NutritionDashboard } from '@/features/nutrition/components/nutrition-dashboard';

type NutritionPageProps = { searchParams: Promise<{ add?: string }> };

export default async function NutritionPage({ searchParams }: NutritionPageProps) {
  const query = await searchParams;
  return <NutritionDashboard startAdding={query.add === '1'} />;
}
