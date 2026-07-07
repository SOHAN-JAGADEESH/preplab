import { byId, imgUrl, DAYS, DAY_LONG } from '../lib/recipes'
import { dayMacros, weekMacros } from '../lib/macros'
import { useStore } from '../store'

export default function PlannerView({ onOpen, onAddDay, onGoShopping }) {
  const { plan, goals, removeFromPlan, updateServings, autoFill, clearWeek } = useStore()
  const w = weekMacros(plan)
  const totalMeals = DAYS.reduce((n, d) => n + plan[d].length, 0)
  const activeDays = DAYS.filter((d) => plan[d].length).length || 1

  return (
    <section className="view view-planner">
      <div className="view-head">
        <div>
          <div className="view-eyebrow">02 · Weekly Engine</div>
          <h2 className="view-title">Your week, macro-balanced.</h2>
          <p className="view-sub">Each slot is <b>one 900 kcal serving</b> you eat that day. Most batches yield 2–3 of these, so use the <b>＋ / −</b> on a meal to log how many servings you'll eat. Your shopping list rounds up to whole batches.</p>
        </div>
        <div className="planner-tools">
          <button className="btn btn-line" onClick={autoFill}>Auto-fill to my goals</button>
          <button className="btn btn-line" onClick={clearWeek}>Clear week</button>
          <button className="btn btn-ember" onClick={onGoShopping}>Build shopping list →</button>
        </div>
      </div>

      <div className="week-summary">
        <div className="ws-title">Week totals<small>{totalMeals} meals · avg/day</small></div>
        <div className="ws-metric cal"><b>{Math.round(w.cal / activeDays)}</b><small>kcal/day {goals.set ? `· goal ${goals.calories}` : ''}</small></div>
        <div className="ws-metric p"><b>{Math.round(w.p / activeDays)}g</b><small>protein/day {goals.set ? `· goal ${goals.protein}` : ''}</small></div>
        <div className="ws-metric c"><b>{Math.round(w.c / activeDays)}g</b><small>carbs/day</small></div>
        <div className="ws-metric f"><b>{Math.round(w.f / activeDays)}g</b><small>fat/day</small></div>
      </div>

      <div className="planner-board">
        {DAYS.map((d) => {
          const m = dayMacros(plan, d)
          const goalCal = goals.set ? goals.calories : 2200
          const pct = Math.min(100, Math.round((m.cal / goalCal) * 100))
          const over = m.cal > goalCal * 1.05
          return (
            <div className="day-col" key={d}>
              <div className="day-head">
                <div className="day-name">{DAY_LONG[d]}</div>
                <div className="day-cals"><b>{m.cal}</b> kcal · {m.p}g protein</div>
                <div className="day-bar"><i className={over ? 'over' : ''} style={{ width: pct + '%' }} /></div>
              </div>
              <div className="day-meals">
                {plan[d].map((entry, idx) => {
                  const r = byId[entry.id]
                  if (!r) return null
                  const sv = entry.servings || 1
                  return (
                    <div className="meal-chip" key={idx}>
                      <div className="mc-main" onClick={() => onOpen(r.id)}>
                        <img src={imgUrl(r)} alt="" />
                        <div style={{ minWidth: 0 }}>
                          <div className="mc-name">{r.title}</div>
                          <div className="mc-cal">{r.calories * sv} kcal · {r.protein * sv}g P</div>
                        </div>
                        <button className="mc-del" title="Remove" onClick={(e) => { e.stopPropagation(); removeFromPlan(d, idx) }}>✕</button>
                      </div>
                      <div className="mc-serv" title="Servings eaten this day">
                        <button onClick={() => updateServings(d, idx, -1)} disabled={sv <= 1}>−</button>
                        <span>{sv} {sv === 1 ? 'serving' : 'servings'}</span>
                        <button onClick={() => updateServings(d, idx, 1)}>+</button>
                      </div>
                    </div>
                  )
                })}
                <button className="add-meal" onClick={() => onAddDay(d)}>Add meal</button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
