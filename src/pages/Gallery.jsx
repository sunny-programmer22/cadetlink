import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Lightbox from '../components/Lightbox'
import { Image, Film, Grid3X3, AlertCircle } from 'lucide-react'

export default function Gallery() {
  const [mediaItems, setMediaItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    supabase
      .from('posts')
      .select('id, content, media_url, media_type, created_at, profiles(full_name, cadet_number)')
      .not('media_url', 'is', null)
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (!error) setMediaItems(data || [])
        setLoading(false)
      })
  }, [])

  const filteredItems = filter === 'all'
    ? mediaItems
    : mediaItems.filter(item => item.media_type === filter)

  const imageUrls = filteredItems
    .filter(item => item.media_type === 'image')
    .map(item => item.media_url)

  const openLightbox = (index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-wide">Batch Gallery</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">VISUAL ARCHIVE</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-600 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
          <Grid3X3 className="w-3 h-3" />
          {mediaItems.length} {mediaItems.length === 1 ? 'ASSET' : 'ASSETS'}
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        {[
          { id: 'all', label: 'All Media', icon: Grid3X3 },
          { id: 'image', label: 'Photos', icon: Image },
          { id: 'video', label: 'Videos', icon: Film },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
              filter === id
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'bg-slate-900/50 text-slate-400 border border-slate-800/50 hover:border-slate-700/50 hover:text-slate-300'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="tactical-card p-10 text-center">
          <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No media assets found.</p>
          <p className="text-xs text-slate-600 mt-1">Posts with images or videos will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative bg-slate-900 border border-slate-800 rounded-xl overflow-hidden cursor-pointer hover:border-amber-500/30 transition-all duration-200"
              onClick={() => item.media_type === 'image' && openLightbox(imageUrls.indexOf(item.media_url))}
            >
              {item.media_type === 'image' ? (
                <>
                  <img
                    src={item.media_url}
                    alt={item.content || 'Batch media'}
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 left-0 right-0 p-2.5">
                      <p className="text-[10px] text-white/80 truncate font-medium">
                        {item.profiles?.full_name || 'Unknown'}
                      </p>
                      <p className="text-[9px] text-white/50 font-mono truncate">
                        {item.profiles?.cadet_number || '---'}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative w-full aspect-square flex items-center justify-center bg-slate-950">
                  <video
                    src={item.media_url}
                    className="absolute inset-0 w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                    <Film className="w-8 h-8 text-white/70" />
                  </div>
                </div>
              )}
              {item.media_type === 'image' && (
                <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded text-[9px] font-mono text-amber-400/80 border border-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  IMAGE
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightboxOpen && imageUrls.length > 0 && (
        <Lightbox
          images={imageUrls}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxOpen(false)}
          onPrev={() => setLightboxIndex((prev) => (prev > 0 ? prev - 1 : imageUrls.length - 1))}
          onNext={() => setLightboxIndex((prev) => (prev < imageUrls.length - 1 ? prev + 1 : 0))}
        />
      )}
    </div>
  )
}
