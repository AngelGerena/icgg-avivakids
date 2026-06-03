import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Calendar, Users, Download, Plus, Trash2, CheckCircle, Check, X } from 'lucide-react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const VBS_THEMES = [
  { value: 'under-the-sea',   label: 'Under the Sea',    emoji: '🌊', bg: 'from-blue-400 to-teal-500',      accent: '#0891b2' },
  { value: 'jungle-safari',   label: 'Jungle Safari',    emoji: '🦁', bg: 'from-green-500 to-lime-400',     accent: '#16a34a' },
  { value: 'outer-space',     label: 'Outer Space',      emoji: '🚀', bg: 'from-purple-700 to-blue-800',    accent: '#7c3aed' },
  { value: 'super-heroes',    label: 'Super Heroes',     emoji: '⚡', bg: 'from-red-500 to-blue-500',       accent: '#dc2626' },
  { value: 'dino-adventure',  label: 'Dino Adventure',   emoji: '🦕', bg: 'from-green-600 to-yellow-500',   accent: '#65a30d' },
  { value: 'wild-west',       label: 'Wild West',        emoji: '🤠', bg: 'from-yellow-600 to-amber-400',   accent: '#d97706' },
  { value: 'kingdom-castle',  label: 'Kingdom & Castle', emoji: '👑', bg: 'from-purple-600 to-yellow-400',  accent: '#7c3aed' },
  { value: 'tropical-fiesta', label: 'Tropical Fiesta',  emoji: '🦜', bg: 'from-pink-500 to-green-400',     accent: '#ec4899' },
];

const DAYS_OF_WEEK = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];
const DAYS_LABELS: Record<string, string> = {
  monday:'Lunes', tuesday:'Martes', wednesday:'Miércoles', thursday:'Jueves',
  friday:'Viernes', saturday:'Sábado', sunday:'Domingo',
};

const GROUPS = [
  { value: 'estrellas',    label: 'Estrellas (4-5 años)'    },
  { value: 'exploradores', label: 'Exploradores (6-8 años)' },
  { value: 'aventureros',  label: 'Aventureros (9-11 años)' },
  { value: 'lideres',      label: 'Líderes (12+ años)'      },
];

interface VBSChild {
  id: string;
  full_name: string;
  dob: string | null;
  age: number | null;
  grade: string | null;
  group_name: string | null;
  parent_name: string;
  parent_phone: string;
  parent_email: string | null;
  is_first_time: boolean;
  registered_by: string;
  registration_date: string;
  unique_code: string;
}

interface VBSSettings {
  id: string;
  theme: string;
  title: string;
  start_date: string | null;
  end_date: string | null;
  active_days: string[];
  is_active: boolean;
}

interface VBSAttendance {
  child_id: string;
  date: string;
}

const generateCode = () => 'VBS' + Math.floor(1000 + Math.random() * 9000).toString();

