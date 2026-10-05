# Macro Tracker

A personal calorie and macro tracker in one HTML page. It runs the setup interview,
calculates your plan, and logs meals by text or photo, with Claude estimating the
calories and macros.

Live version: https://claude.ai/artifact/RoJm5zAjLQ5SgPXKgJBQAG

## Flow

1. **Interview**: 11 one-per-screen questions (name, age, sex, height, weight, goal,
   goal weight, activity, pace, eating style, notes). Imperial or metric.
2. **Plan**: BMR, TDEE, daily calories, macros, water and timeline, with a
   Methodology note. "Looks good" saves it; "Adjust" goes back.
3. **Tracker**: calorie ring, protein/carbs/fat rings, water stepper, food logger,
   diary by meal, 7-day chart, Backup & Restore, light/dark toggle.

## Plan math

| Step | Formula |
|---|---|
| BMR | Mifflin-St Jeor: 10·kg + 6.25·cm − 5·age + 5 (men) / − 161 (women) |
| TDEE | BMR × 1.2 / 1.375 / 1.55 / 1.725 / 1.9 |
| Lose | TDEE − 250 / 500 / 750 (gentle / steady / aggressive), capped at ~1% bodyweight per week, floor 1,500 (men) / 1,200 (women) |
| Gain | TDEE + 250 / 325 / 400 |
| Protein | 1.0 g/lb when losing, an athlete or high-protein; else 0.8 g/lb (goal weight is the reference when losing) |
| Fat | 0.35 g/lb (drops to 0.25 g/lb if carbs would fall under 50 g) |
| Carbs | Remaining calories (keto: 25 g; low-carb: ≤25% of calories) |
| Water | 0.5–1.0 oz/lb by activity level, shown in liters |
| Timeline | weeks = \|current − goal\| ÷ ((TDEE − target) × 7 ÷ 3,500) |

Sample check: male, 30, 180 cm, 90 kg, moderately active, steady loss →
BMR 1,880 · TDEE 2,914 · 2,410 cal · 176 P / 287 C / 62 F · 1.0 lb/week · ~22 weeks.

## Data

- Signed in on claude.ai: synced privately to your account (only you can read it).
- Always mirrored to the browser, plus a copyable save code for backups.

General guidance, not medical advice. Check with your primary care physician before
starting any new diet.
