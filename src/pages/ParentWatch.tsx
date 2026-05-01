import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Bell, BellRing, Heart, Shield, Eye } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Alert {
  id: string;
  child_number: string;
  reason: string;
  triggered_at: string;
}

type Screen = 'login' | 'watching' | 'alert';

// Cute chime sound generated via Web Audio API — no file needed
const playChime = () => {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ctx.currentTime + i * 0.18;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.4, start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
      osc.start(start);
      osc.stop(start + 0.6);
    });
  } catch (e) {
    // Audio not available — fail silently
  }
};

export const ParentWatch = () => {
  const { language } = useLanguage();
  const [screen, setScreen] = useState<Screen>('login');
  const [childNumber, setChildNumber] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [childName, setChildName] = useState('');
  const [childId, setChildId] = useState('');
  const [activeAlert, setActiveAlert] = useState<Alert | null>(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [pulse, setPulse] = useState(false);
  const channelRef = useRef<any>(null);

  const es = language === 'es';

  // Cleanup realtime on unmount
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, []);

  const handleLogin = async () => {
    if (!childNumber.trim() || !parentEmail.trim()) {
      setLoginError(es ? 'Por favor complete ambos campos.' : 'Please fill in both fields.');
      return;
    }
    setLoginLoading(true);
    setLoginError('');

    try {
      // Verify child exists
      const { data: child, error: childError } = await supabase
        .from('children')
        .select('id, full_name, unique_number')
        .eq('unique_number', childNumber.trim())
        .maybeSingle();

      if (childError || !child) {
        setLoginError(es ? 'Número de niño no encontrado.' : 'Child number not found.');
        setLoginLoading(false);
        return;
      }

      // Verify parent email matches
      const { data: parent, error: parentError } = await supabase
        .from('parents')
        .select('primary_email')
        .eq('child_id', child.id)
        .maybeSingle();

      if (parentError || !parent) {
        setLoginError(es ? 'No se encontró información del padre/madre.' : 'Parent information not found.');
        setLoginLoading(false);
        return;
      }

      if (parent.primary_email.toLowerCase() !== parentEmail.trim().toLowerCase()) {
        setLoginError(es ? 'El correo no coincide con nuestros registros.' : 'Email does not match our records.');
        setLoginLoading(false);
        return;
      }

      setChildName(child.full_name.trim().split(' ')[0]);
      setChildId(child.id);

      // Subscribe to realtime alerts for this child number
      const channel = supabase
        .channel(`parent-watch-${child.unique_number}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'alerts',
            filter: `child_number=eq.${child.unique_number}`,
          },
          (payload) => {
            const incoming = payload.new as Alert;
            setActiveAlert(incoming);
            setScreen('alert');
            playChime();
          }
        )
        .subscribe();

      channelRef.current = channel;
      setScreen('watching');

      // Pulse the bell every 8 seconds to remind parent the page is live
      const pulseInterval = setInterval(() => setPulse(p => !p), 8000);
      return () => clearInterval(pulseInterval);

    } catch (err) {
      setLoginError(es ? 'Ocurrió un error. Intente de nuevo.' : 'An error occurred. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const dismissAlert = () => {
    setActiveAlert(null);
    setScreen('watching');
  };

  // Floating hearts animation helper
  const FloatingHeart = ({ delay, x }: { delay: number; x: number }) => (
    <motion.div
      className="absolute text-kids-coral text-2xl pointer-events-none"
      style={{ left: `${x}%`, bottom: '10%' }}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -300, opacity: 0 }}
      transition={{ duration: 3, delay, ease: 'easeOut', repeat: Infinity, repeatDelay: 5 }}
    >
      ♥
    </motion.div>
  );

  // LOGIN SCREEN
  if (screen === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <FloatingHeart delay={0} x={10} />
        <FloatingHeart delay={1.5} x={30} />
        <FloatingHeart delay={0.8} x={60} />
        <FloatingHeart delay={2.2} x={80} />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-bubbly p-10 shadow-2xl max-w-md w-full relative z-10"
        >
          <div className="text-center mb-8">
            <motion.div
              animate={{ rotate: [0, -15, 15, -15, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 3 }}
              className="flex justify-center mb-4"
            >
              <div className="bg-gradient-to-br from-kids-blue to-kids-purple rounded-full p-5 shadow-lg">
                <Bell className="w-12 h-12 text-white" />
              </div>
            </motion.div>
            <h1 className="text-3xl font-black text-kids-purple mb-2">
              {es ? 'Notificaciones de Padres' : 'Parent Notifications'}
            </h1>
            <p className="text-gray-500 font-semibold text-sm">
              {es
                ? 'Mantenga esta página abierta durante el servicio para recibir alertas de su hijo/a.'
                : 'Keep this page open during service to receive alerts about your child.'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">
                {es ? 'Número de 4 dígitos del niño/a' : "Child's 4-digit number"}
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={childNumber}
                onChange={(e) => { setChildNumber(e.target.value); setLoginError(''); }}
                placeholder="0001"
                className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-blue focus:border-kids-purple focus:outline-none text-2xl font-black text-center tracking-widest"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-600 mb-1">
                {es ? 'Su correo electrónico registrado' : 'Your registered email'}
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => { setParentEmail(e.target.value); setLoginError(''); }}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                placeholder={es ? 'correo@ejemplo.com' : 'email@example.com'}
                className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-coral focus:border-kids-purple focus:outline-none text-lg font-semibold"
              />
            </div>

            {loginError && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-red-500 font-bold text-sm text-center"
              >
                {loginError}
              </motion.p>
            )}

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogin}
              disabled={loginLoading}
              className="w-full py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white text-xl font-black rounded-bubbly shadow-lg disabled:opacity-50"
            >
              {loginLoading
                ? (es ? 'Verificando...' : 'Verifying...')
                : (es ? 'Activar Notificaciones' : 'Activate Notifications')}
            </motion.button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs font-semibold">
            <Shield className="w-4 h-4" />
            <span>{es ? 'Sus datos están seguros y protegidos.' : 'Your information is safe and secure.'}</span>
          </div>
        </motion.div>
      </div>
    );
  }

  // ALERT SCREEN
  if (screen === 'alert' && activeAlert) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden bg-gradient-to-br from-kids-coral via-kids-yellow to-kids-purple">
        {/* Attention-grabbing pulsing rings */}
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-8 border-white/30"
            style={{ width: i * 200, height: i * 200 }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="bg-white rounded-bubbly p-10 shadow-2xl max-w-sm w-full text-center relative z-10"
        >
          <motion.div
            animate={{ rotate: [-15, 15, -15, 15, 0], scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1.5 }}
            className="flex justify-center mb-6"
          >
            <div className="bg-gradient-to-br from-kids-coral to-kids-yellow rounded-full p-5 shadow-xl">
              <BellRing className="w-16 h-16 text-white" />
            </div>
          </motion.div>

          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <h1 className="text-4xl font-black text-kids-purple mb-2">
              {es ? '¡Atención!' : 'Attention!'}
            </h1>
            <p className="text-gray-500 font-bold mb-6 text-sm">
              {es ? 'Por favor diríjase al salón de clases' : 'Please come to the classroom'}
            </p>
          </motion.div>

          {/* Child number big display */}
          <div className="bg-gradient-to-br from-kids-blue/10 to-kids-purple/10 rounded-bubbly p-6 mb-6 border-4 border-kids-purple">
            <p className="text-sm font-bold text-gray-500 mb-1">
              {es ? 'Niño/a' : 'Child'}
            </p>
            <div className="text-6xl font-black text-kids-purple mb-1 tracking-widest">
              {activeAlert.child_number}
            </div>
            <div className="text-2xl font-black text-kids-blue">
              {childName}
            </div>
          </div>

          {/* Reason */}
          <div className="bg-kids-yellow/20 rounded-bubbly px-4 py-3 mb-6">
            <p className="text-sm font-bold text-gray-600">
              {activeAlert.reason}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={dismissAlert}
            className="w-full py-4 bg-gradient-to-r from-kids-mint to-kids-blue text-white text-xl font-black rounded-bubbly shadow-lg"
          >
            {es ? 'Entendido — Voy en camino' : 'Got it — On my way'}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // WATCHING SCREEN
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <FloatingHeart delay={0} x={8} />
      <FloatingHeart delay={2} x={25} />
      <FloatingHeart delay={1} x={70} />
      <FloatingHeart delay={3} x={88} />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-bubbly p-10 shadow-2xl max-w-sm w-full text-center relative z-10"
      >
        {/* Live indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            animate={{ scale: [1, 1.5, 1], opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-3 h-3 rounded-full bg-green-500"
          />
          <span className="text-green-600 font-black text-sm uppercase tracking-wider">
            {es ? 'En vivo' : 'Live'}
          </span>
        </div>

        {/* Animated bell */}
        <motion.div
          animate={pulse
            ? { rotate: [-20, 20, -20, 20, 0], scale: [1, 1.15, 1] }
            : { rotate: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="flex justify-center mb-6"
        >
          <div className="bg-gradient-to-br from-kids-blue to-kids-purple rounded-full p-6 shadow-xl">
            <Bell className="w-16 h-16 text-white" />
          </div>
        </motion.div>

        <h2 className="text-3xl font-black text-kids-purple mb-3">
          {es ? `Hola, papá/mamá de ${childName}` : `Hi, ${childName}'s parent`}
        </h2>

        <p className="text-gray-500 font-semibold mb-8 text-sm leading-relaxed">
          {es
            ? 'Estamos cuidando de su hijo/a. Si le necesitamos, esta pantalla se iluminará con una alerta. Mantenga esta página abierta durante el servicio.'
            : 'We are caring for your child. If we need you, this screen will light up with an alert. Keep this page open during service.'}
        </p>

        {/* Reassurance icons */}
        <div className="flex justify-center gap-6 mb-8">
          <div className="flex flex-col items-center gap-1">
            <div className="bg-kids-mint/20 rounded-full p-3">
              <Shield className="w-6 h-6 text-kids-mint" />
            </div>
            <span className="text-xs font-bold text-gray-400">{es ? 'Seguro' : 'Safe'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-kids-coral/20 rounded-full p-3">
              <Heart className="w-6 h-6 text-kids-coral" />
            </div>
            <span className="text-xs font-bold text-gray-400">{es ? 'Amado' : 'Loved'}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="bg-kids-blue/20 rounded-full p-3">
              <Eye className="w-6 h-6 text-kids-blue" />
            </div>
            <span className="text-xs font-bold text-gray-400">{es ? 'Cuidado' : 'Watched'}</span>
          </div>
        </div>

        <button
          onClick={() => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            setScreen('login');
            setChildNumber('');
            setParentEmail('');
            setChildName('');
            setActiveAlert(null);
          }}
          className="text-xs text-gray-300 font-semibold hover:text-gray-400 transition-colors underline"
        >
          {es ? 'Cerrar sesión' : 'Sign out'}
        </button>
      </motion.div>
    </div>
  );
};
