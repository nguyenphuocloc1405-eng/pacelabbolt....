export interface Run {
  id: string;
  date: string;
  distance_km: number;
  duration_min: number;
  pace_sec_per_km: number;
  mood: 'Easy' | 'Hard' | 'Max';
  notes: string | null;
  created_at: string;
  shoe_id?: string | null;
  workout_type?: WorkoutType | null;
}

export interface RunInput {
  date: string;
  distance_km: number;
  duration_min: number;
  pace_sec_per_km: number;
  mood: 'Easy' | 'Hard' | 'Max';
  notes: string | null;
  shoe_id?: string | null;
  workout_type?: WorkoutType | null;
}

export type WorkoutType =
  | 'Easy'
  | 'Tempo'
  | 'Interval'
  | 'Long Run'
  | 'Fartlek'
  | 'Hill Repeats';

export type GoalDistance = '5KM' | '10KM' | '21KM';

export interface ExerciseItem {
  name: string;
  sets: number;
  reps: string;
  done: boolean;
}

export interface IntervalSegment {
  label: string;
  label_vi: string;
  type: 'warmup' | 'fast' | 'recovery' | 'cooldown';
  duration_min?: number;
  distance_m?: number;
  repeats?: number;
}

export interface WorkoutDetail {
  segments: IntervalSegment[];
  target_pace?: string;
  target_pace_vi?: string;
  hr_zone?: string;
}

export interface TrainingDay {
  day: string;
  focus: string;
  type: 'Run' | 'Rest' | 'Cross' | 'Strength';
  workout: string;
  exercises: ExerciseItem[];
  workout_type?: WorkoutType | null;
  detail?: WorkoutDetail | null;
}

export interface MealItem {
  name: string;
  ingredients: string[];
  calories: number;
  cost: number;
}

export interface MealCategory {
  category: 'Breakfast' | 'Lunch' | 'Dinner';
  meals: MealItem[];
}

export interface NutritionPlan {
  day: string;
  meals: MealCategory[];
}

export interface Shoe {
  id: string;
  name: string;
  brand: string;
  max_km: number;
  created_at: string;
}

export interface ShoeInput {
  name: string;
  brand: string;
  max_km: number;
}
