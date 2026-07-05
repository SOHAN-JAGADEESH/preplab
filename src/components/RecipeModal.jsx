import { useState, useEffect } from 'react'
import { byId, imgUrl } from '../lib/recipes'
import { fmtNum, scaleText, splitIng } from '../lib/format'
import { useStore } from '../store'

export default function RecipeModal({ recipeId, onClose, onPlan }) {
  const { isFav, toggleFav } = useStore()
  const r = byId[recipeId]
  const [servings, setServings] = useState(r.servings)
  const [done, setDone] = useState(() => new Set())

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const f = servings / r.servings
  const scaled = f !== 1
  const fav = isFav(r.id)
  const toggleStep = (i) => setDone((d) => { const n = new Set(d); n.has(i) ? n.delete(i) : n.add(i); return n })

  const macros = [
    ['cal', Math.round(r.calories), 'kcal'],
    ['p', Math.round(r.protein) + 'g', 'Protein'],
    ['c', Math.round(r.carbs) + 'g', 'Carbs'],
    ['f', Math.round(r.fat) + 'g', 'Fat'],
  ]

  return (
    <div className="modal-root">
      <div className="modal-scrim" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true">
        <div className="modal-media">
          <div className="modal-media-top">
            <button className={'fav-btn' + (fav ? ' is-fav' : '')} onClick={() => toggleFav(r.id)}>{fav ? '❤️' : '🤍'}</button>
            <button className="modal-close" onClick={onClose}>✕</button>
          </div>
          <img src={imgUrl(r)} alt={r.title} onError={(e) => (e.currentTarget.style.opacity = 0)} />
          <div className="modal-media-info">
            <div className="modal-recipe-no">Recipe №{String(r.id).padStart(3, '0')} · {r.cuisine}{r.spicy ? ' · 🌶 Spicy' : ''}</div>
            <h2 className="modal-title">{r.title}</h2>
          </div>
        </div>

        <div className="modal-panel">
          <p className="modal-desc">{r.description}</p>
          <div className="macro-board">
            {macros.map(([cls, v, l]) => (
              <div className={'macro-cell ' + cls} key={l}><div className="mc-bar" /><b>{v}</b><small>{l}</small></div>
            ))}
          </div>

          <div className="scaler">
            <div className="scaler-label">Scale recipe · base makes <b>{r.servings}</b></div>
            <div className="stepper">
              <button onClick={() => setServings((s) => Math.max(1, s - 1))}>−</button>
              <span className="val">{servings}</span>
              <button onClick={() => setServings((s) => Math.min(20, s + 1))}>+</button>
            </div>
          </div>

          <div className="modal-actions">
            <button className="btn btn-ember" onClick={() => onPlan(r.id)}>＋ Add to planner</button>
            <button className="btn btn-line" onClick={() => toggleFav(r.id)}>{fav ? '❤️ Saved' : '🤍 Save'}</button>
          </div>

          <div className="sec-head">Ingredients {scaled && <span className="sec-note lime">scaled ×{fmtNum(f)}</span>}</div>
          {r.ingredientGroups.map((g, gi) => (
            <div className="ing-group" key={gi}>
              <h5>{g.group}</h5>
              <ul className="ing-list">
                {g.items.map((it, ii) => {
                  const s = splitIng(scaleText(it, f))
                  return (
                    <li key={ii}>
                      <span className={'qty' + (scaled ? ' scaled' : '')}>{s.qty || '·'}</span>
                      <span>{s.name}</span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}

          <div className="sec-head">Method · {r.steps.length} steps <span className="sec-note">tap to tick off</span></div>
          <ol className="steps">
            {r.steps.map((st, i) => (
              <li key={i} className={done.has(i) ? 'done' : ''} onClick={() => toggleStep(i)}>
                <span className="step-txt">{st}</span>
              </li>
            ))}
          </ol>

          {r.notes?.length > 0 && (
            <>
              <div className="sec-head">Important cooking notes</div>
              <ul className="cook-notes">
                {r.notes.map((n, i) => <li key={i}>{n}</li>)}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
