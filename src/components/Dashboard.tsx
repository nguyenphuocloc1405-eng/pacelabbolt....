import { useMemo, useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Activity, Flame, MapPin, Timer, TrendingUp, Target, Pencil, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import type { Run } from '@/types';
import type { Lang } from '@/lib/i18n';
import { calcCalories, formatDate, formatDuration, formatPace } from '@/lib/format';
import { useLanguage } from '@/lib/i18n';
import { fetchWeeklyGoal, saveWeeklyGoal } from '@/lib/firestore';

interface DashboardProps {
  runs: Run[];
  onNavigate: (tab: string) => void;
}

type ChartRange = 'week' | 'month';

export default function Dashboard({ runs, onNavigate }: DashboardProps) {
  const { lang, t, td } = useLanguage();
  const [chartRange, setChartRange] = useState<ChartRange>('week');
  const [weeklyGoal, setWeeklyGoal] = useState(0);
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalInput, setGoalInput] = useState('');
  const [savingGoal, setSavingGoal] = useState(false);

  useEffect(() => {
    fetchWeeklyGoal().then((km) => {
      setWeeklyGoal(km);
      setGoalInput(km > 0 ? km.toString() : '20');
    }).catch((err) => console.error('Failed to load weekly goal:', err));
  }, []);

  const stats = useMemo(() => {
    const totalKm = runs.reduce((sum, r) => sum + r.distance_km, 0);
    const totalMin = runs.reduce((sum, r) => sum + r.duration_min, 0);
    const avgPace =
      runs.length > 0
        ? Math.round(runs.reduce((sum, r) => sum + r.pace_sec_per_km, 0) / runs.length)
        : 0;
    const totalCal = runs.reduce((sum, r) => sum + calcCalories(r.distance_km), 0);
    return {
      totalKm: totalKm.toFixed(1),
      totalMin,
      avgPace,
      totalCal,
      runCount: runs.length,
    };
  }, [runs]);

  const chartData = useMemo(() => {
    const now = new Date();
    const days = chartRange === 'week' ? 7 : 30;
    const buckets: { label: string; date: string; km: number; calories: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayRuns = runs.filter((r) => r.date === dateStr);
      buckets.push({
        label:
          chartRange === 'week'
            ? d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', { weekday: 'short' })
            : `${d.getDate()}`,
        date: dateStr,
        km: dayRuns.reduce((s, r) => s + r.distance_km, 0),
        calories: dayRuns.reduce((s, r) => s + calcCalories(r.distance_km), 0),
      });
    }
    return buckets;
  }, [runs, chartRange, lang]);

  const recentRuns = useMemo(
    () => [...runs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3),
    [runs],
  );

  // Weekly progress: sum km from last 7 days
  const weekKm = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 6);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    return runs
      .filter((r) => r.date >= weekAgoStr)
      .reduce((sum, r) => sum + r.distance_km, 0);
  }, [runs]);

  const weekPct = weeklyGoal > 0 ? Math.min(100, Math.round((weekKm / weeklyGoal) * 100)) : 0;
  const weekRemaining = Math.max(0, weeklyGoal - weekKm);

  async function handleSaveGoal() {
    const km = parseFloat(goalInput) || 0;
    if (km <= 0) return;
    setSavingGoal(true);
    try {
      await saveWeeklyGoal(km);
      setWeeklyGoal(km);
      setEditingGoal(false);
    } catch (err) {
      console.error('Failed to save weekly goal:', err);
    } finally {
      setSavingGoal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<MapPin className="h-5 w-5" />}
          label={t('dash.totalKm')}
          value={`${stats.totalKm} km`}
          accent="orange"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label={t('dash.avgPace')}
          value={stats.avgPace > 0 ? `${formatPace(stats.avgPace)}/km` : '--'}
          accent="green"
        />
        <StatCard
          icon={<Timer className="h-5 w-5" />}
          label={t('dash.totalTime')}
          value={stats.totalMin > 0 ? formatDuration(stats.totalMin, lang) : '--'}
          accent="blue"
        />
        <StatCard
          icon={<Flame className="h-5 w-5" />}
          label={t('dash.totalCal')}
          value={stats.totalCal > 0 ? `${stats.totalCal.toLocaleString()} kcal` : '--'}
          accent="red"
        />
      </div>

      {/* Weekly Goal Progress Bar */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Target className="h-5 w-5 text-orange-400" />
            <h3 className="font-semibold text-white">{t('dash.weeklyGoal')}</h3>
          </div>
          {editingGoal ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                step="1"
                value={goalInput}
                onChange={(e) => setGoalInput(e.target.value)}
                className="w-20 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-white focus:border-orange-500 focus:outline-none"
              />
              <span className="text-sm text-neutral-500">{t('dash.goalKm')}</span>
              <button
                onClick={handleSaveGoal}
                disabled={savingGoal}
                className="rounded-lg bg-orange-500 p-1.5 text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingGoal(true)}
              className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
            >
              <Pencil className="h-3.5 w-3.5" />
              {t('dash.setGoal')}
            </button>
          )}
        </div>

        {weeklyGoal > 0 ? (
          <>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-neutral-400">
                {t('dash.thisWeek')}: <span className="font-bold text-white">{weekKm.toFixed(1)}</span> / {weeklyGoal} {t('dash.goalKm')}
              </span>
              <span className={`font-semibold ${weekPct >= 100 ? 'text-green-400' : 'text-orange-400'}`}>
                {weekPct >= 100 ? t('dash.goalReached') : `${weekPct}%`}
              </span>
            </div>
            <div className="h-3.5 overflow-hidden rounded-full bg-neutral-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  weekPct >= 100
                    ? 'bg-gradient-to-r from-green-600 to-green-400'
                    : 'bg-gradient-to-r from-orange-500 to-orange-400'
                }`}
                style={{ width: `${weekPct}%` }}
              />
            </div>
            {weekPct < 100 && (
              <p className="mt-2 text-xs text-neutral-500">
                {weekRemaining.toFixed(1)} km {t('dash.goalRemaining')}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-neutral-500">{t('dash.noGoal')}</p>
        )}
      </div>

      {/* Overload Warning */}
      <OverloadWarning runs={runs} lang={lang} t={t} />

      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-400" />
            <h2 className="text-lg font-semibold text-white">{t('dash.chartTitle')}</h2>
          </div>
          <div className="flex gap-1 rounded-lg bg-neutral-800 p-1">
            <button
              onClick={() => setChartRange('week')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                chartRange === 'week'
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('dash.week')}
            </button>
            <button
              onClick={() => setChartRange('month')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                chartRange === 'month'
                  ? 'bg-orange-500 text-white'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('dash.month')}
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorKm" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              axisLine={{ stroke: '#404040' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#a3a3a3', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#171717',
                border: '1px solid #404040',
                borderRadius: '12px',
                color: '#fff',
              }}
              labelStyle={{ color: '#a3a3a3' }}
              formatter={(value) => [`${Number(value).toFixed(1)} km`, t('dash.distance')]}
            />
            <Area
              type="monotone"
              dataKey="km"
              stroke="#f97316"
              strokeWidth={2.5}
              fill="url(#colorKm)"
              dot={{ fill: '#f97316', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">{t('dash.recentRuns')}</h2>
            <button
              onClick={() => onNavigate('log')}
              className="text-sm font-medium text-orange-400 transition-colors hover:text-orange-300"
            >
              {t('dash.viewAll')}
            </button>
          </div>
          {recentRuns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Activity className="mb-3 h-10 w-10 text-neutral-700" />
              <p className="text-neutral-500">{t('dash.noRuns')}</p>
              <button
                onClick={() => onNavigate('log')}
                className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
              >
                {t('dash.logFirst')}
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentRuns.map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-800/40 p-4 transition-colors hover:border-neutral-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                      <MapPin className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{run.distance_km.toFixed(1)} km</p>
                      <p className="text-sm text-neutral-400">{formatDate(run.date, lang)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">{t('log.pace')}</p>
                      <p className="font-semibold text-green-400">{formatPace(run.pace_sec_per_km)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-neutral-500">{t('log.time')}</p>
                      <p className="font-semibold text-blue-400">{formatDuration(run.duration_min, lang)}</p>
                    </div>
                    <MoodBadge mood={run.mood} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5">
          <h2 className="mb-4 text-lg font-semibold text-white">{t('dash.summary')}</h2>
          <div className="space-y-4">
            <SummaryRow label={t('dash.totalRuns')} value={stats.runCount.toString()} />
            <SummaryRow
              label={t('dash.avgPerRun')}
              value={stats.runCount > 0 ? `${(parseFloat(stats.totalKm) / stats.runCount).toFixed(1)} km` : '--'}
            />
            <SummaryRow
              label={t('dash.calPerRun')}
              value={stats.runCount > 0 ? Math.round(stats.totalCal / stats.runCount).toLocaleString() : '--'}
            />
            <div className="border-t border-neutral-800 pt-4">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" />
                <p className="text-sm text-neutral-400">{t('dash.goalSuggest')}</p>
              </div>
              <p className="mt-2 font-semibold text-white">
                {stats.totalKm === '0.0' ? t('dash.startToday') : t('dash.keepPace')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  function MoodBadge({ mood }: { mood: Run['mood'] }) {
    const styles = {
      Easy: 'bg-green-500/10 text-green-400 border-green-500/20',
      Hard: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
      Max: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return (
      <span className={`rounded-lg border px-3 py-1 text-xs font-medium ${styles[mood]}`}>
        {td(mood)}
      </span>
    );
  }
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: 'orange' | 'green' | 'blue' | 'red';
}) {
  const colors = {
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur transition-transform hover:scale-[1.02]">
      <div className={`mb-3 inline-flex rounded-xl border p-2.5 ${colors[accent]}`}>{icon}</div>
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-white">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-neutral-400">{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function OverloadWarning({ runs, lang, t }: { runs: Run[]; lang: Lang; t: (key: string, ...args: unknown[]) => string }) {
  const { thisWeekKm, lastWeekKm, pct } = useMemo(() => {
    const now = new Date();
    const thisWeekStart = new Date(now);
    thisWeekStart.setDate(now.getDate() - now.getDay());
    thisWeekStart.setHours(0, 0, 0, 0);
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);

    const thisWeekStr = thisWeekStart.toISOString().split('T')[0];
    const lastWeekStr = lastWeekStart.toISOString().split('T')[0];

    const thisWeekKm = runs
      .filter((r) => r.date >= thisWeekStr)
      .reduce((sum, r) => sum + r.distance_km, 0);
    const lastWeekKm = runs
      .filter((r) => r.date >= lastWeekStr && r.date < thisWeekStr)
      .reduce((sum, r) => sum + r.distance_km, 0);

    const pct = lastWeekKm > 0 ? Math.round(((thisWeekKm - lastWeekKm) / lastWeekKm) * 100) : 0;
    return { thisWeekKm, lastWeekKm, pct };
  }, [runs]);

  if (thisWeekKm === 0 && lastWeekKm === 0) return null;

  const isOverload = pct > 15 && lastWeekKm > 0;

  return (
    <div
      className={`rounded-2xl border p-5 backdrop-blur transition-all ${
        isOverload
          ? 'border-red-500/30 bg-red-500/5'
          : 'border-green-500/30 bg-green-500/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
            isOverload
              ? 'bg-red-500/10 text-red-400'
              : 'bg-green-500/10 text-green-400'
          }`}
        >
          {isOverload ? <AlertTriangle className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${isOverload ? 'text-red-400' : 'text-green-400'}`}>
            {isOverload ? t('overload.title') : t('overload.safe')}
          </h3>
          {isOverload && (
            <p className="mt-1 text-sm text-neutral-300">
              {t('overload.increase').replace('{pct}', pct.toString())}
            </p>
          )}
          {isOverload && (
            <p className="mt-2 text-sm text-neutral-400">{t('overload.advice')}</p>
          )}
          <div className="mt-3 grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <p className="text-xs text-neutral-500">{t('overload.lastWeek')}</p>
              <p className="mt-0.5 font-bold text-white">{lastWeekKm.toFixed(1)} km</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <p className="text-xs text-neutral-500">{t('overload.thisWeek')}</p>
              <p className="mt-0.5 font-bold text-white">{thisWeekKm.toFixed(1)} km</p>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
              <p className="text-xs text-neutral-500">{t('overload.change')}</p>
              <p
                className={`mt-0.5 font-bold ${
                  pct > 15 ? 'text-red-400' : pct < 0 ? 'text-blue-400' : 'text-green-400'
                }`}
              >
                {pct > 0 ? '+' : ''}{pct}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
