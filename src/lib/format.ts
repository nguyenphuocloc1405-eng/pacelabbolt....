import type { Lang } from '@/lib/i18n';

export function formatPace(secPerKm: number): string {
  const min = Math.floor(secPerKm / 60);
  const sec = Math.round(secPerKm % 60);
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export function parseDurationToSeconds(input: string): number {
  const trimmed = input.trim();
  if (!trimmed) return 0;
  const parts = trimmed.split(/[:.]/).map((p) => parseInt(p, 10));
  if (parts.some((p) => isNaN(p))) return 0;
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  }
  if (parts.length === 1) {
    return parts[0] * 60;
  }
  return 0;
}

export function formatDuration(min: number, lang: Lang = 'vi'): string {
  const totalSec = Math.round(min * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const hLabel = lang === 'vi' ? 'g' : 'h';
  const mLabel = lang === 'vi' ? 'p' : 'm';
  const sLabel = lang === 'vi' ? 's' : 's';
  if (h > 0) {
    return `${h}${hLabel} ${m.toString().padStart(2, '0')}${mLabel} ${s.toString().padStart(2, '0')}${sLabel}`;
  }
  if (m > 0) {
    return `${m}${mLabel} ${s.toString().padStart(2, '0')}${sLabel}`;
  }
  return `${s}${sLabel}`;
}

export function formatDurationClock(min: number): string {
  const totalSec = Math.round(min * 60);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
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
