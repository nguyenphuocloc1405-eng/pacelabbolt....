import type { NutritionPlan } from '@/types';

export const nutritionPlans: NutritionPlan[] = [
  {
    day: 'Monday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'Oatmeal with Banana & Honey',
            ingredients: ['Rolled oats 60g', 'Banana 1', 'Honey 1 tsp', 'Almond milk 200ml'],
            calories: 380,
            cost: 25000,
          },
          {
            name: 'Boiled Eggs & Whole Wheat Toast',
            ingredients: ['Eggs 2', 'Whole wheat bread 2 slices', 'Butter 5g'],
            calories: 320,
            cost: 18000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Grilled Chicken & Brown Rice',
            ingredients: ['Chicken breast 150g', 'Brown rice 100g', 'Mixed vegetables', 'Olive oil'],
            calories: 520,
            cost: 55000,
          },
          {
            name: 'Beef Noodle Salad',
            ingredients: ['Lean beef 100g', 'Rice noodles 80g', 'Fresh herbs', 'Fish sauce dressing'],
            calories: 480,
            cost: 45000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Salmon & Sweet Potato',
            ingredients: ['Salmon fillet 150g', 'Sweet potato 200g', 'Steamed broccoli'],
            calories: 510,
            cost: 85000,
          },
          {
            name: 'Tofu & Vegetable Stir-fry',
            ingredients: ['Tofu 200g', 'Mixed vegetables 150g', 'Sesame oil', 'Brown rice 80g'],
            calories: 420,
            cost: 35000,
          },
        ],
      },
    ],
  },
  {
    day: 'Tuesday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'Greek Yogurt & Berries',
            ingredients: ['Greek yogurt 200g', 'Mixed berries 100g', 'Granola 30g'],
            calories: 340,
            cost: 40000,
          },
          {
            name: 'Avocado Toast & Egg',
            ingredients: ['Whole wheat bread 2 slices', 'Avocado 1/2', 'Egg 1', 'Chili flakes'],
            calories: 400,
            cost: 35000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Pork & Rice Plate',
            ingredients: ['Lean pork 120g', 'Jasmine rice 100g', 'Cucumber & tomato'],
            calories: 510,
            cost: 42000,
          },
          {
            name: 'Chicken Pho',
            ingredients: ['Rice noodles 80g', 'Chicken breast 100g', 'Broth', 'Bean sprouts'],
            calories: 450,
            cost: 38000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Shrimp & Quinoa Bowl',
            ingredients: ['Shrimp 150g', 'Quinoa 100g', 'Avocado', 'Lime dressing'],
            calories: 480,
            cost: 70000,
          },
          {
            name: 'Vegetable Curry & Rice',
            ingredients: ['Mixed vegetables 200g', 'Coconut milk 50ml', 'Brown rice 80g'],
            calories: 440,
            cost: 30000,
          },
        ],
      },
    ],
  },
  {
    day: 'Wednesday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'Banana Smoothie Bowl',
            ingredients: ['Banana 1', 'Greek yogurt 150g', 'Peanut butter 1 tbsp', 'Granola 30g'],
            calories: 390,
            cost: 32000,
          },
          {
            name: 'Rice Porridge with Chicken',
            ingredients: ['Rice 60g', 'Chicken breast 80g', 'Green onion', 'Ginger'],
            calories: 350,
            cost: 25000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Grilled Fish & Rice',
            ingredients: ['Fish fillet 150g', 'Jasmine rice 100g', 'Pickled vegetables'],
            calories: 490,
            cost: 60000,
          },
          {
            name: 'Chicken Salad Bowl',
            ingredients: ['Chicken breast 120g', 'Mixed greens 150g', 'Cherry tomatoes', 'Olive oil dressing'],
            calories: 380,
            cost: 48000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Beef & Broccoli Stir-fry',
            ingredients: ['Lean beef 120g', 'Broccoli 150g', 'Brown rice 80g', 'Soy sauce'],
            calories: 470,
            cost: 52000,
          },
          {
            name: 'Mushroom & Tofu Soup',
            ingredients: ['Tofu 150g', 'Mushrooms 100g', 'Seaweed', 'Brown rice 60g'],
            calories: 360,
            cost: 28000,
          },
        ],
      },
    ],
  },
  {
    day: 'Thursday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'Peanut Butter Banana Toast',
            ingredients: ['Whole wheat bread 2 slices', 'Peanut butter 2 tbsp', 'Banana 1'],
            calories: 410,
            cost: 22000,
          },
          {
            name: 'Vegetable Omelette',
            ingredients: ['Eggs 3', 'Bell pepper', 'Spinach', 'Cheese 20g'],
            calories: 360,
            cost: 28000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Turkey & Avocado Wrap',
            ingredients: ['Whole wheat wrap', 'Turkey 100g', 'Avocado 1/2', 'Greens'],
            calories: 460,
            cost: 50000,
          },
          {
            name: 'Com Tam (Broken Rice)',
            ingredients: ['Broken rice 100g', 'Grilled pork 100g', 'Fried egg', 'Pickled veg'],
            calories: 560,
            cost: 40000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Grilled Chicken & Quinoa',
            ingredients: ['Chicken breast 150g', 'Quinoa 100g', 'Roasted zucchini'],
            calories: 500,
            cost: 58000,
          },
          {
            name: 'Lentil Soup & Salad',
            ingredients: ['Lentils 100g', 'Carrot', 'Onion', 'Side salad'],
            calories: 380,
            cost: 25000,
          },
        ],
      },
    ],
  },
  {
    day: 'Friday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'Overnight Oats & Mango',
            ingredients: ['Rolled oats 60g', 'Mango 100g', 'Chia seeds 1 tbsp', 'Yogurt 100g'],
            calories: 370,
            cost: 30000,
          },
          {
            name: 'Egg & Rice Plate',
            ingredients: ['Jasmine rice 80g', 'Fried eggs 2', 'Soy sauce', 'Cucumber'],
            calories: 420,
            cost: 20000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Banh Mi Thit',
            ingredients: ['Baguette', 'Pork pate 50g', 'Pickled veg', 'Cilantro', 'Chili'],
            calories: 480,
            cost: 25000,
          },
          {
            name: 'Salmon Rice Bowl',
            ingredients: ['Salmon 120g', 'Brown rice 100g', 'Edamame', 'Sesame seeds'],
            calories: 520,
            cost: 75000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Pasta with Tomato & Basil',
            ingredients: ['Whole wheat pasta 80g', 'Tomato sauce', 'Basil', 'Parmesan 20g'],
            calories: 450,
            cost: 35000,
          },
          {
            name: 'Grilled Tofu & Vegetable Bowl',
            ingredients: ['Tofu 200g', 'Quinoa 80g', 'Roasted vegetables 150g'],
            calories: 410,
            cost: 32000,
          },
        ],
      },
    ],
  },
  {
    day: 'Saturday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'Pancakes & Maple Syrup',
            ingredients: ['Whole wheat flour 80g', 'Egg 1', 'Maple syrup 2 tbsp', 'Berries 50g'],
            calories: 420,
            cost: 35000,
          },
          {
            name: 'Fruit & Nut Bowl',
            ingredients: ['Mixed fruit 200g', 'Almonds 30g', 'Walnuts 20g', 'Honey 1 tsp'],
            calories: 350,
            cost: 42000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Bun Cha (Grilled Pork & Noodles)',
            ingredients: ['Rice vermicelli 100g', 'Grilled pork 120g', 'Fresh herbs', 'Nuoc cham'],
            calories: 520,
            cost: 45000,
          },
          {
            name: 'Chicken Caesar Salad',
            ingredients: ['Chicken breast 120g', 'Romaine lettuce', 'Croutons', 'Parmesan', 'Caesar dressing'],
            calories: 440,
            cost: 52000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Steak & Mashed Potato',
            ingredients: ['Beef sirloin 150g', 'Potato 200g', 'Butter 10g', 'Steamed beans'],
            calories: 580,
            cost: 95000,
          },
          {
            name: 'Vegetable Fried Rice',
            ingredients: ['Brown rice 100g', 'Mixed vegetables 150g', 'Egg 1', 'Soy sauce'],
            calories: 430,
            cost: 25000,
          },
        ],
      },
    ],
  },
  {
    day: 'Sunday',
    meals: [
      {
        category: 'Breakfast',
        meals: [
          {
            name: 'French Toast',
            ingredients: ['Whole wheat bread 2 slices', 'Egg 1', 'Milk 50ml', 'Cinnamon', 'Honey'],
            calories: 380,
            cost: 28000,
          },
          {
            name: 'Congee with Egg & Pork',
            ingredients: ['Rice 60g', 'Pork 50g', 'Egg 1', 'Green onion'],
            calories: 340,
            cost: 22000,
          },
        ],
      },
      {
        category: 'Lunch',
        meals: [
          {
            name: 'Pho Bo (Beef Noodle Soup)',
            ingredients: ['Rice noodles 80g', 'Beef slices 100g', 'Broth', 'Bean sprouts', 'Herbs'],
            calories: 480,
            cost: 45000,
          },
          {
            name: 'Grilled Chicken Salad',
            ingredients: ['Chicken breast 120g', 'Mixed greens 150g', 'Avocado', 'Lime dressing'],
            calories: 400,
            cost: 50000,
          },
        ],
      },
      {
        category: 'Dinner',
        meals: [
          {
            name: 'Roasted Chicken & Vegetables',
            ingredients: ['Chicken thigh 150g', 'Roasted potato 150g', 'Carrots', 'Olive oil'],
            calories: 540,
            cost: 65000,
          },
          {
            name: 'Vegetable & Tofu Curry',
            ingredients: ['Tofu 150g', 'Mixed vegetables 200g', 'Coconut milk 80ml', 'Brown rice 80g'],
            calories: 430,
            cost: 30000,
          },
        ],
      },
    ],
  },
];
