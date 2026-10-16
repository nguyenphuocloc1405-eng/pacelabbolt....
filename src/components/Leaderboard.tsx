import { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Crown, Footprints, Edit2, Check, X, Star } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { fetchLeaderboard, fetchUserProfile, saveUserProfile } from '@/lib/firestore';
import { BADGE_DEFS, getUnlockedBadges, getRunnerLevel, LEVEL_DEFS } from '@/lib/badges';
import type { LeaderboardEntry, Run } from '@/types';

interface LeaderboardProps {
  runs: Run[];
}

const NEON_COLORS: Record<string, { glow: string; border: string; bg: string }> = {
  orange: { glow: 'rgba(249,115,22,0.4)', border: 'rgba(249,115,22,0.4)', bg: 'rgba(249,115,22,0.08)' },
  blue: { glow: 'rgba(59,130,246,0.4)', border: 'rgba(59,130,246,0.4)', bg: 'rgba(59,130,246,0.08)' },
  green: { glow: 'rgba(34,197,94,0.4)', border: 'rgba(34,197,94,0.4)', bg: 'rgba(34,197,94,0.08)' },
  yellow: { glow: 'rgba(234,179,8,0.4)', border: 'rgba(234,179,8,0.4)', bg: 'rgba(234,179,8,0.08)' },
  red: { glow: 'rgba(239,68,68,0.4)', border: 'rgba(239,68,68,0.4)', bg: 'rgba(239,68,68,0.08)' },
};

