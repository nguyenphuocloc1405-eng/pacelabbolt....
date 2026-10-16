import { useState } from 'react';
import { Plus, Trash2, MapPin, Timer, TrendingUp, Calendar, X, Activity, Download, Footprints, Tag } from 'lucide-react';
import type { Run, RunInput, Shoe, WorkoutType } from '@/types';
import { calcCalories, formatDate, formatDuration, formatPace } from '@/lib/format';
import { useLanguage } from '@/lib/i18n';

const WORKOUT_TYPES: WorkoutType[] = ['Easy', 'Tempo', 'Interval', 'Long Run', 'Fartlek', 'Hill Repeats'];

const workoutStyles: Record<WorkoutType, string> = {
  'Easy': 'bg-green-500/10 text-green-400 border-green-500/30',
  'Tempo': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  'Interval': 'bg-red-500/10 text-red-400 border-red-500/30',
  'Long Run': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  'Fartlek': 'bg-purple-500/10 text-purple-400 border-purple-500/30',
  'Hill Repeats': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

interface RunningLogProps {
  runs: Run[];
  shoes: Shoe[];
  onAddRun: (run: RunInput) => Promise<void>;
  onDeleteRun: (id: string) => void;
}

export default function RunningLog({ runs, shoes, onAddRun, onDeleteRun }: RunningLogProps) {
  const { lang, t, td } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedRuns = [...runs].sort((a, b) => b.date.localeCompare(a.date));

  const shoeMap = new Map(shoes.map((s) => [s.id, s]));

  async function handleSubmit(input: RunInput) {
    setSubmitting(true);
    setError(null);
    try {
      await onAddRun(input);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('log.saveError'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleExportCsv() {
    try {
      const headers = ['Date', 'Distance (km)', 'Duration (min)', 'Pace (sec/km)', 'Pace', 'Calories', 'Mood', 'Workout Type', 'Shoes', 'Notes'];
      const rows = sortedRuns.map((r) => {
        const shoeName = r.shoe_id ? shoeMap.get(r.shoe_id)?.name ?? '' : '';
        return [
          r.date,
          r.distance_km.toFixed(1),
          r.duration_min.toString(),
          r.pace_sec_per_km.toString(),
          formatPace(r.pace_sec_per_km),
          calcCalories(r.distance_km).toString(),
          r.mood,
          r.workout_type ?? '',
          shoeName,
          (r.notes ?? '').replace(/"/g, '""'),
        ];
      });
      const csv = [headers, ...rows]
        .map((row) => row.map((cell) => `"${cell}"`).join(','))
        .join('\n');
      const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pacelab-runs-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(t('log.exportError'));
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('log.title')}</h2>
          <p className="mt-1 text-sm text-neutral-400">
            {sortedRuns.length} {t('log.count')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {sortedRuns.length > 0 && (
            <button
              onClick={handleExportCsv}
              className="flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              <Download className="h-5 w-5" />
              <span className="hidden sm:inline">{t('log.exportCsv')}</span>
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">{t('log.addRun')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <RunForm
          shoes={shoes}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}

      {sortedRuns.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 py-20 text-center">
          <Activity className="mb-4 h-12 w-12 text-neutral-700" />
          <h3 className="text-lg font-semibold text-white">{t('log.empty')}</h3>
          <p className="mt-1 text-sm text-neutral-500">{t('log.emptyDesc')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
            {t('log.logFirst')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {sortedRuns.map((run) => (
            <RunCard
              key={run.id}
              run={run}
              shoeName={run.shoe_id ? shoeMap.get(run.shoe_id)?.name : undefined}
              onDelete={() => onDeleteRun(run.id)}
            />
          ))}
        </div>
      )}
    </div>
  );

  function RunCard({ run, shoeName, onDelete }: { run: Run; shoeName?: string; onDelete: () => void }) {
    const moodStyles = {
      Easy: 'bg-green-500/10 text-green-400 border-green-500/30',
      Hard: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      Max: 'bg-red-500/10 text-red-400 border-red-500/30',
    };
    return (
      <div className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur transition-all hover:border-neutral-700 hover:shadow-lg hover:shadow-black/20">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
              <MapPin className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{run.distance_km.toFixed(1)} km</p>
              <p className="text-xs text-neutral-400">{formatDate(run.date, lang)}</p>
            </div>
          </div>
          <button
            onClick={onDelete}
            className="rounded-lg p-1.5 text-neutral-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-2">
          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <TrendingUp className="mx-auto mb-1 h-4 w-4 text-green-400" />
            <p className="text-xs text-neutral-500">{t('log.pace')}</p>
            <p className="text-sm font-semibold text-white">{formatPace(run.pace_sec_per_km)}</p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <Timer className="mx-auto mb-1 h-4 w-4 text-blue-400" />
            <p className="text-xs text-neutral-500">{t('log.time')}</p>
            <p className="text-sm font-semibold text-white">{formatDuration(run.duration_min, lang)}</p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <Activity className="mx-auto mb-1 h-4 w-4 text-orange-400" />
            <p className="text-xs text-neutral-500">{t('log.cal')}</p>
            <p className="text-sm font-semibold text-white">{calcCalories(run.distance_km)}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${moodStyles[run.mood]}`}>
              {td(run.mood)}
            </span>
            {run.workout_type && (
              <span className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${workoutStyles[run.workout_type]}`}>
                {td(run.workout_type)}
              </span>
            )}
          </div>
          {shoeName && (
            <span className="flex items-center gap-1 truncate text-xs text-neutral-500" title={shoeName}>
              <Footprints className="h-3 w-3 flex-shrink-0" />
              {shoeName}
            </span>
          )}
        </div>
      </div>
    );
  }

  function RunForm({
    shoes,
    onSubmit,
    onCancel,
    submitting,
  }: {
    shoes: Shoe[];
    onSubmit: (run: RunInput) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
  }) {
    const today = new Date().toISOString().split('T')[0];
    const [date, setDate] = useState(today);
    const [distance, setDistance] = useState('');
    const [duration, setDuration] = useState('');
    const [mood, setMood] = useState<RunInput['mood']>('Easy');
    const [notes, setNotes] = useState('');
    const [shoeId, setShoeId] = useState<string>('');
    const [workoutType, setWorkoutType] = useState<WorkoutType | ''>('');

    const dist = parseFloat(distance) || 0;
    const dur = parseInt(duration) || 0;
    const autoPace = dist > 0 && dur > 0 ? Math.round((dur * 60) / dist) : 0;

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (dist <= 0 || dur <= 0) return;
      await onSubmit({
        date,
        distance_km: dist,
        duration_min: dur,
        pace_sec_per_km: autoPace || 300,
        mood,
        notes: notes.trim() || null,
        shoe_id: shoeId || null,
        workout_type: (workoutType || null) as WorkoutType | null,
      });
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{t('log.formTitle')}</h3>
            <button
              onClick={onCancel}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('log.date')} icon={<Calendar className="h-4 w-4" />}>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-input"
                  required
                />
              </Field>
              <Field label={t('log.mood')} icon={<Activity className="h-4 w-4" />}>
                <div className="flex gap-2">
                  {(['Easy', 'Hard', 'Max'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMood(m)}
                      className={`flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-all ${
                        mood === m
                          ? m === 'Easy'
                            ? 'border-green-500 bg-green-500/10 text-green-400'
                            : m === 'Hard'
                              ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                              : 'border-red-500 bg-red-500/10 text-red-400'
                          : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                      }`}
                    >
                      {td(m)}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t('log.distance')} icon={<MapPin className="h-4 w-4" />}>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  placeholder="5.0"
                  className="form-input"
                  required
                />
              </Field>
              <Field label={t('log.duration')} icon={<Timer className="h-4 w-4" />}>
                <input
                  type="number"
                  min="1"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  placeholder="30"
                  className="form-input"
                  required
                />
              </Field>
            </div>

            {autoPace > 0 && (
              <div className="rounded-lg border border-green-500/20 bg-green-500/5 px-4 py-2.5 text-sm text-green-400">
                {t('log.autoPace')}: <span className="font-semibold">{formatPace(autoPace)}/km</span>
              </div>
            )}

            <Field label={t('log.workoutType')} icon={<Tag className="h-4 w-4" />}>
              <div className="flex flex-wrap gap-1.5">
                {WORKOUT_TYPES.map((wt) => (
                  <button
                    key={wt}
                    type="button"
                    onClick={() => setWorkoutType(workoutType === wt ? '' : wt)}
                    className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
                      workoutType === wt
                        ? workoutStyles[wt]
                        : 'border-neutral-700 text-neutral-400 hover:border-neutral-600'
                    }`}
                  >
                    {td(wt)}
                  </button>
                ))}
              </div>
            </Field>

            {shoes.length > 0 && (
              <Field label={t('log.shoe')} icon={<Footprints className="h-4 w-4" />}>
                <select
                  value={shoeId}
                  onChange={(e) => setShoeId(e.target.value)}
                  className="form-input"
                >
                  <option value="">{t('log.noShoe')}</option>
                  {shoes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.brand}
                    </option>
                  ))}
                </select>
              </Field>
            )}

            <Field label={t('log.notes')}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('log.notesPlaceholder')}
                rows={3}
                className="form-input resize-none"
              />
            </Field>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                {t('log.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? t('log.saving') : t('log.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
        {icon && <span className="text-neutral-500">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}
