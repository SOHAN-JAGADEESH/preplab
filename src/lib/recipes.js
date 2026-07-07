import raw from '../data/recipes.json'

const proteinSource = (t) => {
  t = t.toLowerCase()
  if (t.includes('salmon')) return 'Salmon'
  if (t.includes('shrimp') || t.includes('prawn')) return 'Shrimp'
  if (t.includes('turkey')) return 'Turkey'
  if (t.includes('steak')) return 'Steak'
  if (t.includes('beef') || t.includes('bulgogi')) return 'Beef'
  if (t.includes('chicken')) return 'Chicken'
  return 'Other'
}
const dishType = (t) => {
  t = t.toLowerCase()
  if (t.includes('fried rice')) return 'Fried Rice'
  if (t.includes('mac n cheese') || t.includes('mac and cheese')) return 'Mac n Cheese'
  if (t.includes('loaded fries') || t.includes('fries')) return 'Loaded Fries'
  if (t.includes('noodle') || t.includes('ramen') || t.includes('chow mein') || t.includes('linguine')) return 'Noodles'
  if (t.includes('pasta') || t.includes('alfredo')) return 'Pasta'
  if (t.includes('rice bowl') || t.includes('bowl')) return 'Bowls'
  if (t.includes('rice')) return 'Rice'
  if (t.includes('potato') || t.includes('mash') || t.includes('chips')) return 'Potatoes'
  return 'Other'
}
const CUISINES = {
  Korean: ['korean', 'bulgogi', 'kimchi', 'gochujang'],
  Mexican: ['taco', 'fajita', 'chipotle', 'nacho', 'street corn', 'burrito', 'quesadilla'],
  Italian: ['alfredo', 'pasta', 'parm', 'parmesan', 'linguine'],
  'Middle Eastern': ['shawarma', 'halal', 'harissa', 'peri', 'turkish', 'kofta', 'kebab'],
  Asian: ['teriyaki', 'orange chicken', 'chow mein', 'sweet & sour', 'sweet and sour', 'dynamite', 'ramen', 'peanut', 'chilli crisp', 'honey chilli'],
  American: ['nashville', 'buffalo', 'philly', 'cheesesteak', 'bbq', 'loaded fries', 'mac n cheese'],
  Indian: ['butter chicken', 'masala', 'tikka', 'curry'],
}
const cuisine = (t) => {
  t = t.toLowerCase()
  for (const [c, kws] of Object.entries(CUISINES)) if (kws.some((k) => t.includes(k))) return c
  return 'Comfort'
}
const isSpicy = (t, d) => {
  const s = (t + ' ' + d).toLowerCase()
  return ['spicy', 'chilli', 'chili', 'nashville', 'buffalo', 'hot ', 'peri', 'harissa', 'chipotle', 'dynamite', 'gochujang', 'sriracha'].some((k) => s.includes(k))
}

// Every recipe is normalized to a TRUE 900 kcal serving: macros are scaled by
// 900/originalCalories, a batch is re-portioned to the nearest whole number of
// 900-kcal servings, and ingredient quantities are scaled by batchScale so the
// batch really contains servings × 900 kcal. Original cookbook numbers are
// kept on base* fields.
export const TARGET_CAL = 900

export const RECIPES = raw.map((r) => {
  const ingredientCount = r.ingredientGroups.reduce((n, g) => n + g.items.length, 0)
  const k = r.calories ? TARGET_CAL / r.calories : 1
  const batchCal = (r.calories || 0) * (r.servings || 1)
  const servings = Math.max(1, Math.round(batchCal / TARGET_CAL)) || 1
  // scale ingredient quantities so a batch holds exactly `servings` × 900 kcal
  const batchScale = batchCal ? (TARGET_CAL * servings) / batchCal : 1
  const protein = Math.round((r.protein || 0) * k)
  return {
    ...r,
    baseCalories: r.calories,
    baseProtein: r.protein,
    baseCarbs: r.carbs,
    baseFat: r.fat,
    baseServings: r.servings,
    calories: TARGET_CAL,
    protein,
    carbs: Math.round((r.carbs || 0) * k),
    fat: Math.round((r.fat || 0) * k),
    servings,
    makes: servings,
    batchScale,
    image: `recipe-${String(r.id).padStart(3, '0')}.jpg`,
    proteinSource: proteinSource(r.title),
    dishType: dishType(r.title),
    cuisine: cuisine(r.title),
    spicy: isSpicy(r.title, r.description || ''),
    highProtein: protein >= 50,
    lowCal: (r.calories || 999) <= 500, // light as originally written
    proteinPct: Math.round(((protein * 4) / TARGET_CAL) * 100),
    ingredientCount,
  }
})

export const byId = Object.fromEntries(RECIPES.map((r) => [r.id, r]))

// image url helper: images live in /public/recipes, served at base + recipes/
export const imgUrl = (r) => `${import.meta.env.BASE_URL}recipes/${r.image}`

export const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
export const DAY_LONG = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' }
