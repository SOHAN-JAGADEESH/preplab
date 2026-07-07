import { RECIPES } from '../lib/recipes'

export default function Hero({ onBrowse, onSurprise }) {
  const avgP = Math.round(RECIPES.reduce((s, r) => s + r.protein, 0) / RECIPES.length)
  const maxP = Math.max(...RECIPES.map((r) => r.protein))
  const cuis = new Set(RECIPES.map((r) => r.cuisine)).size
  const stats = [
    ['ember', RECIPES.length, 'Restaurant-grade recipes'],
    ['lime', avgP + 'g', 'Average protein / serving'],
    ['ember', maxP + 'g', 'Highest protein hit'],
    ['lime', cuis, 'Flavour worlds to raid'],
  ]
  const picks = RECIPES.filter((r) => r.protein >= 55).slice(0, 14).map((r) => r.title)
  const marquee = [...picks, ...picks]

  return (
    <div className="hero">
      <div className="hero-grid">
        <div className="hero-copy">
          <div className="hero-eyebrow">High-protein meal prep engine</div>
          <h1 className="hero-title">Eat like<br />you mean it.</h1>
          <p className="hero-sub">
            <strong>{RECIPES.length}</strong> restaurant-grade, high-protein meal preps,
            engineered with full macros, a smart weekly planner, and a shopping list that
            builds itself. No bland chicken &amp; rice. Ever.
          </p>
          <div className="hero-cta">
            <button className="btn btn-ember" onClick={onBrowse}>Browse the library →</button>
            <button className="btn btn-line" onClick={onSurprise}>Surprise me</button>
          </div>
        </div>
        <div className="hero-stats">
          {stats.map(([cls, n, l], i) => (
            <div className="stat-card" key={i}>
              <div className={'stat-num ' + cls}>{n}</div>
              <div className="stat-label">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-marquee">
        <div className="marquee-track">
          {marquee.map((t, i) => (<span key={i}>{t} <b>·</b></span>))}
        </div>
      </div>
    </div>
  )
}
