import type { TrainingDay, GoalDistance } from '@/types';

export const trainingPlans: Record<GoalDistance, TrainingDay[]> = {
  '5KM': [
    {
      day: 'Monday',
      focus: 'Easy Run',
      type: 'Run',
      workout: '3km easy pace (60-70% effort)',
      workout_type: 'Easy',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '3km easy pace', label_vi: '3km nhịp dễ chịu', type: 'fast', distance_m: 3000 },
          { label: '5 min easy jog', label_vi: '5 phút chạy chậm', type: 'cooldown', duration_min: 5 },
        ],
        target_pace: '6:00-6:30 /km',
        target_pace_vi: '6:00-6:30 /km',
        hr_zone: 'Zone 2 (60-70% HR max)',
      },
      exercises: [
        { name: 'Squat', sets: 3, reps: '15', done: false },
        { name: 'Lunge', sets: 3, reps: '12 each leg', done: false },
        { name: 'Core Plank', sets: 3, reps: '45 sec', done: false },
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Intervals',
      type: 'Run',
      workout: '5 x 400m sprint + 200m walk recovery',
      workout_type: 'Interval',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '400m fast', label_vi: '400m nhanh', type: 'fast', distance_m: 400, repeats: 5 },
          { label: '200m walk', label_vi: '200m đi bộ', type: 'recovery', distance_m: 200, repeats: 5 },
          { label: '10 min easy jog cooldown', label_vi: '10 phút chạy chậm thả lỏng', type: 'cooldown', duration_min: 10 },
        ],
        target_pace: '< 2:00 /km (sprint pace)',
        target_pace_vi: '< 2:00 /km (nhịp nước rút)',
        hr_zone: 'Zone 5 (90-95% HR max)',
      },
      exercises: [
        { name: 'Core Crunch', sets: 3, reps: '20', done: false },
        { name: 'Mountain Climber', sets: 3, reps: '30 sec', done: false },
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Rest & Recovery',
      type: 'Rest',
      workout: 'Full rest or light walk 20 min',
      exercises: [
        { name: 'Hamstring Stretch', sets: 2, reps: '30 sec each', done: false },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each', done: false },
      ],
    },
    {
      day: 'Thursday',
      focus: 'Tempo Run',
      type: 'Run',
      workout: '2km warmup + 2km tempo + 1km cooldown',
      workout_type: 'Tempo',
      detail: {
        segments: [
          { label: '2km warmup', label_vi: '2km khởi động', type: 'warmup', distance_m: 2000 },
          { label: '2km tempo', label_vi: '2km tempo', type: 'fast', distance_m: 2000 },
          { label: '1km cooldown', label_vi: '1km giảm tốc', type: 'cooldown', distance_m: 1000 },
        ],
        target_pace: '5:00-5:30 /km',
        target_pace_vi: '5:00-5:30 /km',
        hr_zone: 'Zone 4 (80-90% HR max)',
      },
      exercises: [
        { name: 'Lunge', sets: 3, reps: '10 each leg', done: false },
        { name: 'Core Plank', sets: 3, reps: '60 sec', done: false },
        { name: 'Squat', sets: 3, reps: '20', done: false },
      ],
    },
    {
      day: 'Friday',
      focus: 'Strength Training',
      type: 'Strength',
      workout: 'Full body strength session',
      exercises: [
        { name: 'Squat', sets: 4, reps: '12', done: false },
        { name: 'Lunge', sets: 3, reps: '12 each leg', done: false },
        { name: 'Core Plank', sets: 3, reps: '45 sec', done: false },
        { name: 'Russian Twist', sets: 3, reps: '20', done: false },
      ],
    },
    {
      day: 'Saturday',
      focus: 'Long Run',
      type: 'Run',
      workout: '5km at conversational pace',
      workout_type: 'Long Run',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '5km at conversational pace', label_vi: '5km nhịp đàm thoại', type: 'fast', distance_m: 5000 },
          { label: '5 min easy jog', label_vi: '5 phút chạy chậm', type: 'cooldown', duration_min: 5 },
        ],
        target_pace: '6:00-6:30 /km',
        target_pace_vi: '6:00-6:30 /km',
        hr_zone: 'Zone 2 (60-70% HR max)',
      },
      exercises: [
        { name: 'Core Crunch', sets: 2, reps: '15', done: false },
      ],
    },
    {
      day: 'Sunday',
      focus: 'Rest Day',
      type: 'Rest',
      workout: 'Complete rest or gentle yoga',
      exercises: [
        { name: 'Full Body Stretch', sets: 1, reps: '15 min', done: false },
      ],
    },
  ],
  '10KM': [
    {
      day: 'Monday',
      focus: 'Easy Run',
      type: 'Run',
      workout: '5km easy pace (60-70% effort)',
      workout_type: 'Easy',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '5km easy pace', label_vi: '5km nhịp dễ chịu', type: 'fast', distance_m: 5000 },
          { label: '5 min easy jog', label_vi: '5 phút chạy chậm', type: 'cooldown', duration_min: 5 },
        ],
        target_pace: '5:45-6:15 /km',
        target_pace_vi: '5:45-6:15 /km',
        hr_zone: 'Zone 2 (60-70% HR max)',
      },
      exercises: [
        { name: 'Squat', sets: 3, reps: '15', done: false },
        { name: 'Lunge', sets: 3, reps: '12 each leg', done: false },
        { name: 'Core Plank', sets: 3, reps: '45 sec', done: false },
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Speed Work',
      type: 'Run',
      workout: '6 x 800m at 5K pace + 400m jog recovery',
      workout_type: 'Interval',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '800m at 5K pace', label_vi: '800m nhịp 5K', type: 'fast', distance_m: 800, repeats: 6 },
          { label: '400m jog recovery', label_vi: '400m chạy chậm nghỉ', type: 'recovery', distance_m: 400, repeats: 6 },
          { label: '10 min easy jog cooldown', label_vi: '10 phút chạy chậm thả lỏng', type: 'cooldown', duration_min: 10 },
        ],
        target_pace: '4:00-4:30 /km (5K pace)',
        target_pace_vi: '4:00-4:30 /km (nhịp 5K)',
        hr_zone: 'Zone 5 (90-95% HR max)',
      },
      exercises: [
        { name: 'Core Crunch', sets: 3, reps: '25', done: false },
        { name: 'Mountain Climber', sets: 3, reps: '40 sec', done: false },
        { name: 'Russian Twist', sets: 3, reps: '20', done: false },
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Recovery',
      type: 'Cross',
      workout: '30 min cycling or swimming',
      exercises: [
        { name: 'Foam Roll', sets: 1, reps: '10 min', done: false },
        { name: 'Hip Flexor Stretch', sets: 2, reps: '30 sec each', done: false },
      ],
    },
    {
      day: 'Thursday',
      focus: 'Tempo Run',
      type: 'Run',
      workout: '2km warmup + 4km tempo + 1km cooldown',
      workout_type: 'Tempo',
      detail: {
        segments: [
          { label: '2km warmup', label_vi: '2km khởi động', type: 'warmup', distance_m: 2000 },
          { label: '4km tempo', label_vi: '4km tempo', type: 'fast', distance_m: 4000 },
          { label: '1km cooldown', label_vi: '1km giảm tốc', type: 'cooldown', distance_m: 1000 },
        ],
        target_pace: '4:45-5:15 /km',
        target_pace_vi: '4:45-5:15 /km',
        hr_zone: 'Zone 4 (80-90% HR max)',
      },
      exercises: [
        { name: 'Squat', sets: 4, reps: '15', done: false },
        { name: 'Core Plank', sets: 3, reps: '60 sec', done: false },
      ],
    },
    {
      day: 'Friday',
      focus: 'Strength & Core',
      type: 'Strength',
      workout: '45 min strength + core circuit',
      exercises: [
        { name: 'Squat', sets: 4, reps: '12', done: false },
        { name: 'Lunge', sets: 4, reps: '12 each leg', done: false },
        { name: 'Core Plank', sets: 3, reps: '60 sec', done: false },
        { name: 'Russian Twist', sets: 3, reps: '25', done: false },
        { name: 'Mountain Climber', sets: 3, reps: '45 sec', done: false },
      ],
    },
    {
      day: 'Saturday',
      focus: 'Long Run',
      type: 'Run',
      workout: '8km at easy conversational pace',
      workout_type: 'Long Run',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '8km at easy conversational pace', label_vi: '8km nhịp đàm thoại dễ chịu', type: 'fast', distance_m: 8000 },
          { label: '5 min easy jog', label_vi: '5 phút chạy chậm', type: 'cooldown', duration_min: 5 },
        ],
        target_pace: '5:30-6:00 /km',
        target_pace_vi: '5:30-6:00 /km',
        hr_zone: 'Zone 2 (60-70% HR max)',
      },
      exercises: [
        { name: 'Core Crunch', sets: 2, reps: '20', done: false },
      ],
    },
    {
      day: 'Sunday',
      focus: 'Rest Day',
      type: 'Rest',
      workout: 'Complete rest or gentle yoga',
      exercises: [
        { name: 'Full Body Stretch', sets: 1, reps: '20 min', done: false },
      ],
    },
  ],
  '21KM': [
    {
      day: 'Monday',
      focus: 'Easy Run',
      type: 'Run',
      workout: '6km easy pace (60-70% effort)',
      workout_type: 'Easy',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '6km easy pace', label_vi: '6km nhịp dễ chịu', type: 'fast', distance_m: 6000 },
          { label: '5 min easy jog', label_vi: '5 phút chạy chậm', type: 'cooldown', duration_min: 5 },
        ],
        target_pace: '5:30-6:00 /km',
        target_pace_vi: '5:30-6:00 /km',
        hr_zone: 'Zone 2 (60-70% HR max)',
      },
      exercises: [
        { name: 'Squat', sets: 3, reps: '15', done: false },
        { name: 'Lunge', sets: 3, reps: '12 each leg', done: false },
        { name: 'Core Plank', sets: 3, reps: '60 sec', done: false },
      ],
    },
    {
      day: 'Tuesday',
      focus: 'Interval Training',
      type: 'Run',
      workout: '8 x 1km at 10K pace + 90 sec jog recovery',
      workout_type: 'Interval',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '1km at 10K pace', label_vi: '1km nhịp 10K', type: 'fast', distance_m: 1000, repeats: 8 },
          { label: '90 sec jog', label_vi: '90 giây chạy chậm', type: 'recovery', duration_min: 1.5, repeats: 8 },
          { label: '10 min easy jog cooldown', label_vi: '10 phút chạy chậm thả lỏng', type: 'cooldown', duration_min: 10 },
        ],
        target_pace: '4:15-4:45 /km (10K pace)',
        target_pace_vi: '4:15-4:45 /km (nhịp 10K)',
        hr_zone: 'Zone 5 (90-95% HR max)',
      },
      exercises: [
        { name: 'Core Crunch', sets: 4, reps: '25', done: false },
        { name: 'Mountain Climber', sets: 3, reps: '45 sec', done: false },
        { name: 'Russian Twist', sets: 3, reps: '25', done: false },
      ],
    },
    {
      day: 'Wednesday',
      focus: 'Recovery',
      type: 'Cross',
      workout: '40 min easy cycling or swimming',
      exercises: [
        { name: 'Foam Roll', sets: 1, reps: '15 min', done: false },
        { name: 'Hamstring Stretch', sets: 2, reps: '45 sec each', done: false },
      ],
    },
    {
      day: 'Thursday',
      focus: 'Tempo Run',
      type: 'Run',
      workout: '2km warmup + 6km tempo + 2km cooldown',
      workout_type: 'Tempo',
      detail: {
        segments: [
          { label: '2km warmup', label_vi: '2km khởi động', type: 'warmup', distance_m: 2000 },
          { label: '6km tempo', label_vi: '6km tempo', type: 'fast', distance_m: 6000 },
          { label: '2km cooldown', label_vi: '2km giảm tốc', type: 'cooldown', distance_m: 2000 },
        ],
        target_pace: '4:30-5:00 /km',
        target_pace_vi: '4:30-5:00 /km',
        hr_zone: 'Zone 4 (80-90% HR max)',
      },
      exercises: [
        { name: 'Squat', sets: 4, reps: '15', done: false },
        { name: 'Core Plank', sets: 4, reps: '60 sec', done: false },
        { name: 'Lunge', sets: 3, reps: '15 each leg', done: false },
      ],
    },
    {
      day: 'Friday',
      focus: 'Strength & Core',
      type: 'Strength',
      workout: '60 min full body strength + core',
      exercises: [
        { name: 'Squat', sets: 4, reps: '12', done: false },
        { name: 'Lunge', sets: 4, reps: '12 each leg', done: false },
        { name: 'Core Plank', sets: 4, reps: '60 sec', done: false },
        { name: 'Russian Twist', sets: 4, reps: '25', done: false },
        { name: 'Mountain Climber', sets: 4, reps: '45 sec', done: false },
      ],
    },
    {
      day: 'Saturday',
      focus: 'Long Run',
      type: 'Run',
      workout: '14km at easy conversational pace',
      workout_type: 'Long Run',
      detail: {
        segments: [
          { label: '10 min easy jog', label_vi: '10 phút chạy chậm khởi động', type: 'warmup', duration_min: 10 },
          { label: '14km at easy conversational pace', label_vi: '14km nhịp đàm thoại dễ chịu', type: 'fast', distance_m: 14000 },
          { label: '10 min easy jog cooldown', label_vi: '10 phút chạy chậm thả lỏng', type: 'cooldown', duration_min: 10 },
        ],
        target_pace: '5:15-5:45 /km',
        target_pace_vi: '5:15-5:45 /km',
        hr_zone: 'Zone 2 (60-70% HR max)',
      },
      exercises: [
        { name: 'Core Crunch', sets: 2, reps: '20', done: false },
      ],
    },
    {
      day: 'Sunday',
      focus: 'Rest Day',
      type: 'Rest',
      workout: 'Complete rest or gentle yoga',
      exercises: [
        { name: 'Full Body Stretch', sets: 1, reps: '25 min', done: false },
      ],
    },
  ],
};
