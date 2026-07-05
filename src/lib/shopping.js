import { byId, DAYS } from './recipes'
import { fmtNum, roundQty } from './format'
import ingredientMap from '../data/ingredientMap.json'

/* ----------------------------------------------------------------
   Grocery engine built on the cookbook's Master Grocery List.
   Every recipe ingredient line was resolved OFFLINE (from the PDF)
   to a canonical item + parsed quantity in data/ingredientMap.json:
     map:     raw ingredient string -> [{name, family?, base?}]
     catalog: canonical name -> {category, rank, recipes}
   Categories and in-category order ("ranked by frequency") follow
   the book. No fragile runtime string parsing.
----------------------------------------------------------------- */
const { categories, catalog, map } = ingredientMap

// things that come out of a tap don't belong on a shopping list
const NOT_PURCHASED = new Set(['Water'])

export const CATEGORY_ORDER = categories
export const CATEGORY_EMOJI = {
  'Meats': '🥩',
  'Dairy': '🧀',
  'Produce': '🥬',
  'Spices & Seasonings': '🧂',
  'Pantry': '🍯',
  'Noodles & Pasta': '🍝',
  'Other': '🧺',
}

// servings planned + whole batches that must be cooked, per recipe and in total
export function planStats(plan) {
  const servingsByRecipe = {}
  DAYS.forEach((d) => plan[d].forEach((e) => { servingsByRecipe[e.id] = (servingsByRecipe[e.id] || 0) + (e.servings || 1) }))
  let servings = 0, batches = 0
  Object.entries(servingsByRecipe).forEach(([id, s]) => {
    const r = byId[id]; if (!r) return
    servings += s
    batches += Math.ceil(s / r.servings)
  })
  return { servings, batches, recipes: Object.keys(servingsByRecipe).length, servingsByRecipe }
}

/* ---------------- build aggregated list ---------------- */
export function buildShopping(plan) {
  const { servingsByRecipe } = planStats(plan)

  const agg = {} // canonical name -> {key, name, category, rank, fams, recipes:Set}
  Object.entries(servingsByRecipe).forEach(([id, s]) => {
    const r = byId[id]
    if (!r) return
    // whole batches only — scaled so every serving is genuinely 900 kcal
    const f = Math.ceil(s / r.servings) * (r.batchScale || 1)
    r.ingredientGroups.forEach((g) => g.items.forEach((raw) => {
      const entries = map[raw]
      if (!entries) return
      entries.forEach((e) => {
        if (NOT_PURCHASED.has(e.name)) return
        const info = catalog[e.name]
        if (!agg[e.name]) {
          agg[e.name] = {
            key: e.name, name: e.name,
            category: info?.category || 'Other',
            rank: info?.rank ?? 999,
            fams: {}, recipes: new Set(),
          }
        }
        agg[e.name].recipes.add(r.title)
        if (e.family) agg[e.name].fams[e.family] = (agg[e.name].fams[e.family] || 0) + e.base * f
      })
    }))
  })
  return Object.values(agg).map((o) => ({ ...o, recipes: [...o.recipes] }))
}

export function qtyDisplay(item) {
  const parts = []
  const fam = item.fams
  if (fam.mass) {
    const g = roundQty(fam.mass, 'g')
    parts.push(g >= 1000 ? `${fmtNum(roundQty(g / 1000, 'kg'))} kg` : `${fmtNum(g)} g`)
  }
  if (fam.vol) {
    const ml = roundQty(fam.vol, 'ml')
    parts.push(ml >= 1000 ? `${fmtNum(roundQty(ml / 1000, 'l'))} L` : `${fmtNum(ml)} ml`)
  }
  if (fam.spoon) parts.push(fam.spoon >= 3 ? `${fmtNum(roundQty(fam.spoon / 3, 'tbsp'))} tbsp` : `${fmtNum(roundQty(fam.spoon, 'tsp'))} tsp`)
  if (fam.cup) parts.push(`${fmtNum(roundQty(fam.cup, 'cup'))} cup`)
  // discrete things you buy whole — always round up
  if (fam.clove) parts.push(`${Math.ceil(fam.clove)} clove`)
  if (fam.slice) parts.push(`${Math.ceil(fam.slice)} slice`)
  if (fam.can) parts.push(`${Math.ceil(fam.can)} can`)
  if (fam.sheet) parts.push(`${Math.ceil(fam.sheet)} sheet`)
  if (fam.count) parts.push(`×${Math.ceil(fam.count)}`)
  return parts.join(' + ')
}

// group by master-list category, items in the book's frequency order
export function groupByAisle(items) {
  const groups = {}
  items.forEach((it) => { (groups[it.category] ||= []).push(it) })
  Object.values(groups).forEach((list) => list.sort((a, b) => a.rank - b.rank))
  return CATEGORY_ORDER.filter((c) => groups[c]).map((c) => ({ aisle: c, emoji: CATEGORY_EMOJI[c], items: groups[c] }))
}

export function shoppingText(items) {
  const lines = ['PREP LAB — Shopping List', '']
  groupByAisle(items).forEach(({ aisle, items: list }) => {
    lines.push(aisle.toUpperCase())
    list.forEach((o) => { const q = qtyDisplay(o); lines.push(`  [ ] ${o.name}${q ? ' — ' + q : ''}`) })
    lines.push('')
  })
  return lines.join('\n')
}
