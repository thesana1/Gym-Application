'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  ConsultationRequestFormSchema,
  type ConsultationRequestFormType,
} from '@/features/coaches/validations/coach.validation';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';

type ConsultationRequestFormProps = {
  saving: boolean;
  onCancel: () => void;
  onSave: (request: ConsultationRequestFormType) => Promise<void>;
};

export const ConsultationRequestForm = ({
  saving,
  onCancel,
  onSave,
}: ConsultationRequestFormProps) => {
  const form = useForm<ConsultationRequestFormType>({
    resolver: zodResolver(ConsultationRequestFormSchema),
    defaultValues: { topic: '', message: '', preferredAvailability: '' },
  });

  return (
    <form className="grid gap-3 border-t pt-4" onSubmit={form.handleSubmit(onSave)}>
      <label className="grid gap-2 text-sm font-medium">
        Topic
        <Input maxLength={120} {...form.register('topic')} />
        {form.formState.errors.topic && (
          <span className="text-xs text-destructive">
            {form.formState.errors.topic.message}
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        What would you like help with? (do not include medical or contact details)
        <textarea
          rows={3}
          maxLength={1200}
          {...form.register('message')}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        {form.formState.errors.message && (
          <span className="text-xs text-destructive">
            {form.formState.errors.message.message}
          </span>
        )}
      </label>
      <label className="grid gap-2 text-sm font-medium">
        General preferred availability (optional)
        <Input
          maxLength={300}
          placeholder="e.g. weekday mornings"
          {...form.register('preferredAvailability')}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        This sends a request, not a booking. No payment or appointment is
        created. You may cancel until the request is declined or cancelled.
        Keep medical details and private contact information out of the message.
      </p>
      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving ? 'Sending…' : 'Send request'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
