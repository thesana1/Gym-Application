import { COMMON_COPY } from '@/shared/const/copy-common.const';

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4 px-4 pt-5" role="status" aria-label={COMMON_COPY.loading}>
      <div className="h-10 w-48 animate-pulse rounded-lg bg-muted" />
      <div className="h-44 animate-pulse rounded-lg bg-muted" />
      <div className="h-36 animate-pulse rounded-lg bg-muted" />
    </div>
  );
}
