import { TriangleAlert } from 'lucide-react';

import type { FitnessAnswer } from '@/features/assistant/validations/fitness-question.validation';
import { COACH_COPY } from '@/shared/const/copy-account.const';

type FitnessAnswerCardProps = {
  answer: FitnessAnswer;
  onFollowUp?: (question: string) => void;
};

export const FitnessAnswerCard = ({ answer, onFollowUp }: FitnessAnswerCardProps) => (
  <div className="flex flex-col gap-4">
    {answer.seeProfessional && (
      <p role="note" className="flex gap-2 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-base">
        <TriangleAlert className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />{COACH_COPY.seeDoctor}
      </p>
    )}
    <p className="whitespace-pre-line text-lg leading-relaxed">{answer.answer}</p>
    {answer.keyPoints.length > 0 && (
      <ul className="list-disc space-y-1 pl-5 text-base">{answer.keyPoints.map((point) => <li key={point}>{point}</li>)}</ul>
    )}
    {onFollowUp && answer.followUpQuestions.length > 0 && (
      <div className="flex flex-col gap-2">
        <p className="text-base font-semibold">{COACH_COPY.askNext}</p>
        {answer.followUpQuestions.map((question) => (
          <button key={question} type="button" onClick={() => onFollowUp(question)}
            className="min-h-12 rounded-lg border border-border bg-background px-4 py-2 text-left text-base hover:border-primary hover:text-primary-ink
              focus-visible:outline-2 focus-visible:outline-ring">
            {question}
          </button>
        ))}
      </div>
    )}
  </div>
);
