import type { BadgeDef, BadgeId, Run } from '@/types';

export const BADGE_DEFS: BadgeDef[] = [
  {
    id: 'first_run',
    icon: '🎯',
    name_en: 'First Steps',
    name_vi: 'Bước chân đầu tiên',
    desc_en: 'Complete your first run',
    desc_vi: 'Hoàn thành buổi chạy đầu tiên',
    color: 'green',
  },
  {
    id: 'first_10k',
    icon: '🏅',
    name_en: '10K Milestone',
    name_vi: 'Cột mốc 10K',
    desc_en: 'Complete your first 10K run',
    desc_vi: 'Hoàn thành bài chạy 10K đầu tiên',
    color: 'blue',
  },
  {
    id: 'streak_5',
    icon: '🔥',
    name_en: '5-Day Streak',
    name_vi: 'Chuỗi 5 ngày',
    desc_en: 'Run 5 consecutive days',
    desc_vi: 'Chạy liên tục 5 ngày',
    color: 'orange',
  },
  {
    id: 'streak_10',
    icon: '⚡',
    name_en: '10-Day Streak',
    name_vi: 'Chuỗi 10 ngày',
    desc_en: 'Run 10 consecutive days',
    desc_vi: 'Chạy liên tục 10 ngày',
    color: 'orange',
  },
  {
    id: 'early_bird',
    icon: '🌅',
    name_en: 'Early Bird',
    name_vi: 'Chim sớm',
    desc_en: 'Run before 6 AM',
    desc_vi: 'Chạy trước 6 giờ sáng',
    color: 'yellow',
  },
  {
    id: 'night_owl',
    icon: '🌙',
    name_en: 'Night Owl',
    name_vi: 'Cú đêm',
    desc_en: 'Run after 9 PM',
    desc_vi: 'Chạy sau 9 giờ tối',
    color: 'blue',
  },
  {
    id: 'century_club',
    icon: '💯',
    name_en: 'Century Club',
    name_vi: 'Câu lạc bộ 100KM',
    desc_en: 'Reach 100KM total distance',
    desc_vi: 'Tổng quãng đường đạt 100KM',
    color: 'orange',
  },
  {
    id: 'half_marathon',
    icon: '🏆',
    name_en: 'Half Marathon',
    name_vi: 'Bán marathon',
    desc_en: 'Run 21KM in a single session',
    desc_vi: 'Chạy quãng đường 21KM trong 1 buổi',
    color: 'red',
  },
  {
    id: 'weekly_warrior',
    icon: '⚔️',
    name_en: 'Weekly Warrior',
    name_vi: 'Chiến binh tuần',
    desc_en: 'Run 30KM in one week',
    desc_vi: 'Chạy đủ 30KM trong 1 tuần',
    color: 'orange',
  },
  {
    id: 'month_master',
    icon: '👑',
    name_en: 'Month Master',
    name_vi: 'Vua tháng',
    desc_en: 'Run 120KM in one month',
    desc_vi: 'Chạy đủ 120KM trong 1 tháng',
    color: 'yellow',
  },
];

function getMaxStreak(runs: Run[]): number {
  const dates = runs.map((r) => r.date).sort();
  if (dates.length === 0) return 0;
  let max = 1;
  let current = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 1) {
      current++;
      max = Math.max(max, current);
    } else if (diff > 1) {
      current = 1;
    }
  }
  return max;
}

function getWeeklyMaxKm(runs: Run[]): number {
  const weeks: Record<string, number> = {};
  runs.forEach((r) => {
    const d = new Date(r.date);
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - d.getDay());
    const key = weekStart.toISOString().split('T')[0];
    weeks[key] = (weeks[key] ?? 0) + r.distance_km;
  });
  return Math.max(0, ...Object.values(weeks));
}

function getMonthlyMaxKm(runs: Run[]): number {
  const months: Record<string, number> = {};
  runs.forEach((r) => {
    const key = r.date.substring(0, 7);
    months[key] = (months[key] ?? 0) + r.distance_km;
  });
  return Math.max(0, ...Object.values(months));
}

export function getUnlockedBadges(runs: Run[]): Set<BadgeId> {
  const unlocked = new Set<BadgeId>();
  if (runs.length === 0) return unlocked;

  unlocked.add('first_run');

  const totalKm = runs.reduce((sum, r) => sum + r.distance_km, 0);
  if (totalKm >= 100) unlocked.add('century_club');

  const has10k = runs.some((r) => r.distance_km >= 10);
  if (has10k) unlocked.add('first_10k');

  const has21k = runs.some((r) => r.distance_km >= 21);
  if (has21k) unlocked.add('half_marathon');

  const maxStreak = getMaxStreak(runs);
  if (maxStreak >= 5) unlocked.add('streak_5');
  if (maxStreak >= 10) unlocked.add('streak_10');

  const hasEarly = runs.some((r) => {
    const d = new Date(r.date + 'T06:00');
    return d.getHours() < 6;
  });
  if (hasEarly) unlocked.add('early_bird');

  const hasNight = runs.some((r) => {
    const d = new Date(r.date + 'T21:00');
    return d.getHours() >= 21;
  });
  if (hasNight) unlocked.add('night_owl');

  if (getWeeklyMaxKm(runs) >= 30) unlocked.add('weekly_warrior');
  if (getMonthlyMaxKm(runs) >= 120) unlocked.add('month_master');

  return unlocked;
}
