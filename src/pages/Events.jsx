import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Clock, Plus, X, Send, User, Calendar, BookOpen } from 'lucide-react'

export default function Events({ session }) {
  const [events, setEvents] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [eventFile, setEventFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [expandedId, setExpandedId] = useState(null)

  useEffect(() => {
    supabase
      .from('events')
      .select('id, title, description, event_date, media_url, created_at, user_id, profiles(full_name, cadet_number)')
      .order('event_date', { ascending: false })
      .then(({ data, error }) => { if (!error) setEvents(data || []) })
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!title.trim()) return
    setSubmitting(true)

    let mediaUrl = null
    if (eventFile) {
      const ext = eventFile.name.split('.').pop()
      const fileName = `events/${session.user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('cadet-media')
        .upload(fileName, eventFile)

      if (!uploadError) {
        const { data: { publicUrl } } = supabase.storage
          .from('cadet-media')
          .getPublicUrl(fileName)
        mediaUrl = publicUrl
      }
    }

    const { error } = await supabase.from('events').insert([
      {
        user_id: session.user.id,
        title: title.trim(),
        description: description.trim(),
        event_date: eventDate || new Date().toISOString(),
        media_url: mediaUrl,
      }
    ])

    if (!error) {
      setTitle('')
      setDescription('')
      setEventDate('')
      setEventFile(null)
      setShowForm(false)
      supabase
        .from('events')
        .select('id, title, description, event_date, media_url, created_at, user_id, profiles(full_name, cadet_number)')
        .order('event_date', { ascending: false })
        .then(({ data, error: refetchErr }) => { if (!refetchErr) setEvents(data || []) })
    }
    setSubmitting(false)
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      day: 'numeric', month: 'long', year: 'numeric'
    })
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-100 tracking-wide">Memorable Events</h1>
          <p className="text-xs text-slate-500 font-mono mt-0.5">ACADEMY MILESTONES</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="tactical-btn flex items-center gap-2 text-xs"
        >
          {showForm ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {showForm ? 'Cancel' : 'New Event'}
        </button>
      </div>

      {/* New Event Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="tactical-card p-5 space-y-4 animate-fade-in">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-mono text-slate-400 tracking-wider uppercase">Record New Milestone</span>
          </div>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Event Title"
            required
            className="tactical-input font-medium"
          />

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe this memorable event in detail..."
            rows={4}
            className="tactical-input resize-none"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="date"
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="tactical-input pl-10"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 tactical-input cursor-pointer">
                <span className="text-slate-500 text-xs">Attach Photo</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setEventFile(e.target.files[0])}
                />
                {eventFile && (
                  <span className="text-xs text-emerald-400 ml-auto truncate">{eventFile.name}</span>
                )}
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="tactical-btn flex items-center gap-2 text-xs disabled:opacity-40"
            >
              {submitting ? 'Saving...' : 'Publish Event'}
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {events.length === 0 ? (
        <div className="tactical-card p-10 text-center">
          <Clock className="w-8 h-8 text-slate-700 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No events recorded yet.</p>
          <p className="text-xs text-slate-600 mt-1">Document your academy milestones here.</p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900" />

          <div className="space-y-5">
            {events.map((event) => {
              const isExpanded = expandedId === event.id
              return (
                <div key={event.id} className="relative pl-12 animate-slide-up">
                  {/* Timeline dot */}
                  <div className="absolute left-[13px] top-6 w-[13px] h-[13px] rounded-full bg-amber-500 border-[3px] border-slate-950 shadow-sm shadow-amber-500/30 z-10" />

                  {/* Card */}
                  <div
                    className={`tactical-card p-5 cursor-pointer transition-all duration-200 ${
                      isExpanded ? 'border-amber-500/30' : ''
                    }`}
                    onClick={() => setExpandedId(isExpanded ? null : event.id)}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-200 text-sm leading-snug">{event.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Calendar className="w-3 h-3 text-amber-500/70" />
                          <span className="text-[11px] font-mono text-amber-500/70">
                            {formatDate(event.event_date || event.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Author */}
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800/40">
                      <User className="w-3 h-3 text-slate-500" />
                      <span className="text-xs text-slate-400">
                        {event.profiles?.full_name || 'Unknown'}
                      </span>
                      <span className="text-[10px] font-mono text-slate-600">
                        #{event.profiles?.cadet_number || '---'}
                      </span>
                    </div>

                    {/* Description (truncated or full) */}
                    {event.description && (
                      <p className={`text-sm text-slate-300 leading-relaxed ${
                        !isExpanded ? 'line-clamp-2' : ''
                      }`}>
                        {event.description}
                      </p>
                    )}

                    {/* Media */}
                    {event.media_url && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-slate-800/60 bg-slate-950">
                        <img
                          src={event.media_url}
                          alt={event.title}
                          className="w-full max-h-64 object-contain"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Expand hint */}
                    {event.description && event.description.length > 120 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : event.id) }}
                        className="text-[11px] text-amber-500/70 hover:text-amber-400 mt-2 font-medium transition-colors"
                      >
                        {isExpanded ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
