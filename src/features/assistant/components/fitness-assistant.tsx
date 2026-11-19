'use client';

import { Send } from 'lucide-react';
import { useEffect, useState } from 'react';

import { FitnessAnswerCard } from '@/features/assistant/components/fitness-answer-card';
import { useFitnessAssistant } from '@/features/assistant/hooks/use-fitness-assistant';
import { PageHeader } from '@/shared/components/layout/page-header';
import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { AI_DISCLAIMERS } from '@/shared/const/ai.const';
import { COACH_COPY } from '@/shared/const/copy-account.const';

const copy = COACH_COPY;

export const FitnessAssistant = () => {
  const [question, setQuestion] = useState('');
  const [tooShort, setTooShort] = useState(false);
  const { latest, history, usage, loading, error, ask, loadHistory } = useFitnessAssistant();

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  const submit = async (text: string) => {
    setQuestion(text);
    if (text.trim().length < 5) {
      setTooShort(true);
      return;
    }
    setTooShort(false);
    if (await ask(text)) setQuestion('');
  };

  return (
    <div className="flex max-w-2xl animate-rise flex-col gap-5">
      <PageHeader title={copy.title} description={copy.description} className="mb-1" />
      <form className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5" noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void submit(question);
        }}>
        <label htmlFor="assistant-question" className="text-lg font-semibold">{copy.question}</label>
        <textarea id="assistant-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={copy.placeholder}
          rows={3} maxLength={500} aria-invalid={tooShort} aria-describedby="assistant-privacy"
          className="w-full rounded-lg border border-input bg-background px-3 py-3 text-lg focus-visible:outline-2 focus-visible:outline-ring" />
        {tooShort && <p role="alert" className="text-base text-destructive">{copy.tooShort}</p>}
        <p id="assistant-privacy" className="text-base text-muted-foreground">{copy.privacy}</p>
        <Button type="submit" size="lg" disabled={loading}>
          <Send className="size-5" aria-hidden="true" />{loading ? copy.thinking : copy.ask}
        </Button>
        {usage && <p className="text-center text-base text-muted-foreground">{copy.used(usage.used, usage.limit)}</p>}
      </form>

      {loading && <div role="status" className="rounded-lg border border-border bg-card p-5 text-base">{copy.wait}</div>}
      {error && <p role="alert" className="text-base text-destructive">{error}</p>}

      {latest && (
        <section aria-labelledby="latest-answer" className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5">
          <h2 id="latest-answer" className="text-xl">{latest.question}</h2>
          {latest.source === 'saved' && <p className="text-base text-muted-foreground">{copy.saved}</p>}
          <FitnessAnswerCard answer={latest.answer} onFollowUp={(followUp) => void submit(followUp)} />
          <p className="text-base text-muted-foreground">{AI_DISCLAIMERS.training}</p>
        </section>
      )}

      {history.length > 0 && (
        <Disclosure summary={copy.past}>
          <div className="flex flex-col gap-3">
            {history.map((item) => (
              <Disclosure key={item.id} className="bg-background" summary={copy.pastItem(item.label, new Date(item.createdAt).toLocaleDateString())}>
                <FitnessAnswerCard answer={item.data} />
              </Disclosure>
            ))}
            <p className="text-base text-muted-foreground">{AI_DISCLAIMERS.training}</p>
          </div>
        </Disclosure>
      )}
    </div>
  );
};
