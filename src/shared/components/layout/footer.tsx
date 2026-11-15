import { APP_NAME } from '@/shared/const/app.const';
import { LANDING_COPY } from '@/shared/const/copy-public.const';

export const Footer = () => {
  return (
    <footer className="border-t border-border px-6 py-6 sm:px-10">
      <p className="text-center text-base text-muted-foreground">
        {APP_NAME} · {LANDING_COPY.footer}
      </p>
    </footer>
  );
};
