'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';

import { AdminMemberRow } from '@/features/admin/components/admin-member-row';
import { useAdminUsers } from '@/features/admin/hooks/use-admin-users';
import { AdminSearchSchema, type AdminSearchType } from '@/features/admin/validations/admin.validation';
import { Button } from '@/shared/components/ui/button';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { ADMIN_COPY } from '@/shared/const/copy-admin.const';

const copy = ADMIN_COPY.people;

type SessionUser = { id?: string };

export const AdminMembers = () => {
  const { data: session } = useSession();
  const selfId = (session?.user as SessionUser | undefined)?.id;
  const { users, loading, busyId, error, notice, search, run } = useAdminUsers();
  const form = useForm<AdminSearchType>({ resolver: zodResolver(AdminSearchSchema), defaultValues: { query: '' } });

  return (
    <section aria-labelledby="admin-people" className="flex flex-col gap-4">
      <h2 id="admin-people" className="text-xl">{copy.title}</h2>
      <Form {...form}>
        <form role="search" onSubmit={form.handleSubmit(({ query }) => search(query))} className="flex items-end gap-2">
          <FormField control={form.control} name="query" render={({ field }) => (
            <FormItem className="min-w-0 flex-1">
              <FormLabel>{copy.search}</FormLabel>
              <FormControl><Input type="search" placeholder={copy.searchPlaceholder} {...field} /></FormControl>
            </FormItem>
          )} />
          <Button type="submit" variant="outline">{copy.searchButton}</Button>
        </form>
      </Form>

      <div aria-live="polite">
        {error && <p role="alert" className="rounded-lg bg-destructive/10 p-4 text-base text-destructive">{error}</p>}
        {notice && !error && <p role="status" className="rounded-lg bg-pool/15 p-4 text-base font-semibold">{notice}</p>}
      </div>

      {loading && users.length === 0 ? (
        <div className="h-40 animate-pulse rounded-lg bg-muted" role="status" aria-label={copy.loading} />
      ) : users.length === 0 ? (
        <EmptyState message={copy.empty} />
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{copy.shown(users.length)}</p>
          <ul className="flex flex-col divide-y divide-border rounded-lg border border-border bg-card">
            {users.map((user) => (
              <AdminMemberRow key={user.id} user={user} self={user.id === selfId} busy={busyId === user.id} onAction={run} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
};
