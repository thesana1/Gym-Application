'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm, useWatch, type FieldErrors } from 'react-hook-form';

import { ExperienceStep, GoalStep } from '@/features/fitness/components/fitness-profile-fields';
import { BodyStep, DaysStep, EquipmentStep } from '@/features/fitness/components/fitness-profile-options';
import { FitnessProfileSummary, PROFILE_STEPS, type ProfileStep } from '@/features/fitness/components/fitness-profile-summary';
import { useFitnessProfile } from '@/features/fitness/hooks/use-fitness-profile';
import { FitnessProfileInput, FitnessProfileSchema, FitnessProfileType } from '@/features/fitness/validations/fitness-profile.validation';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import { PROFILE_COPY } from '@/shared/const/copy-account.const';
import { ONBOARDING_ROUTES } from '@/shared/const/routes.const';

const EMPTY_PROFILE: FitnessProfileInput = {
  goal: '', experience: '', age: '', heightCm: '', weightKg: '', trainingDaysPerWeek: '', availableEquipment: [],
};

const STEP_FIELDS: Record<ProfileStep, (keyof FitnessProfileInput)[]> = {
  goal: ['goal'], experience: ['experience'], days: ['trainingDaysPerWeek'], equipment: ['availableEquipment'], body: ['age', 'heightCm', 'weightKg'],
};

const toFormValues = (profile: FitnessProfileInput | FitnessProfileType | null): FitnessProfileInput => ({
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

const copy = PROFILE_COPY;

// First visit: one question per screen. Later visits: a summary where each answer can be changed on its own.
export const FitnessProfileForm = () => {
  const router = useRouter();
  const { loading, saving, error, loadProfile, saveProfile } = useFitnessProfile();
  const [hasProfile, setHasProfile] = useState(false);
  const [view, setView] = useState<'summary' | 'step'>('step');
  const [step, setStep] = useState(0);
  const form = useForm<FitnessProfileInput, undefined, FitnessProfileType>({
    resolver: zodResolver(FitnessProfileSchema),
    defaultValues: EMPTY_PROFILE,
  });
  const values = useWatch({ control: form.control }) as FitnessProfileInput;
  const { reset } = form;

  useEffect(() => {
    let active = true;
    void loadProfile().then((profile) => {
      if (!active) return;
      reset(toFormValues(profile));
      setHasProfile(profile !== null);
      setView(profile ? 'summary' : 'step');
    });
    return () => {
      active = false;
    };
  }, [loadProfile, reset]);

  const onSubmit = async (profile: FitnessProfileType) => {
    if (!(await saveProfile(profile))) return;
    reset(toFormValues(profile));
    if (!hasProfile) {
      // First answers saved: refresh the layout (it hid the menu) and show the Premium offer page.
      router.refresh();
      router.push(ONBOARDING_ROUTES.welcome);
      return;
    }
    setView('summary');
  };

  const onInvalid = (errors: FieldErrors<FitnessProfileInput>) => {
    const first = PROFILE_STEPS.findIndex((name) => STEP_FIELDS[name].some((field) => errors[field]));
    if (first >= 0) setStep(first);
    setView('step');
  };

  const next = async () => {
    if (await form.trigger(STEP_FIELDS[PROFILE_STEPS[step]])) setStep((current) => current + 1);
  };

  const isLast = step === PROFILE_STEPS.length - 1;
  const control = form.control;
  const stepView = { goal: <GoalStep control={control} />, experience: <ExperienceStep control={control} />, days: <DaysStep control={control} />,
    equipment: <EquipmentStep control={control} />, body: <BodyStep control={control} /> }[PROFILE_STEPS[step]];

  if (loading) return <div className="h-72 animate-pulse rounded-2xl bg-muted" role="status" aria-label={copy.loading} />;

  return (
    <div className="flex animate-rise flex-col gap-5">
      <PageHeader title={hasProfile ? copy.title : copy.setupTitle} description={hasProfile ? copy.description : copy.setupDescription} className="mb-1" />
      {view === 'summary' ? (
        <>
          <FitnessProfileSummary values={values} onChange={(name) => { setStep(PROFILE_STEPS.indexOf(name)); setView('step'); }} />
          <p className="text-base text-muted-foreground">{copy.privacy}</p>
        </>
      ) : (
        <form noValidate onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="flex flex-col gap-6">
          {!hasProfile && (
            <div className="flex flex-col gap-2">
              <p className="text-base font-semibold text-muted-foreground">{copy.stepOf(step + 1, PROFILE_STEPS.length)}</p>
              <div className="grid grid-cols-5 gap-1" aria-hidden="true">
                {PROFILE_STEPS.map((name, index) => (
                  <span key={name} className={index <= step ? 'h-2 rounded-full bg-primary' : 'h-2 rounded-full bg-muted'} />
                ))}
              </div>
            </div>
          )}
          {stepView}
          {error && <p className="text-base text-destructive" role="alert">{error}</p>}
          <div className="sticky bottom-24 z-10 flex gap-3 bg-background/95 py-2 lg:bottom-0">
            {hasProfile ? (
              <>
                <Button type="button" size="lg" variant="outline" onClick={() => { reset(); setView('summary'); }}>{copy.backToSummary}</Button>
                <Button type="submit" size="lg" className="flex-1" disabled={saving}>{saving ? copy.saving : copy.save}</Button>
              </>
            ) : (
              <>
                {step > 0 && (
                  <Button type="button" size="lg" variant="outline" onClick={() => setStep((current) => current - 1)}>
                    <ArrowLeft className="size-5" aria-hidden="true" />{copy.back}
                  </Button>
                )}
                {isLast ? (
                  // A separate key stops React reusing the Next button, so the tap that reveals this button cannot submit.
                  <Button key="finish" type="submit" size="lg" className="flex-1" disabled={saving}>{saving ? copy.saving : copy.finish}</Button>
                ) : (
                  <Button key="next" type="button" size="lg" className="flex-1" onClick={() => void next()}>
                    {copy.next}<ArrowRight className="size-5" aria-hidden="true" />
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
      )}
    </div>
  );
};
