import { PageHeader } from '@/shared/components/layout/page-header';
import { SectionTabs } from '@/shared/components/layout/section-tabs';
import { PROGRESS_COPY } from '@/shared/const/copy-progress.const';
import { PROGRESS_TABS } from '@/shared/const/navigation.const';

export const ProgressHeader = () => (
  <PageHeader title={PROGRESS_COPY.title} description={PROGRESS_COPY.description}>
    <SectionTabs tabs={PROGRESS_TABS} />
  </PageHeader>
);
