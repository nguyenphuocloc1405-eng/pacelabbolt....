import { useState, useEffect, useMemo } from 'react';
import { Trophy, Medal, Crown, Footprints, Edit2, Check, X } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { fetchLeaderboard, fetchUserProfile, saveUserProfile } from '@/lib/firestore';
import { BADGE_DEFS, getUnlockedBadges } from '@/lib/badges';
import type { LeaderboardEntry, Run } from '@/types';

interface LeaderboardProps {
  runs: Run[];
}

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

      {/* Profile card */}
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

      {/* Badges grid */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 backdrop-blur">
        <div className="mb-4 flex items-center gap-2">
          <Medal className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold text-white">{t('lb.badges')}</h3>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {BADGE_DEFS.map((badge) => {
            const isUnlocked = unlockedBadges.has(badge.id);
            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center rounded-xl border p-4 text-center transition-all ${
                  isUnlocked
                    ? 'border-orange-500/30 bg-orange-500/5 hover:scale-105'
                    : 'border-neutral-800 bg-neutral-800/20 opacity-50'
                }`}
              >
                <div className={`mb-2 text-3xl ${isUnlocked ? '' : 'grayscale'}`}>{badge.icon}</div>
                <p className="text-xs font-semibold text-white">
                  {lang === 'vi' ? badge.name_vi : badge.name_en}
                </p>
                <p className="mt-1 text-[10px] leading-tight text-neutral-500">
                  {lang === 'vi' ? badge.desc_vi : badge.desc_en}
                </p>
                {!isUnlocked && (
                  <p className="mt-2 text-[10px] text-neutral-600">{t('lb.badgesLocked')}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
