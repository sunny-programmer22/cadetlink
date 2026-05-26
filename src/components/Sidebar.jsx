import { useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  LayoutDashboard, Image, UserCircle, Settings, LogOut,
  Shield, Menu, X, ChevronRight
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'feed', label: 'The Hub', icon: LayoutDashboard },
  { id: 'gallery', label: 'Batch Gallery', icon: Image },
  { id: 'profile', label: 'Profile Dashboard', icon: UserCircle },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activeView, onNavigate }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleNav = (id) => {
    onNavigate(id)
    setMobileOpen(false)
  }

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-40 h-full bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/80
        transition-all duration-300 flex flex-col
        ${collapsed ? 'w-[68px]' : 'w-64'}
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className={`p-5 border-b border-slate-800/80 ${collapsed ? 'px-0 text-center' : ''}`}>
          <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
            <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shrink-0">
              <Shield className="w-5 h-5 text-amber-500" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-amber-500 tracking-wider truncate">SESENTA SEGUNDIANOS ROJOS</h2>
                <p className="text-[10px] font-mono text-slate-500 tracking-widest">BATCH PORTAL</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                transition-all duration-150 group relative
                ${activeView === id
                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }
                ${collapsed ? 'justify-center px-0' : ''}
              `}
            >
              <Icon className="w-4.5 h-4.5 shrink-0" />
              {!collapsed && (
                <>
                  <span className="truncate">{label}</span>
                  {activeView === id && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-amber-500/60" />}
                </>
              )}
              {collapsed && activeView === id && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-amber-500 rounded-r" />
              )}
            </button>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="p-3 border-t border-slate-800/80 space-y-2">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          <button
            onClick={() => supabase.auth.signOut()}
            className={`
              w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-red-400/70 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/30
              transition-all duration-150
              ${collapsed ? 'justify-center px-0' : ''}
            `}
          >
            <LogOut className="w-4.5 h-4.5 shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>

          {!collapsed && (
            <div className="px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="status-dot status-dot--active" />
                <span className="text-[10px] font-mono text-slate-600 tracking-wider">SESSION ACTIVE</span>
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
