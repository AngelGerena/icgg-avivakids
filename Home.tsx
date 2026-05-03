import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Event } from '../lib/supabase';
import { Calendar as CalendarIcon, List, MapPin, Clock } from 'lucide-react';

export const Calendar = () => {
  const { t } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true });
      if (error) { console.error('Calendar fetch error:', error.message); return; }
      if (data) setEvents(data);
    } catch (err) {
      console.error('Calendar unexpected error:', err);
    }
  };

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'Actividad':
      case 'Activity':
        return 'kids-blue';
      case 'Celebracion':
      case 'Celebration':
        return 'kids-yellow';
      case 'Retiro':
      case 'Retreat':
        return 'kids-mint';
      case 'Especial':
      case 'Special':
        return 'kids-coral';
      default:
        return 'kids-purple';
    }
  };

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const getEventsForDay = (day: number) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const dateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    return events.filter((event) => event.date === dateStr);
  };

  const getUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return events.filter((event) => new Date(event.date + 'T12:00:00') >= today);
  };

  const monthNames = {
    es: [
      'Enero',
      'Febrero',
      'Marzo',
      'Abril',
      'Mayo',
      'Junio',
      'Julio',
      'Agosto',
      'Septiembre',
      'Octubre',
      'Noviembre',
      'Diciembre',
    ],
    en: [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
  };

  const dayNames = {
    es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-kids-purple mb-6">
            {t.calendar.title}
          </h1>

          <div className="flex justify-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('calendar')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-bubbly font-bold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-kids-blue text-white shadow-lg'
                  : 'bg-white text-kids-blue border-2 border-kids-blue'
              }`}
            >
              <CalendarIcon className="w-5 h-5" />
              <span>{t.calendar.calendarView}</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-bubbly font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-kids-blue text-white shadow-lg'
                  : 'bg-white text-kids-blue border-2 border-kids-blue'
              }`}
            >
              <List className="w-5 h-5" />
              <span>{t.calendar.listView}</span>
            </motion.button>
          </div>
        </motion.div>

        {viewMode === 'calendar' ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-bubbly p-8 shadow-2xl border border-gray-100"
          >
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
                  )
                }
                className="px-6 py-2 bg-kids-purple text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
              >
                ←
              </button>
              <h2 className="text-3xl font-black text-kids-purple">
                {
                  monthNames[language as 'es' | 'en'] ?? monthNames['es'][
                    currentMonth.getMonth()
                  ]
                }{' '}
                {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={() =>
                  setCurrentMonth(
                    new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1)
                  )
                }
                className="px-6 py-2 bg-kids-purple text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
              >
                →
              </button>
            </div>

            <div className="grid grid-cols-7 gap-2">
              {dayNames[language as 'es' | 'en'] ?? dayNames['es'].map((day) => (
                <div
                  key={day}
                  className="text-center font-black text-kids-blue py-2"
                >
                  {day}
                </div>
              ))}

              {getDaysInMonth().map((day, index) => {
                const dayEvents = day ? getEventsForDay(day) : [];
                return (
                  <div
                    key={index}
                    className={`min-h-24 p-2 rounded-lg border-2 ${
                      day
                        ? 'bg-white border-gray-200 hover:border-kids-blue hover:shadow-md transition-all cursor-pointer'
                        : 'bg-gray-50/50 border-transparent'
                    }`}
                  >
                    {day && (
                      <>
                        <div className="font-bold text-gray-700 mb-1">{day}</div>
                        {dayEvents.map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs font-semibold p-1 rounded mb-1 bg-${getCategoryColor(
                              event.category
                            )} text-white truncate`}
                            title={event.title}
                          >
                            {event.title}
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-3xl font-black text-kids-blue mb-4">
              {t.calendar.upcomingEvents}
            </h2>

            {getUpcomingEvents().length > 0 ? (
              getUpcomingEvents().map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100 border-l-8"
                  style={{
                    borderLeftColor: event.color || '#CE93D8',
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-gray-800 mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-gray-600 font-semibold mb-3">
                          {event.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center space-x-2 text-kids-blue font-bold">
                          <CalendarIcon className="w-4 h-4" />
                          <span>{new Date(event.date + 'T12:00:00').toLocaleDateString()}</span>
                        </div>
                        {event.time && (
                          <div className="flex items-center space-x-2 text-kids-purple font-bold">
                            <Clock className="w-4 h-4" />
                            <span>{event.time}</span>
                          </div>
                        )}
                        {event.location && (
                          <div className="flex items-center space-x-2 text-kids-coral font-bold">
                            <MapPin className="w-4 h-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.category && (
                      <div
                        className={`px-4 py-2 rounded-bubbly bg-${getCategoryColor(
                          event.category
                        )} text-white font-bold text-sm`}
                      >
                        {event.category}
                      </div>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-bubbly shadow-xl border border-gray-100">
                <p className="text-xl font-bold text-gray-500">
                  No hay eventos próximos
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
