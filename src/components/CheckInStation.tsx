import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Delete, Search, CheckCircle, User, Hash, Type } from 'lucide-react';

export const CheckInStation = () => {
  const [mode, setMode] = useState<'number' | 'name'>('number');
  const [num, setNum] = useState('');
  const [nameQ, setNameQ] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [recent, setRecent] = useState<{ name: string; number: string; time: string }[]>([]);

  const searchByNumber = async (n: string) => {
    setNotFound(false);
    const { data } = await supabase.from('children').select('*').eq('unique_number', n).maybeSingle();
    setResults(data ? [data] : []);
    if (!data) setNotFound(true);
  };

  const searchByName = async (q: string) => {
    setNotFound(false);
    if (q.trim().length < 2) { setResults([]); return; }
    const { data } = await supabase
      .from('children')
      .select('*')
      .ilike('full_name', '%' + q.trim() + '%')
      .order('full_name', { ascending: true })
      .limit(12);
    setResults(data || []);
    if (!data || data.length === 0) setNotFound(true);
  };

  const press = (d: string) => {
    const next = (num + d).slice(0, 4);
    setNum(next);
    setResults([]);
    setNotFound(false);
    if (next.length === 4) searchByNumber(next);
  };
  const backspace = () => { setNum(num.slice(0, -1)); setResults([]); setNotFound(false); };
  const clearAll = () => { setNum(''); setNameQ(''); setResults([]); setNotFound(false); };

  const checkIn = async (child: any) => {
    setBusyId(child.id);
    try {
      const now = new Date().toISOString();
      await supabase.from('children').update({ checked_in_today: true, check_in_time: now }).eq('id', child.id);
      const today = now.split('T')[0];
      const { data: ex } = await supabase
        .from('attendance').select('id').eq('child_id', child.id).eq('date', today).maybeSingle();
      if (!ex) {
        await supabase.from('attendance').insert({
          child_id: child.id, child_number: child.unique_number, date: today,
          checked_in_at: now, checked_in_by: 'station',
        });
      }
      setRecent((r) => [{ name: child.full_name, number: child.unique_number, time: now }, ...r].slice(0, 8));
      clearAll();
    } catch (e) {
      alert('No se pudo registrar la entrada. Intenta de nuevo.');
    } finally {
      setBusyId(null);
    }
  };

  const fmt = (iso: string) => new Date(iso).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  const ChildCard = ({ c }: { c: any }) => (
    <div className="flex items-center gap-4 bg-white border-2 border-gray-100 rounded-bubbly p-3 shadow-sm">
      {c.photo_url ? (
        <img src={c.photo_url} alt={c.full_name} className="w-16 h-16 rounded-full object-cover border-2 border-kids-purple flex-shrink-0" />
      ) : (
        <div className="w-16 h-16 rounded-full bg-kids-purple/10 flex items-center justify-center flex-shrink-0 border-2 border-kids-purple/20">
          <User className="w-8 h-8 text-kids-purple/50" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-black text-gray-800 text-lg truncate">{c.full_name}</p>
        <p className="text-sm font-bold text-kids-purple">#{c.unique_number}{c.checked_in_today ? ' · Ya presente' : ''}</p>
      </div>
      <button
        onClick={() => checkIn(c)}
        disabled={busyId === c.id}
        className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-kids-mint to-green-500 text-white font-black rounded-bubbly shadow-md hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 flex-shrink-0"
      >
        <CheckCircle className="w-5 h-5" />
        {busyId === c.id ? '...' : 'Entrada'}
      </button>
    </div>
  );

  return (
    <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-6 sm:p-8 shadow-xl border border-white/20">
      <h2 className="text-2xl sm:text-3xl font-black text-kids-blue flex items-center mb-2">
        <CheckCircle className="w-8 h-8 mr-3 flex-shrink-0" />
        Registro Rápido
      </h2>
      <p className="text-gray-500 font-semibold mb-6">Ingresa el número del niño o busca por nombre y confirma la entrada.</p>

      {/* Mode toggle */}
      <div className="flex gap-2 bg-gray-100 rounded-bubbly p-1 mb-6 max-w-sm">
        <button
          onClick={() => { setMode('number'); clearAll(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all ${mode === 'number' ? 'bg-white shadow text-kids-purple' : 'text-gray-400'}`}
        >
          <Hash className="w-4 h-4" /> Por número
        </button>
        <button
          onClick={() => { setMode('name'); clearAll(); }}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-black text-sm transition-all ${mode === 'name' ? 'bg-white shadow text-kids-purple' : 'text-gray-400'}`}
        >
          <Type className="w-4 h-4" /> Por nombre
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input side */}
        <div>
          {mode === 'number' ? (
            <div className="max-w-xs mx-auto">
              <div className="h-16 mb-4 rounded-bubbly border-4 border-kids-blue flex items-center justify-center">
                <span className="text-4xl font-black tracking-[0.3em] text-kids-purple">
                  {num.padEnd(4, '•')}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['1','2','3','4','5','6','7','8','9'].map((d) => (
                  <button key={d} onClick={() => press(d)}
                    className="h-16 bg-gray-50 hover:bg-kids-blue/10 rounded-bubbly text-2xl font-black text-gray-800 active:scale-95 transition-transform border-2 border-gray-100">
                    {d}
                  </button>
                ))}
                <button onClick={clearAll}
                  className="h-16 bg-kids-coral/10 hover:bg-kids-coral/20 rounded-bubbly text-lg font-black text-kids-coral active:scale-95 transition-transform border-2 border-kids-coral/20">
                  C
                </button>
                <button onClick={() => press('0')}
                  className="h-16 bg-gray-50 hover:bg-kids-blue/10 rounded-bubbly text-2xl font-black text-gray-800 active:scale-95 transition-transform border-2 border-gray-100">
                  0
                </button>
                <button onClick={backspace}
                  className="h-16 bg-gray-50 hover:bg-gray-100 rounded-bubbly flex items-center justify-center text-gray-600 active:scale-95 transition-transform border-2 border-gray-100">
                  <Delete className="w-6 h-6" />
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  type="text"
                  value={nameQ}
                  onChange={(e) => { setNameQ(e.target.value); searchByName(e.target.value); }}
                  placeholder="Escribe el nombre del niño..."
                  className="w-full h-14 pl-12 pr-4 rounded-bubbly border-4 border-kids-blue focus:border-kids-purple focus:outline-none text-lg font-semibold"
                />
              </div>
            </div>
          )}
        </div>

        {/* Results side */}
        <div>
          <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-2">
            {results.length > 0 ? 'Confirma y registra' : 'Resultado'}
          </p>
          <div className="space-y-3 min-h-[6rem]">
            {results.map((c) => <ChildCard key={c.id} c={c} />)}
            {notFound && results.length === 0 && (
              <div className="text-gray-400 font-semibold bg-gray-50 rounded-bubbly p-4 text-center">
                No se encontró ningún niño. Verifica el número o el nombre.
              </div>
            )}
            {!notFound && results.length === 0 && (
              <div className="text-gray-300 font-semibold bg-gray-50 rounded-bubbly p-4 text-center">
                {mode === 'number' ? 'Ingresa el número de 4 dígitos.' : 'Escribe al menos 2 letras.'}
              </div>
            )}
          </div>

          {/* Recent check-ins */}
          {recent.length > 0 && (
            <div className="mt-6">
              <p className="text-xs font-black text-gray-400 uppercase tracking-wide mb-2">Registrados recién</p>
              <div className="space-y-1.5">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-bold text-gray-800">{r.name}</span>
                      <span className="text-xs text-gray-500">#{r.number}</span>
                    </div>
                    <span className="text-xs text-green-600 font-bold">{fmt(r.time)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
