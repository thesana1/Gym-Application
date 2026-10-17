'use client';

import { useState } from 'react';

import type { CoachProfile } from '@/features/coaches/service/coach.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type CoachModerationQueueProps = {
  profiles: CoachProfile[];
  saving: boolean;
  onReview: (
    profileId: string,
    decision: 'verified' | 'rejected',
    expectedRevision: number
  ) => Promise<void>;
};

export const CoachModerationQueue = ({
  profiles,
  saving,
  onReview,
}: CoachModerationQueueProps) => {
  const [verifiedProfiles, setVerifiedProfiles] = useState<Set<string>>(
    new Set()
  );

  return (
    <section className="grid gap-4">
      <h2 className="text-lg font-semibold">
        Coach qualification review and moderation
      </h2>
      <p className="text-sm text-muted-foreground">
        Before verifying, independently check each qualification with its
        issuing organization. Review only the credentials submitted for this
        profile; coach-provided availability is not a booked schedule.
      </p>
      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No pending or published coach profiles need review.
        </p>
      ) : (
        profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {profile.displayName} · {profile.verificationStatus}
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <p className="whitespace-pre-wrap text-sm">{profile.bio}</p>
              <p className="text-sm">
                {profile.experienceYears} years ·{' '}
                {profile.specializations.map((value) => value.replaceAll('-', ' ')).join(', ')}
              </p>
              <p className="text-sm">
                Self-reported qualifications:{' '}
                {profile.qualifications.map(({ title }) => title).join(', ')}
              </p>
              <p className="text-sm">Languages: {profile.languages.join(', ')}</p>
              <p className="text-sm">
                Availability note: {profile.availabilityNote ?? 'Not listed'}
              </p>
              <label className="flex items-start gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={verifiedProfiles.has(profile.id)}
                  onChange={(event) =>
                    setVerifiedProfiles((current) => {
                      const next = new Set(current);
                      if (event.target.checked) next.add(profile.id);
                      else next.delete(profile.id);
                      return next;
                    })
                  }
                />
                I independently verified the listed qualifications.
              </label>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={
                    saving ||
                    !verifiedProfiles.has(profile.id) ||
                    profile.verificationStatus === 'verified'
                  }
                  onClick={() =>
                    void onReview(profile.id, 'verified', profile.revision)
                  }
                >
                  Verify qualifications
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={saving}
                  onClick={() =>
                    void onReview(profile.id, 'rejected', profile.revision)
                  }
                >
                  Reject or delist
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </section>
  );
};
