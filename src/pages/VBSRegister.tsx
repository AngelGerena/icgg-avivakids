import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import { CheckCircle, Star, Fish, Waves } from 'lucide-react';

interface VBSSettings {
  theme: string;
  title: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
}

const VBS_THEMES: Record<string, { bg: string; accent: string; emoji: string[]; label: string }> = {
  'under-the-sea':  { bg: 'from-blue-400 via-cyan-400 to-teal-500',    accent: '#0891b2', emoji: ['🐠','🐙','🦈','🌊','⭐','🐚','🦀','🐟'], label: 'Under the Sea'       },
  'jungle-safari':  { bg: 'from-green-500 via-emerald-400 to-lime-400', accent: '#16a34a', emoji: ['🦁','🐘','🐒','🌿','🦜','🌺','🐆','🦒'], label: 'Jungle Safari'       },
  'outer-space':    { bg: 'from-purple-700 via-indigo-600 to-blue-800', accent: '#7c3aed', emoji: ['🚀','🪐','⭐','🌙','👨‍🚀','🌟','🛸','💫'], label: 'Outer Space'         },
  'super-heroes':   { bg: 'from-red-500 via-yellow-400 to-blue-500',    accent: '#dc2626', emoji: ['⚡','🦸','🛡️','💥','🌟','🔥','💪','🦸‍♀️'], label: 'Super Heroes'      },
  'dino-adventure': { bg: 'from-green-600 via-lime-500 to-yellow-500',  accent: '#65a30d', emoji: ['🦕','🦖','🌋','🥚','🌿','💎','🦴','🌄'], label: 'Dino Adventure'     },
  'wild-west':      { bg: 'from-yellow-600 via-orange-500 to-amber-400',accent: '#d97706', emoji: ['🤠','🌵','🐴','⭐','🎯','🌅','🪶','🐂'], label: 'Wild West'           },
  'kingdom-castle': { bg: 'from-purple-600 via-violet-500 to-yellow-400',accent: '#7c3aed',emoji: ['👑','🏰','🛡️','⚔️','💎','🌟','🦅','🗝️'], label: 'Kingdom & Castle'   },
  'tropical-fiesta':{ bg: 'from-pink-500 via-yellow-400 to-green-400',  accent: '#ec4899', emoji: ['🦜','🌺','🏝️','🌴','🎉','🦩','🌸','🎊'], label: 'Tropical Fiesta'   },
};

const GROUPS = [
  { value: 'estrellas',    label: 'Estrellas (4-5 años)'    },
  { value: 'exploradores', label: 'Exploradores (6-8 años)' },
  { value: 'aventureros',  label: 'Aventureros (9-11 años)' },
  { value: 'lideres',      label: 'Líderes (12+ años)'      },
];

const generateCode = () => 'VBS' + Math.floor(1000 + Math.random() * 9000).toString();