export default function Leaderboard({ runs }: LeaderboardProps) {
  const { lang, t } = useLanguage();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileName, setProfileName] = useState('You');
  const [avatar, setAvatar] = useState('🏃');
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState('🏃');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    fetchUserProfile()
      .then((p) => {
        setProfileName(p.name);
        setAvatar(p.avatar);
        setNameInput(p.name);
        setAvatarInput(p.avatar);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchLeaderboard(period)
      .then(setEntries)
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [period]);

  const unlockedBadges = useMemo(() => getUnlockedBadges(runs), [runs]);
  const totalKm = useMemo(() => runs.reduce((sum, r) => sum + r.distance_km, 0), [runs]);
  const level = useMemo(() => getRunnerLevel(totalKm), [totalKm]);

  async function handleSaveProfile() {
    setSavingProfile(true);
    try {
      await saveUserProfile(nameInput.trim() || 'Runner', avatarInput);
      setProfileName(nameInput.trim() || 'Runner');
      setAvatar(avatarInput);
      setEditingProfile(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  }

  const AVATARS = ['🏃', '🏅', '🔥', '⚡', '💪', '🦵', '👟', '⭐'];

  const rankIcons = [
    <Crown key="1" className="h-5 w-5 text-yellow-400" />,
    <Medal key="2" className="h-5 w-5 text-neutral-300" />,
    <Medal key="3" className="h-5 w-5 text-orange-700" />,
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">{t('lb.title')}</h2>
        <p className="mt-1 text-sm text-neutral-400">{t('lb.subtitle')}</p>
      </div>

      {/* Profile card with level bar */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        {editingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">{t('lb.profileName')}</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="form-input"
                placeholder="Runner"
                maxLength={20}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-neutral-300">Avatar</label>
              <div className="flex flex-wrap gap-2">
                {AVATARS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAvatarInput(a)}
                    className={`flex h-10 w-10 items-center justify-center rounded-xl border text-xl transition-all ${
                      avatarInput === a
                        ? 'border-orange-500 bg-orange-500/15'
                        : 'border-neutral-700 hover:border-neutral-600'
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditingProfile(false)}
                className="flex items-center gap-2 rounded-xl border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                <X className="h-4 w-4" /> {t('log.cancel')}
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={savingProfile}
                className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> {t('lb.saveProfile')}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-2xl">
                  {avatar}
                </div>
                <div>
                  <p className="font-semibold text-white">{profileName}</p>
                  <p className="text-sm text-neutral-400">
                    {unlockedBadges.size} {t('lb.badgesUnlocked')} / {BADGE_DEFS.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setNameInput(profileName);
                  setAvatarInput(avatar);
                  setEditingProfile(true);
                }}
                className="flex items-center gap-1.5 rounded-lg border border-neutral-700 px-3 py-1.5 text-sm text-neutral-300 transition-colors hover:bg-neutral-800"
              >
                <Edit2 className="h-3.5 w-3.5" /> {t('dash.setGoal')}
              </button>
            </div>

            {/* Level progress bar */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star
                    className="h-4 w-4"
                    style={{ color: level.color }}
                    fill={level.color}
                  />
                  <span className="text-sm font-medium" style={{ color: level.color }}>
                    {t('lvl.level')} {level.level} — {lang === 'vi' ? level.title_vi : level.title_en}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  {level.kmToNext > 0
                    ? `${level.kmToNext.toFixed(1)} ${t('lvl.kmToNext')}`
                    : t('lvl.maxLevel')}
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-neutral-800">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${level.progressPct}%`,
                    background: `linear-gradient(90deg, ${level.color}80, ${level.color})`,
                    boxShadow: `0 0 10px ${level.color}60`,
                  }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] text-neutral-600">
                <span>Lv.{level.level}</span>
                <span>{totalKm.toFixed(1)} km</span>
                <span>Lv.{Math.min(level.level + 1, LEVEL_DEFS.length)}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Leaderboard table */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-400" />
            <h3 className="text-lg font-semibold text-white">{t('lb.title')}</h3>
          </div>
          <div className="flex gap-1 rounded-lg bg-neutral-800 p-1">
            <button
              onClick={() => setPeriod('week')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                period === 'week' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('lb.week')}
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                period === 'month' ? 'bg-orange-500 text-white' : 'text-neutral-400 hover:text-white'
              }`}
            >
              {t('lb.month')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-neutral-800 border-t-orange-500" />
          </div>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="mb-3 h-10 w-10 text-neutral-700" />
            <p className="text-neutral-500">{t('lb.noData')}</p>
            <p className="mt-1 text-sm text-neutral-600">{t('lb.noDataDesc')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, idx) => (
              <div
                key={entry.id}
                className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                  idx === 0
                    ? 'border-yellow-500/30 bg-yellow-500/5'
                    : 'border-neutral-800 bg-neutral-800/30 hover:border-neutral-700'
                }`}
              >
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center font-bold text-white">
                  {idx < 3 ? rankIcons[idx] : <span className="text-neutral-400">{idx + 1}</span>}
                </div>
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-xl">
                  🏃
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-white">{entry.name}</p>
                  <p className="text-xs text-neutral-400">
                    {entry.runCount} {t('lb.runs')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-orange-400">{entry.totalKm.toFixed(1)}</p>
                  <p className="text-xs text-neutral-500">km</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Neon glassmorphism badges grid */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{t('lb.badges')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGE_DEFS.map((badge) => {
            const isUnlocked = unlockedBadges.has(badge.id);
            const neon = NEON_COLORS[badge.color] ?? NEON_COLORS.orange;
            return (
              <div
                key={badge.id}
                className={`relative flex flex-col items-center rounded-xl border p-4 text-center transition-all duration-300 ${
                  isUnlocked ? 'hover:scale-105' : 'opacity-40'
                }`}
                style={{
                  borderColor: isUnlocked ? neon.border : 'rgba(64,64,64,0.4)',
                  background: isUnlocked
                    ? `linear-gradient(135deg, ${neon.bg}, rgba(255,255,255,0.02))`
                    : 'rgba(38,38,38,0.2)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: isUnlocked ? `0 0 20px ${neon.glow}, inset 0 0 20px rgba(255,255,255,0.03)` : 'none',
                }}
              >
                {isUnlocked && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-20"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${neon.glow}, transparent 70%)`,
                    }}
                  />
                )}
                <div className={`relative mb-2 text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                  {badge.icon}
                </div>
                <p className="relative text-xs font-semibold text-white">
                  {lang === 'vi' ? badge.name_vi : badge.name_en}
                </p>
                <p className="relative mt-1 text-[10px] leading-tight text-neutral-500">
                  {lang === 'vi' ? badge.desc_vi : badge.desc_en}
                </p>
                {!isUnlocked && (
                  <p className="relative mt-2 text-[10px] text-neutral-600">{t('lb.badgesLocked')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
