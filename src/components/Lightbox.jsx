import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'

export default function Lightbox({ images, currentIndex, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrev?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [onClose, onPrev, onNext])

  const image = images[currentIndex]

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm animate-fade-in">
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Download */}
      <a
        href={image}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-4 right-16 z-10 p-2.5 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-800 transition-all"
      >
        <Download className="w-5 h-5" />
      </a>

      {/* Counter */}
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-slate-900/80 border border-slate-700/60 rounded-lg text-xs font-mono text-slate-400">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Previous */}
      {onPrev && images.length > 1 && (
        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-800 transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {/* Image */}
      <div className="max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={image}
          alt="Full size"
          className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>

      {/* Next */}
      {onNext && images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-slate-900/80 border border-slate-700/60 rounded-xl text-slate-400 hover:text-amber-500 hover:bg-slate-800 transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  )
}
