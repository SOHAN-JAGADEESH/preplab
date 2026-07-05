import { useState, useMemo, useRef } from 'react'
import { RECIPES } from '../lib/recipes'
import { fitsGoals } from '../lib/macros'
import { useStore } from '../store'
import Hero from './Hero'
import FilterBar from './FilterBar'
import RecipeCard from './RecipeCard'

const initialFilters = { search: '', protein: new Set(), dish: new Set(), flags: new Set(), sort: 'default' }

export default function LibraryView({ onOpen, onPlan }) {
  const { isFav, goals, exclude } = useStore()
  const [filters, setFilters] = useState(initialFilters)
  const filterRef = useRef(null)

  const list = useMemo(() => {
    let l = RECIPES.filter((r) => !exclude.includes(r.proteinSource))
    const q = filters.search.trim().toLowerCase()
    if (q) {
      l = l.filter((r) => (r.title + ' ' + r.description + ' ' + r.cuisine + ' ' +
        r.ingredientGroups.map((g) => g.items.join(' ')).join(' ')).toLowerCase().includes(q))
    }
    if (filters.protein.size) l = l.filter((r) => filters.protein.has(r.proteinSource))
    if (filters.dish.size) l = l.filter((r) => filters.dish.has(r.dishType))
    if (filters.flags.has('highProtein')) l = l.filter((r) => r.highProtein)
    if (filters.flags.has('lowCal')) l = l.filter((r) => r.lowCal)
    if (filters.flags.has('spicy')) l = l.filter((r) => r.spicy)
    if (filters.flags.has('fav')) l = l.filter((r) => isFav(r.id))
    if (filters.flags.has('fitsGoals')) l = l.filter((r) => fitsGoals(r, goals))
    const s = filters.sort
    if (s === 'protein') l.sort((a, b) => b.protein - a.protein)
    else if (s === 'proteinPct') l.sort((a, b) => b.proteinPct - a.proteinPct)
    else if (s === 'calLow') l.sort((a, b) => a.calories - b.calories)
    else if (s === 'calHigh') l.sort((a, b) => b.calories - a.calories)
    else if (s === 'quick') l.sort((a, b) => a.ingredientCount - b.ingredientCount)
    return l
  }, [filters, goals, isFav, exclude])

  const surprise = () => {
    const pool = list.length ? list : RECIPES
    onOpen(pool[Math.floor(Math.random() * pool.length)].id)
  }
  const browse = () => filterRef.current?.scrollIntoView({ behavior: 'smooth' })

  return (
    <section className="view view-library">
      <Hero onBrowse={browse} onSurprise={surprise} />
      <div ref={filterRef}>
        <FilterBar filters={filters} set={setFilters} resultCount={list.length} />
      </div>
      {list.length ? (
        <div className="recipe-grid">
          {list.map((r, i) => (
            <RecipeCard key={r.id} recipe={r} index={i} onOpen={onOpen} onPlan={onPlan} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-emoji">🍳</div>
          <h3>No meals match that.</h3>
          <p>Try loosening a filter or clearing your search.</p>
          <button className="btn btn-line" onClick={() => setFilters(initialFilters)}>Reset filters</button>
        </div>
      )}
    </section>
  )
}
