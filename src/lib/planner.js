import { RECIPES, DAYS } from './recipes'

export function emptyPlan() {
  return Object.fromEntries(DAYS.map((d) => [d, []]))
}

// Greedily fill each day toward the calorie target, favouring protein density + variety.
export function autoFillPlan(goals, exclude = []) {
  const target = goals.set ? goals.calories : 2200
  const allowed = RECIPES.filter((r) => !exclude.includes(r.proteinSource))
  const pool = allowed.sort((a, b) => b.proteinPct - a.proteinPct).slice(0, 60)
  if (!pool.length) return emptyPlan()
  const plan = emptyPlan()
  DAYS.forEach((d, di) => {
    const order = pool.slice(di * 3).concat(pool.slice(0, di * 3))
    let cal = 0, guard = 0
    const used = new Set()
    while (cal < target * 0.92 && plan[d].length < 4 && guard < 200) {
      guard++
      const r = order[(guard * 7 + di * 5) % order.length]
      if (used.has(r.id)) continue
      if (cal + r.calories > target * 1.12 && plan[d].length >= 2) break
      plan[d].push({ id: r.id, servings: 1 })
      used.add(r.id)
      cal += r.calories
    }
  })
  return plan
}
