import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { User, Hash, Home as HomeIcon, ShieldCheck, Loader } from 'lucide-react';

const ROOMS: Record<string, string> = {
  babies: 'Bebés (0-2 años)',
  explorers: 'Exploradores (3-4 años)',
  adventurers: 'Principiantes/Primarios (5-8 años)',
  youth: 'Jóvenes (9-12 años)',
};

export const ChildProfile = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState<any>(null);
  const [parent, setParent] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setLoading(false);
        return;
      }
      const { data: c } = await supabase
        .from('children')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      setChild(c);
      if (c) {
        const { data: p } = await supabase
          .from('parents')
          .select('primary_name, approved_pickup_name')
          .eq('child_id', c.id)
          .maybeSingle();
        setParent(p);
      }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 text-kids-purple animate-spin" />
      </div>
    );
  }

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-bubbly shadow-xl p-10 text-center max-w-md">
          <User className="w-16 h-16 text-kids-purple/30 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-kids-purple mb-2">Perfil no encontrado</h1>
          <p className="text-gray-500 font-semibold">
            No pudimos encontrar este perfil. Verifica el código QR o consulta a un maestro.
          </p>
        </div>
      </div>
    );
  }

  const Row = ({ icon, label, value }: { icon: JSX.Element; label: string; value: string }) => (
    <div className="flex items-center gap-3 w-full bg-kids-purple/5 rounded-xl px-4 py-3">
      <div className="text-kids-purple flex-shrink-0">{icon}</div>
      <div className="min-w-0">
        <div className="text-xs font-black text-kids-purple uppercase">{label}</div>
        <div className="text-gray-800 font-bold truncate">{value}</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen py-10 px-4 flex items-start justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-bubbly shadow-2xl max-w-md w-full overflow-hidden border-4 border-kids-purple"
      >
        <div className="bg-gradient-to-r from-kids-yellow via-kids-blue to-kids-purple p-5 text-center">
          <h1 className="text-white font-black text-xl">Ministerio de Niños - Aviva Kids</h1>
        </div>

        <div className="p-8 flex flex-col items-center text-center">
          {child.photo_url ? (
            <img
              src={child.photo_url}
              alt={child.full_name}
              className="w-40 h-40 rounded-full object-cover border-4 border-kids-purple shadow-lg"
            />
          ) : (
            <div className="w-40 h-40 rounded-full bg-kids-purple/10 flex items-center justify-center border-4 border-dashed border-kids-purple/40">
              <User className="w-20 h-20 text-kids-purple/40" />
            </div>
          )}

          <h2 className="text-3xl font-black text-kids-purple mt-4">{child.full_name}</h2>
          {child.nickname && (
            <p className="text-gray-500 font-semibold italic">"{child.nickname}"</p>
          )}

          <div className="text-5xl font-black text-kids-blue my-4">{child.unique_number}</div>

          <div className="w-full space-y-3 mt-2">
            <Row
              icon={<HomeIcon className="w-5 h-5" />}
              label="Salón / Clase"
              value={ROOMS[child.room] || child.room || '-'}
            />
            <Row
              icon={<Hash className="w-5 h-5" />}
              label="Número del niño/a"
              value={child.unique_number}
            />
            {parent?.primary_name && (
              <Row
                icon={<User className="w-5 h-5" />}
                label="Padre / Tutor"
                value={parent.primary_name}
              />
            )}
            {parent?.approved_pickup_name && (
              <Row
                icon={<ShieldCheck className="w-5 h-5" />}
                label="Persona autorizada"
                value={parent.approved_pickup_name}
              />
            )}
          </div>

          <p className="text-xs text-gray-400 font-semibold mt-6">
            Para uso del ministerio infantil
          </p>
        </div>
      </motion.div>
    </div>
  );
};
