'use client';

import { useMemo, useState } from 'react';

import { CoachProfileCard } from '@/features/coaches/components/coach-profile-card';
import type { CoachProfile } from '@/features/coaches/service/coach.service';
import type { ConsultationRequestFormType } from '@/features/coaches/validations/coach.validation';
import { Input } from '@/shared/components/ui/input';
import { COACH_SPECIALIZATIONS } from '@/shared/const/coaching.const';

type CoachSearchSectionProps = {
  coaches: CoachProfile[];
  saving: boolean;
  onRequest: (
    coachProfileId: string,
    request: ConsultationRequestFormType
  ) => Promise<boolean>;
};

export const CoachSearchSection = ({
  coaches,
  saving,
  onRequest,
}: CoachSearchSectionProps) => {
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [language, setLanguage] = useState('');
  const filteredCoaches = useMemo(
    () =>
      coaches.filter((coach) => {
        const normalizedSearch = search.trim().toLowerCase();
        const matchesSearch =
          !normalizedSearch ||
          `${coach.displayName} ${coach.bio} ${coach.specializations.join(' ')}`
            .toLowerCase()
            .includes(normalizedSearch);
        const matchesSpecialization =
          !specialization || coach.specializations.includes(specialization);
        const matchesLanguage =
          !language.trim() ||
          coach.languages.some((value) =>
            value.toLowerCase().includes(language.trim().toLowerCase())
          );
        return matchesSearch && matchesSpecialization && matchesLanguage;
      }),
    [coaches, language, search, specialization]
  );

  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-semibold">Find a coach</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm">
          Search
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Name or focus"
          />
        </label>
        <label className="grid gap-1 text-sm">
          Specialization
          <select
            value={specialization}
            onChange={(event) => setSpecialization(event.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">All specializations</option>
            {COACH_SPECIALIZATIONS.map((value) => (
              <option key={value} value={value}>
                {value.replaceAll('-', ' ')}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          Language
          <Input
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            placeholder="e.g. English"
          />
        </label>
      </div>
      {filteredCoaches.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No verified coaches match these filters yet. Profiles appear here only
          after qualification review; no demo listings are shown.
        </p>
      ) : (
        filteredCoaches.map((coach) => (
          <CoachProfileCard
            key={coach.id}
            coach={coach}
            saving={saving}
            onRequest={onRequest}
          />
        ))
      )}
    </section>
  );
};
