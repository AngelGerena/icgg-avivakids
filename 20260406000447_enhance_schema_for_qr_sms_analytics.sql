import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Event } from '../lib/supabase';
import { ChevronLeft, ChevronRight, CalendarDays, List, MapPin, Clock, X } from 'lucide-react';

const CATEGORY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  'Actividad':   { bg: 'bg-kids-blue',   text: 'text-white', dot: 'bg-kids-blue'   },
  'Activity':    { bg: 'bg-kids-blue',   text: 'text-white', dot: 'bg-kids-blue'   },
  'Celebracion': { bg: 'bg-kids-yellow', text: 'text-gray-800', dot: 'bg-kids-yellow' },
  'Celebration': { bg: 'bg-kids-yellow', text: 'text-gray-800', dot: 'bg-kids-yellow' },
  'Retiro':      { bg: 'bg-kids-mint',   text: 'text-white', dot: 'bg-kids-mint'   },
  'Retreat':     { bg: 'bg-kids-mint',   text: 'text-white', dot: 'bg-kids-mint'   },
  'Especial':    { bg: 'bg-kids-coral',  text: 'text-white', dot: 'bg-kids-coral'  },
  'Special':     { bg: 'bg-kids-coral',  text: 'text-white', dot: 'bg-kids-coral'  },
};

const getCatStyle = (cat?: string) =>
  CATEGORY_STYLES[cat || ''] || { bg: 'bg-kids-purple', text: 'text-white', dot: 'bg-kids-purple' };

const MONTH_NAMES = {
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
};
const DAY_NAMES = {
  es: ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'],
  en: ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'],
};

