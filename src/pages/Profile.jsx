import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import PostCard from '../components/PostCard'
import { Shield, BadgeCheck, Mail, Activity, FileText, Pencil, Camera, Check, X } from 'lucide-react'

export default function Profile({ session }) {
  const [profile, setProfile] = useState(null)
  const [myPosts, setMyPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxImage, setLightboxImage] = useState(null)

  const [editingName, setEditingName] = useState(false)
  const [editName, setEditName] = useState('')
  const [savingName, setSavingName] = useState(false)

  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const avatarInputRef = useRef(null)

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
        if (error) {
          console.error('Error fetching profile:', error)
        } else {
          setProfile(data)
        }
      } catch (err) {
        console.error('Unexpected error fetching profile:', err)
      } finally {
        setLoading(false)
      }
    }

    const fetchMyPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('posts')
          .select('id, content, media_url, created_at, profiles(full_name, cadet_number)')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
        if (error) {
          console.error('Error fetching posts:', error)
        } else {
          setMyPosts(data || [])
        }
      } catch (err) {
        console.error('Unexpected error fetching posts:', err)
      }
    }

    fetchProfile()
    fetchMyPosts()
  }, [session])

  const handleSaveProfile = async () => {
    if (!editName.trim() || editName === profile?.full_name) {
      setEditingName(false)
      return
    }
    setSavingName(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: editName.trim() })
        .eq('id', session.user.id)
      if (error) {
        console.error('Error saving profile name:', error)
      } else {
        setProfile((prev) => ({ ...prev, full_name: editName.trim() }))
      }
    } catch (err) {
      console.error('Unexpected error saving name:', err)
    }
    setSavingName(false)
    setEditingName(false)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)

    try {
      const ext = file.name.split('.').pop()
      const fileName = `avatars/${session.user.id}.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('cadet-media')
        .upload(fileName, file, { upsert: true })
      if (uploadError) {
        console.error('Error uploading avatar:', uploadError)
        setUploadingAvatar(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('cadet-media')
        .getPublicUrl(fileName)

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', session.user.id)
      if (updateError) {
        console.error('Error updating avatar_url:', updateError)
      } else {
        setProfile((prev) => ({ ...prev, avatar_url: publicUrl }))
      }
    } catch (err) {
      console.error('Unexpected error during avatar upload:', err)
    }
    setUploadingAvatar(false)
  }

  const displayName = profile?.full_name || session?.user?.email?.split('@')[0] || 'Cadet'
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const statusBg = 'bg-emerald-950/30 border-emerald-900/40'

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

          {/* Avatar — editable */}
          <div className="px-5 pb-5 -mt-10">
            <div className="relative group mb-4 w-20 h-20">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="avatar"
                  className="w-20 h-20 rounded-xl border-[3px] border-slate-900 object-cover shadow-lg shadow-amber-500/20" />
              ) : (
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 border-[3px] border-slate-900 flex items-center justify-center text-white text-xl font-black font-mono shadow-lg shadow-amber-500/20">
                  {initials}
                </div>
              )}
              <button onClick={() => avatarInputRef.current?.click()} disabled={uploadingAvatar}
                className="absolute inset-0 rounded-xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer border-[3px] border-slate-900">
                {uploadingAvatar ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Camera className="w-5 h-5 text-white" />
                )}
              </button>
              <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
            </div>

            {/* Name — editable */}
            <div className="space-y-3">
              <div>
                {editingName ? (
                  <div className="flex items-center gap-2">
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)}
                      autoFocus className="tactical-input flex-1 text-base font-bold py-1.5"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSaveProfile(); if (e.key === 'Escape') setEditingName(false) }} />
                    <button onClick={handleSaveProfile} disabled={savingName}
                      className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400 hover:bg-emerald-500/30 transition">
                      {savingName ? <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
                    </button>
                    <button onClick={() => setEditingName(false)}
                      className="p-2 bg-red-500/10 rounded-lg text-red-400 hover:bg-red-500/20 transition">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group/name">
                    <h2 className="text-lg font-bold text-slate-100">{displayName}</h2>
                    <button onClick={() => { setEditName(profile?.full_name || displayName); setEditingName(true) }}
                      className="p-1 rounded-md text-slate-600 hover:text-amber-400 hover:bg-slate-800/50 opacity-0 group-hover/name:opacity-100 transition-all">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-mono text-slate-500">#{profile?.cadet_number || '---'}</span>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono tracking-wider ${statusBg}`}>
                <span className="status-dot status-dot--active" />
                <span className="text-emerald-400">ACTIVE DUTY</span>
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
              <PostCard key={post.id} post={post} onImageClick={(url) => setLightboxImage(url)} displayName={displayName} />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setLightboxImage(null)}>
          <img src={lightboxImage} alt="Expanded" className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} />
          <button onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
