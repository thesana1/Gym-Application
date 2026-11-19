'use client';
import Link from 'next/link';
import { useEffect } from 'react';

import { Button } from '@/shared/components/ui/button';
import { COMMON_COPY } from '@/shared/const/copy-common.const';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function Error({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-96 max-w-md flex-col items-start justify-center gap-4 px-4">
      <h2 className="text-2xl">{COMMON_COPY.errorTitle}</h2>
      <p className="text-lg text-muted-foreground">{COMMON_COPY.somethingWentWrong}</p>
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>{COMMON_COPY.tryAgain}</Button>
        <Button asChild variant="outline"><Link href="/dashboard">{COMMON_COPY.goHome}</Link></Button>
      </div>
    </div>
  );
}