export const Calendar = () => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [events, setEvents] = useState<Event[]>([]);
  const [view, setView] = useState<'month' | 'list'>('month');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase.from('events').select('*').order('date', { ascending: true });
      if (error) { console.error('Calendar fetch error:', error.message); return; }
      if (data) setEvents(data);
    } catch (err) { console.error('Calendar unexpected error:', err); }
  };

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  const dateStr = (day: number) =>
    `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;

  const eventsForDay = (day: number) => events.filter(e => e.date === dateStr(day));

  const upcomingEvents = events.filter(e => new Date(e.date + 'T12:00:00') >= new Date(today.setHours(0,0,0,0)));

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1));

  const monthLabel = MONTH_NAMES[language as 'es' | 'en']?.[month] ?? MONTH_NAMES.es[month];
  const dayLabels = DAY_NAMES[language as 'es' | 'en'] ?? DAY_NAMES.es;

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-kids-purple mb-4">
            {es ? 'Calendario de Eventos' : 'Event Calendar'}
          </h1>
          <p className="text-gray-500 font-semibold mb-6">
            {es ? 'Mantente al día con todo lo que ocurre en ICGG Aviva Kids' : 'Stay up to date with everything at ICGG Aviva Kids'}
          </p>
          {/* View toggle */}
          <div className="inline-flex bg-white rounded-bubbly shadow-lg border border-gray-200 p-1">
            {(['month', 'list'] as const).map(v => (
              <button key={v} onClick={() => { setView(v); setSelectedDay(null); }}
                className={`flex items-center gap-2 px-5 py-2 rounded-bubbly font-bold text-sm transition-all ${view === v ? 'bg-kids-purple text-white shadow-md' : 'text-gray-500 hover:text-kids-purple'}`}>
                {v === 'month' ? <><CalendarDays className="w-4 h-4" />{es ? 'Mes' : 'Month'}</> : <><List className="w-4 h-4" />{es ? 'Lista' : 'List'}</>}
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* MONTH VIEW */}
          {view === 'month' && (
            <motion.div key="month" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6">

              {/* Calendar grid */}
              <div className="lg:col-span-2 bg-white rounded-bubbly shadow-xl border border-gray-100 overflow-hidden">
                {/* Month nav */}
                <div className="bg-gradient-to-r from-kids-purple to-kids-blue p-4 flex items-center justify-between">
                  <button onClick={prevMonth} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h2 className="text-xl sm:text-2xl font-black text-white">{monthLabel} {year}</h2>
                  <button onClick={nextMonth} className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-100">
                  {dayLabels.map(d => (
                    <div key={d} className="text-center py-2 text-xs font-black text-gray-400 uppercase tracking-wide">{d}</div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {Array.from({ length: firstDay }).map((_, i) => (
                    <div key={`empty-${i}`} className="border-b border-r border-gray-50 min-h-[60px] sm:min-h-[80px]" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                    const dayEvts = eventsForDay(day);
                    const isSelected = selectedDay === day;
                    const isTod = isToday(day);
                    return (
                      <div key={day} onClick={() => setSelectedDay(isSelected ? null : day)}
                        className={`border-b border-r border-gray-100 min-h-[60px] sm:min-h-[80px] p-1 sm:p-2 cursor-pointer transition-all ${isSelected ? 'bg-kids-purple/10 border-kids-purple' : 'hover:bg-gray-50'}`}>
                        <div className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-black mb-1 ${isTod ? 'bg-kids-purple text-white' : isSelected ? 'bg-kids-purple/20 text-kids-purple' : 'text-gray-700'}`}>
                          {day}
                        </div>
                        <div className="space-y-0.5">
                          {dayEvts.slice(0, 2).map(evt => (
                            <div key={evt.id}
                              className={`text-xs font-bold px-1 py-0.5 rounded truncate ${getCatStyle(evt.category).bg} ${getCatStyle(evt.category).text}`}>
                              <span className="hidden sm:inline">{evt.title}</span>
                              <span className="sm:hidden">•</span>
                            </div>
                          ))}
                          {dayEvts.length > 2 && (
                            <div className="text-xs font-bold text-kids-purple">+{dayEvts.length - 2}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Side panel — selected day events or next events */}
              <div className="space-y-4">
                {selectedDay ? (
                  <div className="bg-white rounded-bubbly shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-kids-blue to-kids-mint p-4">
                      <h3 className="text-lg font-black text-white">
                        {selectedDay} {monthLabel}
                      </h3>
                      <p className="text-white/70 text-xs font-semibold">
                        {eventsForDay(selectedDay).length} {es ? 'evento(s)' : 'event(s)'}
                      </p>
                    </div>
                    <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                      {eventsForDay(selectedDay).length === 0 ? (
                        <p className="text-gray-400 font-semibold text-sm text-center py-6">
                          {es ? 'Sin eventos este día' : 'No events this day'}
                        </p>
                      ) : (
                        eventsForDay(selectedDay).map(evt => (
                          <motion.div key={evt.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                            className="rounded-bubbly overflow-hidden border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-all"
                            onClick={() => setSelectedEvent(evt)}>
                            {evt.flyer_url && (
                              <img src={evt.flyer_url} alt={evt.title} className="w-full h-36 object-cover" />
                            )}
                            <div className="p-3">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <h4 className="font-black text-gray-800 text-sm leading-tight">{evt.title}</h4>
                                {evt.category && (
                                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${getCatStyle(evt.category).bg} ${getCatStyle(evt.category).text}`}>
                                    {evt.category}
                                  </span>
                                )}
                              </div>
                              {evt.time && (
                                <div className="flex items-center gap-1 text-xs text-kids-purple font-bold mb-1">
                                  <Clock className="w-3 h-3" />{evt.time}
                                </div>
                              )}
                              {evt.location && (
                                <div className="flex items-center gap-1 text-xs text-kids-coral font-bold">
                                  <MapPin className="w-3 h-3" />{evt.location}
                                </div>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-bubbly shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-kids-yellow to-kids-coral p-4">
                      <h3 className="text-lg font-black text-white">{es ? 'Próximos Eventos' : 'Upcoming Events'}</h3>
                    </div>
                    <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                      {upcomingEvents.slice(0, 5).length === 0 ? (
                        <p className="text-gray-400 font-semibold text-sm text-center py-6">
                          {es ? 'No hay eventos próximos' : 'No upcoming events'}
                        </p>
                      ) : (
                        upcomingEvents.slice(0, 5).map(evt => (
                          <div key={evt.id} onClick={() => setSelectedEvent(evt)}
                            className="flex items-center gap-3 p-3 rounded-bubbly border border-gray-100 hover:border-kids-purple hover:shadow-md transition-all cursor-pointer">
                            <div className={`w-2 h-10 rounded-full flex-shrink-0 ${getCatStyle(evt.category).dot}`} />
                            {evt.flyer_url && (
                              <img src={evt.flyer_url} alt={evt.title} className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-black text-gray-800 text-sm truncate">{evt.title}</p>
                              <p className="text-xs text-gray-400 font-semibold">
                                {new Date(evt.date + 'T12:00:00').toLocaleDateString(es ? 'es-ES' : 'en-US', { month: 'short', day: 'numeric' })}
                                {evt.time && ` · ${evt.time}`}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* Legend */}
                <div className="bg-white rounded-bubbly p-4 shadow border border-gray-100">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-3">{es ? 'Categorías' : 'Categories'}</p>
                  <div className="space-y-2">
                    {Object.entries({ 'Actividad': 'bg-kids-blue', 'Celebracion': 'bg-kids-yellow', 'Retiro': 'bg-kids-mint', 'Especial': 'bg-kids-coral' }).map(([cat, color]) => (
                      <div key={cat} className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${color}`} />
                        <span className="text-xs font-semibold text-gray-600">{cat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-4">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-bubbly shadow-xl border border-gray-100">
                  <div className="text-5xl mb-4">📅</div>
                  <p className="text-xl font-bold text-gray-400">{es ? 'No hay eventos próximos' : 'No upcoming events'}</p>
                </div>
              ) : (
                upcomingEvents.map((evt, idx) => (
                  <motion.div key={evt.id}
                    initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => setSelectedEvent(evt)}
                    className="bg-white rounded-bubbly shadow-xl border border-gray-100 overflow-hidden cursor-pointer hover:shadow-2xl hover:scale-[1.01] transition-all">
                    <div className="flex flex-col sm:flex-row">
                      {/* Flyer */}
                      {evt.flyer_url ? (
                        <div className="sm:w-48 md:w-64 flex-shrink-0">
                          <img src={evt.flyer_url} alt={evt.title} className="w-full h-48 sm:h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`sm:w-16 flex-shrink-0 ${getCatStyle(evt.category).bg} flex items-center justify-center p-4 sm:p-0`}>
                          <div className={`sm:hidden text-white font-black text-sm`}>{evt.category}</div>
                        </div>
                      )}
                      {/* Info */}
                      <div className="flex-1 p-5 sm:p-6">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <h3 className="text-xl sm:text-2xl font-black text-gray-800">{evt.title}</h3>
                          {evt.category && (
                            <span className={`px-3 py-1 rounded-full text-sm font-black ${getCatStyle(evt.category).bg} ${getCatStyle(evt.category).text}`}>
                              {evt.category}
                            </span>
                          )}
                        </div>
                        {evt.description && <p className="text-gray-600 font-semibold mb-4 text-sm leading-relaxed">{evt.description}</p>}
                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center gap-2 text-kids-blue font-bold text-sm">
                            <CalendarDays className="w-4 h-4" />
                            {new Date(evt.date + 'T12:00:00').toLocaleDateString(es ? 'es-ES' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </div>
                          {evt.time && (
                            <div className="flex items-center gap-2 text-kids-purple font-bold text-sm">
                              <Clock className="w-4 h-4" />{evt.time}
                            </div>
                          )}
                          {evt.location && (
                            <div className="flex items-center gap-2 text-kids-coral font-bold text-sm">
                              <MapPin className="w-4 h-4" />{evt.location}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Event detail modal */}
      <AnimatePresence>
        {selectedEvent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedEvent(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-bubbly shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {selectedEvent.flyer_url && (
                <img src={selectedEvent.flyer_url} alt={selectedEvent.title} className="w-full max-h-72 object-cover rounded-t-bubbly" />
              )}
              <div className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h2 className="text-2xl font-black text-gray-800">{selectedEvent.title}</h2>
                  <button onClick={() => setSelectedEvent(null)} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition-colors">
                    <X className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                {selectedEvent.category && (
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-black mb-4 ${getCatStyle(selectedEvent.category).bg} ${getCatStyle(selectedEvent.category).text}`}>
                    {selectedEvent.category}
                  </span>
                )}
                {selectedEvent.description && <p className="text-gray-600 font-semibold mb-4 leading-relaxed">{selectedEvent.description}</p>}
                <div className="space-y-3 bg-gray-50 rounded-bubbly p-4">
                  <div className="flex items-center gap-3 font-bold text-kids-blue">
                    <CalendarDays className="w-5 h-5 flex-shrink-0" />
                    {new Date(selectedEvent.date + 'T12:00:00').toLocaleDateString(es ? 'es-ES' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  {selectedEvent.time && (
                    <div className="flex items-center gap-3 font-bold text-kids-purple">
                      <Clock className="w-5 h-5 flex-shrink-0" />{selectedEvent.time}
                    </div>
                  )}
                  {selectedEvent.location && (
                    <div className="flex items-center gap-3 font-bold text-kids-coral">
                      <MapPin className="w-5 h-5 flex-shrink-0" />{selectedEvent.location}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
