'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';

import type { CoachProfile } from '@/features/coaches/service/coach.service';
import {
  CoachProfileSchema,
  type CoachProfileType,
} from '@/features/coaches/validations/coach.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  COACH_SPECIALIZATIONS,
  type CoachSpecialization,
} from '@/shared/const/coaching.const';

type CoachProfileFormProps = {
  profile: CoachProfile | null;
  saving: boolean;
  onSave: (profile: CoachProfileType) => Promise<void>;
};

const getDefaultValues = (profile: CoachProfile | null): CoachProfileType => ({
  displayName: profile?.displayName ?? '',
  bio: profile?.bio ?? '',
  experienceYears: profile?.experienceYears ?? 0,
  qualifications: profile?.qualifications ?? [{ title: '' }],
  specializations:
    profile?.specializations.filter(
      (value): value is CoachSpecialization =>
        COACH_SPECIALIZATIONS.some((specialization) => specialization === value)
    ) ?? [],
  languages: profile?.languages ?? [],
  availabilityNote: profile?.availabilityNote ?? '',
});

export const CoachProfileForm = ({
  profile,
  saving,
  onSave,
}: CoachProfileFormProps) => {
  const form = useForm<CoachProfileType>({
    resolver: zodResolver(CoachProfileSchema),
    defaultValues: getDefaultValues(profile),
  });
  const qualifications = useWatch({
    control: form.control,
    name: 'qualifications',
  });
  const specializations = useWatch({
    control: form.control,
    name: 'specializations',
  });
  const languages = useWatch({ control: form.control, name: 'languages' });

  useEffect(() => {
    form.reset(getDefaultValues(profile));
  }, [form, profile]);

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit(onSave)}>
      <label className="grid gap-2 text-sm font-medium">
        Public display name
        <Input maxLength={80} {...form.register('displayName')} />
        {form.formState.errors.displayName && (
          <span className="text-xs text-destructive">
            {form.formState.errors.displayName.message}
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Bio (30-1200 characters)
        <textarea
          rows={4}
          maxLength={1200}
          {...form.register('bio')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {form.formState.errors.bio && (
          <span className="text-xs text-destructive">
            {form.formState.errors.bio.message}
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Years of experience
        <Input
          type="number"
          min="0"
          max="60"
          {...form.register('experienceYears', { valueAsNumber: true })}
        />
      </label>
      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Specializations</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {COACH_SPECIALIZATIONS.map((specialization) => (
            <label key={specialization} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={specializations.includes(specialization)}
                onChange={(event) =>
                  form.setValue(
                    'specializations',
                    event.target.checked
                      ? [...specializations, specialization]
                      : specializations.filter((value) => value !== specialization),
                    { shouldValidate: true }
                  )
                }
              />
              {specialization.replaceAll('-', ' ')}
            </label>
          ))}
        </div>
        {form.formState.errors.specializations && (
          <span className="text-xs text-destructive">
            Select at least one specialization.
          </span>
        )}
      </fieldset>
      <label className="grid gap-2 text-sm font-medium">
        Qualifications (self-reported; one title per line)
        <textarea
          rows={3}
          value={qualifications.map(({ title }) => title).join('\n')}
          onChange={(event) =>
            form.setValue(
              'qualifications',
              event.target.value
                .split('\n')
                .filter((title) => title.trim())
                .map((title) => ({ title })),
              { shouldValidate: true }
            )
          }
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {form.formState.errors.qualifications && (
          <span className="text-xs text-destructive">
            Enter at least one qualification.
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Languages (comma-separated)
        <Input
          value={languages.join(', ')}
          onChange={(event) =>
            form.setValue(
              'languages',
              event.target.value.split(',').map((language) => language.trim()),
              { shouldValidate: true }
            )
          }
        />
        {form.formState.errors.languages && (
          <span className="text-xs text-destructive">
            Enter at least one language.
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Availability note (self-reported, not a confirmed appointment slot)
        <Input maxLength={300} {...form.register('availabilityNote')} />
      </label>
      {profile && (
        <p className="text-sm text-muted-foreground">
          Saving an updated profile sends it back for verification and removes it
          from the public directory until reviewed.
        </p>
      )}
      <Button type="submit" disabled={saving}>
        {saving ? 'Submitting…' : profile ? 'Update coach profile' : 'Apply as a coach'}
      </Button>
    </form>
  );
};
