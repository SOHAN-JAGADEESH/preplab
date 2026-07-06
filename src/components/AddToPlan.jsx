import { byId, imgUrl, RECIPES, DAYS, DAY_LONG } from '../lib/recipes'
import { useStore } from '../store'

// mode A: { recipeId } -> place a batch's servings across days. mode B: { day } -> pick a recipe.
export default function AddToPlan({ target, onClose }) {
  const { plan, addToPlan, addBatch, exclude, showToast } = useStore()

  if (target.recipeId != null) {
    const r = byId[target.recipeId]
    const batch = r.servings || 4
    // servings of THIS recipe already placed this session, per day + total
    const onDay = (d) => plan[d].filter((m) => m.id === r.id).reduce((n, m) => n + (m.servings || 1), 0)
    const placed = DAYS.reduce((n, d) => n + onDay(d), 0)

    return (
      <div className="pop-root">
        <div className="pop-scrim" onClick={onClose} />
        <div className="pop">
          <div className="pop-head">
            <h4>Place {r.title}</h4>
            <p>This batch makes <b>{batch} servings</b> ({r.calories} kcal · {r.protein}g protein each). Tap days to spread them out — or tap one day a few times to eat it there.</p>

            <div className="place-meter">
              <span className="pm-count"><b>{placed}</b> / {batch} servings placed</span>
              <button className="pm-spread" onClick={() => addBatch(r.id, batch)}>Spread batch over {batch} days</button>
            </div>

            <div className="day-select">
              {DAYS.map((d) => {
                const c = onDay(d)
                return (
                  <button key={d} className={'day-pick' + (c > 0 ? ' has' : '')} onClick={() => addToPlan(r.id, d)}>
                    {d}{c > 0 && <em>{c}</em>}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="pop-foot">
            <span className="pf-hint">{placed === 0 ? 'Nothing placed yet' : `${placed} serving${placed > 1 ? 's' : ''} added`}</span>
            <button className="btn btn-ember" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    )
  }

  // mode B — choose a recipe for a given day
  const day = target.day
  const sorted = RECIPES.filter((r) => !exclude.includes(r.proteinSource)).sort((a, b) => b.protein - a.protein)
  return (
    <div className="pop-root">
      <div className="pop-scrim" onClick={onClose} />
      <div className="pop">
        <div className="pop-head">
          <h4>Add a meal · {DAY_LONG[day]}</h4>
          <p>Pick any recipe to drop into this day (1 serving — adjust on the chip)</p>
        </div>
        <div className="pop-list">
          {sorted.map((r) => (
            <div className="pop-item" key={r.id} onClick={() => { addToPlan(r.id, day); showToast(`Added to ${DAY_LONG[day]}`) }}>
              <img src={imgUrl(r)} alt="" />
              <div>
                <div className="pi-name">{r.title}</div>
                <div className="pi-mac">{r.calories} kcal · {r.protein}g P · {r.carbs}g C · {r.fat}g F</div>
              </div>
              <span className="pi-add">+</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
