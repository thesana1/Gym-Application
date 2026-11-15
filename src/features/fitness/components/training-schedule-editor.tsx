import { Select } from '@/shared/components/ui/select';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { WEEKDAYS } from '@/shared/const/weekdays.const';

type TrainingScheduleEditorProps = {
  sessions: { title: string }[];
  assignments: Record<number, number | ''>;
  saving: boolean;
  onAssignmentChange: (sessionIndex: number, weekday: number | '') => void;
};

export const TrainingScheduleEditor = ({ sessions, assignments, saving, onAssignmentChange }: TrainingScheduleEditorProps) => {
  const assignedWeekdays = new Set(Object.values(assignments).filter((weekday) => weekday !== ''));
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sessions.map((session, sessionIndex) => (
        <label key={`${session.title}-${sessionIndex}`} htmlFor={`training-day-${sessionIndex}`} className="flex flex-col gap-2 text-base font-medium">
          {WORKOUTS_COPY.view.workoutNumber(sessionIndex)}: {session.title}
          <Select id={`training-day-${sessionIndex}`} value={assignments[sessionIndex] ?? ''} disabled={saving}
            onChange={(event) => onAssignmentChange(sessionIndex, event.target.value === '' ? '' : Number(event.target.value))}>
            <option value="">{WORKOUTS_COPY.schedule.notScheduled}</option>
            {WEEKDAYS.map(({ value, label }) => (
              <option key={value} value={value} disabled={assignedWeekdays.has(value) && assignments[sessionIndex] !== value}>{label}</option>
            ))}
          </Select>
        </label>
      ))}
    </div>
  );
};
