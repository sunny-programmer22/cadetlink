import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import { Shield, Mail, Lock, User, Hash, ArrowRight, AlertTriangle } from 'lucide-react'
import Dashboard from './Dashboard'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [cadetNumber, setCadetNumber] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [msg, setMsg] = useState({ type: '', text: '' })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription?.unsubscribe()
  }, [])

  const handleAuth = async (e) => {
    e.preventDefault()
    setMsg({ type: '', text: '' })

    if (isRegistering) {
      const { data, error } = await supabase.auth.signUp({ email, password })
      if (error) return setMsg({ type: 'error', text: error.message })

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert([
          { id: data.user.id, full_name: fullName, cadet_number: cadetNumber }
        ])
        if (profileError) return setMsg({ type: 'error', text: profileError.message })
        setMsg({ type: 'success', text: 'Account created! Pending activation approval.' })
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return setMsg({ type: 'error', text: error.message })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Shield className="w-8 h-8 text-amber-500 animate-pulse-slow" />
          <span className="text-xs font-mono text-slate-500 tracking-widest uppercase">Establishing secure connection...</span>
        </div>
      </div>
    )
  }

  if (session) return <Dashboard session={session} />

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.03)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0v60M0 30h60\' stroke=\'%23f59e0b\' stroke-width=\'0.5\'/%3E%3C/svg%3E")' }} />

      <div className="glass-panel p-8 rounded-2xl w-full max-w-md space-y-7 relative animate-fade-in">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Shield className="w-8 h-8 text-amber-500" />
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-[0.15em] text-amber-500 leading-tight">SESENTA SEGUNDIANOS ROJOS</h1>
          <p className="text-xs font-mono text-slate-500 uppercase tracking-[0.2em]">
            {isRegistering ? 'CREATE BATCH PROFILE' : 'ENTER GARRISON'}
          </p>
          <div className="flex justify-center gap-1.5 pt-1">
            <span className="status-dot status-dot--active" />
            <span className="text-[10px] font-mono text-slate-600 tracking-wider">SECURE CONNECTION</span>
          </div>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          {isRegistering && (
            <div className="space-y-4 animate-fade-in">
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  required
                  className="tactical-input pl-10"
                />
              </div>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Cadet Number"
                  value={cadetNumber}
                  onChange={e => setCadetNumber(e.target.value)}
                  required
                  className="tactical-input pl-10"
                />
              </div>
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="tactical-input pl-10"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="tactical-input pl-10"
            />
          </div>

          <button type="submit" className="tactical-btn w-full flex items-center justify-center gap-2">
            {isRegistering ? 'Register' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {msg.text && (
          <div className={`flex items-start gap-2.5 p-3 rounded-lg border text-xs ${
            msg.type === 'error'
              ? 'bg-red-950/30 border-red-900/40 text-red-400'
              : 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400'
          }`}>
            <AlertTriangle className={`w-4 h-4 mt-0.5 shrink-0 ${msg.type === 'error' ? 'text-red-400' : 'text-emerald-400'}`} />
            <span>{msg.text}</span>
          </div>
        )}

        <div className="text-center">
          <p className="text-xs text-slate-500">
            {isRegistering ? 'Already have access? ' : 'First time checking in? '}
            <button
              onClick={() => { setIsRegistering(!isRegistering); setMsg({ type: '', text: '' }) }}
              className="text-amber-500 hover:text-amber-400 font-semibold transition-colors"
            >
              {isRegistering ? 'Sign In' : 'Request Access'}
            </button>
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/60">
          <p className="text-[10px] text-slate-700 text-center font-mono tracking-wider">
            SESENTA SEGUNDIANOS ROJOS v2.0 // BATCH PORTAL
          </p>
        </div>
      </div>
    </div>
  )
}
