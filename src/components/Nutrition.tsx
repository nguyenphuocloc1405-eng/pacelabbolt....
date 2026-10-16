import { useMemo, useState, useEffect, useCallback } from 'react';
import { Apple, Coffee, Sun, Moon, Wallet, Utensils } from 'lucide-react';
import { nutritionPlans } from '@/data/nutritionData';
import type { MealCategory } from '@/types';
import { formatVnd } from '@/lib/format';
import { useLanguage } from '@/lib/i18n';
import { fetchNutritionSelections, saveNutritionSelections } from '@/lib/firestore';

const mealIcons = {
  Breakfast: Coffee,
  Lunch: Sun,
  Dinner: Moon,
};

const mealAccentColors = {
  Breakfast: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  Lunch: 'text-green-400 bg-green-500/10 border-green-500/20',
  Dinner: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
};

type BudgetRange = 'day' | 'week';

export default function Nutrition() {
  const { t, td } = useLanguage();
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedMeals, setSelectedMeals] = useState<Record<string, Set<string>>>({});
  const [budgetRange, setBudgetRange] = useState<BudgetRange>('day');

  const selectedDay = nutritionPlans[selectedDayIdx];

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await fetchNutritionSelections();
        if (cancelled) return;
        const state: Record<string, Set<string>> = {};
        for (const [key, meals] of Object.entries(data)) {
          state[key] = new Set(meals);
        }
        setSelectedMeals(state);
      } catch (err) {
        console.error('Failed to load nutrition selections:', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleMeal = useCallback(
    (mealName: string) => {
      setSelectedMeals((prev) => {
        const key = `${selectedDayIdx}`;
        const current = new Set(prev[key] || []);
        if (current.has(mealName)) {
          current.delete(mealName);
        } else {
          current.add(mealName);
        }
        const newState = { ...prev, [key]: current };
        saveNutritionSelections(key, Array.from(current)).catch((err) =>
          console.error('Failed to save nutrition selection:', err),
        );
        return newState;
      });
    },
    [selectedDayIdx],
  );

  const selectedSet = selectedMeals[`${selectedDayIdx}`] || new Set<string>();

  const { totalCalories, totalCost, selectedCount } = useMemo(() => {
    let cal = 0;
    let cost = 0;
    for (const cat of selectedDay.meals) {
      for (const meal of cat.meals) {
        if (selectedSet.has(meal.name)) {
          cal += meal.calories;
          cost += meal.cost;
        }
      }
    }
    return { totalCalories: cal, totalCost: cost, selectedCount: selectedSet.size };
  }, [selectedDay, selectedSet]);

  const weeklyBudget = useMemo(() => {
    const allCosts: number[] = nutritionPlans.map((day) => {
      let dayCost = 0;
      for (const cat of day.meals) {
        for (const meal of cat.meals) {
          dayCost += meal.cost;
        }
      }
      return dayCost;
    });
    return allCosts.reduce((sum, c) => sum + c, 0);
  }, []);

  const displayBudget = budgetRange === 'day' ? totalCost : weeklyBudget;
  const budgetLabel = budgetRange === 'day' ? t('nut.todayBudget') : t('nut.weekBudget');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('nut.title')}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t('nut.subtitle')}</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2">
        {nutritionPlans.map((plan, idx) => (
          <button
            key={idx}
            onClick={() => setSelectedDayIdx(idx)}
            className={`flex-shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-all ${
              selectedDayIdx === idx
                ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                : 'border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            {td(plan.day)}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {selectedDay.meals.map((cat) => (
            <MealCategoryCard
              key={cat.category}
              cat={cat}
              selectedSet={selectedSet}
              onToggle={toggleMeal}
            />
          ))}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
            <div className="mb-4 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-orange-400" />
              <h3 className="font-semibold text-white">{t('nut.estimatedCost')}</h3>
            </div>

            <div className="mb-4 flex gap-1 rounded-lg bg-neutral-800 p-1">
              <button
                onClick={() => setBudgetRange('day')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  budgetRange === 'day'
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t('nut.byDay')}
              </button>
              <button
                onClick={() => setBudgetRange('week')}
                className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  budgetRange === 'week'
                    ? 'bg-orange-500 text-white'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                {t('nut.byWeek')}
              </button>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4">
              <p className="text-xs text-neutral-500">{budgetLabel}</p>
              <p className="mt-1 text-3xl font-bold text-orange-400">{formatVnd(displayBudget)}</p>
            </div>

            {budgetRange === 'day' && (
              <>
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{t('nut.selectedMeals')}</span>
                    <span className="font-semibold text-white">{selectedCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">{t('nut.totalCal')}</span>
                    <span className="font-semibold text-white">{totalCalories} kcal</span>
                  </div>
                </div>
                {selectedCount === 0 && (
                  <p className="mt-3 rounded-lg bg-neutral-800/50 px-3 py-2 text-xs text-neutral-500">
                    {t('nut.selectHint')}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Apple className="h-5 w-5 text-green-400" />
              <h3 className="font-semibold text-white">{t('nut.nutritionGoal')}</h3>
            </div>
            <div className="space-y-3">
              <NutrientBar label={t('nut.calories')} value={totalCalories} target={2200} unit="kcal" color="orange" />
              <NutrientBar
                label={t('nut.selectionRatio')}
                value={selectedCount}
                target={selectedDay.meals.reduce((s, c) => s + c.meals.length, 0)}
                unit={t('nut.meals')}
                color="green"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function MealCategoryCard({
    cat,
    selectedSet,
    onToggle,
  }: {
    cat: MealCategory;
    selectedSet: Set<string>;
    onToggle: (name: string) => void;
  }) {
    const Icon = mealIcons[cat.category];
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${mealAccentColors[cat.category]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <h3 className="font-semibold text-white">{td(cat.category)}</h3>
        </div>
        <div className="space-y-3">
          {cat.meals.map((meal) => {
            const selected = selectedSet.has(meal.name);
            return (
              <button
                key={meal.name}
                onClick={() => onToggle(meal.name)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-orange-500/40 bg-orange-500/5'
                    : 'border-neutral-800 bg-neutral-800/20 hover:border-neutral-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Utensils className={`h-4 w-4 flex-shrink-0 ${selected ? 'text-orange-400' : 'text-neutral-600'}`} />
                    <p className="font-medium text-white truncate">{td(meal.name)}</p>
                  </div>
                  <p className="mt-1.5 ml-6 text-xs text-neutral-500 line-clamp-2">
                    {meal.ingredients.map((ing) => td(ing)).join(', ')}
                  </p>
                  <div className="mt-2 ml-6 flex items-center gap-4">
                    <span className="text-xs text-orange-400">{meal.calories} kcal</span>
                    <span className="text-xs text-green-400">{formatVnd(meal.cost)}</span>
                  </div>
                </div>
                <div
                  className={`ml-3 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition-all ${
                    selected
                      ? 'border-orange-500 bg-orange-500 text-white'
                      : 'border-neutral-600 bg-transparent'
                  }`}
                >
                  {selected && <CheckIcon />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function NutrientBar({
  label,
  value,
  target,
  unit,
  color,
}: {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: 'orange' | 'green';
}) {
  const pct = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;
  const barColor = color === 'orange' ? 'bg-orange-500' : 'bg-green-500';
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-neutral-400">{label}</span>
        <span className="font-medium text-white">
          {value} / {target} {unit}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
        <div
          className={`h-full rounded-full ${barColor} transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
