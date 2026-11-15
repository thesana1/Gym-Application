import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Disclosure } from '@/shared/components/ui/disclosure';
import { Input } from '@/shared/components/ui/input';
import { Select } from '@/shared/components/ui/select';
import { WORKOUTS_COPY } from '@/shared/const/copy-workouts.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

type WorkoutLogFiltersProps = {
  loading: boolean;
  onApply: (filters: { from?: string; to?: string; exerciseId?: string }) => void;
  onClear: () => void;
};

const copy = WORKOUTS_COPY.history;
const dateStart = (value: string) => (value ? new Date(`${value}T00:00:00`).toISOString() : undefined);
const dateEnd = (value: string) => (value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined);

export const WorkoutLogFilters = ({ loading, onApply, onClear }: WorkoutLogFiltersProps) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exerciseId, setExerciseId] = useState('');

  return (
    <Disclosure summary={copy.filter}>
      <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => {
        event.preventDefault();
        onApply({ from: dateStart(from), to: dateEnd(to), exerciseId: exerciseId || undefined });
      }}>
        <label className="flex flex-col gap-2 text-base font-medium">
          {copy.from}
          <Input type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-base font-medium">
          {copy.to}
          <Input type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-base font-medium sm:col-span-2">
          {copy.exercise}
          <Select value={exerciseId} onChange={(event) => setExerciseId(event.target.value)}>
            <option value="">{copy.allExercises}</option>
            {WORKOUT_EXERCISE_LIBRARY.map(({ id, name }) => <option key={id} value={id}>{name}</option>)}
          </Select>
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" disabled={loading} className="flex-1 sm:flex-none">{copy.apply}</Button>
          <Button type="button" variant="outline" onClick={() => { setFrom(''); setTo(''); setExerciseId(''); onClear(); }}>{copy.clear}</Button>
        </div>
      </form>
    </Disclosure>
  );
};
