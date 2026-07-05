import { useMemo } from 'react'
import { buildShopping, groupByAisle, qtyDisplay, shoppingText, planStats } from '../lib/shopping'
import { useStore } from '../store'

export default function ShoppingView({ onGoPlanner }) {
  const { plan, checked, toggleChecked, setAllChecked, showToast } = useStore()
  const items = useMemo(() => buildShopping(plan), [plan])
  const stats = useMemo(() => planStats(plan), [plan])

  if (!items.length) {
    return (
      <section className="view view-shopping">
        <Head />
        <div className="empty-state">
          <div className="empty-emoji">🛒</div>
          <h3>Nothing planned yet.</h3>
          <p>Add meals to your weekly planner and your grocery list appears here.</p>
          <button className="btn btn-ember" onClick={onGoPlanner}>Go to planner</button>
        </div>
      </section>
    )
  }

  const checkedN = items.filter((o) => checked[o.key]).length
  const pct = Math.round((checkedN / items.length) * 100)
  const groups = groupByAisle(items)

  const copy = () => navigator.clipboard.writeText(shoppingText(items))
    .then(() => showToast('📋', 'List copied to clipboard'), () => showToast('⚠️', 'Copy failed'))
  const toggleAll = () => {
    const allOn = items.every((o) => checked[o.key])
    setAllChecked(items.map((o) => o.key), !allOn)
  }

  return (
    <section className="view view-shopping">
      <Head onCopy={copy} onToggleAll={toggleAll} />
      <div className="shopping-meta">
        <div className="sm-item"><b>{items.length}</b><small>line items</small></div>
        <div className="sm-item"><b>{stats.batches}</b><small>batches to cook</small></div>
        <div className="sm-item"><b>{stats.servings}</b><small>servings total</small></div>
        <div className="sm-progress">
          <div className="bar"><i style={{ width: pct + '%' }} /></div>
          <span>{checkedN} of {items.length} gathered · {pct}%</span>
        </div>
      </div>
      <div className="shopping-cols">
        {groups.map(({ aisle, emoji, items: list }) => (
          <div className="aisle" key={aisle}>
            <div className="aisle-head"><span className="ae">{emoji}</span><h4>{aisle}</h4><span className="ac">{list.length}</span></div>
            <ul>
              {list.map((o) => (
                <li key={o.key} className={'shop-item' + (checked[o.key] ? ' checked' : '')} onClick={() => toggleChecked(o.key)}
                  title={'Used in: ' + o.recipes.join(', ')}>
                  <span className="shop-check">✓</span>
                  <span className="si-name">{o.name}{o.recipes.length > 1 && <small className="si-uses"> · {o.recipes.length} recipes</small>}</span>
                  <span className="si-qty">{qtyDisplay(o)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}

function Head({ onCopy, onToggleAll }) {
  return (
    <div className="view-head">
      <div>
        <div className="view-eyebrow">03 · Auto Grocery</div>
        <h2 className="view-title">The list builds itself.</h2>
        <p className="view-sub">Every ingredient from your planned week — merged into the cookbook's Master Grocery List, ranked by frequency.</p>
      </div>
      {onCopy && (
        <div className="planner-tools">
          <button className="btn btn-line" onClick={onCopy}>📋 Copy list</button>
          <button className="btn btn-line" onClick={onToggleAll}>Toggle all</button>
        </div>
      )}
    </div>
  )
}
