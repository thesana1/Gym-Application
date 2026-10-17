import { WEEKDAYS } from '@/shared/const/weekdays.const';

type TrainingScheduleEditorProps = {
  sessions: { title: string }[];
  assignments: Record<number, number | ''>;
  saving: boolean;
  onAssignmentChange: (sessionIndex: number, weekday: number | '') => void;
};

export const TrainingScheduleEditor = ({
  sessions,
  assignments,
  saving,
  onAssignmentChange,
}: TrainingScheduleEditorProps) => {
  const assignedWeekdays = new Set(
    Object.values(assignments).filter((weekday) => weekday !== '')
  );

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {sessions.map((session, sessionIndex) => (
        <label
          key={`${session.title}-${sessionIndex}`}
          htmlFor={`training-day-${sessionIndex}`}
          className="grid gap-1.5 text-sm font-medium"
        >
          Session {sessionIndex + 1}: {session.title}
          <select
            id={`training-day-${sessionIndex}`}
            value={assignments[sessionIndex] ?? ''}
            disabled={saving}
            onChange={(event) =>
              onAssignmentChange(
                sessionIndex,
                event.target.value === '' ? '' : Number(event.target.value)
              )
            }
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm font-normal"
          >
            <option value="">Not scheduled</option>
            {WEEKDAYS.map(({ value, label }) => (
              <option
                key={value}
                value={value}
                disabled={
                  assignedWeekdays.has(value) &&
                  assignments[sessionIndex] !== value
                }
              >
                {label}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
};
