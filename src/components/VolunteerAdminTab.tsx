import { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import { supabase } from '../lib/supabase';
import { HandHeart, Mail, Phone, Trash2, Download, Loader2, Sun, Moon, Sparkles, Link as LinkIcon } from 'lucide-react';

interface VolunteerSignup {
  id: string;
  volunteer_date: string;
  slot_type: 'sunday' | 'thursday' | 'event';
  slot_label: string | null;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const prettyDate = (ds: string) => {
  const s = new Date(ds + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  return s.charAt(0).toUpperCase() + s.slice(1);
};

export const VolunteerAdminTab = () => {
  const [rows, setRows] = useState<VolunteerSignup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchRows = async () => {
    setLoading(true);
    setError('');
    try {
      const today = todayStr();
      let query = supabase.from('volunteer_signups').select('*');
      query =
        view === 'upcoming'
          ? query.gte('volunteer_date', today).order('volunteer_date', { ascending: true })
          : query.lt('volunteer_date', today).order('volunteer_date', { ascending: false });
      const { data, error: fetchError } = await query.order('created_at', { ascending: true });
      if (fetchError) {
        setError(`No se pudo cargar la lista: ${fetchError.message}`);
        setRows([]);
      } else {
        setRows((data as VolunteerSignup[]) || []);
      }
    } catch (err) {
      setError('Error inesperado al cargar voluntarios.');
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

  const handleDelete = async (row: VolunteerSignup) => {
    if (!window.confirm(`¿Eliminar a ${row.full_name} del ${prettyDate(row.volunteer_date)}?`)) return;
    setDeletingId(row.id);
    const { error: delError } = await supabase.from('volunteer_signups').delete().eq('id', row.id);
    if (delError) {
      window.alert(`No se pudo eliminar: ${delError.message}`);
    } else {
      setRows((prev) => prev.filter((r) => r.id !== row.id));
    }
    setDeletingId(null);
  };

  const exportExcel = () => {
    const sheet = XLSX.utils.json_to_sheet(
      rows.map((r) => ({
        Fecha: r.volunteer_date,
        Servicio: r.slot_label || r.slot_type,
        Nombre: r.full_name,
        Correo: r.email,
        Telefono: r.phone,
        'Registrado el': new Date(r.created_at).toLocaleString('es-ES'),
      }))
    );
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Voluntarios');
    XLSX.writeFile(book, `voluntarios-${view === 'upcoming' ? 'proximos' : 'pasados'}-${todayStr()}.xlsx`);
  };

  const copyLink = async () => {
    const url = `${window.location.origin}/volunteer`;
    try {
      await navigator.clipboard.writeText(url);
      window.alert('Enlace copiado: ' + url);
    } catch (_e) {
      window.prompt('Copie este enlace:', url);
    }
  };

  const grouped = rows.reduce<Record<string, VolunteerSignup[]>>((acc, r) => {
    (acc[r.volunteer_date] = acc[r.volunteer_date] || []).push(r);
    return acc;
  }, {});

  const SlotIcon = ({ type }: { type: VolunteerSignup['slot_type'] }) =>
    type === 'sunday' ? (
      <Sun className="w-4 h-4 text-kids-coral" />
    ) : type === 'thursday' ? (
      <Moon className="w-4 h-4 text-kids-blue" />
    ) : (
      <Sparkles className="w-4 h-4 text-yellow-500" />
    );

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-kids-coral via-kids-purple to-kids-blue rounded-bubbly p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
            <HandHeart className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Padres Voluntarios</h2>
            <p className="text-white/90 font-semibold text-sm">Quién se anotó para ayudar a los maestros cada día.</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-full font-bold text-sm transition-colors"
          >
            <LinkIcon className="w-4 h-4" />
            Copiar enlace
          </button>
          <button
            onClick={exportExcel}
            disabled={rows.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-white text-kids-purple rounded-full font-black text-sm disabled:opacity-50 hover:scale-105 transition-transform"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      <div className="inline-flex bg-white rounded-bubbly shadow border border-gray-200 p-1">
        {(['upcoming', 'past'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-5 py-2 rounded-bubbly font-bold text-sm transition-all ${
              view === v ? 'bg-kids-purple text-white shadow-md' : 'text-gray-500 hover:text-kids-purple'
            }`}
          >
            {v === 'upcoming' ? 'Próximos' : 'Pasados'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-10 h-10 text-kids-purple animate-spin" />
        </div>
      ) : error ? (
        <p className="bg-kids-coral/10 text-kids-coral font-bold rounded-bubbly p-4">{error}</p>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-bubbly shadow p-10 text-center">
          <HandHeart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-bold">
            {view === 'upcoming' ? 'Todavía no hay voluntarios anotados.' : 'No hay registros pasados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {Object.entries(grouped).map(([date, list]) => (
            <div key={date} className="bg-white rounded-bubbly shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 flex items-center justify-between border-b border-gray-100">
                <h3 className="font-black text-gray-800">{prettyDate(date)}</h3>
                <span className="bg-kids-mint text-white text-sm font-black rounded-full px-3 py-1">
                  {list.length} {list.length === 1 ? 'voluntario' : 'voluntarios'}
                </span>
              </div>
              <ul className="divide-y divide-gray-100">
                {list.map((r) => (
                  <li key={r.id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                    <div className="min-w-0">
                      <p className="font-black text-gray-800">{r.full_name}</p>
                      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                        <SlotIcon type={r.slot_type} />
                        {r.slot_label || r.slot_type}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={`tel:${r.phone.replace(/\D/g, '')}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-kids-coral/10 text-kids-coral font-bold text-sm hover:bg-kids-coral/20"
                      >
                        <Phone className="w-4 h-4" />
                        {r.phone}
                      </a>
                      <a
                        href={`mailto:${r.email}`}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-kids-blue/10 text-kids-blue font-bold text-sm hover:bg-kids-blue/20 max-w-[240px] truncate"
                      >
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{r.email}</span>
                      </a>
                      <button
                        onClick={() => handleDelete(r)}
                        disabled={deletingId === r.id}
                        aria-label="Eliminar"
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-kids-coral hover:text-white transition-colors disabled:opacity-50"
                      >
                        {deletingId === r.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
