import { useState, useMemo } from 'react';
import { Plus, Trash2, Footprints, X } from 'lucide-react';
import type { Run, Shoe, ShoeInput } from '@/types';
import { useLanguage } from '@/lib/i18n';

interface ShoeTrackerProps {
  shoes: Shoe[];
  runs: Run[];
  onAddShoe: (input: ShoeInput) => Promise<void>;
  onDeleteShoe: (id: string) => void;
}

export default function ShoeTracker({ shoes, runs, onAddShoe, onDeleteShoe }: ShoeTrackerProps) {
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shoeKm = useMemo(() => {
    const map: Record<string, { km: number; count: number }> = {};
    for (const run of runs) {
      if (run.shoe_id) {
        if (!map[run.shoe_id]) map[run.shoe_id] = { km: 0, count: 0 };
        map[run.shoe_id].km += run.distance_km;
        map[run.shoe_id].count += 1;
      }
    }
    return map;
  }, [runs]);

  async function handleSubmit(input: ShoeInput) {
    setSubmitting(true);
    setError(null);
    try {
      await onAddShoe(input);
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t('shoe.title')}</h2>
          <p className="mt-1 text-sm text-neutral-400">{t('shoe.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-orange-600"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">{t('shoe.add')}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {showForm && (
        <ShoeForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          submitting={submitting}
        />
      )}

      {shoes.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 py-20 text-center">
          <Footprints className="mb-4 h-12 w-12 text-neutral-700" />
          <h3 className="text-lg font-semibold text-white">{t('shoe.empty')}</h3>
          <p className="mt-1 text-sm text-neutral-500">{t('shoe.emptyDesc')}</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus className="h-5 w-5" />
            {t('shoe.add')}
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {shoes.map((shoe) => {
            const stats = shoeKm[shoe.id] || { km: 0, count: 0 };
            const pct = Math.min(100, Math.round((stats.km / shoe.max_km) * 100));
            const remaining = Math.max(0, shoe.max_km - stats.km);
            const wornOut = remaining < 60;

            return (
              <div
                key={shoe.id}
                className="group rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur transition-all hover:border-neutral-700"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-500/10">
                      <Footprints className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="font-bold text-white">{shoe.name}</p>
                      <p className="text-xs text-neutral-400">{shoe.brand}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (confirm(t('shoe.deleteConfirm'))) onDeleteShoe(shoe.id);
                    }}
                    className="rounded-lg p-1.5 text-neutral-600 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-400 group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-400">
                    {t('shoe.totalKm')}: <span className="font-semibold text-white">{stats.km.toFixed(1)} km</span>
                  </span>
                  <span className={`rounded-lg border px-2 py-0.5 text-xs font-medium ${
                    wornOut
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-green-500/30 bg-green-500/10 text-green-400'
                  }`}>
                    {wornOut ? t('shoe.wornOut') : t('shoe.inUse')}
                  </span>
                </div>

                <div className="mb-2 h-3 overflow-hidden rounded-full bg-neutral-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      wornOut
                        ? 'bg-gradient-to-r from-red-600 to-red-500'
                        : 'bg-gradient-to-r from-orange-500 to-orange-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">
                    {stats.count} {t('shoe.runs')}
                  </span>
                  <span className={wornOut ? 'text-red-400' : 'text-neutral-400'}>
                    {remaining.toFixed(0)} km {t('shoe.remaining')} / {shoe.max_km} km
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  function ShoeForm({
    onSubmit,
    onCancel,
    submitting,
  }: {
    onSubmit: (input: ShoeInput) => Promise<void>;
    onCancel: () => void;
    submitting: boolean;
  }) {
    const [name, setName] = useState('');
    const [brand, setBrand] = useState('');
    const [maxKm, setMaxKm] = useState('600');

    async function handleSubmit(e: React.FormEvent) {
      e.preventDefault();
      if (!name.trim() || !brand.trim()) return;
      await onSubmit({
        name: name.trim(),
        brand: brand.trim(),
        max_km: parseInt(maxKm) || 600,
      });
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl">
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">{t('shoe.add')}</h3>
            <button
              onClick={onCancel}
              className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t('shoe.name')}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('shoe.namePlaceholder')}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t('shoe.brand')}
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder={t('shoe.brandPlaceholder')}
                className="form-input"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">
                {t('shoe.maxKm')}
              </label>
              <input
                type="number"
                min="100"
                step="50"
                value={maxKm}
                onChange={(e) => setMaxKm(e.target.value)}
                className="form-input"
                required
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 rounded-xl border border-neutral-700 px-4 py-2.5 font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                {t('shoe.cancel')}
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 rounded-xl bg-orange-500 px-4 py-2.5 font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                {submitting ? '...' : t('shoe.save')}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
