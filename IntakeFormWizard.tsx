import { useEffect, useState } from 'react';
import { supabase, Alert } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

export const AlertBanner = () => {
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchActiveAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from('alerts')
          .select('*')
          .eq('resolved', false)
          .order('triggered_at', { ascending: false });

        if (error) {
          console.error('AlertBanner fetch error:', error.message);
          return;
        }
        if (data) {
          setActiveAlerts(data);
        }
      } catch (err) {
        console.error('AlertBanner unexpected error:', err);
      }
    };

    fetchActiveAlerts();

    const channel = supabase
      .channel('alerts-channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'alerts',
        },
        () => {
          fetchActiveAlerts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AnimatePresence>
      {activeAlerts.length > 0 && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          className="fixed top-16 lg:top-24 left-0 right-0 z-40"
        >
          {activeAlerts.map((alert) => (
            <motion.div
              key={alert.id}
              animate={{
                backgroundColor: ['#DC2626', '#EF4444', '#DC2626'],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
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
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
