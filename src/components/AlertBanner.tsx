import { useEffect, useRef, useState } from 'react';
import { supabase, Alert } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, User } from 'lucide-react';

// Notifications on the alert panel auto-clear after this many milliseconds (10-15s window).
const AUTO_DISMISS_MS = 12000;

export const AlertBanner = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  // Track which alert ids already have a running auto-dismiss timer so we never double-schedule.
  const timersRef = useRef<Record<string, number>>({});

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('resolved', false)
        .order('triggered_at', { ascending: false });

      if (data) {
        setActiveAlerts(data as Alert[]);
      }
    };

    fetchActiveAlerts();

    const channel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'alerts' },
        () => {
          fetchActiveAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      Object.values(timersRef.current).forEach((t) => clearTimeout(t));
      timersRef.current = {};
    };
  }, []);

  // Schedule a one-time auto-dismiss for every alert we are currently showing.
  useEffect(() => {
    activeAlerts.forEach((alert) => {
      if (timersRef.current[alert.id] || dismissedIds.has(alert.id)) return;
      timersRef.current[alert.id] = window.setTimeout(() => {
        setDismissedIds((prev) => {
          const next = new Set(prev);
          next.add(alert.id);
          return next;
        });
        delete timersRef.current[alert.id];
      }, AUTO_DISMISS_MS);
    });
  }, [activeAlerts, dismissedIds]);

  const visibleAlerts = activeAlerts.filter((a) => !dismissedIds.has(a.id));

  return (
    <AnimatePresence>
      {visibleAlerts.length > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-20 left-0 right-0 z-40"
        >
          {visibleAlerts.map((alert) =>
            alert.alert_type === 'checkout' ? (
              // Checkout confirmation: friendly green card with the pickup person photo.
              <motion.div
                key={alert.id}
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0 }}
                className="py-6 px-4 bg-green-600 shadow-2xl"
              >
                <div className="container mx-auto">
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
                </div>
              </motion.div>
            ) : (
              // Emergency / pickup-request: high-visibility flashing banner with the child number.
              <motion.div
                key={alert.id}
                animate={{ backgroundColor: ['#DC2626', '#EF4444', '#DC2626'] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                className="py-8 px-4 shadow-2xl"
              >
                <div className="container mx-auto">
                  <div className="flex items-center justify-center space-x-6">
                    <AlertCircle className="w-16 h-16 text-white animate-pulse" />
                    <div className="text-center">
                      <div className="text-8xl font-black text-white mb-2">
                        {alert.child_number}
                      </div>
                      <div className="text-2xl font-bold text-white">
                        {alert.reason}
                      </div>
                    </div>
                    <AlertCircle className="w-16 h-16 text-white animate-pulse" />
                  </div>
                </div>
              </motion.div>
            )
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
