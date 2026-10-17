'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { FitnessProfileFields } from '@/features/fitness/components/fitness-profile-fields';
import { useFitnessProfile } from '@/features/fitness/hooks/use-fitness-profile';
import {
  FitnessProfileInput,
  FitnessProfileSchema,
  FitnessProfileType,
} from '@/features/fitness/validations/fitness-profile.validation';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Form } from '@/shared/components/ui/form';

const EMPTY_PROFILE: FitnessProfileInput = {
  goal: '',
  experience: '',
  age: '',
  heightCm: '',
  weightKg: '',
  trainingDaysPerWeek: '',
  availableEquipment: [],
};

const toFormValues = (
  profile: FitnessProfileInput | FitnessProfileType | null
): FitnessProfileInput => ({
  ...EMPTY_PROFILE,
  ...profile,
  goal: profile?.goal ?? '',
  experience: profile?.experience ?? '',
  age: profile?.age ?? '',
  heightCm: profile?.heightCm ?? '',
  weightKg: profile?.weightKg ?? '',
  trainingDaysPerWeek: profile?.trainingDaysPerWeek ?? '',
  availableEquipment: profile?.availableEquipment ?? [],
});

type FitnessProfileFormProps = {
  userName: string;
};

export const FitnessProfileForm = ({ userName }: FitnessProfileFormProps) => {
  const { loading, saving, error, loadProfile, saveProfile } = useFitnessProfile();
  const form = useForm<FitnessProfileInput, undefined, FitnessProfileType>({
    resolver: zodResolver(FitnessProfileSchema),
    defaultValues: EMPTY_PROFILE,
  });
  const { handleSubmit, reset } = form;

  useEffect(() => {
    let active = true;

    const load = async () => {
      const profile = await loadProfile();
      if (!active) return;
      reset(toFormValues(profile));
    };

    void load();
    return () => {
      active = false;
    };
  }, [loadProfile, reset]);

  const onSubmit = async (profile: FitnessProfileType) => {
    if (await saveProfile(profile)) {
      reset(toFormValues(profile));
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Your starting point
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Fitness profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {userName ? `Hi ${userName}, ` : ''}
          share only what you are comfortable sharing. You can update your goals
          or clear optional details at any time.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goals and experience</CardTitle>
          <CardDescription>
            A goal and experience level help shape future training guidance.
            Measurements and equipment are optional.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground" role="status">
              Loading your profile...
            </p>
          ) : (
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FitnessProfileFields control={form.control} />
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Your profile is private to your account. Fitness guidance is
                  general information, not medical advice.
                </p>
                {error && (
                  <p className="text-sm font-medium text-destructive" role="alert">
                    {error}
                  </p>
                )}
                <Button type="submit" disabled={saving}>
                  {saving ? 'Saving profile...' : 'Save profile'}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
