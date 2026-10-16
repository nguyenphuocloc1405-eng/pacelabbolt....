import type { Lang } from '@/lib/i18n';

export function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function formatDuration(min: number, lang: Lang = 'vi'): string {
  if (min < 60) return `${min}${lang === 'vi' ? 'p' : 'm'}`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  const hLabel = lang === 'vi' ? 'g' : 'h';
  const mLabel = lang === 'vi' ? 'p' : 'm';
  return `${h}${hLabel} ${m}${mLabel}`;
}

export function formatDate(dateStr: string, lang: Lang = 'vi'): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === 'vi' ? 'vi-VN' : 'en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function calcCalories(distanceKm: number, weightKg: number = 65): number {
  return Math.round(distanceKm * weightKg * 1.03);
}

export function formatVnd(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount);
}
