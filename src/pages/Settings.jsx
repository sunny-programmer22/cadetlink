import { useState } from 'react'
import { supabase } from '../supabaseClient'
import {
  Palette, Shield as ShieldIcon,
  Monitor, Sliders, Eye, Bell, Check, Copy, ChevronRight
} from 'lucide-react'

const TABS = [
  { id: 'theme', label: 'Theme', icon: Palette },
  { id: 'security', label: 'Security', icon: ShieldIcon },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
]

const THEMES = [
  { id: 'tactical-dark', label: 'Tactical Dark', desc: 'Deep slate with amber accents', color: 'bg-slate-950 border-amber-500', preview: ['bg-slate-950', 'bg-slate-900', 'bg-amber-500'] },
  { id: 'charcoal', label: 'Charcoal', desc: 'Cool charcoal tones with blue highlights', color: 'bg-zinc-950 border-blue-500', preview: ['bg-zinc-950', 'bg-zinc-900', 'bg-blue-500'] },
  { id: 'classic-navy', label: 'Classic Navy', desc: 'Traditional navy with gold trim', color: 'bg-slate-950 border-yellow-500', preview: ['bg-navy-950', 'bg-navy-900', 'bg-yellow-500'] },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('theme')
  const [selectedTheme, setSelectedTheme] = useState('tactical-dark')
  const [copied, setCopied] = useState(false)

  const handleCopyId = () => {
    navigator.clipboard.writeText('ssr-v2')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSignOut = () => {
    supabase.auth.signOut()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-slate-100 tracking-wide">Settings</h1>
        <p className="text-xs text-slate-500 font-mono mt-0.5">CONTROL PANEL</p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/80 border border-slate-800/60 rounded-xl w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === id
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-sm'
                : 'text-slate-400 hover:text-slate-300 border border-transparent'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Theme Tab */}
      {activeTab === 'theme' && (
        <div className="space-y-4 animate-fade-in">
          <div className="tactical-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Palette className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200">Theme Customization</h2>
            </div>
            <p className="text-xs text-slate-500 mb-4">Select your preferred garrison visual style.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setSelectedTheme(theme.id)}
                  className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                    selectedTheme === theme.id
                      ? 'border-amber-500 bg-amber-500/5'
                      : 'border-slate-800 bg-slate-950/50 hover:border-slate-700'
                  }`}
                >
                  {/* Color preview */}
                  <div className="flex gap-1 mb-3">
                    {theme.preview.map((color, i) => (
                      <div key={i} className={`w-6 h-6 rounded ${color}`} />
                    ))}
                  </div>

                  <h3 className="text-xs font-bold text-slate-200 mb-0.5">{theme.label}</h3>
                  <p className="text-[10px] text-slate-500">{theme.desc}</p>

                  {selectedTheme === theme.id && (
                    <div className="absolute top-2 right-2 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3 text-slate-950" />
                    </div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-800/60">
              <div className="flex items-center gap-2 text-[10px] text-slate-600 font-mono">
                <Eye className="w-3 h-3" />
                Theme preference is stored locally. Full persistence coming in next update.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-4 animate-fade-in">
          <div className="tactical-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldIcon className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200">Account Security</h2>
            </div>

            <div className="space-y-4">
              {/* Connection status */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <span className="status-dot status-dot--active" />
                  <div>
                    <p className="text-xs font-medium text-slate-200">Session Status</p>
                    <p className="text-[10px] font-mono text-slate-500">Authenticated via Supabase</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-1 rounded border border-emerald-900/40">
                  ACTIVE
                </span>
              </div>

              {/* Identifier */}
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Monitor className="w-4 h-4 text-slate-500" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">Instance Identifier</p>
                      <p className="text-[10px] font-mono text-slate-500">ssr-v2</p>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyId}
                    className="flex items-center gap-1 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    <Copy className="w-3 h-3" />
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>

              {/* Sign out */}
              <div className="pt-2">
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-950/30 px-3 py-2 rounded-lg border border-transparent hover:border-red-900/30 transition-all"
                >
                  <ChevronRight className="w-3 h-3" />
                  Sign Out of All Sessions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-4 animate-fade-in">
          <div className="tactical-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-slate-200">Interface Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Compact mode toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-200">Compact Mode</p>
                    <p className="text-[10px] font-mono text-slate-500">Reduce spacing for denser content</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-slate-800 rounded-full relative cursor-pointer">
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-slate-400 rounded-full transition-transform" />
                </div>
              </div>

              {/* Notifications toggle */}
              <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-slate-500" />
                  <div>
                    <p className="text-xs font-medium text-slate-200">Notifications</p>
                    <p className="text-[10px] font-mono text-slate-500">Broadcast alerts & batch updates</p>
                  </div>
                </div>
                <div className="w-9 h-5 bg-amber-500/30 rounded-full relative cursor-pointer">
                  <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-amber-400 rounded-full transition-transform" />
                </div>
              </div>

              {/* Font size */}
              <div className="p-3 bg-slate-950/50 rounded-lg border border-slate-800/60">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-medium text-slate-200">Font Size</span>
                  <span className="text-[10px] font-mono text-slate-500">Content display scale</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-500">A</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full relative">
                    <div className="absolute left-1/3 top-0 h-full w-1/3 bg-amber-500/50 rounded-full" />
                    <div className="absolute left-[33%] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-amber-500 rounded-full shadow-sm shadow-amber-500/30" />
                  </div>
                  <span className="text-xs text-slate-300">A</span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-600 font-mono flex items-center gap-1.5">
                <Sliders className="w-3 h-3" />
                More preference options coming soon.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
