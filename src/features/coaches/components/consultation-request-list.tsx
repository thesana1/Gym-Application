'use client';

import type { ConsultationRequest } from '@/features/coaches/service/coach.service';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';

type ConsultationRequestListProps = {
  requests: ConsultationRequest[];
  saving: boolean;
  onUpdate: (
    requestId: string,
    status: 'accepted' | 'declined' | 'cancelled'
  ) => Promise<void>;
};

export const ConsultationRequestList = ({
  requests,
  saving,
  onUpdate,
}: ConsultationRequestListProps) => (
  <section className="grid gap-4">
    <h2 className="text-lg font-semibold">Consultation requests</h2>
    {requests.length === 0 ? (
      <p className="text-sm text-muted-foreground">
        Requests you send or receive will appear here.
      </p>
    ) : (
      requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle className="text-base">
              {request.direction === 'outgoing'
                ? `Request to ${request.coachName}`
                : `Request about ${request.topic}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm">
              <span className="font-medium">Topic:</span> {request.topic}
            </p>
            <p className="whitespace-pre-wrap text-sm">{request.message}</p>
            {request.preferredAvailability && (
              <p className="text-sm">
                <span className="font-medium">Preferred availability:</span>{' '}
                {request.preferredAvailability}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Status: {request.status}
              {request.status === 'accepted' &&
                ' — accepted request; no appointment has been booked.'}
            </p>
            {(request.status === 'pending' || request.status === 'accepted') && (
              <div className="flex flex-wrap gap-2">
                {request.direction === 'incoming' && request.status === 'pending' ? (
                  <>
                    <Button
                      size="sm"
                      disabled={saving}
                      onClick={() => void onUpdate(request.id, 'accepted')}
                    >
                      Accept request
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={saving}
                      onClick={() => void onUpdate(request.id, 'declined')}
                    >
                      Decline
                    </Button>
                  </>
                ) : request.direction === 'outgoing' ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => void onUpdate(request.id, 'cancelled')}
                  >
                    Cancel request
                  </Button>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
      ))
    )}
  </section>
);
