import { useState, useEffect, useCallback } from 'react';
import { Check, Dumbbell, Footprints, Moon, Repeat, Zap } from 'lucide-react';
import type { GoalDistance, TrainingDay } from '@/types';
import { trainingPlans } from '@/data/trainingPlans';
import { useLanguage } from '@/lib/i18n';
import { fetchCompletions, saveCompletion, type CompletionData } from '@/lib/firestore';

const goals: GoalDistance[] = ['5KM', '10KM', '21KM'];

const typeConfig = {
  Run: { icon: Footprints, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  Rest: { icon: Moon, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  Cross: { icon: Repeat, color: 'text-green-400 bg-green-500/10 border-green-500/20' },
  Strength: { icon: Zap, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
};

function translateReps(reps: string, td: (en: string) => string): string {
  return reps
    .replace(/each leg/gi, 'EACH_LEG_PLACEHOLDER')
    .replace(/sec/gi, 'SEC_PLACEHOLDER')
    .replace(/min/gi, 'MIN_PLACEHOLDER')
    .split(' ')
    .map((word) => {
      if (word === 'EACH_LEG_PLACEHOLDER') return td('each leg');
      if (word === 'SEC_PLACEHOLDER') return td('sec');
      if (word === 'MIN_PLACEHOLDER') return td('min');
      return word;
    })
    .join(' ');
}

export default function TrainingPlan() {
  const { t, td } = useLanguage();
  const [selectedGoal, setSelectedGoal] = useState<GoalDistance>('5KM');
  const [completionState, setCompletionState] = useState<
    Record<GoalDistance, CompletionData>
  >({ '5KM': {}, '10KM': {}, '21KM': {} });
  const [loaded, setLoaded] = useState<GoalDistance[]>([]);

  const plan = trainingPlans[selectedGoal];

  const loadGoal = useCallback(async (goal: GoalDistance) => {
    if (loaded.includes(goal)) return;
    try {
      const state = await fetchCompletions(goal);
      setCompletionState((prev) => ({ ...prev, [goal]: state }));
      setLoaded((prev) => [...prev, goal]);
    } catch (err) {
      console.error('Failed to load completions:', err);
      setLoaded((prev) => [...prev, goal]);
    }
  }, [loaded]);

  useEffect(() => {
    loadGoal(selectedGoal);
  }, [selectedGoal, loadGoal]);

  const goalInfo: Record<GoalDistance, { weeks: string; desc: string }> = {
    '5KM': { weeks: t('goal.5KM.weeks'), desc: t('goal.5KM.desc') },
    '10KM': { weeks: t('goal.10KM.weeks'), desc: t('goal.10KM.desc') },
    '21KM': { weeks: t('goal.21KM.weeks'), desc: t('goal.21KM.desc') },
  };

  function toggleExercise(dayIdx: number, exIdx: number) {
    setCompletionState((prev) => {
      const goalState = { ...prev[selectedGoal] };
      const dayState = { ...(goalState[dayIdx] || {}) };
      dayState[exIdx] = !dayState[exIdx];
      goalState[dayIdx] = dayState;
      const newState = { ...prev, [selectedGoal]: goalState };
      saveCompletion(selectedGoal, goalState).catch((err) =>
        console.error('Failed to save completion:', err),
      );
      return newState;
    });
  }

  const completedCount = Object.values(completionState[selectedGoal] || {}).reduce(
    (sum, dayEx) => sum + Object.values(dayEx || {}).filter(Boolean).length,
    0,
  );
  const totalExercises = plan.reduce((sum, day) => sum + day.exercises.length, 0);
  const progressPct = totalExercises > 0 ? Math.round((completedCount / totalExercises) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('train.title')}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t('train.subtitle')}</p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {goals.map((goal) => {
          const active = selectedGoal === goal;
          return (
            <button
              key={goal}
              onClick={() => setSelectedGoal(goal)}
              className={`rounded-2xl border p-4 text-center transition-all sm:p-5 ${
                active
                  ? 'border-orange-500 bg-orange-500/10 scale-[1.02]'
                  : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700'
              }`}
            >
              <p
                className={`text-xl font-bold sm:text-2xl ${active ? 'text-orange-400' : 'text-white'}`}
              >
                {goal}
              </p>
              <p className="mt-1 text-xs text-neutral-400 sm:text-sm">{goalInfo[goal].weeks}</p>
              <p className="mt-0.5 text-xs text-neutral-500 hidden sm:block">{goalInfo[goal].desc}</p>
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-300">{t('train.progress')}</span>
          <span className="text-sm font-semibold text-orange-400">
            {completedCount}/{totalExercises} {t('train.exercises')}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <p className="mt-2 text-right text-xs text-neutral-500">{progressPct}% {t('train.completed')}</p>
      </div>

      <div className="space-y-4">
        {plan.map((day, dayIdx) => (
          <TrainingDayCard
            key={`${selectedGoal}-${dayIdx}`}
            day={day}
            dayIdx={dayIdx}
            completedExercises={completionState[selectedGoal]?.[dayIdx] || {}}
            onToggle={(exIdx) => toggleExercise(dayIdx, exIdx)}
          />
        ))}
      </div>
    </div>
  );

  function TrainingDayCard({
    day,
    dayIdx,
    completedExercises,
    onToggle,
  }: {
    day: TrainingDay;
    dayIdx: number;
    completedExercises: Record<number, boolean>;
    onToggle: (exIdx: number) => void;
  }) {
    const config = typeConfig[day.type];
    const Icon = config.icon;
    const completedCount = Object.values(completedExercises).filter(Boolean).length;
    const allDone = day.exercises.length > 0 && completedCount === day.exercises.length;

    return (
      <div
        className={`rounded-2xl border p-5 backdrop-blur transition-all ${
          allDone
            ? 'border-green-500/30 bg-green-500/5'
            : 'border-neutral-800 bg-neutral-900/60'
        }`}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${config.color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-white">{td(day.day)}</h3>
                <span className="text-xs text-neutral-500">{t('train.day')} {dayIdx + 1}</span>
              </div>
              <p className="text-sm text-neutral-400">{td(day.focus)}</p>
            </div>
          </div>
          {allDone && (
            <span className="flex items-center gap-1 rounded-lg bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-400">
              <Check className="h-3 w-3" /> {t('train.completedBadge')}
            </span>
          )}
        </div>

        <div className="mb-4 rounded-xl border border-neutral-800 bg-neutral-800/30 p-3">
          <p className="text-sm text-neutral-300">
            <span className="font-medium text-orange-400">{t('train.workout')}: </span>
            {td(day.workout)}
          </p>
        </div>

        {day.exercises.length > 0 && (
          <div className="space-y-2">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-neutral-500">
              <Dumbbell className="h-3.5 w-3.5" />
              {t('train.supportEx')}
            </div>
            {day.exercises.map((ex, exIdx) => {
              const done = completedExercises[exIdx] || false;
              return (
                <button
                  key={exIdx}
                  onClick={() => onToggle(exIdx)}
                  className={`flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all ${
                    done
                      ? 'border-green-500/30 bg-green-500/5'
                      : 'border-neutral-800 bg-neutral-800/20 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-md border transition-all ${
                        done
                          ? 'border-green-500 bg-green-500 text-white'
                          : 'border-neutral-600 bg-transparent'
                      }`}
                    >
                      {done && <Check className="h-4 w-4" />}
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${done ? 'text-neutral-500 line-through' : 'text-white'}`}
                      >
                        {td(ex.name)}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {ex.sets} {t('train.sets')} × {translateReps(ex.reps, td)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs font-medium ${
                      done
                        ? 'bg-green-500/10 text-green-400'
                        : 'bg-neutral-800 text-neutral-400'
                    }`}
                  >
                    {done ? t('train.done') : t('train.tick')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}
