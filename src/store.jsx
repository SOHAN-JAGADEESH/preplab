import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { DAYS, DAY_LONG } from './lib/recipes'
import { emptyPlan, autoFillPlan } from './lib/planner'

const STORE = 'preplab.react.v1'
const defaults = () => ({
  favorites: [],
  goals: { calories: 2200, protein: 180, carbs: 210, fat: 70, set: false },
  plan: emptyPlan(),
  checked: {},
  exclude: [], // protein sources to hide (e.g. ['Beef','Steak'])
})
function load() {
  try {
    const s = JSON.parse(localStorage.getItem(STORE))
    if (!s) return defaults()
    const d = defaults()
    return { ...d, ...s, goals: { ...d.goals, ...(s.goals || {}) }, plan: { ...d.plan, ...(s.plan || {}) } }
  } catch {
    return defaults()
  }
}

const StoreCtx = createContext(null)
export const useStore = () => useContext(StoreCtx)

export function StoreProvider({ children }) {
  const [state, setState] = useState(load)
  const [toast, setToast] = useState(null)
  const toastTimer = useRef(null)

  useEffect(() => { localStorage.setItem(STORE, JSON.stringify(state)) }, [state])

  const showToast = useCallback((msg) => {
    setToast({ msg, id: Math.random() })
    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2200)
  }, [])

  const toggleFav = useCallback((id) => {
    setState((s) => {
      const has = s.favorites.includes(id)
      return { ...s, favorites: has ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }
    })
  }, [])

  // add `count` servings of a recipe to a day, merging into an existing chip
  const addToPlan = useCallback((id, day, count = 1) => {
    setState((s) => {
      const list = s.plan[day]
      const i = list.findIndex((m) => m.id === id)
      const next = i >= 0
        ? list.map((m, j) => (j === i ? { ...m, servings: (m.servings || 1) + count } : m))
        : [...list, { id, servings: count }]
      return { ...s, plan: { ...s.plan, [day]: next } }
    })
  }, [])

  // distribute a whole batch (n servings) across the n emptiest days, one each
  const addBatch = useCallback((id, n) => {
    setState((s) => {
      const order = [...DAYS].sort((a, b) => s.plan[a].reduce((x, m) => x + (m.servings || 1), 0) - s.plan[b].reduce((x, m) => x + (m.servings || 1), 0))
      const days = order.slice(0, n)
      const plan = { ...s.plan }
      days.forEach((d) => {
        const list = plan[d]
        const i = list.findIndex((m) => m.id === id)
        plan[d] = i >= 0 ? list.map((m, j) => (j === i ? { ...m, servings: (m.servings || 1) + 1 } : m)) : [...list, { id, servings: 1 }]
      })
      return { ...s, plan }
    })
    showToast(`Batch spread across ${n} days`)
  }, [showToast])

  const removeFromPlan = useCallback((day, idx) => {
    setState((s) => ({ ...s, plan: { ...s.plan, [day]: s.plan[day].filter((_, i) => i !== idx) } }))
  }, [])

  const updateServings = useCallback((day, idx, delta) => {
    setState((s) => ({
      ...s,
      plan: {
        ...s.plan,
        [day]: s.plan[day].map((m, i) => (i === idx ? { ...m, servings: Math.max(1, Math.min(12, (m.servings || 1) + delta)) } : m)),
      },
    }))
  }, [])

  const clearWeek = useCallback(() => {
    setState((s) => ({ ...s, plan: emptyPlan() }))
    showToast('Week cleared')
  }, [showToast])

  const autoFill = useCallback(() => {
    setState((s) => ({ ...s, plan: autoFillPlan(s.goals, s.exclude) }))
    showToast('Week auto-filled to your goals')
  }, [showToast])

  const toggleExclude = useCallback((source) => {
    setState((s) => {
      const has = s.exclude.includes(source)
      return { ...s, exclude: has ? s.exclude.filter((x) => x !== source) : [...s.exclude, source] }
    })
  }, [])

  const setExclude = useCallback((list) => setState((s) => ({ ...s, exclude: list })), [])

  const setGoals = useCallback((g) => {
    setState((s) => ({ ...s, goals: { ...g, set: true } }))
    showToast('Targets locked in')
  }, [showToast])

  const toggleChecked = useCallback((key) => {
    setState((s) => ({ ...s, checked: { ...s.checked, [key]: !s.checked[key] } }))
  }, [])

  const setAllChecked = useCallback((keys, value) => {
    setState((s) => {
      const checked = { ...s.checked }
      keys.forEach((k) => { checked[k] = value })
      return { ...s, checked }
    })
  }, [])

  const value = {
    ...state, showToast, toast,
    toggleFav, addToPlan, addBatch, removeFromPlan, updateServings, clearWeek, autoFill, setGoals, toggleChecked, setAllChecked,
    toggleExclude, setExclude,
    isFav: (id) => state.favorites.includes(id),
    isHidden: (r) => state.exclude.includes(r.proteinSource),
  }
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>
}

export { DAYS, DAY_LONG }
