import { useEffect, useState, useCallback } from 'react';
import { LayoutDashboard, Footprints, Dumbbell, Apple, Globe, Calculator, Footprints as ShoeIcon, Trophy, HeartPulse, Award } from 'lucide-react';
import Dashboard from '@/components/Dashboard';
import RunningLog from '@/components/RunningLog';
import TrainingPlan from '@/components/TrainingPlan';
import Nutrition from '@/components/Nutrition';
import PaceCalculator from '@/components/PaceCalculator';
import ShoeTracker from '@/components/ShoeTracker';
import Leaderboard from '@/components/Leaderboard';
import HeartRateZones from '@/components/HeartRateZones';
import LifetimeStats from '@/components/LifetimeStats';
import {
  fetchRuns as fbFetchRuns,
  addRun as fbAddRun,
  deleteRun as fbDeleteRun,
  fetchShoes as fbFetchShoes,
  addShoe as fbAddShoe,
  deleteShoe as fbDeleteShoe,
} from '@/lib/firestore';
import { LanguageProvider, useLanguage, type Lang } from '@/lib/i18n';
import type { Run, RunInput, Shoe, ShoeInput } from '@/types';

type Tab = 'dashboard' | 'log' | 'training' | 'nutrition' | 'pace' | 'shoes' | 'leaderboard' | 'hr' | 'lifetime';

function AppInner() {
  const { lang, toggleLang, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [runs, setRuns] = useState<Run[]>([]);
  const [shoes, setShoes] = useState<Shoe[]>([]);
  const [loading, setLoading] = useState(true);

  const tabs: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
    { id: 'dashboard', label: t('nav.dashboard'), icon: LayoutDashboard },
    { id: 'log', label: t('nav.log'), icon: Footprints },
    { id: 'training', label: t('nav.training'), icon: Dumbbell },
    { id: 'nutrition', label: t('nav.nutrition'), icon: Apple },
    { id: 'pace', label: t('nav.paceCalc'), icon: Calculator },
    { id: 'shoes', label: t('nav.shoes'), icon: ShoeIcon },
    { id: 'leaderboard', label: t('nav.leaderboard'), icon: Trophy },
    { id: 'hr', label: t('nav.hrZones'), icon: HeartPulse },
    { id: 'lifetime', label: t('nav.lifetime'), icon: Award },
  ];

  const fetchRuns = useCallback(async () => {
    try {
      const data = await fbFetchRuns();
      setRuns(data);
    } catch (err) {
      console.error('Failed to load runs:', err);
    }
  }, []);

  const fetchShoes = useCallback(async () => {
    try {
      const data = await fbFetchShoes();
      setShoes(data);
    } catch (err) {
      console.error('Failed to load shoes:', err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchRuns(), fetchShoes()]).finally(() => setLoading(false));
  }, [fetchRuns, fetchShoes]);

  const handleAddRun = async (input: RunInput) => {
    const data = await fbAddRun(input);
    setRuns((prev) => [...prev, data]);
  };

  const handleDeleteRun = async (id: string) => {
    await fbDeleteRun(id);
    setRuns((prev) => prev.filter((r) => r.id !== id));
  };

  const handleAddShoe = async (input: ShoeInput) => {
    const data = await fbAddShoe(input);
    setShoes((prev) => [...prev, data]);
  };

  const handleDeleteShoe = async (id: string) => {
    await fbDeleteShoe(id);
    setShoes((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="sticky top-0 z-40 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
              <Footprints className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-none tracking-tight">
                Pace<span className="text-orange-500">Lab</span>
              </h1>
              <p className="text-[10px] text-neutral-500">{t('app.tagline')}</p>
            </div>
          </div>
          <LanguageSwitcher lang={lang} onToggle={toggleLang} />
        </div>
      </header>

      <nav className="sticky top-[57px] z-30 border-b border-neutral-800/80 bg-neutral-950/80 backdrop-blur-lg hidden md:block">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex gap-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                    active
                      ? 'border-orange-500 text-orange-400'
                      : 'border-transparent text-neutral-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:px-6 md:pb-6">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-800 border-t-orange-500" />
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && <Dashboard runs={runs} onNavigate={(t) => setActiveTab(t as Tab)} />}
            {activeTab === 'log' && (
              <RunningLog runs={runs} shoes={shoes} onAddRun={handleAddRun} onDeleteRun={handleDeleteRun} />
            )}
            {activeTab === 'training' && <TrainingPlan />}
            {activeTab === 'nutrition' && <Nutrition />}
            {activeTab === 'pace' && <PaceCalculator runs={runs} />}
            {activeTab === 'shoes' && (
              <ShoeTracker shoes={shoes} runs={runs} onAddShoe={handleAddShoe} onDeleteShoe={handleDeleteShoe} />
            )}
            {activeTab === 'leaderboard' && <Leaderboard runs={runs} />}
            {activeTab === 'hr' && <HeartRateZones />}
            {activeTab === 'lifetime' && <LifetimeStats runs={runs} />}
          </>
        )}
      </main>

      <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
        <div className="flex items-center justify-between gap-1 overflow-x-auto rounded-2xl border border-white/10 bg-slate-900/80 px-2 py-2 shadow-2xl backdrop-blur-xl no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-all duration-300 ${
                  active
                    ? 'bg-orange-500/15 text-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.3)]'
                    : 'text-neutral-500 hover:text-neutral-300'
                }`}
                style={{ minWidth: '52px' }}
              >
                <Icon
                  className={`h-5 w-5 transition-all duration-300 ${
                    active ? 'scale-110 drop-shadow-[0_0_4px_rgba(249,115,22,0.6)]' : ''
                  }`}
                />
                <span className="truncate text-[10px] leading-none">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function LanguageSwitcher({ lang, onToggle }: { lang: Lang; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-1.5 rounded-xl border border-neutral-700 bg-neutral-800/50 px-3 py-1.5 text-sm font-medium text-neutral-300 transition-all hover:border-orange-500/50 hover:bg-neutral-800"
      title={lang === 'vi' ? 'Chuyển sang Tiếng Anh' : 'Switch to Vietnamese'}
    >
      <Globe className="h-4 w-4 text-orange-400" />
      <span className="flex items-center gap-1">
        <span className={lang === 'vi' ? 'text-white' : 'text-neutral-500'}>VI</span>
        <span className="text-neutral-600">|</span>
        <span className={lang === 'en' ? 'text-white' : 'text-neutral-500'}>EN</span>
      </span>
    </button>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppInner />
    </LanguageProvider>
  );
}
