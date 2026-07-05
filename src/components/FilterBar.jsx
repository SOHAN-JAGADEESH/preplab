import { useMemo } from 'react'
import { RECIPES } from '../lib/recipes'
import { useStore } from '../store'

const P_EMOJI = { Chicken: '🍗', Beef: '🥩', Steak: '🥩', Salmon: '🐟', Shrimp: '🦐', Turkey: '🦃', Other: '🍽️' }
const D_EMOJI = { 'Mac n Cheese': '🧀', Bowls: '🥣', 'Fried Rice': '🍚', Noodles: '🍜', Pasta: '🍝', 'Loaded Fries': '🍟', Potatoes: '🥔', Rice: '🍚', Other: '✨' }

const SORTS = [
  ['default', 'Featured'], ['protein', 'Most protein'], ['proteinPct', 'Highest protein %'],
  ['calLow', 'Fewest calories'], ['calHigh', 'Most calories'], ['quick', 'Fewest ingredients'],
]

export default function FilterBar({ filters, set, resultCount }) {
  const { goals, exclude } = useStore()
  const counts = useMemo(() => {
    const avail = RECIPES.filter((r) => !exclude.includes(r.proteinSource))
    const p = {}, d = {}
    avail.forEach((r) => { p[r.proteinSource] = (p[r.proteinSource] || 0) + 1; d[r.dishType] = (d[r.dishType] || 0) + 1 })
    return {
      proteins: Object.keys(p).sort((a, b) => p[b] - p[a]).map((k) => [k, p[k]]),
      dishes: Object.keys(d).sort((a, b) => d[b] - d[a]).map((k) => [k, d[k]]),
    }
  }, [exclude])

  const toggleSet = (field, val) => {
    const next = new Set(filters[field])
    next.has(val) ? next.delete(val) : next.add(val)
    set({ ...filters, [field]: next })
  }
  const toggleFlag = (flag) => toggleSet('flags', flag)
  const active = filters.search || filters.protein.size || filters.dish.size || filters.flags.size

  const flagBtns = [
    ['highProtein', '💪 50g+ protein'], ['lowCal', '🪶 Under 500 cal'],
    ['spicy', '🌶️ Spicy'], ['fav', '❤️ Favourites'],
  ]
  if (goals.set) flagBtns.push(['fitsGoals', '🎯 Fits my goals'])

  return (
    <div className="filterbar">
      <div className="filter-row filter-row-top">
        <div className="search-wrap">
          <svg viewBox="0 0 24 24" className="search-ico"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
          <input className="search-input" type="search" placeholder="Search 104 recipes, ingredients, flavours…"
            value={filters.search} onChange={(e) => set({ ...filters, search: e.target.value })} autoComplete="off" />
          {filters.search && <button className="search-clear" onClick={() => set({ ...filters, search: '' })}>✕</button>}
        </div>
        <div className="sort-wrap">
          <label>Sort</label>
          <select className="sort-select" value={filters.sort} onChange={(e) => set({ ...filters, sort: e.target.value })}>
            {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div className="filter-row filter-row-pills">
        {counts.proteins.map(([k, n]) => (
          <button key={k} className={'pill' + (filters.protein.has(k) ? ' is-on' : '')} onClick={() => toggleSet('protein', k)}>
            <span className="pemo">{P_EMOJI[k] || '🍽️'}</span>{k} <span className="pc">{n}</span>
          </button>
        ))}
      </div>
      <div className="filter-row filter-row-pills">
        {counts.dishes.map(([k, n]) => (
          <button key={k} className={'pill' + (filters.dish.has(k) ? ' is-on' : '')} onClick={() => toggleSet('dish', k)}>
            <span className="pemo">{D_EMOJI[k] || '✨'}</span>{k} <span className="pc">{n}</span>
          </button>
        ))}
      </div>

      <div className="filter-row">
        <div className="toggle-group">
          {flagBtns.map(([flag, label]) => (
            <button key={flag} className={'toggle' + (filters.flags.has(flag) ? ' is-on' : '')} onClick={() => toggleFlag(flag)}>{label}</button>
          ))}
        </div>
        <div className="results-meta">
          <b>{resultCount}</b> meals
          {active && <button className="reset-btn" onClick={() => set({ search: '', protein: new Set(), dish: new Set(), flags: new Set(), sort: filters.sort })}>Reset</button>}
        </div>
      </div>
    </div>
  )
}
