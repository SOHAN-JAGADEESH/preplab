import { useState, useEffect } from 'react'
import { StoreProvider, useStore } from './store'
import TopBar from './components/TopBar'
import LibraryView from './components/LibraryView'
import PlannerView from './components/PlannerView'
import ShoppingView from './components/ShoppingView'
import RecipeModal from './components/RecipeModal'
import GoalsDrawer from './components/GoalsDrawer'
import AddToPlan from './components/AddToPlan'

function Shell() {
  const { toast } = useStore()
  const [view, setView] = useState('library')
  const [modalId, setModalId] = useState(null)
  const [goalsOpen, setGoalsOpen] = useState(false)
  const [planTarget, setPlanTarget] = useState(null) // {recipeId} | {day}

  const go = (v) => { setView(v); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  return (
    <>
      <div className="atmosphere"><div className="atmo-mesh" /><div className="atmo-grain" /></div>

      <TopBar view={view} setView={go} onGoals={() => setGoalsOpen(true)} />

      <main>
        {view === 'library' && (
          <LibraryView onOpen={setModalId} onPlan={(id) => setPlanTarget({ recipeId: id })} />
        )}
        {view === 'planner' && (
          <PlannerView onOpen={setModalId} onAddDay={(day) => setPlanTarget({ day })} onGoShopping={() => go('shopping')} />
        )}
        {view === 'shopping' && (
          <ShoppingView onGoPlanner={() => go('planner')} />
        )}
      </main>

      {modalId != null && (
        <RecipeModal recipeId={modalId} onClose={() => setModalId(null)}
          onPlan={(id) => setPlanTarget({ recipeId: id })} />
      )}
      {goalsOpen && <GoalsDrawer onClose={() => setGoalsOpen(false)} />}
      {planTarget && <AddToPlan target={planTarget} onClose={() => setPlanTarget(null)} />}

      <div className={'toast' + (toast ? ' show' : '')}>
        {toast && <><span className="te">{toast.emoji}</span>{toast.msg}</>}
      </div>
    </>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  )
}
