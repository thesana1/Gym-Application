import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

type WorkoutLogFiltersProps = {
  loading: boolean;
  onApply: (filters: {
    from?: string;
    to?: string;
    exerciseId?: string;
  }) => void;
  onClear: () => void;
};

const dateStart = (value: string) =>
  value ? new Date(`${value}T00:00:00`).toISOString() : undefined;

const dateEnd = (value: string) =>
  value ? new Date(`${value}T23:59:59.999`).toISOString() : undefined;

export const WorkoutLogFilters = ({
  loading,
  onApply,
  onClear,
}: WorkoutLogFiltersProps) => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exerciseId, setExerciseId] = useState('');

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Filter workout history</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          onSubmit={(event) => {
            event.preventDefault();
            onApply({
              from: dateStart(from),
              to: dateEnd(to),
              exerciseId: exerciseId || undefined,
            });
          }}
        >
          <label className="grid gap-1 text-xs text-muted-foreground">
            From
            <Input
              type="date"
              value={from}
              max={to || undefined}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            To
            <Input
              type="date"
              value={to}
              min={from || undefined}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>
          <label className="grid gap-1 text-xs text-muted-foreground">
            Exercise
            <select
              value={exerciseId}
              onChange={(event) => setExerciseId(event.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All exercises</option>
              {WORKOUT_EXERCISE_LIBRARY.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex items-end gap-2">
            <Button type="submit" disabled={loading}>
              Apply filters
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFrom('');
                setTo('');
                setExerciseId('');
                onClear();
              }}
            >
              Clear
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
