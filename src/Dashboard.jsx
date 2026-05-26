import { useState } from 'react'
import Sidebar from './components/Sidebar'
import Feed from './pages/Feed'
import Gallery from './pages/Gallery'
import Events from './pages/Events'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

export default function Dashboard({ session }) {
  const [activeView, setActiveView] = useState('feed')

  const renderView = () => {
    switch (activeView) {
      case 'feed':
        return <Feed session={session} />
      case 'gallery':
        return <Gallery session={session} />
      case 'events':
        return <Events session={session} />
      case 'profile':
        return <Profile session={session} />
      case 'settings':
        return <Settings session={session} />
      default:
        return <Feed session={session} />
    }
  }

  const viewTitles = {
    feed: 'The Hub',
    gallery: 'Batch Gallery',
    events: 'Memorable Events',
    profile: 'Profile Dashboard',
    settings: 'Settings',
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar */}
      <Sidebar
        activeView={activeView}
        onNavigate={setActiveView}
        session={session}
      />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 min-h-screen">
        {/* Top bar (mobile indicator) */}
        <div className="sticky top-0 z-20 lg:hidden bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 px-4 py-3 flex items-center justify-center">
          <div className="flex items-center gap-2">
            <span className="status-dot status-dot--active" />
            <span className="text-xs font-mono text-slate-500 tracking-wider uppercase">
              {viewTitles[activeView]}
            </span>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          {renderView()}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800/60 px-6 py-4">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-700">
            <span>SESENTA SEGUNDIANOS ROJOS v2.0</span>
            <span>BATCH PORTAL // CLASSIFIED</span>
          </div>
        </div>
      </main>
    </div>
  )
}
