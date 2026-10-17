'use client';

import { CoachProfileForm } from '@/features/coaches/components/coach-profile-form';
import type { CoachProfile } from '@/features/coaches/service/coach.service';
import type { CoachProfileType } from '@/features/coaches/validations/coach.validation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type CoachApplicationProps = {
  loaded: boolean;
  profile: CoachProfile | null;
  saving: boolean;
  onSave: (profile: CoachProfileType) => Promise<void>;
};

export const CoachApplication = ({
  loaded,
  profile,
  saving,
  onSave,
}: CoachApplicationProps) => (
  <Card>
    <CardHeader>
      <CardTitle className="text-base">Apply to be listed as a coach</CardTitle>
    </CardHeader>
    <CardContent className="grid gap-3">
      <p className="text-sm text-muted-foreground">
        Qualifications and availability are self-reported until an admin
        reviews the credentials. Updating a listed profile removes it from
        search while it is reviewed again. Public profile details are visible to
        signed-in members; do not include private contact or medical information.
        {profile && ` Current status: ${profile.verificationStatus}.`}
      </p>
      {loaded ? (
        <CoachProfileForm profile={profile} saving={saving} onSave={onSave} />
      ) : (
        <p className="text-sm text-muted-foreground">Loading profile…</p>
      )}
    </CardContent>
  </Card>
);
