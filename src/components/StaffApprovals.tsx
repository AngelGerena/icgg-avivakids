import { useEffect, useState } from 'react';
import { UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Pending = { id: string; email: string; created_at: string };

// New teacher-portal accounts wait here until an existing teacher approves them.
// Shows nothing when there is no one waiting.
export const StaffApprovals = () => {
  const [pending, setPending] = useState<Pending[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabase.rpc('kids_pending_staff');
    if (!error && Array.isArray(data)) setPending(data as Pending[]);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (p: Pending) => {
    if (!window.confirm(`¿Dar acceso de maestro/a a ${p.email}? Podrá ver a todos los niños y sus formularios.`)) return;
    setBusyId(p.id);
    const { error } = await supabase.rpc('kids_approve_staff', { p_user: p.id });
    setBusyId(null);
    if (error) {
      alert('No se pudo aprobar. Intenta de nuevo.');
      return;
    }
    setPending((prev) => prev.filter((x) => x.id !== p.id));
  };

  if (pending.length === 0) return null;

  return (
    <div className="bg-white rounded-bubbly shadow-xl p-6 border-4 border-kids-yellow">
      <div className="flex items-center gap-3 mb-2">
        <UserCheck className="w-7 h-7 text-kids-purple" />
        <h2 className="text-2xl font-black text-kids-purple">Cuentas esperando aprobación</h2>
      </div>
      <p className="text-gray-500 font-semibold text-sm mb-4">
        Solo aprueba a maestros y voluntarios que conoces. Las cuentas sin aprobar no pueden ver información de los niños.
      </p>
      <div className="space-y-2">
        {pending.map((p) => (
          <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-gray-50">
            <div className="min-w-0">
              <div className="font-bold text-gray-800 break-all">{p.email}</div>
              <div className="text-xs text-gray-500 font-semibold">
                Creada el {new Date(p.created_at).toLocaleDateString('es-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            <button
              type="button"
              onClick={() => approve(p)}
              disabled={busyId === p.id}
              className="px-5 py-2 rounded-full font-bold text-white bg-kids-purple disabled:opacity-50"
            >
              {busyId === p.id ? 'Aprobando...' : 'Aprobar'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
