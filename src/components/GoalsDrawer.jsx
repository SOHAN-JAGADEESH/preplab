import { useState, useEffect, useMemo } from 'react'
import { computeTDEE } from '../lib/macros'
import { RECIPES } from '../lib/recipes'
import { useStore } from '../store'

const PRESETS = [
  ['No red meat', ['Beef', 'Steak']],
  ['Pescatarian', ['Chicken', 'Beef', 'Steak', 'Turkey', 'Other']],
  ['Poultry only', ['Beef', 'Steak', 'Salmon', 'Shrimp', 'Other']],
]

function DietProfile() {
  const { exclude, toggleExclude, setExclude } = useStore()
  const sources = useMemo(() => {
    const c = {}
    RECIPES.forEach((r) => { c[r.proteinSource] = (c[r.proteinSource] || 0) + 1 })
    return Object.keys(c).sort((a, b) => c[b] - c[a]).map((k) => [k, c[k]])
  }, [])
  const available = RECIPES.filter((r) => !exclude.includes(r.proteinSource)).length

  return (
    <div className="diet-section">
      <div className="field"><label>Dietary profile — tap a protein to hide it</label>
        <div className="diet-chips">
          {sources.map(([k, n]) => {
            const off = exclude.includes(k)
            return (
              <button key={k} className={'diet-chip' + (off ? ' off' : '')} onClick={() => toggleExclude(k)}>
                {k}<em>{n}</em>
                {off && <span className="dc-x">Hidden</span>}
              </button>
            )
          })}
        </div>
      </div>
      <div className="diet-presets">
        {PRESETS.map(([label, list]) => (
          <button key={label} onClick={() => setExclude(list)}>{label}</button>
        ))}
        {exclude.length > 0 && <button className="dp-clear" onClick={() => setExclude([])}>Show all</button>}
      </div>
      <div className="diet-count">{available} of {RECIPES.length} recipes available</div>
    </div>
  )
}

const ACTIVITY = [
  [1.2, 'Sedentary (desk job)'], [1.375, 'Light (1–3 days/wk)'], [1.55, 'Moderate (3–5 days/wk)'],
  [1.725, 'Very active (6–7 days/wk)'], [1.9, 'Athlete (2x/day)'],
]
const GOALS = [[-0.2, 'Lose fat (−20%)'], [-0.1, 'Lean cut (−10%)'], [0, 'Maintain'], [0.12, 'Lean bulk (+12%)']]

export default function GoalsDrawer({ onClose }) {
  const { goals, setGoals } = useStore()
  const [mode, setMode] = useState('calc')
  const [f, setF] = useState({ sex: 'male', age: 28, weight: 80, height: 178, activity: 1.55, goal: -0.2 })
  const [m, setM] = useState({ calories: goals.calories, protein: goals.protein, carbs: goals.carbs, fat: goals.fat })

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [onClose])

  const calc = computeTDEE(f)
  const upF = (k, v) => setF((s) => ({ ...s, [k]: v }))

  return (
    <div className="drawer-root">
      <div className="drawer-scrim" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-modal="true">
        <h3>Your profile</h3>
        <p className="drawer-sub">Hide proteins you don’t eat, then dial in your daily macro targets.</p>

        <DietProfile />

        <div className="drawer-divider">MACRO TARGETS</div>
        <div className="seg" style={{ marginBottom: 20 }}>
          <button className={mode === 'calc' ? 'on' : ''} onClick={() => setMode('calc')}>Calculate for me</button>
          <button className={mode === 'manual' ? 'on' : ''} onClick={() => setMode('manual')}>I know my numbers</button>
        </div>

        {mode === 'calc' ? (
          <>
            <div className="field"><label>Biological sex</label>
              <div className="seg">
                <button className={f.sex === 'male' ? 'on' : ''} onClick={() => upF('sex', 'male')}>Male</button>
                <button className={f.sex === 'female' ? 'on' : ''} onClick={() => upF('sex', 'female')}>Female</button>
              </div>
            </div>
            <div className="field-row">
              <div className="field"><label>Age</label><input type="number" value={f.age} onChange={(e) => upF('age', +e.target.value)} /></div>
              <div className="field"><label>Weight (kg)</label><input type="number" value={f.weight} onChange={(e) => upF('weight', +e.target.value)} /></div>
            </div>
            <div className="field"><label>Height (cm)</label><input type="number" value={f.height} onChange={(e) => upF('height', +e.target.value)} /></div>
            <div className="field"><label>Activity level</label>
              <select value={f.activity} onChange={(e) => upF('activity', parseFloat(e.target.value))}>
                {ACTIVITY.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="field"><label>Goal</label>
              <select value={f.goal} onChange={(e) => upF('goal', parseFloat(e.target.value))}>
                {GOALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="goal-result">
              <div className="gr-row"><span>Daily calories</span><b className="lime">{calc.calories} kcal</b></div>
              <div className="gr-row"><span>Protein · 2g/kg</span><b>{calc.protein}g</b></div>
              <div className="gr-row"><span>Carbs</span><b>{calc.carbs}g</b></div>
              <div className="gr-row"><span>Fat</span><b>{calc.fat}g</b></div>
            </div>
            <button className="btn btn-ember" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setGoals(calc); onClose() }}>Set these targets</button>
          </>
        ) : (
          <>
            <div className="field-row">
              <div className="field"><label>Calories</label><input type="number" value={m.calories} onChange={(e) => setM({ ...m, calories: +e.target.value })} /></div>
              <div className="field"><label>Protein (g)</label><input type="number" value={m.protein} onChange={(e) => setM({ ...m, protein: +e.target.value })} /></div>
            </div>
            <div className="field-row">
              <div className="field"><label>Carbs (g)</label><input type="number" value={m.carbs} onChange={(e) => setM({ ...m, carbs: +e.target.value })} /></div>
              <div className="field"><label>Fat (g)</label><input type="number" value={m.fat} onChange={(e) => setM({ ...m, fat: +e.target.value })} /></div>
            </div>
            <button className="btn btn-ember" style={{ width: '100%', justifyContent: 'center' }}
              onClick={() => { setGoals(m); onClose() }}>Save targets</button>
          </>
        )}

        {goals.set && (
          <>
            <div className="drawer-divider">CURRENTLY ACTIVE</div>
            <div className="goal-result">
              <div className="gr-row"><span>Calories</span><b className="lime">{goals.calories}</b></div>
              <div className="gr-row"><span>Protein</span><b>{goals.protein}g</b></div>
              <div className="gr-row"><span>Carbs / Fat</span><b>{goals.carbs}g / {goals.fat}g</b></div>
            </div>
          </>
        )}
      </aside>
    </div>
  )
}
