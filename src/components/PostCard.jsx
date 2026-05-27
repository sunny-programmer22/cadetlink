import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { User, Calendar, MessageSquareText, Trash2, Send } from 'lucide-react'

const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif|ico)$/i.test(url || '')

export default function PostCard({ post, session, onImageClick, displayName, onPostDeleted }) {
  const profile = post.profiles || {}
  const initials = (profile.full_name || '??')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const [saluteCount, setSaluteCount] = useState(0)
  const [userSaluted, setUserSaluted] = useState(false)

  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState([])
  const [commentInput, setCommentInput] = useState('')
  const [loadingComments, setLoadingComments] = useState(false)

  useEffect(() => {
    if (!post?.id) return
    const load = async () => {
      const { count } = await supabase
        .from('salutes')
        .select('id', { count: 'exact', head: true })
        .eq('post_id', post.id)
      setSaluteCount(count ?? 0)

      const { data: mySalute } = await supabase
        .from('salutes')
        .select('id')
        .eq('post_id', post.id)
        .eq('user_id', session?.user?.id)
        .maybeSingle()
      setUserSaluted(!!mySalute)
    }
    load()
  }, [post?.id, session?.user?.id])

  const handleSalute = async () => {
    if (!session?.user?.id) return
    if (userSaluted) {
      const { error } = await supabase
        .from('salutes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', session.user.id)
      if (!error) {
        setUserSaluted(false)
        setSaluteCount((c) => Math.max(0, c - 1))
      }
    } else {
      const { error } = await supabase
        .from('salutes')
        .insert([{ post_id: post.id, user_id: session.user.id }])
      if (!error) {
        setUserSaluted(true)
        setSaluteCount((c) => c + 1)
      }
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post permanently?')) return
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)
    if (!error) {
      onPostDeleted?.(post.id)
    }
  }

  const loadComments = async () => {
    setLoadingComments(true)
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, profiles(full_name, avatar_url)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    if (data) setComments(data)
    setLoadingComments(false)
  }

  const handleToggleComments = () => {
    const next = !showComments
    setShowComments(next)
    if (next && comments.length === 0) loadComments()
  }

  const handleSendComment = async (e) => {
    e.preventDefault()
    if (!commentInput.trim() || !session?.user?.id) return
    const { error } = await supabase
      .from('comments')
      .insert([{ post_id: post.id, user_id: session.user.id, content: commentInput.trim() }])
    if (!error) {
      setCommentInput('')
      loadComments()
    }
  }

  return (
    <div className="tactical-card p-5 space-y-4 animate-fade-in group relative">
      {/* Delete button */}
      {session?.user?.id && post.user_id === session.user.id && (
        <button
          onClick={handleDelete}
          className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-colors opacity-0 group-hover:opacity-100"
          title="Delete post"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs font-bold font-mono shrink-0">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-500/70" />
                {profile.full_name || displayName || 'Unknown Cadet'}
              </h3>
            </div>
            <p className="text-[11px] font-mono text-slate-500">
              CADET-NO: {profile.cadet_number || '---'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 bg-slate-950/50 px-2.5 py-1.5 rounded-md border border-slate-800/50">
          <Calendar className="w-3 h-3" />
          {new Date(post.created_at).toLocaleDateString('en-US', {
            day: 'numeric', month: 'short', year: '2-digit'
          }).toUpperCase()}
        </div>
      </div>

      {/* Content */}
      {post.content && (
        <p className="text-sm text-slate-300 leading-relaxed">{post.content}</p>
      )}

      {/* Media */}
      {post.media_url && (
        <div
          className="rounded-lg overflow-hidden border border-slate-800/60 bg-slate-950 cursor-pointer group/media relative"
          onClick={() => isImage(post.media_url) && onImageClick?.(post.media_url)}
        >
          {isImage(post.media_url) ? (
            <div className="relative">
              <img
                src={post.media_url}
                alt="Batch media"
                className="w-full max-h-96 object-contain hover:opacity-90 transition-opacity"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/media:opacity-100 transition-opacity bg-black/30">
                <span className="text-xs font-mono text-white bg-black/50 px-3 py-1.5 rounded-md backdrop-blur-sm">
                  CLICK TO EXPAND
                </span>
              </div>
            </div>
          ) : (
            <video src={post.media_url} controls className="w-full max-h-96" />
          )}
        </div>
      )}

      {/* Footer Actions */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/40">
        <button
          onClick={handleSalute}
          className={`flex items-center gap-1.5 text-[11px] transition-colors ${
            userSaluted ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
          }`}
        >
          <span className="text-sm">🫡</span>
          <span>{saluteCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className={`flex items-center gap-1.5 text-[11px] transition-colors ${
            showComments ? 'text-amber-400' : 'text-slate-500 hover:text-amber-400'
          }`}
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>Comment{comments.length > 0 ? ` (${comments.length})` : ''}</span>
        </button>

        <span className="text-[10px] font-mono text-slate-700 ml-auto">
          #{String(post.id).slice(0, 8)}
        </span>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="border-t border-slate-800/40 pt-3 space-y-3">
          {loadingComments ? (
            <p className="text-xs text-slate-600">Loading comments...</p>
          ) : comments.length === 0 ? (
            <p className="text-xs text-slate-600">No comments yet.</p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-2.5 bg-slate-950/40 rounded-lg px-3 py-2">
                  <div className="w-6 h-6 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-[10px] font-bold shrink-0 mt-0.5">
                    {(c.profiles?.full_name || '?')[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-slate-300">
                      {c.profiles?.full_name || 'Unknown'}
                    </p>
                    <p className="text-xs text-slate-400">{c.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSendComment} className="flex gap-2">
            <input
              type="text"
              value={commentInput}
              onChange={(e) => setCommentInput(e.target.value)}
              placeholder="Add a comment..."
              className="tactical-input flex-1 text-xs"
            />
            <button
              type="submit"
              disabled={!commentInput.trim()}
              className="tactical-btn p-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
