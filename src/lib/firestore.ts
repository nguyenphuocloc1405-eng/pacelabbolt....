import { supabase } from '@/lib/supabase';
import type { Run, RunInput, GoalDistance, Shoe, ShoeInput, WorkoutType, LeaderboardEntry } from '@/types';

// ---- Runs ----

export async function fetchRuns(): Promise<Run[]> {
  const { data, error } = await supabase
    .from('runs')
    .select('*')
    .order('date', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((d) => ({
    id: d.id,
    date: d.date,
    distance_km: Number(d.distance_km),
    duration_min: d.duration_min,
    pace_sec_per_km: d.pace_sec_per_km,
    mood: d.mood,
    notes: d.notes ?? null,
    created_at: d.created_at ?? new Date().toISOString(),
    shoe_id: d.shoe_id ?? null,
    workout_type: (d.workout_type ?? null) as WorkoutType | null,
  })) as Run[];
}

export async function addRun(input: RunInput): Promise<Run> {
  const { data, error } = await supabase
    .from('runs')
    .insert({
      date: input.date,
      distance_km: input.distance_km,
      duration_min: input.duration_min,
      pace_sec_per_km: input.pace_sec_per_km,
      mood: input.mood,
      notes: input.notes,
      shoe_id: input.shoe_id ?? null,
      workout_type: input.workout_type ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    date: data.date,
    distance_km: Number(data.distance_km),
    duration_min: data.duration_min,
    pace_sec_per_km: data.pace_sec_per_km,
    mood: data.mood,
    notes: data.notes ?? null,
    created_at: data.created_at ?? new Date().toISOString(),
    shoe_id: data.shoe_id ?? null,
    workout_type: (data.workout_type ?? null) as WorkoutType | null,
  };
}

export async function deleteRun(id: string): Promise<void> {
  const { error } = await supabase.from('runs').delete().eq('id', id);
  if (error) throw error;
}

// ---- Exercise completions ----

export type CompletionData = Record<number, Record<number, boolean>>;

export async function fetchCompletions(goal: GoalDistance): Promise<CompletionData> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', `completions_${goal}`)
    .maybeSingle();
  if (error) throw error;
  return (data?.value as CompletionData) ?? {};
}

export async function saveCompletion(goal: GoalDistance, state: CompletionData): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: `completions_${goal}`, value: state });
  if (error) throw error;
}

// ---- Nutrition selections ----

export async function fetchNutritionSelections(): Promise<Record<string, string[]>> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('key, value')
    .like('key', 'nutrition_%');
  if (error) throw error;
  const result: Record<string, string[]> = {};
  (data ?? []).forEach((row) => {
    const dayKey = row.key.replace('nutrition_', '');
    result[dayKey] = (row.value as string[]) ?? [];
  });
  return result;
}

export async function saveNutritionSelections(dayKey: string, meals: string[]): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: `nutrition_${dayKey}`, value: meals });
  if (error) throw error;
}

// ---- Shoes ----

export async function fetchShoes(): Promise<Shoe[]> {
  const { data, error } = await supabase
    .from('shoes')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    brand: d.brand,
    max_km: d.max_km ?? 600,
    created_at: d.created_at ?? new Date().toISOString(),
  })) as Shoe[];
}

export async function addShoe(input: ShoeInput): Promise<Shoe> {
  const { data, error } = await supabase
    .from('shoes')
    .insert({ name: input.name, brand: input.brand, max_km: input.max_km })
    .select()
    .single();
  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    brand: data.brand,
    max_km: data.max_km,
    created_at: data.created_at ?? new Date().toISOString(),
  };
}

export async function deleteShoe(id: string): Promise<void> {
  const { error } = await supabase.from('shoes').delete().eq('id', id);
  if (error) throw error;
}

// ---- Weekly Goal ----

export async function fetchWeeklyGoal(): Promise<number> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'weekly_goal')
    .maybeSingle();
  if (error) throw error;
  return (data?.value as number) ?? 0;
}

export async function saveWeeklyGoal(km: number): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'weekly_goal', value: km });
  if (error) throw error;
}

// ---- Leaderboard ----

export async function fetchLeaderboard(period: 'week' | 'month'): Promise<LeaderboardEntry[]> {
  const { data: runs, error } = await supabase.from('runs').select('date, distance_km');
  if (error) throw error;

  const now = new Date();
  const periodStart = new Date(now);
  if (period === 'week') {
    periodStart.setDate(periodStart.getDate() - 7);
  } else {
    periodStart.setDate(periodStart.getDate() - 30);
  }
  const periodStartStr = periodStart.toISOString().split('T')[0];

  const periodRuns = (runs ?? []).filter((r) => r.date >= periodStartStr);
  const totalKm = periodRuns.reduce((sum, r) => sum + Number(r.distance_km), 0);
  if (totalKm === 0) return [];

  const profile = await fetchUserProfile();

  return [
    {
      id: 'me',
      name: profile.name,
      totalKm: Math.round(totalKm * 100) / 100,
      runCount: periodRuns.length,
    },
  ];
}

// ---- User Profile ----

export async function fetchUserProfile(): Promise<{ name: string; avatar: string }> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', 'user_profile')
    .maybeSingle();
  if (error) throw error;
  const val = data?.value as { name?: string; avatar?: string } | null;
  return { name: val?.name ?? 'You', avatar: val?.avatar ?? '🏃' };
}

export async function saveUserProfile(name: string, avatar: string): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key: 'user_profile', value: { name, avatar } });
  if (error) throw error;
}