export const VBSAdminTab = () => {
  const [activeView, setActiveView] = useState<'settings' | 'children' | 'checkin' | 'reports'>('settings');
  const [settings, setSettings] = useState<VBSSettings | null>(null);
  const [settingsForm, setSettingsForm] = useState({ theme: 'under-the-sea', title: 'VBS 2026', start_date: '', end_date: '', active_days: ['monday','tuesday','wednesday','thursday','friday'], is_active: false });
  const [children, setChildren] = useState<VBSChild[]>([]);
  const [attendance, setAttendance] = useState<VBSAttendance[]>([]);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [todayDate] = useState(new Date().toISOString().split('T')[0]);

  // Registration form
  const [regForm, setRegForm] = useState({ fullName: '', dob: '', age: '', grade: '', group: '', parentName: '', parentPhone: '', parentEmail: '', isFirstTime: false });
  const [regLoading, setRegLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState('');

  const currentTheme = VBS_THEMES.find(t => t.value === settingsForm.theme) || VBS_THEMES[0];

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const { data: s } = await supabase.from('vbs_settings').select('*').order('year', { ascending: false }).limit(1).maybeSingle();
      if (s) {
        setSettings(s);
        setSettingsForm({ theme: s.theme, title: s.title, start_date: s.start_date || '', end_date: s.end_date || '', active_days: s.active_days || ['monday','tuesday','wednesday','thursday','friday'], is_active: s.is_active });
      }
      const { data: c } = await supabase.from('vbs_children').select('*').order('registration_date', { ascending: false });
      if (c) setChildren(c);
      const { data: a } = await supabase.from('vbs_attendance').select('child_id, date');
      if (a) setAttendance(a);
    } catch (err) {
      console.error('VBS fetch error:', err);
    }
  };

  const saveSettings = async () => {
    setSavingSettings(true);
    try {
      if (settings?.id) {
        await supabase.from('vbs_settings').update(settingsForm).eq('id', settings.id);
      } else {
        await supabase.from('vbs_settings').insert({ ...settingsForm, year: new Date().getFullYear() });
      }
      setSettingsSaved(true);
      setTimeout(() => setSettingsSaved(false), 3000);
      fetchAll();
    } catch (err) { console.error('VBS save error:', err); }
    finally { setSavingSettings(false); }
  };

  const toggleDay = (day: string) => {
    setSettingsForm(prev => ({
      ...prev,
      active_days: prev.active_days.includes(day)
        ? prev.active_days.filter(d => d !== day)
        : [...prev.active_days, day],
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegLoading(true);
    try {
      let code = generateCode();
      let unique = false;
      while (!unique) {
        const { data } = await supabase.from('vbs_children').select('unique_code').eq('unique_code', code).maybeSingle();
        if (!data) unique = true; else code = generateCode();
      }
      const { error } = await supabase.from('vbs_children').insert({
        full_name: regForm.fullName.trim(),
        dob: regForm.dob ? new Date(regForm.dob + 'T12:00:00').toISOString().split('T')[0] : null,
        age: regForm.age ? parseInt(regForm.age) : null,
        grade: regForm.grade || null,
        group_name: regForm.group || null,
        parent_name: regForm.parentName.trim(),
        parent_phone: regForm.parentPhone.trim(),
        parent_email: regForm.parentEmail || null,
        is_first_time: regForm.isFirstTime,
        registered_by: 'staff',
        unique_code: code,
      });
      if (error) throw error;
      setRegSuccess(code);
      setRegForm({ fullName: '', dob: '', age: '', grade: '', group: '', parentName: '', parentPhone: '', parentEmail: '', isFirstTime: false });
      fetchAll();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Error al registrar');
    } finally { setRegLoading(false); }
  };

  const markAttendance = async (childId: string) => {
    const alreadyPresent = attendance.some(a => a.child_id === childId && a.date === todayDate);
    if (alreadyPresent) return;
    const { error } = await supabase.from('vbs_attendance').insert({ child_id: childId, date: todayDate, present: true, checked_in_by: 'staff' });
    if (!error) fetchAll();
  };

  const removeAttendance = async (childId: string) => {
    await supabase.from('vbs_attendance').delete().eq('child_id', childId).eq('date', todayDate);
    fetchAll();
  };

  const deleteChild = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a ${name} del registro VBS?`)) return;
    await supabase.from('vbs_children').delete().eq('id', id);
    fetchAll();
  };

  const getVBSDates = (): string[] => {
    if (!settingsForm.start_date || !settingsForm.end_date) return [];
    const dates: string[] = [];
    const current = new Date(settingsForm.start_date + 'T12:00:00');
    const end = new Date(settingsForm.end_date + 'T12:00:00');
    while (current <= end) {
      const dayName = current.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      if (settingsForm.active_days.includes(dayName)) {
        dates.push(current.toISOString().split('T')[0]);
      }
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const exportExcel = () => {
    const vbsDates = getVBSDates();
    const rows = children.map(child => {
      const attendanceRecord: Record<string, string> = {};
      vbsDates.forEach(date => {
        const dayLabel = new Date(date + 'T12:00:00').toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        attendanceRecord[dayLabel] = attendance.some(a => a.child_id === child.id && a.date === date) ? '✓' : '';
      });
      const totalDays = vbsDates.filter(date => attendance.some(a => a.child_id === child.id && a.date === date)).length;
      return {
        'Nombre': child.full_name,
        'Código': child.unique_code,
        'Edad': child.age || '',
        'Grado': child.grade || '',
        'Grupo': child.group_name || '',
        'Padre/Madre': child.parent_name,
        'Teléfono': child.parent_phone,
        'Email': child.parent_email || '',
        'Primera Vez': child.is_first_time ? 'Sí' : 'No',
        'Registro': new Date(child.registration_date).toLocaleDateString(),
        'Total Días': totalDays,
        ...attendanceRecord,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'VBS Roster');
    XLSX.writeFile(wb, `VBS-Roster-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = () => {
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const vbsDates = getVBSDates();

    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(settingsForm.title + ' — Reporte Completo', 14, 16);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.text(`Total registrados: ${children.length} | Primera vez: ${children.filter(c => c.is_first_time).length} | Generado: ${new Date().toLocaleDateString()}`, 14, 24);

    const dateHeaders = vbsDates.slice(0, 15).map(d => new Date(d + 'T12:00:00').toLocaleDateString('es-ES', { month: 'numeric', day: 'numeric' }));
    const head = [['Nombre', 'Código', 'Edad', 'Grupo', 'Padre/Madre', 'Teléfono', 'Total', ...dateHeaders]];
    const body = children.map(child => {
      const totalDays = vbsDates.filter(d => attendance.some(a => a.child_id === child.id && a.date === d)).length;
      const dayMarks = vbsDates.slice(0, 15).map(d => attendance.some(a => a.child_id === child.id && a.date === d) ? '✓' : '');
      return [child.full_name, child.unique_code, child.age || '', child.group_name || '', child.parent_name, child.parent_phone, totalDays.toString(), ...dayMarks];
    });

    autoTable(pdf, {
      startY: 30,
      head,
      body,
      theme: 'grid',
      headStyles: { fillColor: [8, 145, 178], fontSize: 8, fontStyle: 'bold', textColor: 255 },
      bodyStyles: { fontSize: 7 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    pdf.save(`VBS-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const presentToday = children.filter(c => attendance.some(a => a.child_id === c.id && a.date === todayDate));
  const absentToday = children.filter(c => !attendance.some(a => a.child_id === c.id && a.date === todayDate));

  return (
    <div className="space-y-6">
      {/* VBS Header Banner */}
      <div className={`bg-gradient-to-r ${currentTheme.bg} rounded-bubbly p-6 shadow-xl`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-3xl mb-1">{currentTheme.emoji} {settingsForm.title}</div>
            <p className="text-white/80 font-semibold">
              {settingsForm.is_active ? '🟢 VBS Activo' : '⚫ VBS Inactivo'} · {children.length} registrados
            </p>
          </div>
          <div className="flex gap-2 flex-wrap justify-end">
            {(['settings','children','checkin','reports'] as const).map(view => (
              <button key={view} onClick={() => setActiveView(view)}
                className={`px-4 py-2 rounded-bubbly font-bold text-sm transition-all ${activeView === view ? 'bg-white text-gray-800 shadow-lg' : 'bg-white/20 text-white hover:bg-white/30'}`}
              >
                {{ settings: '⚙️ Configurar', children: '👦 Niños', checkin: '✅ Check-In', reports: '📊 Reportes' }[view]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* SETTINGS VIEW */}
        {activeView === 'settings' && (
          <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100 space-y-6"
          >
            <h2 className="text-2xl font-black text-kids-purple">Configuración VBS</h2>

            {/* Theme picker */}
            <div>
              <label className="block text-sm font-black text-gray-600 mb-3">Tema del año</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {VBS_THEMES.map(t => (
                  <button key={t.value} type="button" onClick={() => setSettingsForm(prev => ({ ...prev, theme: t.value }))}
                    className={`relative p-3 rounded-bubbly border-2 transition-all text-left ${settingsForm.theme === t.value ? 'border-kids-purple scale-105 shadow-lg' : 'border-gray-200 hover:border-gray-400'}`}
                  >
                    <div className={`bg-gradient-to-r ${t.bg} rounded-lg p-2 text-center text-2xl mb-2`}>{t.emoji}</div>
                    <p className="text-xs font-bold text-gray-700 text-center">{t.label}</p>
                    {settingsForm.theme === t.value && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-kids-purple rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Title and dates */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1">Título del VBS</label>
                <input type="text" value={settingsForm.title} onChange={e => setSettingsForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1">Fecha de inicio</label>
                <input type="date" value={settingsForm.start_date} onChange={e => setSettingsForm(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold" />
              </div>
              <div>
                <label className="block text-sm font-black text-gray-600 mb-1">Fecha de cierre</label>
                <input type="date" value={settingsForm.end_date} onChange={e => setSettingsForm(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold" />
              </div>
            </div>

            {/* Days picker */}
            <div>
              <label className="block text-sm font-black text-gray-600 mb-3">Días activos</label>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map(day => (
                  <button key={day} type="button" onClick={() => toggleDay(day)}
                    className={`px-4 py-2 rounded-bubbly font-bold text-sm transition-all ${settingsForm.active_days.includes(day) ? 'bg-kids-purple text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {DAYS_LABELS[day]}
                  </button>
                ))}
              </div>
              {settingsForm.start_date && settingsForm.end_date && (
                <p className="text-xs text-gray-400 font-semibold mt-2">
                  {getVBSDates().length} días de VBS programados
                </p>
              )}
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-bubbly border border-gray-200">
              <div>
                <p className="font-black text-gray-800">Activar VBS</p>
                <p className="text-sm text-gray-500 font-semibold">Permite el registro público en icgg-avivakids.org/vbs</p>
              </div>
              <button onClick={() => setSettingsForm(prev => ({ ...prev, is_active: !prev.is_active }))}
                className={`w-14 h-7 rounded-full transition-all relative ${settingsForm.is_active ? 'bg-kids-mint' : 'bg-gray-300'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-all shadow ${settingsForm.is_active ? 'left-8' : 'left-1'}`} />
              </button>
            </div>

            <motion.button onClick={saveSettings} disabled={savingSettings}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-gradient-to-r from-kids-purple to-kids-blue text-white font-black text-lg rounded-bubbly shadow-lg disabled:opacity-50"
            >
              {settingsSaved ? '✓ Guardado' : savingSettings ? 'Guardando...' : 'Guardar Configuración'}
            </motion.button>
          </motion.div>
        )}

        {/* CHILDREN VIEW */}
        {activeView === 'children' && (
          <motion.div key="children" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            {/* Staff registration form */}
            <div className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100">
              <h3 className="text-xl font-black text-kids-purple mb-4 flex items-center gap-2">
                <Plus className="w-6 h-6" /> Registrar Niño (Personal)
              </h3>
              {regSuccess && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-kids-mint/10 border-2 border-kids-mint rounded-bubbly p-4 mb-4 text-center"
                >
                  <p className="font-black text-kids-mint text-lg">¡Registrado! Código: <span className="text-2xl">{regSuccess}</span></p>
                </motion.div>
              )}
              <form onSubmit={handleRegister}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">Nombre completo *</label>
                    <input type="text" value={regForm.fullName} onChange={e => setRegForm({...regForm, fullName: e.target.value})} required
                      className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-black text-gray-500 mb-1">Edad *</label>
                      <input type="number" min="3" max="18" value={regForm.age} onChange={e => setRegForm({...regForm, age: e.target.value})} required
                        className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-500 mb-1">Grado</label>
                      <input type="text" value={regForm.grade} onChange={e => setRegForm({...regForm, grade: e.target.value})}
                        className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">Grupo</label>
                    <select value={regForm.group} onChange={e => setRegForm({...regForm, group: e.target.value})}
                      className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm bg-white">
                      <option value="">Seleccione...</option>
                      {GROUPS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">Nombre del padre/madre *</label>
                    <input type="text" value={regForm.parentName} onChange={e => setRegForm({...regForm, parentName: e.target.value})} required
                      className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">Teléfono *</label>
                    <input type="tel" value={regForm.parentPhone} onChange={e => setRegForm({...regForm, parentPhone: e.target.value})} required
                      className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-500 mb-1">Email (opcional)</label>
                    <input type="email" value={regForm.parentEmail} onChange={e => setRegForm({...regForm, parentEmail: e.target.value})}
                      className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-200 focus:border-kids-purple focus:outline-none font-semibold text-sm" />
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-4">
                  <input type="checkbox" checked={regForm.isFirstTime} onChange={e => setRegForm({...regForm, isFirstTime: e.target.checked})} className="w-5 h-5" />
                  <label className="font-semibold text-gray-700 text-sm">¿Primera vez en VBS?</label>
                </div>
                <button type="submit" disabled={regLoading}
                  className="w-full py-3 bg-gradient-to-r from-kids-blue to-kids-purple text-white font-black rounded-bubbly shadow-lg disabled:opacity-50">
                  {regLoading ? 'Registrando...' : '+ Registrar Niño'}
                </button>
              </form>
            </div>

            {/* Children list */}
            <div className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-black text-kids-purple">Niños Registrados ({children.length})</h3>
              </div>
              <div className="space-y-3">
                {children.length === 0 && (
                  <p className="text-center text-gray-400 font-semibold py-8">No hay niños registrados aún.</p>
                )}
                {children.map(child => (
                  <div key={child.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-bubbly border border-gray-200">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-gray-800">{child.full_name}</span>
                        <span className="text-xs bg-kids-blue/10 text-kids-blue font-black px-2 py-0.5 rounded-full">{child.unique_code}</span>
                        {child.is_first_time && <span className="text-xs bg-kids-yellow/20 text-kids-yellow font-black px-2 py-0.5 rounded-full">1ra vez</span>}
                        <span className="text-xs bg-gray-100 text-gray-500 font-semibold px-2 py-0.5 rounded-full">{child.registered_by === 'online' ? '🌐 Online' : '👤 Presencial'}</span>
                      </div>
                      <p className="text-xs text-gray-500 font-semibold">
                        {child.age && `${child.age} años`}{child.group_name && ` · ${child.group_name}`} · {child.parent_name} · {child.parent_phone}
                      </p>
                    </div>
                    <button onClick={() => deleteChild(child.id, child.full_name)}
                      className="p-2 bg-red-50 text-red-400 rounded-bubbly hover:bg-red-500 hover:text-white transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* CHECK-IN VIEW */}
        {activeView === 'checkin' && (
          <motion.div key="checkin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-kids-purple">
                  Check-In de Hoy — {new Date(todayDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', month: 'long', day: 'numeric' })}
                </h3>
                <div className="flex gap-3">
                  <span className="bg-kids-mint/10 text-kids-mint font-black px-3 py-1 rounded-full text-sm">{presentToday.length} presentes</span>
                  <span className="bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-full text-sm">{absentToday.length} ausentes</span>
                </div>
              </div>

              {children.length === 0 && (
                <p className="text-center text-gray-400 font-semibold py-8">No hay niños registrados.</p>
              )}

              <div className="space-y-2">
                {children.map(child => {
                  const isPresent = attendance.some(a => a.child_id === child.id && a.date === todayDate);
                  return (
                    <div key={child.id}
                      className={`flex items-center justify-between p-4 rounded-bubbly border-2 transition-all ${isPresent ? 'bg-kids-mint/10 border-kids-mint' : 'bg-white border-gray-200'}`}
                    >
                      <div>
                        <span className="font-black text-gray-800">{child.full_name}</span>
                        <span className="ml-2 text-xs font-black text-kids-blue">{child.unique_code}</span>
                        {child.group_name && <span className="ml-2 text-xs text-gray-400 font-semibold">{child.group_name}</span>}
                      </div>
                      <button
                        onClick={() => isPresent ? removeAttendance(child.id) : markAttendance(child.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-bubbly font-bold text-sm transition-all ${isPresent ? 'bg-kids-mint text-white hover:bg-red-400' : 'bg-gray-100 text-gray-600 hover:bg-kids-mint hover:text-white'}`}
                      >
                        {isPresent ? <><CheckCircle className="w-4 h-4" /> Presente</> : <><Check className="w-4 h-4" /> Marcar</>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* REPORTS VIEW */}
        {activeView === 'reports' && (
          <motion.div key="reports" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100"
          >
            <h3 className="text-xl font-black text-kids-purple mb-6">Reporte para el Pastor</h3>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Registrados', value: children.length, color: 'bg-kids-blue', icon: '👦' },
                { label: 'Primera Vez', value: children.filter(c => c.is_first_time).length, color: 'bg-kids-coral', icon: '⭐' },
                { label: 'Registro Online', value: children.filter(c => c.registered_by === 'online').length, color: 'bg-kids-purple', icon: '🌐' },
                { label: 'Registro Presencial', value: children.filter(c => c.registered_by === 'staff').length, color: 'bg-kids-mint', icon: '👤' },
              ].map((stat, i) => (
                <div key={i} className={`${stat.color} rounded-bubbly p-4 text-white text-center`}>
                  <div className="text-3xl mb-1">{stat.icon}</div>
                  <div className="text-3xl font-black">{stat.value}</div>
                  <div className="text-xs font-semibold opacity-80">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Group breakdown */}
            <div className="mb-8">
              <h4 className="font-black text-gray-700 mb-3">Por Grupo</h4>
              <div className="space-y-2">
                {GROUPS.map(g => {
                  const count = children.filter(c => c.group_name === g.value).length;
                  const pct = children.length ? Math.round(count / children.length * 100) : 0;
                  return (
                    <div key={g.value} className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-600 w-48">{g.label}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4">
                        <div className="bg-kids-purple h-4 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-black text-gray-700 w-8">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Export buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button onClick={exportPDF} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-kids-purple to-kids-blue text-white rounded-bubbly font-black shadow-lg">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div>PDF Reporte Completo</div>
                  <div className="text-xs opacity-80">Roster + asistencia diaria</div>
                </div>
              </motion.button>
              <motion.button onClick={exportExcel} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-kids-yellow to-kids-mint text-gray-800 rounded-bubbly font-black shadow-lg">
                <Download className="w-5 h-5" />
                <div className="text-left">
                  <div>Excel Hoja de Cálculo</div>
                  <div className="text-xs opacity-70">Editable con todos los datos</div>
                </div>
              </motion.button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};
