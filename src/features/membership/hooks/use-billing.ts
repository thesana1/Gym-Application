'use client';

import { useCallback, useEffect, useState } from 'react';

import type { BillingAccess, CheckoutResponse, PurchaseKind } from '@/features/membership/types/payment.types';
import { BILLING_ERRORS } from '@/shared/const/membership-payments.const';
import { http } from '@/shared/lib/http';

export function useBilling(returned: boolean) {
  const [access, setAccess] = useState<BillingAccess | null>(null);
  const [busy, setBusy] = useState<PurchaseKind | 'portal' | 'refresh' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const result = await http.get<BillingAccess>('/membership/access');
      setAccess(result);
      setError(null);
    } catch {
      setError('Unable to load your billing status. Please refresh to try again.');
    }
  }, []);

  useEffect(() => {
    let disposed = false;
    let timer: ReturnType<typeof setTimeout>;
    let attempts = 0;
    async function load() {
      if (disposed) return;
      await refresh();
      attempts += 1;
      if (!disposed && returned && attempts < 10) timer = setTimeout(load, 3000);
    }
    void load();
    return () => { disposed = true; clearTimeout(timer); };
  }, [refresh, returned]);

  const runAction = async (action: PurchaseKind | 'portal' | 'refresh') => {
    setBusy(action);
    setError(null);
    try {
      if (action === 'refresh') return await refresh();
      if (action === 'portal') {
        const result = await http.post<{ url: string }>('/membership/portal', {});
        window.location.assign(result.url);
      } else {
        const result = await http.post<CheckoutResponse>('/membership/checkout', { kind: action });
        if ('checkoutUrl' in result) window.location.assign(result.checkoutUrl);
        else await refresh();
      }
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : '';
      setError(BILLING_ERRORS[message] ?? 'Unable to open billing. Please try again later.');
    } finally {
      setBusy(null);
    }
  };

  return { access, busy, error, runAction };
}
