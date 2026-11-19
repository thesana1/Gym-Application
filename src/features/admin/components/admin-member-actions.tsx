'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import type { AdminAction } from '@/features/admin/hooks/use-admin-users';
import type { AdminUserRow } from '@/features/admin/types/admin.types';
import { AdminGiftFormSchema, type AdminGiftFormType, type AdminMembershipType } from '@/features/admin/validations/admin.validation';
import { Button } from '@/shared/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Select } from '@/shared/components/ui/select';
import { ADMIN_GIFT_MONTHS } from '@/shared/const/admin.const';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';

const copy = ADMIN_COPY.people;

type AdminMemberActionsProps = {
  user: AdminUserRow;
  self: boolean;
  busy: boolean;
  onAction: (action: AdminAction, body?: AdminMembershipType) => void;
};

const confirmThen = (message: string, action: () => void) => {
  if (window.confirm(message)) action();
};

export const AdminMemberActions = ({ user, self, busy, onAction }: AdminMemberActionsProps) => {
  const form = useForm<AdminGiftFormType>({ resolver: zodResolver(AdminGiftFormSchema), defaultValues: { months: String(ADMIN_GIFT_MONTHS[0]) } });
  const gift = ({ months }: AdminGiftFormType) => onAction('gift', { action: 'gift', months: Number(months) });

  return (
    <div className="flex flex-col gap-5">
      {user.plan === 'paid' ? (
        <div className="flex flex-col items-start gap-2">
          <p className="text-base text-muted-foreground">{copy.paidHelp}</p>
          {!user.cancelling && (
            <Button variant="outline" disabled={busy}
              onClick={() => confirmThen(copy.confirmCancel(user.name), () => onAction('cancel-subscription', { action: 'cancel-subscription' }))}>
              {copy.cancelSubscription}
            </Button>
          )}
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(gift)} className="flex flex-col gap-3">
            <h3 className="text-lg">{copy.giftTitle}</h3>
            <p className="text-base text-muted-foreground">{copy.giftHelp}</p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <FormField control={form.control} name="months" render={({ field }) => (
                <FormItem className="sm:w-40">
                  <FormLabel>{copy.giftLength}</FormLabel>
                  <FormControl>
                    <Select {...field}>
                      {ADMIN_GIFT_MONTHS.map((months) => <option key={months} value={String(months)}>{copy.giftMonths(months)}</option>)}
                    </Select>
                  </FormControl>
                </FormItem>
              )} />
              <Button type="submit" disabled={busy}>{user.plan === 'gift' ? copy.extend : copy.gift}</Button>
            </div>
            {user.plan === 'gift' && (
              <Button type="button" variant="outline" className="self-start" disabled={busy}
                onClick={() => confirmThen(copy.confirmRemoveGift(user.name), () => onAction('remove-gift', { action: 'remove-gift' }))}>
                {copy.removeGift}
              </Button>
            )}
          </form>
        </Form>
      )}

      {!self && (
        <div className="flex flex-col items-start gap-2 border-t border-border pt-4">
          <h3 className="text-lg text-destructive">{copy.deleteTitle}</h3>
          <p className="text-base text-muted-foreground">{copy.deleteHelp}</p>
          <Button variant="destructive" disabled={busy} onClick={() => confirmThen(copy.confirmDelete(user.name, user.email), () => onAction('delete'))}>
            {copy.delete}
          </Button>
        </div>
      )}
    </div>
  );
};
