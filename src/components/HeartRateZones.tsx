import { useState, useMemo } from 'react';
import { HeartPulse, Calculator, User, Gauge } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';

const ZONE_DEFS = [
  { zone: 1, minPct: 50, maxPct: 60, nameKey: 'hr.zone1.name', descKey: 'hr.zone1.desc', color: 'blue', hex: '#3b82f6' },
  { zone: 2, minPct: 60, maxPct: 70, nameKey: 'hr.zone2.name', descKey: 'hr.zone2.desc', color: 'green', hex: '#22c55e' },
  { zone: 3, minPct: 70, maxPct: 80, nameKey: 'hr.zone3.name', descKey: 'hr.zone3.desc', color: 'yellow', hex: '#eab308' },
  { zone: 4, minPct: 80, maxPct: 90, nameKey: 'hr.zone4.name', descKey: 'hr.zone4.desc', color: 'orange', hex: '#f97316' },
  { zone: 5, minPct: 90, maxPct: 100, nameKey: 'hr.zone5.name', descKey: 'hr.zone5.desc', color: 'red', hex: '#ef4444' },
];

export default function HeartRateZones() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'auto' | 'manual'>('auto');
  const [age, setAge] = useState('30');
  const [manualHrMax, setManualHrMax] = useState('');

  const hrMax = useMemo(() => {
    if (mode === 'manual') {
      const val = parseInt(manualHrMax) || 0;
      return val > 0 ? val : 0;
    }
    const a = parseInt(age) || 0;
    if (a <= 0) return 0;
    return Math.round(208 - 0.7 * a);
  }, [mode, age, manualHrMax]);

  const zones = useMemo(() => {
    if (hrMax <= 0) return [];
    return ZONE_DEFS.map((z) => ({
      ...z,
      minBpm: Math.round((z.minPct / 100) * hrMax),
      maxBpm: Math.round((z.maxPct / 100) * hrMax),
    }));
  }, [hrMax]);

  const colorClasses: Record<string, string> = {
    blue: 'border-blue-500/30 bg-blue-500/5 text-blue-400',
    green: 'border-green-500/30 bg-green-500/5 text-green-400',
    yellow: 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400',
    orange: 'border-orange-500/30 bg-orange-500/5 text-orange-400',
    red: 'border-red-500/30 bg-red-500/5 text-red-400',
  };

  const barColors: Record<string, string> = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    red: 'bg-red-500',
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('hr.title')}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t('hr.subtitle')}</p>
      </div>

      {/* Input section */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{t('hr.calcMethod')}</h3>
        </div>

        <div className="mb-5 flex gap-1 rounded-lg bg-neutral-800 p-1">
          <button
            onClick={() => setMode('auto')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'auto' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('hr.hrMaxAuto')}
          </button>
          <button
            onClick={() => setMode('manual')}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              mode === 'manual' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('hr.hrMaxManual')}
          </button>
        </div>

        {mode === 'auto' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
                <User className="h-4 w-4 text-neutral-500" />
                {t('hr.age')}
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="30"
                className="form-input"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-center">
                <p className="text-sm text-neutral-400">{t('hr.hrMax')}</p>
                <p className="mt-1 text-3xl font-bold text-orange-400">
                  {hrMax > 0 ? hrMax : '--'}
                  <span className="ml-1 text-sm text-neutral-500">{t('hr.bpm')}</span>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
                <HeartPulse className="h-4 w-4 text-neutral-500" />
                {t('hr.hrMax')}
              </label>
              <input
                type="number"
                min="1"
                value={manualHrMax}
                onChange={(e) => setManualHrMax(e.target.value)}
                placeholder="190"
                className="form-input"
              />
            </div>
            <div className="flex items-end">
              <div className="w-full rounded-xl border border-orange-500/30 bg-orange-500/10 p-4 text-center">
                <p className="text-sm text-neutral-400">{t('hr.hrMax')}</p>
                <p className="mt-1 text-3xl font-bold text-orange-400">
                  {hrMax > 0 ? hrMax : '--'}
                  <span className="ml-1 text-sm text-neutral-500">{t('hr.bpm')}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zone table */}
      {zones.length > 0 ? (
        <div className="space-y-3">
          {zones.map((z) => (
            <div
              key={z.zone}
              className={`rounded-2xl border p-5 backdrop-blur transition-all hover:scale-[1.01] ${colorClasses[z.color]}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl font-bold text-white"
                    style={{ backgroundColor: z.hex }}
                  >
                    {z.zone}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{t(z.nameKey)}</p>
                    <p className="text-xs text-neutral-400">{t(z.descKey)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {z.minBpm}–{z.maxBpm}
                  </p>
                  <p className="text-xs text-neutral-500">{t('hr.bpm')}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-neutral-500">{z.minPct}%</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full ${barColors[z.color]}`}
                    style={{ width: `${z.maxPct - z.minPct}%`, marginLeft: `${z.minPct}%` }}
                  />
                </div>
                <span className="text-xs text-neutral-500">{z.maxPct}%</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 py-16 text-center">
          <Gauge className="mb-3 h-12 w-12 text-neutral-700" />
          <p className="text-neutral-500">
            {mode === 'auto' ? t('hr.age') : t('hr.hrMax')}
          </p>
        </div>
      )}
    </div>
  );
}
