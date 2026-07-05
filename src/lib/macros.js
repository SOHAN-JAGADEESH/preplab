import { byId, DAYS } from './recipes'

export function dayMacros(plan, day) {
  return plan[day].reduce(
    (a, m) => {
      const r = byId[m.id]
      if (!r) return a
      const s = m.servings || 1
      a.cal += r.calories * s; a.p += r.protein * s; a.c += r.carbs * s; a.f += r.fat * s
      return a
    },
    { cal: 0, p: 0, c: 0, f: 0 },
  )
}
export function weekMacros(plan) {
  return DAYS.reduce(
    (a, d) => {
      const m = dayMacros(plan, d)
      a.cal += m.cal; a.p += m.p; a.c += m.c; a.f += m.f
      return a
    },
    { cal: 0, p: 0, c: 0, f: 0 },
  )
}

// Mifflin–St Jeor
export function computeTDEE(f) {
  const bmr = 10 * f.weight + 6.25 * f.height - 5 * f.age + (f.sex === 'male' ? 5 : -161)
  const tdee = bmr * f.activity
  const calories = Math.round((tdee * (1 + f.goal)) / 10) * 10
  const protein = Math.round(f.weight * 2.0)
  const fat = Math.round((calories * 0.25) / 9)
  const carbs = Math.max(0, Math.round((calories - protein * 4 - fat * 9) / 4))
  return { calories, protein, carbs, fat }
}

export function fitsGoals(r, goals) {
  if (!goals.set) return true
  const perMealCal = goals.calories / 3
  const perMealPro = goals.protein / 3
  return r.calories <= perMealCal * 1.3 && r.protein >= perMealPro * 0.75
}
