import type { BadgeDef, BadgeId, Run, RunnerLevel } from '@/types';

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
    id: 'streak_3',
    icon: '💥',
    name_en: 'Spark Streak',
    name_vi: 'Ngọn lửa khởi động',
    desc_en: 'Run 3 consecutive days',
    desc_vi: 'Chạy liên tục 3 ngày',
    color: 'orange',
  },
  {
    id: 'streak_7',
    icon: '⚡',
    name_en: 'Week Warrior',
    name_vi: 'Chiến binh 1 tuần',
    desc_en: 'Run 7 consecutive days',
    desc_vi: 'Chạy liên tục 7 ngày',
    color: 'orange',
  },
  {
    id: 'streak_14',
    icon: '🛡️',
    name_en: 'Iron Legs',
    name_vi: 'Chân đồng vách sắt',
    desc_en: 'Run 14 consecutive days',
    desc_vi: 'Chạy liên tục 14 ngày',
    color: 'blue',
  },
  {
    id: 'streak_30',
    icon: '🔥',
    name_en: 'Endurance Legend',
    name_vi: 'Huyền thoại bền bỉ',
    desc_en: 'Run 30 consecutive days',
    desc_vi: 'Chạy liên tục 30 ngày',
    color: 'red',
  },
  {
    id: 'early_bird_6am',
    icon: '🌅',
    name_en: 'Early Bird',
    name_vi: 'Chạy sáng sớm',
    desc_en: 'Run before 6 AM',
    desc_vi: 'Chạy trước 6 giờ sáng',
    color: 'yellow',
  },
  {
    id: 'sub25_5k',
    icon: '🚀',
    name_en: '5K Sub-25',
    name_vi: '5K dưới 25 phút',
    desc_en: 'Finish 5K in under 25 minutes',
    desc_vi: 'Hoàn thành 5K dưới 25 phút',
    color: 'orange',
  },
  {
    id: 'first_10k',
    icon: '🏅',
    name_en: '10K Finisher',
    name_vi: '10K Finisher',
    desc_en: 'Complete a 10K run',
    desc_vi: 'Hoàn thành bài chạy 10K',
    color: 'blue',
  },
  {
    id: 'half_marathon',
    icon: '🏆',
    name_en: 'Half Marathon',
    name_vi: 'Half Marathon 21K',
    desc_en: 'Run 21KM in a single session',
    desc_vi: 'Chạy quãng đường 21KM trong 1 buổi',
    color: 'red',
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
    id: 'night_owl',
    icon: '🌙',
    name_en: 'Night Owl',
    name_vi: 'Cú đêm',
    desc_en: 'Run after 9 PM',
    desc_vi: 'Chạy sau 9 giờ tối',
    color: 'blue',
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

  const hasSub25 = runs.some((r) => {
    if (r.distance_km < 4.8 || r.distance_km > 5.2) return false;
    return r.duration_min < 25;
  });
  if (hasSub25) unlocked.add('sub25_5k');

  const maxStreak = getMaxStreak(runs);
  if (maxStreak >= 3) unlocked.add('streak_3');
  if (maxStreak >= 7) unlocked.add('streak_7');
  if (maxStreak >= 14) unlocked.add('streak_14');
  if (maxStreak >= 30) unlocked.add('streak_30');

  const hasEarly = runs.some((r) => {
    const d = new Date(r.date + 'T06:00');
    return d.getHours() < 6;
  });
  if (hasEarly) unlocked.add('early_bird_6am');

  const hasNight = runs.some((r) => {
    const d = new Date(r.date + 'T21:00');
    return d.getHours() >= 21;
  });
  if (hasNight) unlocked.add('night_owl');

  if (getWeeklyMaxKm(runs) >= 30) unlocked.add('weekly_warrior');
  if (getMonthlyMaxKm(runs) >= 120) unlocked.add('month_master');

  return unlocked;
}

const LEVEL_DEFS = [
  { maxKm: 10, title_en: 'Rookie', title_vi: 'Tân binh', color: '#6b7280' },
  { maxKm: 25, title_en: 'Beginner', title_vi: 'Người mới', color: '#22c55e' },
  { maxKm: 50, title_en: 'Jogger', title_vi: 'Người chạy bộ', color: '#3b82f6' },
  { maxKm: 100, title_en: 'Runner', title_vi: 'Vận động viên', color: '#eab308' },
  { maxKm: 175, title_en: 'Enthusiast', title_vi: 'Người đam mê', color: '#f97316' },
  { maxKm: 275, title_en: 'Athlete', title_vi: 'Vận động viên năng khiếu', color: '#ef4444' },
  { maxKm: 400, title_en: 'Expert', title_vi: 'Chuyên gia', color: '#a855f7' },
  { maxKm: 600, title_en: 'Master', title_vi: 'Bậc thầy', color: '#06b6d4' },
  { maxKm: 850, title_en: 'Elite', title_vi: 'Tinh hoa', color: '#f43f5e' },
  { maxKm: Infinity, title_en: 'Pro Athlete', title_vi: 'Vận động viên chuyên nghiệp', color: '#fbbf24' },
];

export function getRunnerLevel(totalKm: number): RunnerLevel {
  const level = LEVEL_DEFS.findIndex((l) => totalKm <= l.maxKm);
  const idx = level === -1 ? LEVEL_DEFS.length - 1 : level;
  const def = LEVEL_DEFS[idx];
  const prevMax = idx > 0 ? LEVEL_DEFS[idx - 1].maxKm : 0;
  const range = def.maxKm === Infinity ? LEVEL_DEFS[idx - 1]?.maxKm ?? 850 : def.maxKm;
  const progressPct = def.maxKm === Infinity
    ? 100
    : Math.min(100, Math.round(((totalKm - prevMax) / (range - prevMax)) * 100));
  const kmToNext = def.maxKm === Infinity ? 0 : Math.max(0, def.maxKm - totalKm);

  return {
    level: idx + 1,
    title_en: def.title_en,
    title_vi: def.title_vi,
    totalKm,
    progressPct,
    kmToNext,
    color: def.color,
  };
}

export { LEVEL_DEFS };
