'use client';

import { useCallback, useEffect, useState } from 'react';

import { CoachApplication } from '@/features/coaches/components/coach-application';
import { CoachModerationQueue } from '@/features/coaches/components/coach-moderation-queue';
import { CoachSearchSection } from '@/features/coaches/components/coach-search-section';
import { ConsultationRequestList } from '@/features/coaches/components/consultation-request-list';
import type {
  CoachProfile,
  ConsultationRequest,
} from '@/features/coaches/service/coach.service';
import type {
  CoachProfileType,
  ConsultationRequestFormType,
} from '@/features/coaches/validations/coach.validation';
import { http } from '@/shared/lib/http';

type CoachDirectoryProps = {
  isAdmin: boolean;
};

const FRIENDLY_ERRORS: Record<string, string> = {
  COACH_NOT_AVAILABLE: 'This coach is no longer available in the directory.',
  CANNOT_REQUEST_SELF: 'You cannot request a consultation with your own profile.',
  FORBIDDEN: 'You do not have permission to review coach applications.',
  NOT_FOUND: 'This profile or request is no longer available.',
  UNAUTHORIZED: 'Sign in to use the coach directory.',
  VALIDATION_ERROR: 'Please review the submitted details and try again.',
};

const getErrorMessage = (error: unknown) =>
  error instanceof Error
    ? FRIENDLY_ERRORS[error.message] ?? error.message
    : 'The request could not be completed.';

export const CoachDirectory = ({ isAdmin }: CoachDirectoryProps) => {
  const [coaches, setCoaches] = useState<CoachProfile[]>([]);
  const [ownProfile, setOwnProfile] = useState<CoachProfile | null>(null);
  const [requests, setRequests] = useState<ConsultationRequest[]>([]);
  const [moderationProfiles, setModerationProfiles] = useState<CoachProfile[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const profile = await http.get<CoachProfile | null>('/coaches/profile');
      setOwnProfile(profile);
      setProfileLoaded(true);
      const [directory, ownRequests, moderation] = await Promise.all([
        http.get<CoachProfile[]>('/coaches'),
        http.get<ConsultationRequest[]>('/coaches/requests'),
        isAdmin
          ? http.get<CoachProfile[]>('/coaches/admin')
          : Promise.resolve([]),
      ]);
      setCoaches(directory);
      setRequests(ownRequests);
      setModerationProfiles(moderation);
    } catch (loadError) {
      setError(getErrorMessage(loadError));
    } finally {
      setLoaded(true);
    }
  }, [isAdmin]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const saveProfile = async (profile: CoachProfileType) => {
    setSaving(true);
    setError(null);
    try {
      const saved = await http.put<CoachProfile>('/coaches/profile', profile);
      setOwnProfile(saved);
      setNotice('Your profile was submitted for qualification review.');
      await loadData();
    } catch (saveError) {
      setError(getErrorMessage(saveError));
    } finally {
      setSaving(false);
    }
  };

  const sendRequest = async (
    coachProfileId: string,
    request: ConsultationRequestFormType
  ): Promise<boolean> => {
    setSaving(true);
    setError(null);
    try {
      await http.post('/coaches/requests', { ...request, coachProfileId });
      setNotice('Consultation request sent.');
      await loadData();
      return true;
    } catch (requestError) {
      setError(getErrorMessage(requestError));
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateRequest = async (
    requestId: string,
    status: 'accepted' | 'declined' | 'cancelled'
  ) => {
    setSaving(true);
    setError(null);
    try {
      await http.patch(`/coaches/requests/${requestId}`, { status });
      setNotice(`Request ${status}.`);
      await loadData();
    } catch (updateError) {
      setError(getErrorMessage(updateError));
    } finally {
      setSaving(false);
    }
  };

  const reviewProfile = async (
    profileId: string,
    decision: 'verified' | 'rejected',
    expectedRevision: number
  ) => {
    setSaving(true);
    setError(null);
    try {
      await http.patch('/coaches/admin', {
        profileId,
        decision,
        expectedRevision,
        ...(decision === 'verified' ? { confirmedCredentials: true } : {}),
      });
      setNotice(`Coach profile ${decision}.`);
      await loadData();
    } catch (reviewError) {
      setError(getErrorMessage(reviewError));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Professional guidance
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Coach directory</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Browse profiles with reviewed qualifications and send a consultation
          request. No prices, ratings, or appointment slots are advertised.
        </p>
      </header>

      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      {notice && <p className="text-sm text-primary" role="status">{notice}</p>}

      <CoachApplication
        loaded={profileLoaded}
        profile={ownProfile}
        saving={saving}
        onSave={saveProfile}
      />

      {loaded && (
        <CoachSearchSection
          coaches={coaches}
          saving={saving}
          onRequest={sendRequest}
        />
      )}

      {loaded && (
        <ConsultationRequestList
          requests={requests}
          saving={saving}
          onUpdate={updateRequest}
        />
      )}

      {loaded && isAdmin && (
        <CoachModerationQueue
          profiles={moderationProfiles}
          saving={saving}
          onReview={reviewProfile}
        />
      )}
    </div>
  );
};
