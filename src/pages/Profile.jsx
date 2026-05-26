import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import PostCard from '../components/PostCard'
import { Shield, BadgeCheck, Mail, CalendarDays, Activity, FileText } from 'lucide-react'

export default function Profile({ session }) {
  const [profile, setProfile] = useState(null)
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState(null)

  useEffect(() => {
    if (!session?.user?.id) return
    supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single()
      .then(({ data, error }) => {
        if (!error) setProfile(data)
        setLoading(false)
      })
    supabase
      .from('posts')
      .select('id, content, media_url, media_type, created_at, profiles(full_name, cadet_number)')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setMyPosts(data || []) })
  }, [session])

  const statusConfig = {
    active: { label: 'ACTIVE DUTY', color: 'text-emerald-400', dot: 'status-dot--active', bg: 'bg-emerald-950/30 border-emerald-900/40' },
    pending: { label: 'PENDING ACTIVATION', color: 'text-amber-400', dot: 'status-dot--pending', bg: 'bg-amber-950/30 border-amber-900/40' },
    inactive: { label: 'INACTIVE', color: 'text-red-400', dot: 'status-dot--inactive', bg: 'bg-red-950/30 border-red-900/40' },
  }

  const status = statusConfig[profile?.status || 'active'] || statusConfig.active

  const initials = (profile?.full_name || 'U')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', {
        day: 'numeric', month: 'long', year: 'numeric'
      })
    : '---'

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Shield className="w-6 h-6 text-amber-500 animate-pulse-slow" />
          <span className="text-xs font-mono text-slate-500">LOADING PROFILE...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Profile Card — Left Side */}
      <div className="lg:col-span-2 space-y-6">
        <div className="tactical-card overflow-hidden">
          {/* Banner */}
          <div className="h-20 bg-gradient-to-r from-amber-900/30 via-slate-900 to-slate-950 border-b border-slate-800/60 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M20 0v40M0 20h40\' stroke=\'%23f59e0b\' stroke-width=\'0.5\'/%3E%3C/svg%3E")' }} />
          </div>

          {/* Avatar */}
          <div className="px-5 pb-5 -mt-10">
            <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-[3px] border-slate-900 flex items-center justify-center text-white text-xl font-black font-mono shadow-lg shadow-amber-500/20 mb-4">
              {initials}
            </div>

            {/* Name and Status */}
            <div className="space-y-3">
              <div>
                <h2 className="text-lg font-bold text-slate-100">{profile?.full_name || 'Unknown Cadet'}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-500">
                    #{profile?.cadet_number || '---'}
                  </span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-wider ${status.bg}`}>
                <span className={`status-dot ${status.dot}`} />
                <span className={status.color}>{status.label}</span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="px-5 pb-5 space-y-3">
            <div className="h-px bg-slate-800/60" />

            <div className="space-y-2.5">
              <div className="flex items-center gap-3 text-xs">
                <Mail className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">{session.user.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">Member since {memberSince}</span>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <Activity className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-slate-400">{myPosts.length} posts broadcasted</span>
              </div>
            </div>

            <div className="h-px bg-slate-800/60" />

            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600">
              <BadgeCheck className="w-3 h-3 text-emerald-500" />
              ID: {session.user.id.slice(0, 16)}...
            </div>
          </div>
        </div>
      </div>

      {/* Personal Stream — Right Side */}
      <div className="lg:col-span-3 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-wide">Personal Stream</h2>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">YOUR BROADCASTS</p>
          </div>
          <div className="text-[10px] font-mono text-slate-600 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
            {myPosts.length} {myPosts.length === 1 ? 'POST' : 'POSTS'}
          </div>
        </div>

        {myPosts.length === 0 ? (
          <div className="tactical-card p-10 text-center">
            <FileText className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No personal broadcasts yet.</p>
            <p className="text-xs text-slate-600 mt-1">Your posts will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myPosts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onImageClick={(url) => setLightboxImage(url)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setLightboxImage(null)}>
          <img
            src={lightboxImage}
            alt="Expanded"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={() => setLightboxImage(null)} className="absolute top-4 right-4 p-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
