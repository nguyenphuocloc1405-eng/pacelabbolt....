import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  setDoc,
  updateDoc,
  query,
  orderBy,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Run, RunInput, GoalDistance, Shoe, ShoeInput, WorkoutType } from '@/types';

const RUNS = 'runs';
const EXERCISE_COMPLETIONS = 'exercise_completions';
const NUTRITION_SELECTIONS = 'nutrition_selections';
const SHOES = 'shoes';
const WEEKLY_GOAL = 'weekly_goal';

// ---- Runs ----

export async function fetchRuns(): Promise<Run[]> {
  const q = query(collection(db, RUNS), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d: QueryDocumentSnapshot) => {
    const data = d.data();
    return {
      id: d.id,
      date: data.date,
      distance_km: data.distance_km,
      duration_min: data.duration_min,
      pace_sec_per_km: data.pace_sec_per_km,
      mood: data.mood,
      notes: data.notes ?? null,
      created_at: data.created_at ?? new Date().toISOString(),
      shoe_id: data.shoe_id ?? null,
      workout_type: (data.workout_type ?? null) as WorkoutType | null,
    } as Run;
  });
}

export async function addRun(input: RunInput): Promise<Run> {
  const payload = { ...input, created_at: new Date().toISOString() };
  const ref = await addDoc(collection(db, RUNS), payload);
  return { id: ref.id, ...payload };
}

export async function deleteRun(id: string): Promise<void> {
  await deleteDoc(doc(db, RUNS, id));
}

// ---- Exercise completions ----

export type CompletionData = Record<number, Record<number, boolean>>;

export async function fetchCompletions(goal: GoalDistance): Promise<CompletionData> {
  const snap = await getDocs(collection(db, EXERCISE_COMPLETIONS));
  const existing = snap.docs.find((d: QueryDocumentSnapshot) => d.id === goal);
  if (!existing) return {};
  return (existing.data().state as CompletionData) || {};
}

export async function saveCompletion(
  goal: GoalDistance,
  state: CompletionData,
): Promise<void> {
  await setDoc(doc(db, EXERCISE_COMPLETIONS, goal), { state });
}

// ---- Nutrition selections ----

export async function fetchNutritionSelections(): Promise<Record<string, string[]>> {
  const snap = await getDocs(collection(db, NUTRITION_SELECTIONS));
  const result: Record<string, string[]> = {};
  snap.docs.forEach((d: QueryDocumentSnapshot) => {
    result[d.id] = (d.data().meals as string[]) || [];
  });
  return result;
}

export async function saveNutritionSelections(
  dayKey: string,
  meals: string[],
): Promise<void> {
  await setDoc(doc(db, NUTRITION_SELECTIONS, dayKey), { meals });
}

// ---- Shoes ----

export async function fetchShoes(): Promise<Shoe[]> {
  const snap = await getDocs(collection(db, SHOES));
  return snap.docs.map((d: QueryDocumentSnapshot) => {
    const data = d.data();
    return {
      id: d.id,
      name: data.name,
      brand: data.brand,
      max_km: data.max_km ?? 600,
      created_at: data.created_at ?? new Date().toISOString(),
    } as Shoe;
  });
}

export async function addShoe(input: ShoeInput): Promise<Shoe> {
  const payload = { ...input, created_at: new Date().toISOString() };
  const ref = await addDoc(collection(db, SHOES), payload);
  return { id: ref.id, ...payload };
}

export async function deleteShoe(id: string): Promise<void> {
  await deleteDoc(doc(db, SHOES, id));
}

// ---- Weekly Goal ----

export async function fetchWeeklyGoal(): Promise<number> {
  const snap = await getDocs(collection(db, WEEKLY_GOAL));
  const existing = snap.docs.find((d: QueryDocumentSnapshot) => d.id === 'current');
  if (!existing) return 0;
  return (existing.data().km as number) || 0;
}

export async function saveWeeklyGoal(km: number): Promise<void> {
  await setDoc(doc(db, WEEKLY_GOAL, 'current'), { km });
}
