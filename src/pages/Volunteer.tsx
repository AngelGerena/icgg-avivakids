import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Event } from '../lib/supabase';
import {
  ChevronLeft,
  ChevronRight,
  HandHeart,
  Sun,
  Moon,
  Sparkles,
  X,
  User,
  Mail,
  Phone,
  Loader2,
  CheckCircle2,
  Users,
  CalendarDays,
} from 'lucide-react';

type SlotType = 'sunday' | 'thursday' | 'event';

interface Slot {
  key: string;
  type: SlotType;
  label: string;
  eventId: string | null;
  time?: string;
}

const MONTH_NAMES = {
  es: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};
const DAY_NAMES = {
  es: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
};

const pad = (n: number) => n.toString().padStart(2, '0');
const toDateStr = (y: number, m: number, d: number) => `${y}-${pad(m + 1)}-${pad(d)}`;

const formatPhone = (raw: string) => {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const formatTime = (t?: string) => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  if (Number.isNaN(h)) return t;
  const suffix = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${pad(m || 0)} ${suffix}`;
};

export const Volunteer = () => {
  const { language } = useLanguage();
  const es = language === 'es';

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const [events, setEvents] = useState<Event[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedSlotKey, setSelectedSlotKey] = useState<string>('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [success, setSuccess] = useState(false);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const now = new Date();
  const todayStr = toDateStr(now.getFullYear(), now.getMonth(), now.getDate());
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('*')
          .gte('date', todayStr)
          .order('date', { ascending: true });
        if (error) {
          console.error('Volunteer events fetch error:', error.message);
          return;
        }
        if (data) setEvents(data);
      } catch (err) {
        console.error('Volunteer events unexpected error:', err);
      }
    };
    fetchEvents();
  }, [todayStr]);

  const fetchCounts = async () => {
    try {
      const start = toDateStr(year, month, 1);
      const end = toDateStr(year, month, daysInMonth);
      const { data, error } = await supabase.rpc('volunteer_counts', { start_date: start, end_date: end });
      if (error) {
        console.error('Volunteer counts error:', error.message);
        return;
      }
      const map: Record<string, number> = {};
      (data || []).forEach((row: { volunteer_date: string; total: number }) => {
        map[row.volunteer_date] = Number(row.total) || 0;
      });
      setCounts(map);
    } catch (err) {
      console.error('Volunteer counts unexpected error:', err);
    }
  };

  useEffect(() => {
    fetchCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month]);

  const slotsForDate = (dateStr: string): Slot[] => {
    const weekday = new Date(dateStr + 'T12:00:00').getDay();
    const slots: Slot[] = [];
    if (weekday === 0) {
      slots.push({
        key: 'sunday',
        type: 'sunday',
        label: es ? 'Escuela Dominical' : 'Sunday School',
        eventId: null,
      });
    }
    if (weekday === 4) {
      slots.push({
        key: 'thursday',
        type: 'thursday',
        label: es ? 'Servicio del Jueves' : 'Thursday Service',
        eventId: null,
      });
    }
    events
      .filter((e) => e.date === dateStr)
      .forEach((e) =>
        slots.push({
          key: `event-${e.id}`,
          type: 'event',
          label: e.title,
          eventId: e.id,
          time: e.time,
        })
      );
    return slots;
  };

  const selectedSlots = useMemo(
    () => (selectedDate ? slotsForDate(selectedDate) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedDate, events, es]
  );
  const activeSlot = selectedSlots.find((s) => s.key === selectedSlotKey) || selectedSlots[0];

  const openDay = (dateStr: string) => {
    const slots = slotsForDate(dateStr);
    if (dateStr < todayStr || slots.length === 0) return;
    setSelectedDate(dateStr);
    setSelectedSlotKey(slots[0].key);
    setFormError('');
    setSuccess(false);
  };

  const closeModal = () => {
    setSelectedDate(null);
    setSuccess(false);
    setFormError('');
    setSubmitting(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !activeSlot) return;
    setFormError('');

    const name = fullName.trim();
    const mail = email.trim().toLowerCase();
    const phoneDigits = phone.replace(/\D/g, '');

    if (name.length < 2) {
      setFormError(es ? 'Por favor escriba su nombre completo.' : 'Please enter your full name.');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail)) {
      setFormError(es ? 'Por favor escriba un correo electrónico válido.' : 'Please enter a valid email address.');
      return;
    }
    if (phoneDigits.length !== 10) {
      setFormError(es ? 'Por favor escriba un número de teléfono de 10 dígitos.' : 'Please enter a 10-digit phone number.');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('volunteer_signups').insert({
        volunteer_date: selectedDate,
        slot_type: activeSlot.type,
        event_id: activeSlot.eventId,
        slot_label: activeSlot.label,
        full_name: name,
        email: mail,
        phone: formatPhone(phoneDigits),
      });

      if (error) {
        if (error.code === '23505') {
          setFormError(
            es
              ? 'Ya está anotado(a) para este día. ¡Gracias por su disposición!'
              : "You're already signed up for this day. Thank you for your willingness!"
          );
        } else {
          console.error('Volunteer signup error:', error.message);
          setFormError(
            es
              ? 'No pudimos guardar su registro. Por favor intente de nuevo.'
              : "We couldn't save your sign-up. Please try again."
          );
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubmitting(false);
      fetchCounts();
      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.6 },
          colors: ['#FFD000', '#4FC3F7', '#FF6B6B', '#00C9A7', '#9B59B6'],
          zIndex: 2000,
        });
      } catch (_e) {
        /* confetti is decorative only */
      }
    } catch (err) {
      console.error('Volunteer signup unexpected error:', err);
      setFormError(es ? 'Ocurrió un error inesperado. Intente de nuevo.' : 'Something went wrong. Please try again.');
      setSubmitting(false);
    }
  };

  const prettyDate = (dateStr: string) => {
    const s = new Date(dateStr + 'T12:00:00').toLocaleDateString(es ? 'es-ES' : 'en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const monthLabel = MONTH_NAMES[es ? 'es' : 'en'][month];
  const dayLabels = DAY_NAMES[es ? 'es' : 'en'];

  return (
    <div className="min-h-screen py-6 px-3 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-bubbly bg-gradient-to-br from-kids-coral via-kids-purple to-kids-blue p-8 sm:p-12 text-center text-white shadow-2xl mb-8"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-kids-yellow/40 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-48 h-48 bg-kids-mint/40 rounded-full blur-2xl" />
          <div className="relative z-10">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm">
              <HandHeart className="w-11 h-11 text-white" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-4 drop-shadow-lg">
              {es ? 'Padres Voluntarios' : 'Parent Volunteers'}
            </h1>
            <p className="text-lg sm:text-xl font-bold max-w-3xl mx-auto leading-relaxed drop-shadow">
              {es
                ? 'Si su hijo asiste a la Escuela Dominical, le invitamos a tomar turnos para servir. Más manos significan más amor, más atención y más apoyo para nuestros maestros.'
                : 'If your child attends Sunday School, we invite you to take turns serving. More hands mean more love, more attention, and more support for our teachers.'}
            </p>
            <p className="mt-4 text-base sm:text-lg font-semibold text-white/90">
              {es ? 'Toque un día en el calendario para anotarse.' : 'Tap a day on the calendar to sign up.'}
            </p>
          </div>
        </motion.div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-3 mb-6">
          <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border-2 border-kids-coral font-bold text-gray-700 text-sm">
            <Sun className="w-4 h-4 text-kids-coral" />
            {es ? 'Domingos' : 'Sundays'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border-2 border-kids-blue font-bold text-gray-700 text-sm">
            <Moon className="w-4 h-4 text-kids-blue" />
            {es ? 'Jueves' : 'Thursdays'}
          </span>
          <span className="inline-flex items-center gap-2 bg-white rounded-full px-4 py-2 shadow border-2 border-kids-yellow font-bold text-gray-700 text-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            {es ? 'Eventos Especiales' : 'Special Events'}
          </span>
        </div>

        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="avk-panel rounded-bubbly overflow-hidden"
        >
          <div className="bg-[#1B2452]/60 border-b border-white/10 p-4 flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(new Date(year, month - 1, 1))}
              disabled={isCurrentMonth}
              aria-label={es ? 'Mes anterior' : 'Previous month'}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed rounded-full flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {monthLabel} {year}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(year, month + 1, 1))}
              aria-label={es ? 'Mes siguiente' : 'Next month'}
              className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 bg-black/15 border-b border-white/10">
            {dayLabels.map((d, i) => (
              <div
                key={d}
                className={`text-center py-2 text-xs sm:text-sm font-black uppercase tracking-wide ${
                  i === 0 ? 'text-kids-coral' : i === 4 ? 'text-kids-blue' : 'text-white/60'
                }`}
              >
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {Array.from({ length: firstDay }).map((_, i) => (
              <div key={`empty-${i}`} className="border-b border-r border-white/5 min-h-[72px] sm:min-h-[104px]" />
            ))}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const ds = toDateStr(year, month, day);
              const slots = slotsForDate(ds);
              const isPast = ds < todayStr;
              const isOpen = !isPast && slots.length > 0;
              const isTod = ds === todayStr;
              const hasSunday = slots.some((s) => s.type === 'sunday');
              const hasThursday = slots.some((s) => s.type === 'thursday');
              const eventSlots = slots.filter((s) => s.type === 'event');
              const helpers = counts[ds] || 0;

              const openBg = hasSunday
                ? 'bg-kids-coral/25 hover:bg-kids-coral/40'
                : hasThursday
                ? 'bg-kids-blue/25 hover:bg-kids-blue/40'
                : 'bg-kids-yellow/20 hover:bg-kids-yellow/35';

              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => openDay(ds)}
                  disabled={!isOpen}
                  className={`relative text-left border-b border-r border-white/10 min-h-[72px] sm:min-h-[104px] p-1 sm:p-2 transition-all ${
                    isOpen ? `${openBg} cursor-pointer hover:scale-[1.03] hover:z-10 hover:shadow-lg` : 'cursor-default'
                  } ${isPast ? 'opacity-40' : ''}`}
                >
                  <div
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-sm font-black mb-1 ${
                      isTod ? 'bg-kids-yellow text-[#1B2452]' : isOpen ? 'text-white' : 'text-white/45'
                    }`}
                  >
                    {day}
                  </div>

                  {isOpen && (
                    <div className="space-y-1">
                      {hasSunday && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-white bg-kids-coral rounded-full px-1.5 py-0.5 truncate">
                          <Sun className="w-3 h-3 flex-shrink-0" />
                          <span className="hidden sm:inline truncate">{es ? 'Domingo' : 'Sunday'}</span>
                        </div>
                      )}
                      {hasThursday && (
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-white bg-kids-blue rounded-full px-1.5 py-0.5 truncate">
                          <Moon className="w-3 h-3 flex-shrink-0" />
                          <span className="hidden sm:inline truncate">{es ? 'Jueves' : 'Thursday'}</span>
                        </div>
                      )}
                      {eventSlots.slice(0, 1).map((s) => (
                        <div
                          key={s.key}
                          className="flex items-center gap-1 text-[10px] sm:text-xs font-black text-gray-800 bg-kids-yellow rounded-full px-1.5 py-0.5 truncate"
                        >
                          <Sparkles className="w-3 h-3 flex-shrink-0" />
                          <span className="hidden sm:inline truncate">{s.label}</span>
                        </div>
                      ))}
                      {eventSlots.length > 1 && (
                        <div className="text-[10px] sm:text-xs font-bold text-kids-yellow">+{eventSlots.length - 1}</div>
                      )}
                    </div>
                  )}

                  {isOpen && helpers > 0 && (
                    <div
                      className="absolute top-1 right-1 flex items-center gap-0.5 bg-kids-mint text-white text-[10px] sm:text-xs font-black rounded-full px-1.5 py-0.5 shadow"
                      title={es ? `${helpers} voluntario(s)` : `${helpers} volunteer(s)`}
                    >
                      <Users className="w-3 h-3" />
                      {helpers}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        <p className="text-center text-[#2A1E57]/80 font-bold text-sm mt-4 flex items-center justify-center gap-2">
          <Users className="w-4 h-4 text-kids-mint" />
          {es ? 'El número verde muestra cuántos padres ya se anotaron ese día.' : 'The green number shows how many parents have already signed up that day.'}
        </p>
      </div>

      {/* Sign-up modal */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[150] flex items-center justify-center p-4"
            onClick={closeModal}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-bubbly shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
            >
              {!success ? (
                <>
                  <div className="relative bg-gradient-to-r from-kids-coral via-kids-purple to-kids-blue p-6 text-white rounded-t-bubbly">
                    <button
                      onClick={closeModal}
                      aria-label={es ? 'Cerrar' : 'Close'}
                      className="absolute top-4 right-4 w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                    <HandHeart className="w-10 h-10 mb-2" />
                    <h2 className="text-2xl font-black leading-tight">{es ? '¡Quiero Ayudar!' : 'I Want to Help!'}</h2>
                    <p className="text-white/90 font-semibold mt-1 flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 flex-shrink-0" />
                      {prettyDate(selectedDate)}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {selectedSlots.length > 1 ? (
                      <div>
                        <p className="text-sm font-black text-gray-700 mb-2">
                          {es ? '¿Dónde le gustaría servir?' : 'Where would you like to serve?'}
                        </p>
                        <div className="space-y-2">
                          {selectedSlots.map((s) => (
                            <label
                              key={s.key}
                              className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                                activeSlot?.key === s.key ? 'border-kids-purple bg-kids-purple/10' : 'border-gray-200 hover:border-kids-purple/50'
                              }`}
                            >
                              <input
                                type="radio"
                                name="slot"
                                value={s.key}
                                checked={activeSlot?.key === s.key}
                                onChange={() => setSelectedSlotKey(s.key)}
                                className="accent-kids-purple w-4 h-4"
                              />
                              <span className="font-bold text-gray-800">
                                {s.label}
                                {s.time && <span className="text-gray-500 font-semibold"> · {formatTime(s.time)}</span>}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ) : (
                      activeSlot && (
                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-kids-purple/10 border-2 border-kids-purple/30">
                          {activeSlot.type === 'sunday' ? (
                            <Sun className="w-5 h-5 text-kids-coral" />
                          ) : activeSlot.type === 'thursday' ? (
                            <Moon className="w-5 h-5 text-kids-blue" />
                          ) : (
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                          )}
                          <span className="font-black text-gray-800">
                            {activeSlot.label}
                            {activeSlot.time && <span className="text-gray-500 font-semibold"> · {formatTime(activeSlot.time)}</span>}
                          </span>
                        </div>
                      )
                    )}

                    <label className="block">
                      <span className="text-sm font-black text-gray-700">{es ? 'Nombre completo' : 'Full name'}</span>
                      <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-200 focus-within:border-kids-purple transition-colors">
                        <User className="w-5 h-5 text-kids-purple flex-shrink-0" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          autoComplete="name"
                          required
                          placeholder={es ? 'Ej. María Rodríguez' : 'e.g. Maria Rodriguez'}
                          className="w-full outline-none font-semibold text-gray-800 text-base bg-transparent"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-sm font-black text-gray-700">{es ? 'Correo electrónico' : 'Email'}</span>
                      <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-200 focus-within:border-kids-purple transition-colors">
                        <Mail className="w-5 h-5 text-kids-blue flex-shrink-0" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          autoComplete="email"
                          inputMode="email"
                          required
                          placeholder="nombre@correo.com"
                          className="w-full outline-none font-semibold text-gray-800 text-base bg-transparent"
                        />
                      </div>
                    </label>

                    <label className="block">
                      <span className="text-sm font-black text-gray-700">{es ? 'Teléfono' : 'Phone number'}</span>
                      <div className="mt-1 flex items-center gap-2 px-4 py-3 rounded-2xl border-2 border-gray-200 focus-within:border-kids-purple transition-colors">
                        <Phone className="w-5 h-5 text-kids-coral flex-shrink-0" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(formatPhone(e.target.value))}
                          autoComplete="tel"
                          inputMode="tel"
                          required
                          placeholder="(407) 555-1234"
                          className="w-full outline-none font-semibold text-gray-800 text-base bg-transparent"
                        />
                      </div>
                    </label>

                    {formError && (
                      <p className="text-sm font-bold text-kids-coral bg-kids-coral/10 rounded-2xl px-4 py-3">{formError}</p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-kids-coral via-kids-purple to-kids-blue text-white text-lg font-black rounded-bubbly shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:hover:scale-100 transition-all"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {es ? 'Guardando...' : 'Saving...'}
                        </>
                      ) : (
                        <>
                          <HandHeart className="w-5 h-5" />
                          {es ? 'Anotarme como Voluntario' : 'Sign Me Up to Volunteer'}
                        </>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="p-8 text-center">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 220, damping: 12 }}
                    className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-kids-mint to-kids-blue rounded-full shadow-xl mb-5"
                  >
                    <CheckCircle2 className="w-14 h-14 text-white" />
                  </motion.div>
                  <h2 className="text-3xl font-black text-kids-purple mb-3">
                    {es ? `¡Gracias, ${fullName.trim().split(' ')[0]}!` : `Thank you, ${fullName.trim().split(' ')[0]}!`}
                  </h2>
                  <p className="text-gray-700 font-semibold leading-relaxed mb-2">
                    {es
                      ? 'Gracias por dar un paso al frente y servir junto a nuestros maestros. Su tiempo y su amor hacen una diferencia real en la vida de cada niño.'
                      : 'Thank you for stepping up to serve alongside our teachers. Your time and your love make a real difference in the life of every child.'}
                  </p>
                  <p className="text-gray-600 font-semibold mb-5">
                    {activeSlot?.label} · {prettyDate(selectedDate)}
                  </p>
                  <div className="bg-gradient-to-br from-kids-yellow/20 to-kids-coral/10 border-2 border-kids-yellow/50 rounded-2xl p-4 mb-6">
                    <p className="text-gray-800 font-bold italic leading-relaxed">
                      {es
                        ? '"Dejad a los niños venir a mí, y no se lo impidáis; porque de los tales es el reino de Dios."'
                        : '"Let the little children come to me, and do not hinder them, for the kingdom of God belongs to such as these."'}
                    </p>
                    <p className="text-kids-purple font-black text-sm mt-2">{es ? 'Marcos 10:14' : 'Mark 10:14'}</p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="px-10 py-3 bg-kids-purple text-white text-lg font-black rounded-bubbly shadow-lg hover:scale-105 active:scale-95 transition-transform"
                  >
                    {es ? 'Cerrar' : 'Close'}
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