export const VBSRegister = () => {
  const { language } = useLanguage();
  const es = language === 'es';

  const [settings, setSettings] = useState<VBSSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [childCode, setChildCode] = useState('');
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    fullName: '', dob: '', age: '', grade: '', group: '',
    parentName: '', parentPhone: '', parentEmail: '', isFirstTime: false,
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('vbs_settings')
          .select('*')
          .order('year', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) {
          console.error('VBS settings error:', error.message);
        }
        if (data) {
          setSettings(data);
        }
      } catch (err) {
        console.error('VBS settings fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const theme = VBS_THEMES[settings?.theme || 'under-the-sea'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      let code = generateCode();
      // ensure unique
      let unique = false;
      while (!unique) {
        const { data } = await supabase.from('vbs_children').select('unique_code').eq('unique_code', code).maybeSingle();
        if (!data) unique = true;
        else code = generateCode();
      }

      const formattedDob = form.dob ? new Date(form.dob + 'T12:00:00').toISOString().split('T')[0] : null;

      const { error: insertError } = await supabase.from('vbs_children').insert({
        full_name: form.fullName.trim(),
        dob: formattedDob,
        age: form.age ? parseInt(form.age) : null,
        grade: form.grade.trim() || null,
        group_name: form.group || null,
        parent_name: form.parentName.trim(),
        parent_phone: form.parentPhone.trim(),
        parent_email: form.parentEmail.trim() || null,
        is_first_time: form.isFirstTime,
        registered_by: 'online',
        unique_code: code,
      });

      if (insertError) throw insertError;
      setChildCode(code);
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al registrar');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-black text-kids-purple animate-pulse">Cargando VBS...</div>
      </div>
    );
  }

  if (!settings || !settings.is_active) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center bg-white rounded-bubbly p-12 shadow-xl max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-3xl font-black text-kids-purple mb-3">VBS 2026</h2>
          <p className="text-gray-600 font-semibold">
            {es ? 'El registro de VBS abrirá pronto. ¡Mantente pendiente!' : 'VBS registration opens soon. Stay tuned!'}
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className={`min-h-screen bg-gradient-to-br ${theme.bg} flex items-center justify-center px-4 relative overflow-hidden`}>
        {theme.emoji.map((e, i) => (
          <motion.div key={i} className="absolute text-3xl pointer-events-none"
            style={{ left: `${5 + i * 12}%`, top: '-5%' }}
            animate={{ y: ['0vh', '110vh'], rotate: [0, 360], opacity: [1, 0.5, 0] }}
            transition={{ duration: 3 + i * 0.3, delay: i * 0.2, repeat: Infinity, repeatDelay: 2 }}
          >{e}</motion.div>
        ))}
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="bg-white rounded-bubbly p-10 shadow-2xl text-center max-w-sm relative z-10"
        >
          <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }}>
            <CheckCircle className="w-20 h-20 mx-auto mb-4" style={{ color: theme.accent }} />
          </motion.div>
          <h2 className="text-3xl font-black text-gray-800 mb-2">
            {es ? '¡Registro Exitoso!' : 'Registration Successful!'}
          </h2>
          <p className="text-gray-500 font-semibold mb-6">
            {es ? '¡Bienvenido a VBS 2026!' : 'Welcome to VBS 2026!'}
          </p>
          <div className="rounded-bubbly p-5 mb-6" style={{ background: `${theme.accent}15`, border: `2px solid ${theme.accent}` }}>
            <p className="text-sm font-bold text-gray-600 mb-1">
              {es ? 'Código de registro de tu hijo/a:' : "Your child's registration code:"}
            </p>
            <div className="text-4xl font-black" style={{ color: theme.accent }}>{childCode}</div>
            <p className="text-xs text-gray-400 font-semibold mt-2">
              {es ? 'Guarda este código — se usará para el check-in diario' : 'Save this code — used for daily check-in'}
            </p>
          </div>
          <button onClick={() => window.location.reload()}
            className="w-full py-3 font-black text-white rounded-bubbly"
            style={{ background: theme.accent }}
          >
            {es ? 'Registrar Otro Niño' : 'Register Another Child'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.bg} py-12 px-4`}>
      {/* Floating theme emojis */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {theme.emoji.slice(0, 5).map((e, i) => (
          <motion.div key={i} className="absolute text-4xl opacity-20"
            style={{ left: `${10 + i * 20}%`, top: `${15 + i * 15}%` }}
            animate={{ y: [-10, 10, -10], rotate: [-5, 5, -5] }}
            transition={{ duration: 3 + i, repeat: Infinity, ease: 'easeInOut' }}
          >{e}</motion.div>
        ))}
      </div>

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-3 text-4xl mb-3">
            {theme.emoji.slice(0, 4).map((e, i) => (
              <motion.span key={i} animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1.5, delay: i * 0.2, repeat: Infinity }}
              >{e}</motion.span>
            ))}
          </div>
          <h1 className="text-5xl font-black text-white drop-shadow-lg mb-2">{settings.title}</h1>
          <p className="text-white/90 font-bold text-lg">
            {es ? 'Formulario de Registro' : 'Registration Form'}
          </p>
          {settings.start_date && settings.end_date && (
            <p className="text-white/80 font-semibold mt-1">
              {new Date(settings.start_date + 'T12:00:00').toLocaleDateString(es ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric' })}
              {' — '}
              {new Date(settings.end_date + 'T12:00:00').toLocaleDateString(es ? 'es-ES' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-5">
            {/* Child info */}
            <div className="bg-white rounded-bubbly p-6 shadow-xl">
              <h3 className="text-lg font-black mb-4" style={{ color: theme.accent }}>
                {es ? '👦 Información del Niño/a' : '👦 Child Information'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">
                    {es ? 'Nombre completo' : 'Full name'} *
                  </label>
                  <input type="text" value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-200 focus:outline-none font-semibold"
                    style={{ '--tw-ring-color': theme.accent } as React.CSSProperties}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">{es ? 'Edad' : 'Age'} *</label>
                    <input type="number" min="3" max="18" value={form.age} onChange={e => setForm({...form, age: e.target.value})} required
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-200 focus:outline-none font-semibold" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-600 mb-1">{es ? 'Grado escolar' : 'Grade'}</label>
                    <input type="text" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}
                      placeholder={es ? 'ej. 3ro' : 'e.g. 3rd'}
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-200 focus:outline-none font-semibold" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">{es ? 'Fecha de nacimiento' : 'Date of birth'}</label>
                  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-bubbly overflow-hidden">
                    <div className="px-4 pt-2 pb-0">
                      <p className="text-xs font-black text-yellow-500 uppercase tracking-wide">
                        {es ? 'Fecha de nacimiento' : 'Date of birth'}
                      </p>
                    </div>
                    <input type="date" value={form.dob} onChange={e => setForm({...form, dob: e.target.value})}
                      className="w-full px-4 pb-3 pt-1 bg-transparent border-0 outline-none font-semibold" />
                  </div>
                </div>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-bubbly bg-gray-50">
                  <input type="checkbox" checked={form.isFirstTime} onChange={e => setForm({...form, isFirstTime: e.target.checked})}
                    className="w-5 h-5 rounded" />
                  <span className="font-semibold text-gray-700">
                    {es ? '¿Primera vez en VBS?' : 'First time at VBS?'}
                  </span>
                </label>
              </div>
            </div>

            {/* Parent info */}
            <div className="bg-white rounded-bubbly p-6 shadow-xl">
              <h3 className="text-lg font-black mb-4" style={{ color: theme.accent }}>
                {es ? '👨‍👩‍👧 Información del Padre/Madre' : '👨‍👩‍👧 Parent Information'}
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">
                    {es ? 'Nombre del padre/madre' : 'Parent name'} *
                  </label>
                  <input type="text" value={form.parentName} onChange={e => setForm({...form, parentName: e.target.value})} required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-200 focus:outline-none font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">
                    {es ? 'Teléfono' : 'Phone'} *
                  </label>
                  <input type="tel" value={form.parentPhone} onChange={e => setForm({...form, parentPhone: e.target.value})} required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-200 focus:outline-none font-semibold" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-600 mb-1">
                    {es ? 'Correo electrónico (opcional)' : 'Email (optional)'}
                  </label>
                  <input type="email" value={form.parentEmail} onChange={e => setForm({...form, parentEmail: e.target.value})}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-200 focus:outline-none font-semibold" />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border-2 border-red-300 rounded-bubbly p-4 text-red-700 font-bold text-center">
                {error}
              </div>
            )}

            <motion.button type="submit" disabled={submitting}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-5 text-white text-xl font-black rounded-bubbly shadow-xl disabled:opacity-50"
              style={{ background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)` }}
            >
              {submitting
                ? (es ? 'Registrando...' : 'Registering...')
                : (es ? `¡Registrarse en ${settings.title}!` : `Register for ${settings.title}!`)}
            </motion.button>
          </div>
        </form>
      </div>
    </div>
  );
};
