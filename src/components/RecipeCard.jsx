import { useStore } from '../store'
import { imgUrl } from '../lib/recipes'
import Ring from './Ring'

export default function RecipeCard({ recipe: r, index, onOpen, onPlan }) {
  const { isFav, toggleFav } = useStore()
  const fav = isFav(r.id)
  return (
    <article className="card" style={{ animationDelay: `${Math.min(index, 16) * 0.04}s` }} onClick={() => onOpen(r.id)}>
      <div className="card-media">
        <img loading="lazy" src={imgUrl(r)} alt={r.title} onError={(e) => (e.currentTarget.style.opacity = 0)} />
        <div className="card-badges">
          <div className="badge-row">
            {r.spicy && <span className="tag spicy">🌶 Spicy</span>}
            <span className="tag cuisine">{r.cuisine}</span>
          </div>
          <button className={'fav-btn' + (fav ? ' is-fav' : '')} title="Save"
            onClick={(e) => { e.stopPropagation(); toggleFav(r.id) }}>{fav ? '❤️' : '🤍'}</button>
        </div>
        <div className="card-cal"><b>{r.calories}</b><small>kcal</small></div>
        <div className="card-ring"><Ring pct={r.proteinPct} /></div>
      </div>
      <div className="card-body">
        <h3 className="card-title">{r.title}</h3>
        <div className="card-macros">
          <div className="mm p"><b>{r.protein}g</b><small>Protein</small></div>
          <div className="mm c"><b>{r.carbs}g</b><small>Carbs</small></div>
          <div className="mm f"><b>{r.fat}g</b><small>Fat</small></div>
        </div>
        <div className="card-foot">
          <span>{r.ingredientCount} ingredients · makes {r.makes}</span>
          <button className="plus" title="Add to planner"
            onClick={(e) => { e.stopPropagation(); onPlan(r.id) }}>+</button>
        </div>
      </div>
    </article>
  )
}
