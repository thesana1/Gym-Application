'use client';

import { useState } from 'react';

import { ConsultationRequestForm } from '@/features/coaches/components/consultation-request-form';
import type { CoachProfile } from '@/features/coaches/service/coach.service';
import type { ConsultationRequestFormType } from '@/features/coaches/validations/coach.validation';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type CoachProfileCardProps = {
  coach: CoachProfile;
  saving: boolean;
  onRequest: (
    coachProfileId: string,
    request: ConsultationRequestFormType
  ) => Promise<boolean>;
};

export const CoachProfileCard = ({
  coach,
  saving,
  onRequest,
}: CoachProfileCardProps) => {
  const [isRequestOpen, setIsRequestOpen] = useState(false);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle>{coach.displayName}</CardTitle>
            <CardDescription className="mt-2">
              {coach.experienceYears} years of experience · Verified profile
            </CardDescription>
          </div>
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            Qualifications reviewed
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="whitespace-pre-wrap text-sm">{coach.bio}</p>
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Specializations</dt>
            <dd>{coach.specializations.map((value) => value.replaceAll('-', ' ')).join(', ')}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Languages</dt>
            <dd>{coach.languages.join(', ')}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Qualifications</dt>
            <dd>{coach.qualifications.map(({ title }) => title).join(', ')}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Availability (coach-listed)</dt>
            <dd>{coach.availabilityNote ?? 'Not listed'}</dd>
          </div>
        </dl>
        <p className="text-xs text-muted-foreground">
          Profile details are supplied by the coach. Qualification review is not
          a guarantee of outcomes or a substitute for independent checks.
        </p>
        {!isRequestOpen ? (
          <Button
            className="w-fit"
            onClick={() => setIsRequestOpen(true)}
          >
            Request a consultation
          </Button>
        ) : (
          <ConsultationRequestForm
            saving={saving}
            onCancel={() => setIsRequestOpen(false)}
            onSave={async (request) => {
              if (await onRequest(coach.id, request)) {
                setIsRequestOpen(false);
              }
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};
