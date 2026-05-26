import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabaseClient'
import PostCard from '../components/PostCard'
import { Send, Image, Video, Camera, FileText } from 'lucide-react'

const isVideoFile = (file) => file.type.startsWith('video/')

export default function Feed({ session }) {
  const [posts, setPosts] = useState([])
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, content, media_url, created_at, profiles(full_name, cadet_number)')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => { if (!error) setPosts(data || []) })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!content.trim() && !file) return
    setUploading(true)

    let mediaUrl = null

    if (file) {
      const ext = file.name.split('.').pop()
      const fileName = `${session.user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('cadet-media')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        setUploading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage
        .from('cadet-media')
        .getPublicUrl(fileName)

      mediaUrl = publicUrl
    }

    const { error } = await supabase.from('posts').insert([
      {
        user_id: session.user.id,
        content: content.trim(),
        media_url: mediaUrl,
      }
    ])

    if (!error) {
      setContent('')
      setFile(null)
      setUploading(false)
      supabase
        .from('posts')
        .select('id, content, media_url, created_at, profiles(full_name, cadet_number)')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => { if (!error) setPosts(data || []) })
    } else {
      setUploading(false)
    }
  }

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0]
    if (selected) setFile(selected)
  }

  const clearAttachment = () => {
    setFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-wide">The Hub</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">COMMUNITY BROADCASTS</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-600 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
          <span className="status-dot status-dot--active" />
          {posts.length} {posts.length === 1 ? 'TRANSMISSION' : 'TRANSMISSIONS'}
        </div>
      </div>

      {/* Publish Card */}
      <form onSubmit={handleSubmit} className="tactical-card overflow-hidden">
        <div className="p-4 border-b border-slate-800/60">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Camera className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">Publish Tactical Update</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your tactical update, observation, or broadcast to the batch..."
            rows={3}
            className="tactical-input resize-none"
          />
        </div>

        {/* Attachments */}
        <div className="px-4 py-3 bg-slate-950/50">
          {file ? (
            <div className="flex items-center justify-between bg-slate-900/80 border border-slate-800/60 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {isVideoFile(file) ? (
                  <Video className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <Image className="w-4 h-4 text-amber-400 shrink-0" />
                )}
                <span className="text-xs text-slate-300 truncate">{file.name}</span>
                <span className="text-[10px] font-mono text-slate-500 shrink-0">
                  ({(file.size / 1024 / 1024).toFixed(1)} MB)
                </span>
              </div>
              <button type="button" onClick={clearAttachment} className="text-xs text-red-400 hover:text-red-300 ml-2 shrink-0">
                Remove
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-medium">Attach media:</span>
              <button
                type="button"
                onClick={() => { fileInputRef.current.accept = 'image/*'; fileInputRef.current.click() }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Image className="w-3.5 h-3.5" /> Photo
              </button>
              <button
                type="button"
                onClick={() => { fileInputRef.current.accept = 'video/*'; fileInputRef.current.click() }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition-colors"
              >
                <Video className="w-3.5 h-3.5" /> Video
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 flex items-center justify-between border-t border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-600">
            {content.length > 0 ? `${content.length} chars` : 'Ready'}
          </span>
          <button
            type="submit"
            disabled={uploading || (!content.trim() && !file)}
            className="tactical-btn flex items-center gap-2 text-xs disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {uploading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Broadcast
              </>
            )}
          </button>
        </div>
      </form>

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <div className="tactical-card p-8 text-center">
            <FileText className="w-8 h-8 text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500">No broadcasts yet.</p>
            <p className="text-xs text-slate-600 mt-1">Be the first to share a tactical update.</p>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onImageClick={(url) => setLightboxImage(url)}
            />
          ))
        )}
      </div>

      {/* Lightbox */}
      {lightboxImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in" onClick={() => setLightboxImage(null)}>
          <img
            src={lightboxImage}
            alt="Expanded view"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </div>
  )
}
