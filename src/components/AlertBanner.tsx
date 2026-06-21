import { useEffect, useRef, useState } from 'react';
import { supabase, Alert } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, User, Bell, Footprints } from 'lucide-react';

// Checkout confirmations auto-clear after this many ms. Classroom alerts persist
// until the parent responds and/or a teacher resolves them.
const AUTO_DISMISS_MS = 12000;

type ChildInfo = { photo_url?: string | null; full_name?: string | null };

// Pleasant Web Audio chime. 'alert' = attention (rising); 'success' = confirmation (major chord).
function playChime(type: 'alert' | 'success') {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const now = ctx.currentTime;
    const notes = type === 'success' ? [523.25, 659.25, 783.99] : [784, 988, 784];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.13;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.32, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.38);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => ctx.close().catch(() => {}), 1400);
  } catch {
    /* audio not available */
  }
}

export const AlertBanner = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [childInfo, setChildInfo] = useState<Record<string, ChildInfo>>({});
  const timersRef = useRef<Record<string, number>>({});
  // Remember each alert's last-seen acknowledged state so we can chime on changes.
  const seenRef = useRef<Record<string, boolean>>({});
  // Skip chimes on the very first load (alerts already present shouldn't replay sounds).
  const firstLoadRef = useRef(true);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('resolved', false)
        .order('triggered_at', { ascending: false });
      if (data) setActiveAlerts(data as Alert[]);
    };

    fetchActiveAlerts();

    const channel = supabase
      .channel('alerts-channel')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, () => {
        fetchActiveAlerts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      Object.values(timersRef.current).forEach((t) => clearTimeout(t));
      timersRef.current = {};
    };
  }, []);

  // Play sounds when a new alert arrives or when a parent acknowledges one.
  useEffect(() => {
    const first = firstLoadRef.current;
    activeAlerts.forEach((a) => {
      const wasSeen = a.id in seenRef.current;
      const wasAck = seenRef.current[a.id];
      const isAck = !!a.acknowledged;
      if (!first) {
        if (!wasSeen) {
          if (a.alert_type === 'checkout' || isAck) playChime('success');
          else playChime('alert');
        } else if (!wasAck && isAck) {
          playChime('success');
        }
      }
      seenRef.current[a.id] = isAck;
    });
    firstLoadRef.current = false;
  }, [activeAlerts]);

  // Pull the child's photo + name for classroom alerts so the banner can show them.
  useEffect(() => {
    const ids = activeAlerts
      .filter((a) => a.child_id && !childInfo[a.child_id])
      .map((a) => a.child_id as string);
    if (ids.length === 0) return;
    supabase
      .from('children')
      .select('id, full_name, photo_url')
      .in('id', ids)
      .then(({ data }) => {
        if (!data) return;
        setChildInfo((prev) => {
          const next = { ...prev };
          data.forEach((c: any) => {
            next[c.id] = { photo_url: c.photo_url, full_name: c.full_name };
          });
          return next;
        });
      });
  }, [activeAlerts]);

  // Only checkout confirmations auto-dismiss; classroom alerts stay until handled.
  useEffect(() => {
    activeAlerts.forEach((alert) => {
      if (alert.alert_type !== 'checkout') return;
      if (timersRef.current[alert.id] || dismissedIds.has(alert.id)) return;
      timersRef.current[alert.id] = window.setTimeout(() => {
        setDismissedIds((prev) => new Set(prev).add(alert.id));
        delete timersRef.current[alert.id];
      }, AUTO_DISMISS_MS);
    });
  }, [activeAlerts, dismissedIds]);

  const handleOnMyWay = async (alertId: string) => {
    setActiveAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
    playChime('success');
    try {
      await supabase.rpc('acknowledge_alert', { p_alert_id: alertId });
    } catch (e) {
      console.error('acknowledge error', e);
    }
  };

  const visibleAlerts = activeAlerts.filter((a) => !dismissedIds.has(a.id));

  return (
    <AnimatePresence>
      {visibleAlerts.length > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-0 right-0 z-40 px-4"
        >
          {visibleAlerts.map((alert) => {
            const info = alert.child_id ? childInfo[alert.child_id] : undefined;

            // Checkout confirmation: green card with the pickup person photo.
            if (alert.alert_type === 'checkout') {
              return (
                <motion.div
                  key={alert.id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-6 px-4 bg-green-600 shadow-2xl rounded-bubbly max-w-3xl mx-auto mb-3"
                >
                  <div className="flex flex-col md:flex-row items-center justify-center gap-5 text-center md:text-left">
                    {alert.pickup_photo_url ? (
                      <img
                        src={alert.pickup_photo_url}
                        alt={alert.pickup_name || 'Persona autorizada'}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white flex items-center justify-center flex-shrink-0">
                        <User className="w-12 h-12 text-white" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                        <CheckCircle className="w-7 h-7 text-white" />
                        <span className="text-white text-2xl md:text-3xl font-black">
                          Salida confirmada - #{alert.child_number}
                        </span>
                      </div>
                      <div className="text-white text-lg md:text-xl font-bold max-w-3xl">
                        {alert.reason}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            const acknowledged = !!alert.acknowledged;

            // Classroom alert: red until the parent taps "Voy en camino", then green.
            return (
              <motion.div
                key={alert.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex justify-center mb-3"
              >
                <motion.div
                  animate={
                    acknowledged
                      ? { boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }
                      : {
                          boxShadow: [
                            '0 0 0 0 rgba(255,107,107,0.55)',
                            '0 0 0 16px rgba(255,107,107,0)',
                          ],
                        }
                  }
                  transition={acknowledged ? { duration: 0.3 } : { duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  className={`bg-white rounded-bubbly shadow-2xl border-4 overflow-hidden w-full max-w-2xl ${
                    acknowledged ? 'border-kids-mint' : 'border-kids-coral'
                  }`}
                >
                  <div
                    className={`py-2 px-4 flex items-center justify-center gap-2 ${
                      acknowledged
                        ? 'bg-gradient-to-r from-kids-mint to-green-500'
                        : 'bg-gradient-to-r from-kids-yellow via-kids-coral to-kids-purple'
                    }`}
                  >
                    {acknowledged ? <CheckCircle className="w-5 h-5 text-white" /> : <Bell className="w-5 h-5 text-white" />}
                    <span className="text-white font-black tracking-wide text-sm md:text-base">
                      {acknowledged ? 'El padre/madre viene en camino' : 'Atencion - Ministerio de Ninos'}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                    {info?.photo_url ? (
                      <img
                        src={info.photo_url}
                        alt={info.full_name || 'Nino/a'}
                        className={`w-24 h-24 md:w-28 md:h-28 rounded-full object-cover border-4 shadow-lg flex-shrink-0 ${
                          acknowledged ? 'border-kids-mint' : 'border-kids-coral'
                        }`}
                      />
                    ) : (
                      <div
                        className={`w-24 h-24 md:w-28 md:h-28 rounded-full border-4 border-dashed flex items-center justify-center flex-shrink-0 ${
                          acknowledged ? 'bg-kids-mint/10 border-kids-mint/40' : 'bg-kids-coral/10 border-kids-coral/40'
                        }`}
                      >
                        <User className={`w-12 h-12 ${acknowledged ? 'text-kids-mint' : 'text-kids-coral'}`} />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className={`text-xs font-black uppercase tracking-wide ${acknowledged ? 'text-kids-mint' : 'text-kids-coral'}`}>
                        Numero del nino/a
                      </div>
                      <div className="text-6xl md:text-7xl font-black text-kids-purple leading-none">
                        {alert.child_number}
                      </div>
                      {info?.full_name && (
                        <div className="text-base font-bold text-gray-500 mt-1">{info.full_name}</div>
                      )}
                      <div className="text-xl md:text-2xl font-black text-gray-800 mt-2">{alert.reason}</div>

                      {acknowledged ? (
                        <div className="mt-3 inline-flex items-center gap-2 text-green-600 font-black">
                          <Footprints className="w-5 h-5" />
                          <span>Viene en camino</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleOnMyWay(alert.id)}
                          className="mt-3 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-kids-mint to-green-500 text-white rounded-bubbly font-black shadow-lg hover:scale-105 transition-transform"
                        >
                          <Footprints className="w-5 h-5" />
                          <span>Voy en camino</span>
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
