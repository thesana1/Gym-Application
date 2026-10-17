
import {
  FitnessProfileInput,
  FitnessProfileType,
} from '@/features/fitness/validations/fitness-profile.validation';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import {
  AVAILABLE_EQUIPMENT,
  FITNESS_GOALS,
  TRAINING_EXPERIENCE_LEVELS,
} from '@/shared/const/fitness.const';

import type { Control } from 'react-hook-form';

type FitnessProfileFieldsProps = {
  control: Control<FitnessProfileInput, undefined, FitnessProfileType>;
};

export const FitnessProfileFields = ({ control }: FitnessProfileFieldsProps) => (
  <>
    <FormField
      control={control}
      name="goal"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Fitness goal</FormLabel>
          <FormControl>
            <select
              {...field}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Choose a goal
              </option>
              {FITNESS_GOALS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <FormField
      control={control}
      name="experience"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Training experience</FormLabel>
          <FormControl>
            <select
              {...field}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Choose your experience
              </option>
              {TRAINING_EXPERIENCE_LEVELS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />

    <div className="grid gap-5 sm:grid-cols-2">
      <FormField
        control={control}
        name="age"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Age (optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="13"
                max="100"
                step="1"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>Used only to tailor general guidance.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="trainingDaysPerWeek"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Training days per week (optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="1"
                max="7"
                step="1"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>How many days you can usually train.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="heightCm"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Height in cm (optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="100"
                max="250"
                step="0.1"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>Used only for relevant estimates.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="weightKg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight in kg (optional)</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="30"
                max="350"
                step="0.1"
                {...field}
                value={field.value ?? ''}
              />
            </FormControl>
            <FormDescription>Used only for relevant estimates.</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>

    <FormField
      control={control}
      name="availableEquipment"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Equipment you can use (optional)</FormLabel>
          <div className="grid gap-3 sm:grid-cols-2">
            {AVAILABLE_EQUIPMENT.map(({ value, label }) => (
              <label key={value} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={field.value.includes(value)}
                  onChange={(event) => {
                    const nextValue = event.target.checked
                      ? [...field.value, value]
                      : field.value.filter((item) => item !== value);
                    field.onChange(nextValue);
                  }}
                  className="size-4 accent-primary"
                />
                {label}
              </label>
            ))}
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  </>
);
