'use client';

import { BookOpen, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { EQUIPMENT_GUIDE } from '@/shared/const/equipment-guide.const';
import { WORKOUT_EXERCISE_LIBRARY } from '@/shared/const/workout.const';

export const EquipmentGuide = () => {
  const [search, setSearch] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');

  const entries = useMemo(
    () =>
      EQUIPMENT_GUIDE.filter((guide) => {
        const exercises = WORKOUT_EXERCISE_LIBRARY.filter((exercise) =>
          exercise.equipment.includes(guide.equipment)
        );
        const query = search.trim().toLowerCase();
        const matchesSearch =
          !query ||
          `${guide.title} ${guide.purpose} ${guide.primaryUse} ${exercises
            .map((exercise) => exercise.name)
            .join(' ')}`
            .toLowerCase()
            .includes(query);
        return (
          matchesSearch &&
          (!selectedEquipment || selectedEquipment === guide.equipment)
        );
      }),
    [search, selectedEquipment]
  );

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Learn the setup
        </p>
        <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Equipment guide</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Read general setup guidance and exercise examples from our exercise
          library. Equipment differs by manufacturer; ask gym staff if a
          machine is unfamiliar.
        </p>
      </header>

      <section aria-label="Filter equipment">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Search equipment or exercises
            <span className="relative">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="e.g. row, machine, band"
              />
            </span>
          </label>
          <label className="grid gap-1 text-sm">
            Equipment type
            <select
              value={selectedEquipment}
              onChange={(event) => setSelectedEquipment(event.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">All equipment</option>
              {EQUIPMENT_GUIDE.map(({ equipment, title }) => (
                <option key={equipment} value={equipment}>{title}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No equipment matches your search.
        </p>
      ) : (
        <section aria-label="Equipment tutorials" className="grid gap-4">
          {entries.map((guide) => {
            const exercises = WORKOUT_EXERCISE_LIBRARY.filter((exercise) =>
              exercise.equipment.includes(guide.equipment)
            );

            return (
              <Card key={guide.equipment}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpen className="size-4 text-primary" />
                    {guide.title}
                  </CardTitle>
                  <CardDescription>{guide.purpose}</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5">
                  <div>
                    <h2 className="text-sm font-semibold">Common use</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {guide.primaryUse}
                    </p>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">General setup</h2>
                    <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                      {guide.setup.map((step) => <li key={step}>{step}</li>)}
                    </ol>
                  </div>
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4">
                    <h2 className="text-sm font-semibold">Safety notes</h2>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      {guide.safetyNotes.map((note) => <li key={note}>{note}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold">Related exercises</h2>
                    {exercises.length === 0 ? (
                      <p className="mt-2 text-sm text-muted-foreground">
                        No exercise tutorials are currently listed for this type.
                      </p>
                    ) : (
                      <ul className="mt-2 grid gap-3">
                        {exercises.map((exercise) => (
                          <li key={exercise.id} className="rounded-md border p-4">
                            <h3 className="font-medium">{exercise.name}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              Target areas: {exercise.targetMuscles}
                            </p>
                            <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                              {exercise.instructions.map((instruction) => (
                                <li key={instruction}>{instruction}</li>
                              ))}
                            </ol>
                            <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-3">
                              <div>
                                <dt className="font-medium">Common mistake</dt>
                                <dd className="text-muted-foreground">{exercise.commonMistake}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Easier variation</dt>
                                <dd className="text-muted-foreground">{exercise.regression}</dd>
                              </div>
                              <div>
                                <dt className="font-medium">Exercise safety cue</dt>
                                <dd className="text-muted-foreground">{exercise.safetyCue}</dd>
                              </div>
                            </dl>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </section>
      )}
      <p className="text-xs text-muted-foreground">
        Text guidance only; no video demonstrations are included. This general
        information cannot assess your technique or account for an injury or
        health condition. Stop if you feel pain or unusual discomfort and ask a
        qualified professional for individualized help.
      </p>
    </div>
  );
};
