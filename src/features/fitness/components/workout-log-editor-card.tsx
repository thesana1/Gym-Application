import { WorkoutLogForm } from '@/features/fitness/components/workout-log-form';
import type { WorkoutLog } from '@/features/fitness/service/workout-log.service';
import type { WorkoutSession } from '@/features/fitness/service/workout-plan.service';
import type {
  WorkoutLogInput,
  WorkoutLogType,
} from '@/features/fitness/validations/workout-log.validation';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

type WorkoutLogEditorCardProps = {
  startSession?: WorkoutSession;
  editingWorkout: WorkoutLog | null;
  formOpen: boolean;
  initialValues: WorkoutLogInput;
  saving: boolean;
  onOpen: () => void;
  onCancel: () => void;
  onSubmit: (value: WorkoutLogType) => Promise<void>;
};

export const WorkoutLogEditorCard = ({
  startSession,
  editingWorkout,
  formOpen,
  initialValues,
  saving,
  onOpen,
  onCancel,
  onSubmit,
}: WorkoutLogEditorCardProps) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between gap-4">
      <CardTitle className="text-base">Log a workout</CardTitle>
      {!formOpen && <Button onClick={onOpen}>Log workout</Button>}
    </CardHeader>
    {formOpen && (
      <CardContent>
        {startSession && !editingWorkout && (
          <p className="mb-4 text-sm text-muted-foreground">
            Review the planned exercises and enter the repetitions and weights
            you actually completed. Nothing is saved until you submit this form.
          </p>
        )}
        <WorkoutLogForm
          key={
            editingWorkout?.id ??
            (startSession ? `planned-${startSession.title}` : 'new-workout')
          }
          initialValues={initialValues}
          saving={saving}
          onCancel={onCancel}
          onSubmit={onSubmit}
        />
      </CardContent>
    )}
  </Card>
);
