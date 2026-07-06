import { useStore } from '../store'
import { DAYS } from '../lib/recipes'
import { buildShopping } from '../lib/shopping'
import { useMemo } from 'react'

export default function TopBar({ view, setView, onGoals }) {
  const store = useStore()
  const planCount = DAYS.reduce((n, d) => n + store.plan[d].length, 0)
  const shopCount = useMemo(() => buildShopping(store.plan).length, [store.plan])

  const tab = (id, label, count) => (
    <button className={'nav-btn' + (view === id ? ' is-active' : '')} onClick={() => setView(id)}>
      <span>{id === 'library' ? '01' : id === 'planner' ? '02' : '03'}</span> {label}
      {count > 0 && <em className="nav-count">{count}</em>}
    </button>
  )

  return (
    <header className="topbar">
      <a className="brand" href="#" onClick={(e) => { e.preventDefault(); setView('library') }}>
        <span className="brand-name">PREP<span>LAB</span></span>
      </a>
      <nav className="nav">
        {tab('library', 'Library')}
        {tab('planner', 'Planner', planCount)}
        {tab('shopping', 'Shopping', shopCount)}
      </nav>
      <div className="topbar-actions">
        <button className="ghost-btn" onClick={onGoals} title="Dietary profile & macro targets">
          Profile
        </button>
      </div>
    </header>
  )
}
