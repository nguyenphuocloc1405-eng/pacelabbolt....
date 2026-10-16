import { useState, useMemo } from 'react';
import { Calculator, Timer, MapPin, TrendingUp, Gauge, Trophy } from 'lucide-react';
import type { Run } from '@/types';
import { formatPace } from '@/lib/format';
import { useLanguage } from '@/lib/i18n';

interface PaceCalculatorProps {
  runs: Run[];
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.round(seconds % 60);
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export default function PaceCalculator({ runs }: PaceCalculatorProps) {
  const { t } = useLanguage();

  // Pace calculator state
  const [calcMin, setCalcMin] = useState('');
  const [calcSec, setCalcSec] = useState('');
  const [calcDist, setCalcDist] = useState('');

  // Race predictor state
  const [useRecent, setUseRecent] = useState(true);
  const [manualMin, setManualMin] = useState('');
  const [manualSec, setManualSec] = useState('');
  const [manualDist, setManualDist] = useState('');

  const recentRun = useMemo(
    () => [...runs].sort((a, b) => b.date.localeCompare(a.date))[0],
    [runs],
  );

  // Pace calculator result
  const calcPace = useMemo(() => {
    const totalSec = (parseInt(calcMin) || 0) * 60 + (parseInt(calcSec) || 0);
    const dist = parseFloat(calcDist) || 0;
    if (totalSec <= 0 || dist <= 0) return 0;
    return Math.round(totalSec / dist);
  }, [calcMin, calcSec, calcDist]);

  // Race predictor: Riegel's formula T2 = T1 * (D2/D1)^1.06
  const predictorInput = useMemo(() => {
    if (useRecent && recentRun) {
      return {
        timeSec: recentRun.duration_min * 60,
        distKm: recentRun.distance_km,
      };
    }
    const totalSec = (parseInt(manualMin) || 0) * 60 + (parseInt(manualSec) || 0);
    const dist = parseFloat(manualDist) || 0;
    return { timeSec: totalSec, distKm: dist };
  }, [useRecent, recentRun, manualMin, manualSec, manualDist]);

  const racePredictions = useMemo(() => {
    if (predictorInput.timeSec <= 0 || predictorInput.distKm <= 0) return null;
    const distances = [
      { key: '5K', km: 5 },
      { key: '10K', km: 10 },
      { key: '21K', km: 21.0975 },
      { key: '42K', km: 42.195 },
    ];
    return distances.map((d) => {
      const predictedSec = predictorInput.timeSec * Math.pow(d.km / predictorInput.distKm, 1.06);
      const predictedPace = predictedSec / d.km;
      return {
        ...d,
        timeSec: predictedSec,
        paceSecPerKm: predictedPace,
      };
    });
  }, [predictorInput]);

  const raceDistanceLabels: Record<string, string> = {
    '5K': t('pace.distance5K'),
    '10K': t('pace.distance10K'),
    '21K': t('pace.distance21K'),
    '42K': t('pace.distance42K'),
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('pace.title')}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t('pace.subtitle')}</p>
      </div>

      {/* Pace Calculator */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-5 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{t('pace.calcTitle')}</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
              <Timer className="h-4 w-4 text-neutral-500" />
              {t('pace.timeMin')}
            </label>
            <input
              type="number"
              min="0"
              value={calcMin}
              onChange={(e) => setCalcMin(e.target.value)}
              placeholder="25"
              className="form-input"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
              {t('pace.timeSec')}
            </label>
            <input
              type="number"
              min="0"
              max="59"
              value={calcSec}
              onChange={(e) => setCalcSec(e.target.value)}
              placeholder="30"
              className="form-input"
            />
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-neutral-300">
              <MapPin className="h-4 w-4 text-neutral-500" />
              {t('pace.distance')}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              value={calcDist}
              onChange={(e) => setCalcDist(e.target.value)}
              placeholder="5.0"
              className="form-input"
            />
          </div>
        </div>

        {calcPace > 0 ? (
          <div className="mt-5 rounded-xl border border-orange-500/30 bg-orange-500/10 p-5 text-center">
            <p className="text-sm text-neutral-400">{t('pace.result')}</p>
            <p className="mt-1 text-4xl font-bold text-orange-400">
              {formatPace(calcPace)}
              <span className="ml-1 text-lg text-neutral-500">{t('pace.minPerKm')}</span>
            </p>
          </div>
        ) : (
          <p className="mt-4 text-center text-sm text-neutral-500">{t('pace.calcHint')}</p>
        )}
      </div>

      {/* Race Time Predictor */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-5 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{t('pace.predictorTitle')}</h3>
        </div>

        <div className="mb-4 flex gap-1 rounded-lg bg-neutral-800 p-1">
          <button
            onClick={() => setUseRecent(true)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              useRecent ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('pace.useRecentRun')}
          </button>
          <button
            onClick={() => setUseRecent(false)}
            className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              !useRecent ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
            }`}
          >
            {t('pace.manualInput')}
          </button>
        </div>

        {useRecent ? (
          recentRun ? (
            <div className="mb-5 rounded-xl border border-neutral-800 bg-neutral-800/30 p-4">
              <p className="text-xs text-neutral-500">{t('pace.basedOn')}</p>
              <p className="mt-1 font-semibold text-white">
                {recentRun.distance_km.toFixed(1)} km — {formatTime(recentRun.duration_min * 60)}
              </p>
              <p className="text-sm text-green-400">
                {formatPace(recentRun.pace_sec_per_km)} {t('pace.minPerKm')}
              </p>
            </div>
          ) : (
            <div className="mb-5 rounded-xl border border-neutral-800 bg-neutral-800/20 p-4 text-center">
              <TrendingUp className="mx-auto mb-2 h-8 w-8 text-neutral-700" />
              <p className="text-sm text-neutral-500">{t('pace.noRecentRun')}</p>
            </div>
          )
        ) : (
          <div className="mb-5 grid gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t('pace.timeMin')}
              </label>
              <input
                type="number"
                min="0"
                value={manualMin}
                onChange={(e) => setManualMin(e.target.value)}
                placeholder="25"
                className="form-input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t('pace.timeSec')}
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={manualSec}
                onChange={(e) => setManualSec(e.target.value)}
                placeholder="0"
                className="form-input"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t('pace.distance')}
              </label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={manualDist}
                onChange={(e) => setManualDist(e.target.value)}
                placeholder="5.0"
                className="form-input"
              />
            </div>
          </div>
        )}

        {racePredictions ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {racePredictions.map((race) => (
              <div
                key={race.key}
                className="rounded-xl border border-neutral-800 bg-neutral-800/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gauge className="h-4 w-4 text-orange-400" />
                    <span className="font-semibold text-white">
                      {raceDistanceLabels[race.key]}
                    </span>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-lg bg-neutral-900/50 p-2.5 text-center">
                    <p className="text-xs text-neutral-500">{t('pace.predictedTime')}</p>
                    <p className="mt-0.5 font-bold text-white">
                      {formatTime(race.timeSec)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-neutral-900/50 p-2.5 text-center">
                    <p className="text-xs text-neutral-500">{t('pace.predictedPace')}</p>
                    <p className="mt-0.5 font-bold text-green-400">
                      {formatPace(race.paceSecPerKm)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-neutral-500">{t('pace.predictorHint')}</p>
        )}
      </div>
    </div>
  );
}
