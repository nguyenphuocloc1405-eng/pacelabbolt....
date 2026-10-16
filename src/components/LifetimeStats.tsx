import { useState, useMemo } from 'react';
import { Footprints, Timer, Flame, TrendingUp, Mountain, Gauge, Award, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useLanguage } from '@/lib/i18n';
import { calcCalories, formatDuration, formatPace } from '@/lib/format';
import { getRunnerLevel, LEVEL_DEFS } from '@/lib/badges';
import type { Run } from '@/types';

interface LifetimeStatsProps {
  runs: Run[];
}

export default function LifetimeStats({ runs }: LifetimeStatsProps) {
  const { lang, t } = useLanguage();
  const [view, setView] = useState<'month' | 'year'>('month');

  const stats = useMemo(() => {
    const totalKm = runs.reduce((sum, r) => sum + r.distance_km, 0);
    const totalRuns = runs.length;
    const totalTime = runs.reduce((sum, r) => sum + r.duration_min, 0);
    const totalCal = runs.reduce((sum, r) => sum + calcCalories(r.distance_km), 0);
    const avgPace = totalKm > 0 ? Math.round((totalTime * 60) / totalKm) : 0;
    const longestRun = runs.reduce((max, r) => Math.max(max, r.distance_km), 0);
    const fastestPace = runs.reduce((min, r) => Math.min(min, r.pace_sec_per_km), Infinity);

    return {
      totalKm,
      totalRuns,
      totalTime,
      totalCal,
      avgPace,
      longestRun,
      fastestPace: fastestPace === Infinity ? 0 : fastestPace,
    };
  }, [runs]);

  const level = useMemo(() => getRunnerLevel(stats.totalKm), [stats.totalKm]);

  const chartData = useMemo(() => {
    const groups: Record<string, number> = {};
    runs.forEach((r) => {
      const key = view === 'month' ? r.date.substring(0, 7) : r.date.substring(0, 4);
      groups[key] = (groups[key] ?? 0) + r.distance_km;
    });
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([key, km]) => ({
        label: view === 'month' ? key : key,
        km: Math.round(km * 10) / 10,
      }));
  }, [runs, view]);

  if (runs.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('life.title')}</h2>
          <p className="mt-1 text-sm text-neutral-400">{t('life.subtitle')}</p>
        </div>
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 py-20 text-center">
          <Activity className="mb-4 h-12 w-12 text-neutral-700" />
          <h3 className="text-lg font-semibold text-white">{t('life.noData')}</h3>
          <p className="mt-1 text-sm text-neutral-500">{t('life.noDataDesc')}</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: <Footprints className="h-5 w-5" />, label: t('life.totalKm'), value: stats.totalKm.toFixed(1), unit: 'km', color: 'text-orange-400', bg: 'bg-orange-500/10' },
    { icon: <Activity className="h-5 w-5" />, label: t('life.totalRuns'), value: stats.totalRuns.toString(), unit: '', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { icon: <Timer className="h-5 w-5" />, label: t('life.totalTime'), value: formatDuration(stats.totalTime, lang), unit: '', color: 'text-green-400', bg: 'bg-green-500/10' },
    { icon: <Flame className="h-5 w-5" />, label: t('life.totalCal'), value: stats.totalCal.toLocaleString(), unit: 'cal', color: 'text-red-400', bg: 'bg-red-500/10' },
    { icon: <Mountain className="h-5 w-5" />, label: t('life.elevation'), value: '—', unit: 'm', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
    { icon: <Gauge className="h-5 w-5" />, label: t('life.avgPace'), value: formatPace(stats.avgPace), unit: '/km', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('life.title')}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t('life.subtitle')}</p>
      </div>

      {/* Level bar */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ backgroundColor: level.color + '30', border: `1px solid ${level.color}50` }}
            >
              <span style={{ color: level.color }}>{level.level}</span>
            </div>
            <div>
              <p className="text-xs text-neutral-500">{t('lvl.level')} {level.level}</p>
              <p className="text-lg font-bold text-white" style={{ color: level.color }}>
                {lang === 'vi' ? level.title_vi : level.title_en}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{level.totalKm.toFixed(1)}</p>
            <p className="text-xs text-neutral-500">km</p>
          </div>
        </div>

        <div className="mb-2 flex items-center justify-between text-xs text-neutral-500">
          <span>Lv.{level.level}</span>
          <span>
            {level.kmToNext > 0
              ? `${level.kmToNext.toFixed(1)} ${t('lvl.kmToNext')}`
              : t('lvl.maxLevel')}
          </span>
          <span>Lv.{Math.min(level.level + 1, LEVEL_DEFS.length)}</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-neutral-800">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${level.progressPct}%`,
              background: `linear-gradient(90deg, ${level.color}80, ${level.color})`,
              boxShadow: `0 0 12px ${level.color}60`,
            }}
          />
        </div>
      </div>

      {/* Stat cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur transition-transform hover:scale-[1.02]"
          >
            <div className={`mb-3 inline-flex rounded-xl p-2.5 ${card.bg} ${card.color}`}>
              {card.icon}
            </div>
            <p className="text-sm text-neutral-400">{card.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">
              {card.value}
              {card.unit && <span className="ml-1 text-sm text-neutral-500">{card.unit}</span>}
            </p>
          </div>
        ))}
      </div>

      {/* Personal records */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5 backdrop-blur">
          <div className="mb-2 flex items-center gap-2">
            <Award className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium text-neutral-400">{t('life.longestRun')}</span>
          </div>
          <p className="text-2xl font-bold text-orange-400">{stats.longestRun.toFixed(1)} <span className="text-sm text-neutral-500">km</span></p>
        </div>
        <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-5 backdrop-blur">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium text-neutral-400">{t('life.fastestPace')}</span>
          </div>
          <p className="text-2xl font-bold text-green-400">{formatPace(stats.fastestPace)} <span className="text-sm text-neutral-500">/km</span></p>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 backdrop-blur">
          <div className="mb-2 flex items-center gap-2">
            <Gauge className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-neutral-400">{t('life.avgPace')}</span>
          </div>
          <p className="text-2xl font-bold text-blue-400">{formatPace(stats.avgPace)} <span className="text-sm text-neutral-500">/km</span></p>
        </div>
      </div>

      {/* Progress chart */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">{t('life.progress')}</h3>
          </div>
          <div className="flex gap-1 rounded-lg bg-neutral-800 p-1">
            <button
              onClick={() => setView('month')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                view === 'month' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('life.monthly')}
            </button>
            <button
              onClick={() => setView('year')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                view === 'year' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('life.yearly')}
            </button>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis dataKey="label" stroke="#737373" fontSize={11} />
            <YAxis stroke="#737373" fontSize={11} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#171717',
                border: '1px solid #404040',
                borderRadius: '12px',
                color: '#fff',
              }}
              labelStyle={{ color: '#a3a3a3' }}
            />
            <Bar dataKey="km" fill="#f97316" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
