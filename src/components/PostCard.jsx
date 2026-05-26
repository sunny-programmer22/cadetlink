import { User, Calendar, MessageSquareText } from 'lucide-react'

const isImage = (url) => /\.(jpg|jpeg|png|gif|webp|bmp|svg|avif|ico)$/i.test(url || '')

export default function PostCard({ post, onImageClick, displayName }) {
  const profile = post.profiles || {}
  const initials = (profile.full_name || '??')
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="tactical-card p-5 space-y-4 animate-fade-in group">
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

      {/* Footer */}
      <div className="flex items-center gap-3 pt-1 border-t border-slate-800/40">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <MessageSquareText className="w-3.5 h-3.5" />
          <span>Broadcast</span>
        </div>
        <span className="text-[10px] font-mono text-slate-700 ml-auto">
          #{post.id?.slice(0, 8)}
        </span>
      </div>
    </div>
  )
}
