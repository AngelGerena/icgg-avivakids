import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Child, Event, Alert } from '../lib/supabase';
import {
  ChevronLeft,
  LogIn,
  LogOut,
  Users,
  Bell,
  Calendar,
  Cake,
  Download,
  Search,
  Plus,
  Trash2,
  QrCode,
  TrendingUp,
  Check,
  X,
  BookOpen,
  CheckCircle,
  KeyRound,
  ClipboardCheck,
  Lock,
  Delete,
} from 'lucide-react';
import { QRScanner } from '../components/QRScanner';
import { Analytics } from '../components/Analytics';
import { QRCodeBadge } from '../components/QRCodeBadge';
import { TutorialSlideshow } from '../components/TutorialSlideshow';
import { exportToPDF, exportToExcel, exportSummaryTable } from '../utils/exportUtils';

// Uplifting acknowledgment chime — ascending major chord
let ackAudioCtx: AudioContext | null = null;
const playAckChime = () => {
  try {
    if (!ackAudioCtx) {
      ackAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (ackAudioCtx.state === 'suspended') ackAudioCtx.resume();
    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50]; // G4 C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ackAudioCtx!.createOscillator();
      const gain = ackAudioCtx!.createGain();
      osc.connect(gain);
      gain.connect(ackAudioCtx!.destination);
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = ackAudioCtx!.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.35, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
    });
  } catch (e) {
    console.warn('Ack chime failed:', e);
  }
};

export const TeacherPortal = () => {
  const { t } = useLanguage();
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [authError, setAuthError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'alerts' | 'events' | 'birthdays' | 'analytics' | 'children'
  >('dashboard');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [ackNotification, setAckNotification] = useState<{ parentName: string; childNumber: string } | null>(null);
  const [editingParentId, setEditingParentId] = useState<string | null>(null);
  const [editParentForm, setEditParentForm] = useState({ primary_name: '', primary_phone: '', primary_email: '', secondary_name: '', secondary_phone: '' });

  // Check-in tab state
  const STAFF_PIN = import.meta.env.VITE_CHECKIN_PIN || '1234';
  const [ciPinUnlocked, setCiPinUnlocked] = useState(false);
  const [ciPinEntry, setCiPinEntry] = useState('');
  const [ciPinError, setCiPinError] = useState(false);
  const [ciSuccess, setCiSuccess] = useState(false);
  const [ciChildNumber, setCiChildNumber] = useState('');
  const [ciChildId, setCiChildId] = useState('');
  const [ciLoading, setCiLoading] = useState(false);
  const [ciForm, setCiForm] = useState({ childName: '', parentName: '', parentPhone: '', parentEmail: '', childAge: '', childDob: '', room: '' });
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const [checkedInChildren, setCheckedInChildren] = useState<Child[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [alertNumber, setAlertNumber] = useState('');
  const [alertReason, setAlertReason] = useState('');
  const [events, setEvents] = useState<Event[]>([]);
  const [birthdayChildren, setBirthdayChildren] = useState<Child[]>([]);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf-detailed' | 'pdf-summary' | 'excel'>('pdf-detailed');

  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    description: '',
    location: '',
    category: '',
    color: '#CE93D8',
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData();

      // Subscribe to parent acknowledgments in real time
      const ackChannel = supabase
        .channel('alert-acknowledgments')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'alerts',
            filter: 'parent_acknowledged=eq.true',
          },
          (payload) => {
            const updated = payload.new as any;
            if (updated.parent_acknowledged && updated.acknowledged_by) {
              setAckNotification({
                parentName: updated.acknowledged_by,
                childNumber: updated.child_number,
              });
              playAckChime();
              fetchDashboardData();
              // Auto dismiss after 8 seconds
              setTimeout(() => setAckNotification(null), 8000);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(ackChannel);
      };
    }
  }, [authenticated]);

  const checkAuth = async () => {
    // Check URL hash for recovery token or error FIRST before evaluating session
    const hash = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', '?'));
    const type = params.get('type');
    const errorCode = params.get('error_code');
    const errorDesc = params.get('error_description');

    // Handle expired or invalid recovery links
    if (errorCode === 'otp_expired' || (params.get('error') === 'access_denied' && errorDesc?.includes('expired'))) {
      window.history.replaceState(null, '', window.location.pathname);
      setLoading(false);
      setAuthenticated(false);
      // Show a friendly message via the auth error state
      setAuthError('El enlace de recuperación ha expirado. Por favor solicita uno nuevo.');
      return;
    }

    if (type === 'recovery') {
      // Valid recovery link — show reset form, never grant portal access
      setIsResettingPassword(true);
      setAuthenticated(false);
      setLoading(false);
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }

    const { data } = await supabase.auth.getSession();
    setAuthenticated(!!data.session);
    setLoading(false);

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsResettingPassword(true);
        setAuthenticated(false);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
        setIsResettingPassword(false);
      }
    });
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      setAuthenticated(true);
    } catch (error: any) {
      alert(error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
      setIsSignUp(false);
      setPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      alert(error.message || 'Error al crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin`,
      });
      if (error) throw error;
      setForgotPasswordSent(true);
    } catch (error: any) {
      alert(error.message || 'Error al enviar el correo');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== newPasswordConfirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (newPassword.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setResetSuccess(true);
      setNewPassword('');
      setNewPasswordConfirm('');
      // Sign out the recovery session and return to login
      await supabase.auth.signOut();
      setTimeout(() => {
        setIsResettingPassword(false);
        setResetSuccess(false);
        setAuthenticated(false);
      }, 2500);
    } catch (error: any) {
      alert(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setAuthenticated(false);
  };

  const fetchDashboardData = async () => {
    const { data: children } = await supabase
      .from('children')
      .select('*')
      .eq('checked_in_today', true)
      .order('check_in_time', { ascending: false });

    if (children) {
      setCheckedInChildren(children);
    }

    const { data: eventsData } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });

    if (eventsData) {
      setEvents(eventsData);
    }

    const { data: allChildrenData } = await supabase
      .from('children')
      .select('*, parents(*)')
      .order('full_name', { ascending: true });

    if (allChildrenData) {
      setAllChildren(allChildrenData);

      const currentMonth = new Date().getMonth() + 1;
      const birthdaysThisMonth = allChildrenData.filter((child) => {
        const birthMonth = new Date(child.dob + 'T12:00:00').getMonth() + 1;
        return birthMonth === currentMonth;
      });
      setBirthdayChildren(birthdaysThisMonth);
    }

    const { data: alerts } = await supabase
      .from('alerts')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(50);

    if (alerts) {
      setAlertHistory(alerts);
    }
  };

  const handleQRScan = async (data: any) => {
    let childNumber = '';

    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data);
        childNumber = parsed.childNumber || parsed.child_number || data;
      } catch {
        childNumber = data;
      }
    } else {
      childNumber = data.childNumber || data.child_number || '';
    }

    childNumber = childNumber.toString().trim();

    if (!childNumber) {
      alert('Por favor ingrese un número válido.');
      return;
    }

    // Search by unique number first
    const { data: childData, error: childError } = await supabase
      .from('children')
      .select('*, parents(*), intake_forms(*)')
      .eq('unique_number', childNumber)
      .maybeSingle();

    if (childError) {
      console.error('QR search error:', childError);
      alert(`Error al buscar: ${childError.message}`);
      return;
    }

    // Fallback: search by name
    if (!childData) {
      const { data: nameResults } = await supabase
        .from('children')
        .select('*, parents(*), intake_forms(*)')
        .ilike('full_name', `%${childNumber}%`)
        .limit(1)
        .maybeSingle();

      if (!nameResults) {
        alert(`No se encontró ningún niño con el número o nombre: "${childNumber}"`);
        return;
      }

      // Mark check-in and record attendance
      await recordCheckIn(nameResults);
      setSelectedChild(nameResults);
      setShowQRScanner(false);
      return;
    }

    // Mark check-in and record attendance
    await recordCheckIn(childData);
    setSelectedChild(childData);
    setShowQRScanner(false);
  };

  const recordCheckIn = async (child: any) => {
    const now = new Date().toISOString();
    const today = new Date().toISOString().split('T')[0];

    // Update child checked_in_today
    await supabase
      .from('children')
      .update({ checked_in_today: true, check_in_time: now })
      .eq('id', child.id);

    // Check if already recorded attendance today to avoid duplicates
    const { data: existing } = await supabase
      .from('attendance')
      .select('id')
      .eq('child_id', child.id)
      .eq('service_date', today)
      .maybeSingle();

    if (!existing) {
      await supabase.from('attendance').insert({
        child_id: child.id,
        child_number: child.unique_number,
        child_name: child.full_name,
        room: child.room,
        checked_in_at: now,
        service_date: today,
        checked_in_by: 'qr-scan',
      });
    }

    // Refresh dashboard
    fetchDashboardData();
  };

  const handleSearch = async () => {
    if (!searchTerm) return;

    const { data: children } = await supabase
      .from('children')
      .select('*, parents(*), intake_forms(*)')
      .or(
        `full_name.ilike.%${searchTerm}%,unique_number.ilike.%${searchTerm}%`
      );

    if (children) {
      setSearchResults(children);
    }
  };

  const triggerAlert = async () => {
    if (!alertNumber || !alertReason) {
      alert('Por favor complete todos los campos');
      return;
    }

    const { data: childData } = await supabase
      .from('children')
      .select('*, parents(*)')
      .eq('unique_number', alertNumber)
      .maybeSingle();

    if (!childData) {
      alert('Número de niño no encontrado');
      return;
    }

    const parentData = childData.parents && childData.parents[0];

    const { data: alertData } = await supabase
      .from('alerts')
      .insert({
        child_number: alertNumber,
        child_id: childData.id,
        reason: alertReason,
        resolved: false,
        parent_name: parentData?.primary_name || '',
        parent_phone: parentData?.primary_phone || '',
        sms_sent: false,
      })
      .select()
      .single();

    if (parentData?.primary_email) {
      try {
        const alertTypeMapping: { [key: string]: 'pickup_request' | 'emergency' | 'general' } = {
          'Solicitud de recogida': 'pickup_request',
          'Emergencia médica': 'emergency',
          'Situación de comportamiento': 'general',
          'Otro': 'general',
        };

        const alertType = alertTypeMapping[alertReason] || 'general';

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-parent-email-alert`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              childId: childData.id,
              alertType: alertType,
              message: alertReason,
            }),
          }
        );

        const result = await response.json();

        if (result.success) {
          await supabase
            .from('alerts')
            .update({ sms_sent: true })
            .eq('id', alertData.id);
        }
      } catch (error) {
        console.error('Error sending notification:', error);
      }
    }

    setAlertNumber('');
    setAlertReason('');
    fetchDashboardData();
    alert('Alerta activada y notificación enviada');
  };

  const resolveAlert = async (alertId: string) => {
    await supabase
      .from('alerts')
      .update({
        resolved: true,
        resolved_at: new Date().toISOString(),
        resolved_by: email,
      })
      .eq('id', alertId);

    fetchDashboardData();
  };

  const deleteAlert = async (alertId: string) => {
    await supabase.from('alerts').delete().eq('id', alertId);
    fetchDashboardData();
  };

  const ciHandlePinDigit = (digit: string) => {
    if (ciPinEntry.length >= 4) return;
    const next = ciPinEntry + digit;
    setCiPinEntry(next);
    setCiPinError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === STAFF_PIN) { setCiPinUnlocked(true); setCiPinEntry(''); }
        else { setCiPinError(true); setCiPinEntry(''); }
      }, 200);
    }
  };

  const ciReset = () => {
    setCiPinUnlocked(false); setCiPinEntry(''); setCiPinError(false);
    setCiSuccess(false); setCiChildNumber(''); setCiChildId('');
    setCiForm({ childName: '', parentName: '', parentPhone: '', parentEmail: '', childAge: '', childDob: '', room: '' });
  };

  const ciGenerateNumber = async (): Promise<string> => {
    let unique = false; let number = '';
    while (!unique) {
      number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const { data } = await supabase.from('children').select('unique_number').eq('unique_number', number).maybeSingle();
      if (!data) unique = true;
    }
    return number;
  };

  const ciHandleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCiLoading(true);
    try {
      const formattedDob = new Date(ciForm.childDob + 'T12:00:00').toISOString().split('T')[0];
      const { data: existing } = await supabase.from('children').select('id, full_name, unique_number').ilike('full_name', ciForm.childName.trim()).eq('dob', formattedDob).maybeSingle();
      if (existing) {
        const ok = window.confirm(`Ya existe un registro para ${existing.full_name} (Número: ${existing.unique_number}). ¿Desea registrar de todas formas?`);
        if (!ok) { setCiLoading(false); return; }
      }
      const uniqueNumber = await ciGenerateNumber();
      const { data: childData, error: childError } = await supabase.from('children').insert({ full_name: ciForm.childName.trim(), dob: formattedDob, room: ciForm.room, unique_number: uniqueNumber, checked_in_today: true, check_in_time: new Date().toISOString() }).select().single();
      if (childError) throw childError;
      const { error: parentError } = await supabase.from('parents').insert({ child_id: childData.id, primary_name: ciForm.parentName.trim(), primary_relationship: 'Parent', primary_phone: ciForm.parentPhone.trim(), primary_email: ciForm.parentEmail.trim() });
      if (parentError) throw parentError;
      setCiChildNumber(uniqueNumber); setCiChildId(childData.id); setCiSuccess(true);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 }, colors: ['#FFD700', '#4FC3F7', '#FF6B6B', '#69F0AE', '#CE93D8'] });
      fetchDashboardData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : JSON.stringify(err);
      alert(`Error al registrar: ${msg}`);
    } finally {
      setCiLoading(false);
    }
  };

  const saveParentEdit = async (childId: string) => {
    const { error } = await supabase
      .from('parents')
      .update({
        primary_name: editParentForm.primary_name.trim(),
        primary_phone: editParentForm.primary_phone.trim(),
        primary_email: editParentForm.primary_email.trim(),
        secondary_name: editParentForm.secondary_name.trim() || null,
        secondary_phone: editParentForm.secondary_phone.trim() || null,
      })
      .eq('child_id', childId);

    if (error) {
      alert(`Error al guardar: ${error.message}`);
    } else {
      setEditingParentId(null);
      fetchDashboardData();
    }
  };

  const clearResolvedAlerts = async () => {
    if (!confirm('¿Limpiar todo el historial de alertas resueltas?')) return;
    await supabase.from('alerts').delete().eq('resolved', true);
    fetchDashboardData();
  };

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault();

    const fixedDate = newEvent.date
      ? new Date(newEvent.date + 'T12:00:00').toISOString().split('T')[0]
      : newEvent.date;

    const { error } = await supabase.from('events').insert({ ...newEvent, date: fixedDate });

    if (error) {
      alert(`Error al guardar evento: ${error.message}`);
      return;
    }

    setNewEvent({
      title: '',
      date: '',
      time: '',
      description: '',
      location: '',
      category: '',
      color: '#CE93D8',
    });

    fetchDashboardData();
  };

  const deleteEvent = async (id: string) => {
    if (confirm('¿Eliminar este evento?')) {
      await supabase.from('events').delete().eq('id', id);
      fetchDashboardData();
    }
  };

  const toggleBirthdayCelebrated = async (childId: string, celebrated: boolean) => {
    await supabase
      .from('children')
      .update({ birthday_celebrated: !celebrated })
      .eq('id', childId);

    fetchDashboardData();
  };

  const exportCSV = () => {
    const headers = ['Nombre', 'Número', 'Hora de Registro', 'Sala'];
    const rows = checkedInChildren.map((child) => [
      child.full_name,
      child.unique_number,
      child.check_in_time
        ? new Date(child.check_in_time).toLocaleTimeString()
        : '',
      child.room,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registro-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleExport = async () => {
    setShowExportMenu(false);

    try {
      switch (exportFormat) {
        case 'pdf-detailed':
          await exportToPDF(allChildren as any, true);
          break;
        case 'pdf-summary':
          exportSummaryTable(allChildren as any);
          break;
        case 'excel':
          exportToExcel(allChildren as any);
          break;
      }
      alert('Exportación completada exitosamente');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error al exportar. Por favor intente nuevamente.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-kids-purple"></div>
      </div>
    );
  }

  if (isResettingPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-bubbly p-8 sm:p-12 shadow-2xl max-w-md w-full border-2 border-gray-100"
        >
          <div className="text-center mb-8">
            <KeyRound className="w-16 h-16 text-kids-blue mx-auto mb-4" />
            <h1 className="text-4xl font-black text-kids-blue mb-2">
              Nueva Contrasena
            </h1>
            <p className="text-gray-600 font-semibold">
              Elige una contrasena segura para tu cuenta
            </p>
          </div>

          {resetSuccess ? (
            <div className="space-y-6 text-center">
              <div className="bg-green-50 border-2 border-green-400 rounded-bubbly p-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-800 font-bold text-lg">
                  Contrasena actualizada exitosamente
                </p>
                <p className="text-green-700 text-sm mt-2">
                  Ya puedes iniciar sesion con tu nueva contrasena.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setIsResettingPassword(false);
                  setResetSuccess(false);
                }}
                className="w-full py-4 bg-gradient-to-r from-kids-purple to-kids-blue text-white text-xl font-black rounded-bubbly shadow-lg"
              >
                Ir al inicio de sesion
              </motion.button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  Nueva Contrasena
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Minimo 6 caracteres"
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                />
              </div>
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  Confirmar Nueva Contrasena
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  required
                  minLength={6}
                  placeholder="Repite la contrasena"
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                />
              </div>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.05 }}
                whileTap={{ scale: loading ? 1 : 0.95 }}
                className="w-full py-4 bg-gradient-to-r from-kids-blue to-kids-mint text-white text-xl font-black rounded-bubbly shadow-lg disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar Nueva Contrasena'}
              </motion.button>
            </form>
          )}
        </motion.div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-bubbly p-8 sm:p-12 shadow-2xl max-w-md w-full border-2 border-gray-100"
        >
          <AnimatePresence mode="wait">
            {isForgotPassword ? (
              <motion.div
                key="forgot"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <div className="text-center mb-8">
                  <KeyRound className="w-16 h-16 text-kids-blue mx-auto mb-4" />
                  <h1 className="text-4xl font-black text-kids-blue mb-2">
                    Recuperar Contrasena
                  </h1>
                  <p className="text-gray-600 font-semibold">
                    Te enviaremos un enlace para restablecer tu contrasena
                  </p>
                </div>

                {forgotPasswordSent ? (
                  <div className="space-y-6 text-center">
                    <div className="bg-green-50 border-2 border-green-400 rounded-bubbly p-6">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-800 font-bold text-lg">
                        Correo enviado exitosamente
                      </p>
                      <p className="text-green-700 text-sm mt-2">
                        Revisa tu bandeja de entrada en{' '}
                        <span className="font-black">{email}</span> y sigue el
                        enlace para restablecer tu contrasena.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(false);
                        setForgotPasswordSent(false);
                        setEmail('');
                      }}
                      className="text-kids-blue font-bold hover:underline"
                    >
                      Volver al inicio de sesion
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-6">
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="tu@email.com"
                        className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                      />
                    </div>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.05 }}
                      whileTap={{ scale: loading ? 1 : 0.95 }}
                      className="w-full py-4 bg-gradient-to-r from-kids-blue to-kids-mint text-white text-xl font-black rounded-bubbly shadow-lg disabled:opacity-60"
                    >
                      {loading ? 'Enviando...' : 'Enviar Enlace'}
                    </motion.button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={() => setIsForgotPassword(false)}
                        className="text-kids-blue font-bold hover:underline"
                      >
                        Volver al inicio de sesion
                      </button>
                    </div>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key={isSignUp ? 'signup' : 'login'}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex justify-center mb-6">
                  <a
                    href="/"
                    className="flex items-center gap-2 text-kids-blue font-bold text-sm hover:underline"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Volver al sitio principal
                  </a>
                </div>

                <div className="text-center mb-8">
                  <LogIn className="w-16 h-16 text-kids-purple mx-auto mb-4" />
                  <h1 className="text-4xl font-black text-kids-purple mb-2">
                    {isSignUp ? 'Crear Cuenta' : t.teacherPortal.title}
                  </h1>
                  <p className="text-gray-600 font-semibold">
                    {isSignUp
                      ? 'Registrate para acceder al portal'
                      : 'Inicia sesion para continuar'}
                  </p>
                </div>

                <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-6">
                  {authError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 border-2 border-red-300 rounded-bubbly p-4"
                    >
                      <p className="text-red-700 font-bold text-sm text-center">{authError}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setIsForgotPassword(true);
                        }}
                        className="w-full mt-3 text-kids-blue font-black text-sm underline"
                      >
                        Solicitar nuevo enlace de recuperación
                      </button>
                    </motion.div>
                  )}
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-lg font-bold text-gray-700">
                        {t.teacherPortal.password}
                      </label>
                      {!isSignUp && (
                        <button
                          type="button"
                          onClick={() => {
                            setIsForgotPassword(true);
                            setForgotPasswordSent(false);
                          }}
                          className="text-sm font-bold text-kids-blue hover:underline"
                        >
                          Olvide mi contrasena
                        </button>
                      )}
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold"
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <label className="block text-lg font-bold text-gray-700 mb-2">
                        Confirmar Contrasena
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold"
                      />
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: loading ? 1 : 1.05 }}
                    whileTap={{ scale: loading ? 1 : 0.95 }}
                    className="w-full py-4 bg-gradient-to-r from-kids-purple to-kids-blue text-white text-xl font-black rounded-bubbly shadow-lg disabled:opacity-60"
                  >
                    {loading
                      ? 'Cargando...'
                      : isSignUp
                      ? 'Crear Cuenta'
                      : t.teacherPortal.loginButton}
                  </motion.button>

                  <div className="text-center">
                    <p className="text-gray-400 font-semibold text-sm">
                      Para obtener acceso, contacte al administrador del ministerio.
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">

      {/* Parent acknowledgment notification banner */}
      <AnimatePresence>
        {ackNotification && (
          <motion.div
            initial={{ opacity: 0, y: -80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
          >
            <div className="bg-gradient-to-r from-kids-mint to-kids-blue rounded-bubbly p-5 shadow-2xl border-4 border-white flex items-center gap-4">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, repeat: 3 }}
                className="text-4xl"
              >
                🏃
              </motion.div>
              <div className="flex-1">
                <div className="text-white font-black text-lg leading-tight">
                  {ackNotification.parentName} — En Camino
                </div>
                <div className="text-white/80 font-semibold text-sm">
                  Niño #{ackNotification.childNumber} · El padre/madre confirmó la alerta
                </div>
              </div>
              <button
                onClick={() => setAckNotification(null)}
                className="text-white/70 hover:text-white font-black text-xl"
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl md:text-5xl font-black text-kids-purple">
            {t.teacherPortal.dashboard}
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-kids-yellow to-kids-blue text-white rounded-bubbly font-bold hover:scale-105 transition-transform shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              <span>Tutorial</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-kids-coral text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
            >
              <LogOut className="w-5 h-5" />
              <span>{t.teacherPortal.logout}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'dashboard', label: t.teacherPortal.dashboard, icon: Users },
            { id: 'checkin', label: 'Registro de Niños', icon: ClipboardCheck },
            { id: 'children', label: 'Todos los Niños', icon: Users },
            { id: 'alerts', label: t.teacherPortal.alertPanel, icon: Bell },
            { id: 'events', label: t.teacherPortal.eventManager, icon: Calendar },
            { id: 'birthdays', label: t.teacherPortal.birthdayManager, icon: Cake },
            { id: 'analytics', label: 'Analíticas', icon: TrendingUp },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-bubbly font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-kids-blue text-white shadow-lg'
                  : 'bg-white text-kids-blue border-2 border-kids-blue'
              }`}
            >
              <tab.icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">

            {/* QR Scanner — prominently at the top */}
            <div className="bg-gradient-to-r from-kids-purple to-kids-blue rounded-bubbly p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="text-white">
                <div className="text-2xl font-black mb-1">Escanear QR del Niño</div>
                <div className="text-white/80 font-semibold text-sm">
                  Apunte la camara al codigo QR del padre para registrar la entrada del nino
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowQRScanner(true)}
                className="flex items-center gap-3 px-8 py-4 bg-white text-kids-purple font-black text-lg rounded-bubbly shadow-lg hover:shadow-xl transition-all flex-shrink-0"
              >
                <QrCode className="w-7 h-7" />
                Escanear QR
              </motion.button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="bg-white rounded-bubbly p-6 shadow-xl border-4 border-kids-yellow"
              >
                <div className="flex items-center justify-between mb-4">
                  <Users className="w-12 h-12 text-kids-yellow" />
                  <div className="text-5xl font-black text-kids-yellow">
                    {allChildren.length}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-700">
                  Niños Registrados
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="bg-white rounded-bubbly p-6 shadow-xl border-4 border-kids-mint"
              >
                <div className="flex items-center justify-between mb-4">
                  <CheckCircle className="w-12 h-12 text-kids-mint" />
                  <div className="text-5xl font-black text-kids-mint">
                    {checkedInChildren.length}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-700">
                  Registrados Hoy
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="bg-white rounded-bubbly p-6 shadow-xl border-4 border-kids-blue"
              >
                <div className="flex items-center justify-between mb-4">
                  <Calendar className="w-12 h-12 text-kids-blue" />
                  <div className="text-5xl font-black text-kids-blue">
                    {events.filter(e => new Date(e.date + 'T12:00:00') >= new Date()).length}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-700">
                  Próximos Eventos
                </div>
              </motion.div>
            </div>

            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-kids-blue flex items-center">
                  <Users className="w-8 h-8 mr-3" />
                  {t.teacherPortal.checkInList}
                </h2>
                <button
                  onClick={exportCSV}
                  className="flex items-center space-x-2 px-4 py-2 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                >
                  <Download className="w-5 h-5" />
                  <span>{t.teacherPortal.exportCSV}</span>
                </button>
              </div>

              {checkedInChildren.length > 0 ? (
                <div className="space-y-4">
                  {checkedInChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-bubbly"
                    >
                      <div>
                        <div className="text-xl font-black text-gray-800">
                          {child.full_name}
                        </div>
                        <div className="text-sm font-semibold text-gray-600">
                          {t.teacherPortal.childNumber}: {child.unique_number} |{' '}
                          {child.room}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-kids-blue">
                          {t.teacherPortal.checkedInAt}
                        </div>
                        <div className="text-lg font-black text-gray-700">
                          {child.check_in_time
                            ? new Date(child.check_in_time).toLocaleTimeString()
                            : ''}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 font-bold">
                  {t.teacherPortal.noChildrenCheckedIn}
                </div>
              )}
            </div>

            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
              <h2 className="text-3xl font-black text-kids-purple mb-6 flex items-center">
                <Search className="w-8 h-8 mr-3" />
                {t.teacherPortal.searchIntake}
              </h2>

              <div className="flex space-x-4 mb-6">
                <input
                  type="text"
                  placeholder={t.teacherPortal.searchPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1 px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold"
                />
                <button
                  onClick={handleSearch}
                  className="px-6 py-3 bg-kids-purple text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                >
                  <Search className="w-6 h-6" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="space-y-4">
                  {searchResults.map((result) => (
                    <div
                      key={result.id}
                      className="p-6 bg-gray-50 rounded-bubbly"
                    >
                      <div className="text-2xl font-black text-gray-800 mb-2">
                        {result.full_name} ({result.unique_number})
                      </div>
                      {result.parents && result.parents[0] && (
                        <div className="text-sm font-semibold text-gray-600 mb-2">
                          Contacto: {result.parents[0].primary_name} -{' '}
                          {result.parents[0].primary_phone}
                        </div>
                      )}
                      {result.intake_forms && (
                        <div className="text-sm text-gray-700">
                          <div>
                            Alergias:{' '}
                            {result.intake_forms.allergies?.join(', ') || 'Ninguna'}
                          </div>
                          <div>
                            Condiciones médicas:{' '}
                            {result.intake_forms.medical_conditions || 'Ninguna'}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'alerts' && (
          <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-black text-kids-coral mb-6 flex items-center">
              <Bell className="w-8 h-8 mr-3" />
              {t.teacherPortal.alertPanel}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t.teacherPortal.childNumber}
                </label>
                <input
                  type="text"
                  placeholder={t.teacherPortal.enterNumber}
                  value={alertNumber}
                  onChange={(e) => setAlertNumber(e.target.value)}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold"
                />
              </div>

              <div>
                <label className="block text-lg font-bold text-gray-700 mb-3">
                  {t.teacherPortal.alertReason}
                </label>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {[
                    { label: 'Recogida Urgente', color: 'bg-kids-coral text-white border-kids-coral' },
                    { label: 'Emergencia Médica', color: 'bg-red-500 text-white border-red-500' },
                    { label: 'Comportamiento', color: 'bg-kids-yellow text-gray-800 border-kids-yellow' },
                    { label: 'Mensaje General', color: 'bg-kids-blue text-white border-kids-blue' },
                  ].map((option) => (
                    <button
                      key={option.label}
                      type="button"
                      onClick={() => setAlertReason(option.label)}
                      className={`px-4 py-3 rounded-bubbly font-bold border-2 transition-all ${
                        alertReason === option.label
                          ? option.color + ' scale-105 shadow-lg'
                          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="O escriba un mensaje personalizado..."
                  value={alertReason}
                  onChange={(e) => setAlertReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold text-sm"
                />
              </div>

              <button
                onClick={triggerAlert}
                className="w-full py-4 bg-gradient-to-r from-kids-coral to-red-500 text-white text-xl font-black rounded-bubbly shadow-lg hover:scale-105 transition-transform"
              >
                {t.teacherPortal.triggerAlert}
              </button>
            </div>

            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100 mt-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-kids-purple">
                  Historial de Alertas
                </h2>
                {alertHistory.some(a => a.resolved) && (
                  <button
                    onClick={clearResolvedAlerts}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 border-2 border-red-200 rounded-bubbly font-bold text-sm hover:bg-red-500 hover:text-white hover:border-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Limpiar Historial
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {alertHistory.length === 0 && (
                  <div className="text-center py-8 text-gray-400 font-semibold">
                    No hay alertas registradas.
                  </div>
                )}
                {alertHistory.map((alert) => (
                  <div
                    key={alert.id}
                    className={`flex items-center justify-between p-4 rounded-bubbly ${
                      alert.resolved ? 'bg-gray-100' : 'bg-red-50 border-2 border-red-300'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className="text-2xl font-black text-kids-purple">
                          #{alert.child_number}
                        </div>
                        {alert.sms_sent && (
                          <span className="px-3 py-1 bg-kids-mint text-white rounded-full text-xs font-bold">
                            SMS Enviado
                          </span>
                        )}
                        {alert.resolved && (
                          <span className="px-3 py-1 bg-gray-400 text-white rounded-full text-xs font-bold">
                            Resuelto
                          </span>
                        )}
                        {alert.parent_acknowledged && (
                          <span className="px-3 py-1 bg-kids-blue text-white rounded-full text-xs font-bold flex items-center gap-1">
                            🏃 {alert.acknowledged_by} — En Camino
                          </span>
                        )}
                      </div>
                      <div className="text-sm font-semibold text-gray-700">
                        {alert.reason}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(alert.triggered_at).toLocaleString()}
                        {alert.parent_name && ` | ${alert.parent_name}`}
                        {alert.parent_phone && ` | ${alert.parent_phone}`}
                      </div>
                    </div>
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="flex items-center space-x-2 px-4 py-2 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                      >
                        <Check className="w-5 h-5" />
                        <span>Resolver</span>
                      </button>
                    )}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 ml-2 bg-red-100 text-red-500 rounded-bubbly hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                      title="Eliminar alerta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
              <h2 className="text-3xl font-black text-kids-blue mb-6 flex items-center">
                <Plus className="w-8 h-8 mr-3" />
                {t.calendar.addEvent}
              </h2>

              <form onSubmit={addEvent} className="space-y-4">
                <input
                  type="text"
                  placeholder={t.calendar.eventTitle}
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  required
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={newEvent.date}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, date: e.target.value })
                    }
                    required
                    className="px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                  />
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className="px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                  />
                </div>

                <textarea
                  placeholder={t.calendar.description}
                  value={newEvent.description}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, description: e.target.value })
                  }
                  rows={3}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                />

                <input
                  type="text"
                  placeholder={t.calendar.location}
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                />

                <select
                  value={newEvent.category}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, category: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                >
                  <option value="">Categoría...</option>
                  <option value="Actividad">Actividad</option>
                  <option value="Celebracion">Celebración</option>
                  <option value="Retiro">Retiro</option>
                  <option value="Especial">Especial</option>
                </select>

                <button
                  type="submit"
                  className="w-full py-4 bg-kids-blue text-white text-xl font-black rounded-bubbly shadow-lg hover:scale-105 transition-transform"
                >
                  {t.calendar.addEvent}
                </button>
              </form>
            </div>

            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
              <h2 className="text-3xl font-black text-kids-purple mb-6">
                Eventos Existentes
              </h2>

              <div className="space-y-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-bubbly"
                  >
                    <div>
                      <div className="text-xl font-black text-gray-800">
                        {event.title}
                      </div>
                      <div className="text-sm font-semibold text-gray-600">
                        {new Date(event.date + 'T12:00:00').toLocaleDateString()} |{' '}
                        {event.category}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'birthdays' && (
          <div className="space-y-8">
            {/* This Month */}
            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
              <h2 className="text-3xl font-black text-kids-yellow mb-2 flex items-center">
                <Cake className="w-8 h-8 mr-3" />
                {t.teacherPortal.birthdayManager}
              </h2>
              <p className="text-gray-500 font-semibold mb-6 text-sm">
                Cumpleaños este mes — marque como celebrado para que aparezca en la página pública.
              </p>

              {birthdayChildren.length === 0 ? (
                <div className="text-center py-8 text-gray-400 font-bold">
                  No hay cumpleaños registrados este mes.
                </div>
              ) : (
                <div className="space-y-4">
                  {birthdayChildren.map((child) => (
                    <div
                      key={child.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-bubbly border border-gray-200"
                    >
                      <div>
                        <div className="text-xl font-black text-gray-800">{child.full_name}</div>
                        <div className="text-sm font-semibold text-gray-500">
                          {new Date(child.dob + 'T12:00:00').toLocaleDateString('es-ES', { month: 'long', day: 'numeric' })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleBirthdayCelebrated(child.id, child.birthday_celebrated)}
                          className={`px-4 py-2 rounded-bubbly font-bold transition-all ${
                            child.birthday_celebrated
                              ? 'bg-kids-mint text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-kids-yellow hover:text-white'
                          }`}
                        >
                          {child.birthday_celebrated ? t.birthdays.celebrated : t.teacherPortal.markCelebrated}
                        </button>
                        <button
                          onClick={async () => {
                            if (!confirm(`¿Eliminar a ${child.full_name}? Esta acción no se puede deshacer.`)) return;
                            const { error } = await supabase.from('children').delete().eq('id', child.id);
                            if (error) alert(`Error: ${error.message}`);
                            else fetchDashboardData();
                          }}
                          className="p-2 bg-red-100 text-red-500 rounded-bubbly hover:bg-red-500 hover:text-white transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Edit DOB — all children */}
            <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
              <h3 className="text-2xl font-black text-kids-blue mb-2 flex items-center">
                <Cake className="w-6 h-6 mr-2" />
                Editar Fecha de Nacimiento
              </h3>
              <p className="text-gray-500 font-semibold mb-6 text-sm">
                Actualice la fecha de nacimiento de cualquier niño/a para que aparezca correctamente en la página pública de cumpleaños.
              </p>
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {allChildren.map((child) => (
                  <div
                    key={child.id}
                    className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-bubbly border border-gray-200"
                  >
                    <div className="font-black text-gray-800 min-w-0 flex-1 truncate">
                      {child.full_name}
                    </div>
                    <input
                      type="date"
                      defaultValue={child.dob ? child.dob.split('T')[0] : ''}
                      onBlur={async (e) => {
                        const newDob = e.target.value;
                        if (!newDob || newDob === child.dob?.split('T')[0]) return;
                        const { error } = await supabase
                          .from('children')
                          .update({ dob: newDob })
                          .eq('id', child.id);
                        if (error) {
                          alert(`Error al actualizar: ${error.message}`);
                        } else {
                          fetchDashboardData();
                        }
                      }}
                      className="px-3 py-2 rounded-bubbly border-2 border-kids-blue focus:border-kids-purple focus:outline-none text-sm font-semibold"
                    />
                    <button
                      onClick={async () => {
                        if (!confirm(`¿Eliminar a ${child.full_name}? Esta acción no se puede deshacer.`)) return;
                        const { error } = await supabase.from('children').delete().eq('id', child.id);
                        if (error) alert(`Error: ${error.message}`);
                        else fetchDashboardData();
                      }}
                      className="p-2 bg-red-100 text-red-500 rounded-bubbly hover:bg-red-500 hover:text-white transition-all flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <Analytics />}

        {activeTab === 'checkin' && (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* PIN GATE */}
              {!ciPinUnlocked && (
                <motion.div key="ci-pin" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-bubbly p-10 shadow-xl border border-gray-100 max-w-sm mx-auto text-center"
                >
                  <div className="flex justify-center mb-4">
                    <div className="bg-kids-purple/10 rounded-full p-4">
                      <Lock className="w-10 h-10 text-kids-purple" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-black text-kids-purple mb-1">PIN de Personal</h2>
                  <p className="text-gray-500 font-semibold mb-6 text-sm">Ingrese el PIN para habilitar el registro</p>
                  <div className="flex justify-center gap-4 mb-6">
                    {[0,1,2,3].map(i => (
                      <motion.div key={i} animate={{ scale: ciPinEntry.length > i ? 1.2 : 1 }}
                        className={`w-4 h-4 rounded-full border-2 transition-colors ${ciPinEntry.length > i ? 'bg-kids-purple border-kids-purple' : 'bg-white border-gray-300'}`}
                      />
                    ))}
                  </div>
                  {ciPinError && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 font-bold text-sm mb-4">
                      PIN incorrecto. Intente de nuevo.
                    </motion.p>
                  )}
                  <div className="grid grid-cols-3 gap-3">
                    {['1','2','3','4','5','6','7','8','9','','0','del'].map((d, i) => {
                      if (d === '') return <div key={i} />;
                      if (d === 'del') return (
                        <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => { setCiPinEntry(p => p.slice(0,-1)); setCiPinError(false); }}
                          className="flex items-center justify-center h-14 rounded-bubbly bg-gray-100 text-gray-600 font-bold text-lg hover:bg-gray-200 transition-colors"
                        ><Delete className="w-5 h-5" /></motion.button>
                      );
                      return (
                        <motion.button key={i} whileTap={{ scale: 0.92 }} onClick={() => ciHandlePinDigit(d)}
                          className="flex items-center justify-center h-14 rounded-bubbly bg-kids-purple/10 text-kids-purple font-black text-xl hover:bg-kids-purple/20 transition-colors"
                        >{d}</motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              )}

              {/* SUCCESS SCREEN */}
              {ciPinUnlocked && ciSuccess && (
                <motion.div key="ci-success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto text-center"
                >
                  <div className="bg-gradient-to-br from-kids-mint to-kids-blue rounded-bubbly p-8 mb-6">
                    <motion.div animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }} transition={{ duration: 0.8 }} className="flex justify-center mb-4">
                      <CheckCircle className="w-20 h-20 text-white" />
                    </motion.div>
                    <h2 className="text-3xl font-black text-white mb-2">¡Registro Exitoso!</h2>
                    <p className="text-white/80 font-semibold">Niño registrado y check-in completado</p>
                  </div>
                  <div className="bg-gray-50 rounded-bubbly p-6 mb-6 border border-gray-100">
                    <p className="text-gray-600 font-semibold mb-2">Número asignado al niño:</p>
                    <div className="text-7xl font-black text-kids-purple mb-4">{ciChildNumber}</div>
                    <p className="text-sm text-gray-500 font-semibold mb-6">Entregue este número al padre/madre</p>
                    <QRCodeBadge childName={ciForm.childName || 'Niño'} childNumber={ciChildNumber} childId={ciChildId} />
                  </div>
                  <div className="flex gap-4 justify-center">
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      onClick={() => { setCiSuccess(false); setCiForm({ childName: '', parentName: '', parentPhone: '', parentEmail: '', childAge: '', childDob: '', room: '' }); }}
                      className="px-8 py-3 bg-gradient-to-r from-kids-blue to-kids-purple text-white font-black rounded-bubbly shadow-lg"
                    >Registrar Otro Niño</motion.button>
                    <button onClick={ciReset} className="px-8 py-3 bg-gray-100 text-gray-600 font-bold rounded-bubbly hover:bg-gray-200 transition-colors">
                      Cerrar Sesión de Personal
                    </button>
                  </div>
                </motion.div>
              )}

              {/* CHECK-IN FORM */}
              {ciPinUnlocked && !ciSuccess && (
                <motion.div key="ci-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-black text-kids-blue flex items-center gap-3">
                      <ClipboardCheck className="w-8 h-8" />
                      Registro de Niños
                    </h2>
                    <button onClick={ciReset} className="text-sm text-gray-400 font-semibold hover:text-red-400 transition-colors flex items-center gap-1">
                      <Lock className="w-4 h-4" /> Bloquear
                    </button>
                  </div>

                  <form onSubmit={ciHandleSubmit}>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Child info */}
                      <div className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100 space-y-4">
                        <h3 className="text-lg font-black text-kids-purple flex items-center gap-2">
                          <Users className="w-5 h-5" /> Información del Niño
                        </h3>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1">Nombre completo</label>
                          <input type="text" value={ciForm.childName} onChange={e => setCiForm({...ciForm, childName: e.target.value})} required
                            className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-blue focus:border-kids-purple focus:outline-none font-semibold" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Edad</label>
                            <input type="number" value={ciForm.childAge} onChange={e => setCiForm({...ciForm, childAge: e.target.value})} required
                              className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-yellow focus:border-kids-purple focus:outline-none font-semibold" />
                          </div>
                          <div>
                            <label className="block text-sm font-bold text-gray-600 mb-1">Fecha de nacimiento</label>
                            <input type="date" value={ciForm.childDob} onChange={e => setCiForm({...ciForm, childDob: e.target.value})} required
                              className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-yellow focus:border-kids-purple focus:outline-none font-semibold" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1">Sala / Clase</label>
                          <select value={ciForm.room} onChange={e => setCiForm({...ciForm, room: e.target.value})} required
                            className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-mint focus:border-kids-purple focus:outline-none font-semibold bg-white"
                          >
                            <option value="">Seleccione...</option>
                            <option value="babies">Bebés (0-2 años)</option>
                            <option value="explorers">Exploradores (3-4 años)</option>
                            <option value="adventurers">Principiantes/Primarios (5-8 años)</option>
                            <option value="youth">Jóvenes (9-12 años)</option>
                          </select>
                        </div>
                      </div>

                      {/* Parent info */}
                      <div className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100 space-y-4">
                        <h3 className="text-lg font-black text-kids-coral flex items-center gap-2">
                          <Users className="w-5 h-5" /> Información del Padre/Madre
                        </h3>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1">Nombre completo</label>
                          <input type="text" value={ciForm.parentName} onChange={e => setCiForm({...ciForm, parentName: e.target.value})} required
                            className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-coral focus:border-kids-purple focus:outline-none font-semibold" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1">Teléfono</label>
                          <input type="tel" value={ciForm.parentPhone} onChange={e => setCiForm({...ciForm, parentPhone: e.target.value})} required
                            className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-purple focus:border-kids-blue focus:outline-none font-semibold" />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-gray-600 mb-1">Correo electrónico</label>
                          <input type="email" value={ciForm.parentEmail} onChange={e => setCiForm({...ciForm, parentEmail: e.target.value})} required
                            className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-purple focus:border-kids-blue focus:outline-none font-semibold" />
                        </div>
                      </div>
                    </div>

                    <motion.button type="submit" disabled={ciLoading} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      className="w-full mt-6 py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white text-xl font-black rounded-bubbly shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {ciLoading ? 'Registrando...' : 'Registrar Niño y Completar Check-In'}
                    </motion.button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'children' && (
          <div className="bg-white rounded-bubbly p-8 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-black text-kids-blue flex items-center">
                <Users className="w-8 h-8 mr-3" />
                Todos los Niños Registrados
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-lg font-bold text-gray-600">
                  Total: {allChildren.length}
                </div>
              </div>
            </div>

            {/* Export buttons — always visible */}
            <div className="mb-6 space-y-3">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wide">Exportar Registros</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={async () => { try { await exportToPDF(allChildren as any, true); } catch(e) { alert('Error al exportar PDF'); } }}
                  className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white rounded-bubbly font-bold shadow-lg"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-black">PDF Detallado</div>
                    <div className="text-xs opacity-80">Fotos, QR, info médica completa</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { try { exportSummaryTable(allChildren as any); } catch(e) { alert('Error al exportar PDF'); } }}
                  className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-kids-mint to-kids-blue text-white rounded-bubbly font-bold shadow-lg"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-black">PDF Resumen</div>
                    <div className="text-xs opacity-80">Tabla compacta de referencia rápida</div>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { try { exportToExcel(allChildren as any); } catch(e) { alert('Error al exportar Excel'); } }}
                  className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-kids-yellow to-kids-mint text-gray-800 rounded-bubbly font-bold shadow-lg"
                >
                  <Download className="w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <div className="font-black">Excel</div>
                    <div className="text-xs opacity-70">Hoja de cálculo editable con todos los datos</div>
                  </div>
                </motion.button>
              </div>
            </div>

            <div className="mb-6 text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
              <p className="font-semibold">
                Los números y códigos QR se generan automáticamente cuando los padres completan el formulario de admisión.
                Aquí puedes ver todos los niños registrados y regenerar sus tarjetas QR si es necesario.
              </p>
            </div>

            {allChildren.length > 0 ? (
              <div className="space-y-4">
                {allChildren.map((child: any) => (
                  <div
                    key={child.id}
                    className="p-6 bg-gray-50 rounded-bubbly border-2 border-gray-200 hover:border-kids-purple transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="text-2xl font-black text-kids-purple">
                            {child.full_name}
                          </div>
                          <div className="px-4 py-1 bg-kids-blue text-white rounded-full text-lg font-black">
                            #{child.unique_number}
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="font-bold text-gray-600">Fecha de Nacimiento:</span>{' '}
                            <span className="text-gray-800">
                              {new Date(child.dob + 'T12:00:00').toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-600">Sala:</span>
                            <select
                              defaultValue={child.room || ''}
                              onChange={async (e) => {
                                const newRoom = e.target.value;
                                if (!newRoom || newRoom === child.room) return;
                                const { error } = await supabase
                                  .from('children')
                                  .update({ room: newRoom })
                                  .eq('id', child.id);
                                if (error) {
                                  alert(`Error al cambiar sala: ${error.message}`);
                                } else {
                                  fetchDashboardData();
                                }
                              }}
                              className="px-2 py-1 rounded-bubbly border-2 border-kids-mint focus:border-kids-purple focus:outline-none text-sm font-semibold bg-white"
                            >
                              <option value="">Sin asignar</option>
                              <option value="babies">Bebés (0-2 años)</option>
                              <option value="explorers">Exploradores (3-4 años)</option>
                              <option value="adventurers">Principiantes/Primarios (5-8 años)</option>
                              <option value="youth">Jóvenes (9-12 años)</option>
                            </select>
                          </div>
                          {child.parents && child.parents[0] && (
                            <>
                              <div>
                                <span className="font-bold text-gray-600">Padre/Madre:</span>{' '}
                                <span className="text-gray-800">
                                  {child.parents[0].primary_name}
                                </span>
                              </div>
                              <div>
                                <span className="font-bold text-gray-600">Teléfono:</span>{' '}
                                <span className="text-gray-800">
                                  {child.parents[0].primary_phone}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <button
                          onClick={() => setSelectedChild(child)}
                          className="px-4 py-2 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform w-full"
                        >
                          Ver QR Code
                        </button>
                        <button
                          onClick={() => {
                            const p = child.parents?.[0];
                            setEditParentForm({
                              primary_name: p?.primary_name || '',
                              primary_phone: p?.primary_phone || '',
                              primary_email: p?.primary_email || '',
                              secondary_name: p?.secondary_name || '',
                              secondary_phone: p?.secondary_phone || '',
                            });
                            setEditingParentId(editingParentId === child.id ? null : child.id);
                          }}
                          className={`px-4 py-2 rounded-bubbly font-bold transition-all w-full border-2 ${
                            editingParentId === child.id
                              ? 'bg-kids-purple text-white border-kids-purple'
                              : 'bg-white text-kids-purple border-kids-purple hover:bg-kids-purple hover:text-white'
                          }`}
                        >
                          {editingParentId === child.id ? 'Cancelar' : 'Editar Contacto'}
                        </button>
                        <button
                          onClick={async () => {
                            const confirmed = window.confirm(
                              `¿Está seguro que desea eliminar a ${child.full_name}? Esta acción no se puede deshacer.`
                            );
                            if (!confirmed) return;
                            const { error } = await supabase
                              .from('children')
                              .delete()
                              .eq('id', child.id);
                            if (error) {
                              alert(`Error al eliminar: ${error.message}`);
                            } else {
                              fetchDashboardData();
                            }
                          }}
                          className="px-4 py-2 bg-red-100 text-red-600 border-2 border-red-200 rounded-bubbly font-bold hover:bg-red-500 hover:text-white hover:border-red-500 transition-all w-full"
                        >
                          Eliminar Niño
                        </button>
                      </div>
                    </div>

                    {/* Inline edit form */}
                    <AnimatePresence>
                      {editingParentId === child.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25 }}
                          className="mt-5 pt-5 border-t-2 border-kids-purple/20"
                        >
                          <p className="text-sm font-black text-kids-purple mb-4 uppercase tracking-wide">
                            Editar Información de Contacto
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Nombre del Padre/Madre</label>
                              <input
                                type="text"
                                value={editParentForm.primary_name}
                                onChange={(e) => setEditParentForm({ ...editParentForm, primary_name: e.target.value })}
                                className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none text-sm font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono Principal</label>
                              <input
                                type="tel"
                                value={editParentForm.primary_phone}
                                onChange={(e) => setEditParentForm({ ...editParentForm, primary_phone: e.target.value })}
                                className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none text-sm font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Correo Electrónico</label>
                              <input
                                type="email"
                                value={editParentForm.primary_email}
                                onChange={(e) => setEditParentForm({ ...editParentForm, primary_email: e.target.value })}
                                className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none text-sm font-semibold"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 mb-1">Contacto Secundario (opcional)</label>
                              <input
                                type="text"
                                value={editParentForm.secondary_name}
                                onChange={(e) => setEditParentForm({ ...editParentForm, secondary_name: e.target.value })}
                                placeholder="Nombre"
                                className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none text-sm font-semibold"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-xs font-bold text-gray-500 mb-1">Teléfono Secundario (opcional)</label>
                              <input
                                type="tel"
                                value={editParentForm.secondary_phone}
                                onChange={(e) => setEditParentForm({ ...editParentForm, secondary_phone: e.target.value })}
                                placeholder="Teléfono del contacto secundario"
                                className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none text-sm font-semibold"
                              />
                            </div>
                          </div>
                          <div className="flex gap-3 mt-4">
                            <motion.button
                              whileHover={{ scale: 1.03 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => saveParentEdit(child.id)}
                              className="flex-1 py-3 bg-gradient-to-r from-kids-mint to-kids-blue text-white font-black rounded-bubbly shadow-lg"
                            >
                              Guardar Cambios
                            </motion.button>
                            <button
                              onClick={() => setEditingParentId(null)}
                              className="px-6 py-3 bg-gray-100 text-gray-600 font-bold rounded-bubbly hover:bg-gray-200 transition-colors"
                            >
                              Cancelar
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 font-bold">
                No hay niños registrados aún. Los padres deben completar el formulario de admisión.
              </div>
            )}
          </div>
        )}

        <TutorialSlideshow
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
        />

        <AnimatePresence>
          {showQRScanner && (
            <QRScanner
              onScanSuccess={handleQRScan}
              onClose={() => setShowQRScanner(false)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedChild && activeTab === 'children' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedChild(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-bubbly p-8 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-black text-kids-purple">
                    Código QR - {selectedChild.full_name}
                  </h2>
                  <button
                    onClick={() => setSelectedChild(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-8 h-8 text-gray-600" />
                  </button>
                </div>

                <div className="flex flex-col items-center">
                  <QRCodeBadge
                    childName={selectedChild.full_name}
                    childNumber={selectedChild.unique_number}
                    childId={selectedChild.id}
                  />
                  <div className="mt-6 text-center text-gray-600">
                    <p className="font-semibold">
                      Los padres pueden usar este código QR para hacer check-in rápido.
                    </p>
                    <p className="text-sm mt-2">
                      Haz clic en "Descargar Tarjeta" para guardar e imprimir.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {selectedChild && activeTab === 'dashboard' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedChild(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-bubbly p-8 shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-4xl font-black text-kids-purple">
                    Perfil del Niño
                  </h2>
                  <button
                    onClick={() => setSelectedChild(null)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X className="w-8 h-8 text-gray-600" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="bg-gradient-to-r from-kids-yellow to-kids-blue rounded-bubbly p-6">
                    <div className="text-5xl font-black text-white mb-2">
                      {selectedChild.full_name}
                    </div>
                    <div className="text-3xl font-bold text-white/90">
                      #{selectedChild.unique_number}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-bubbly p-4">
                      <div className="text-sm font-bold text-gray-500 mb-1">
                        Fecha de Nacimiento
                      </div>
                      <div className="text-lg font-black text-gray-800">
                        {new Date(selectedChild.dob + 'T12:00:00').toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-bubbly p-4">
                      <div className="text-sm font-bold text-gray-500 mb-1">Sala</div>
                      <div className="text-lg font-black text-gray-800">
                        {selectedChild.room}
                      </div>
                    </div>

                    {selectedChild.parents && selectedChild.parents[0] && (
                      <>
                        <div className="bg-gray-50 rounded-bubbly p-4">
                          <div className="text-sm font-bold text-gray-500 mb-1">
                            Contacto Principal
                          </div>
                          <div className="text-lg font-black text-gray-800">
                            {selectedChild.parents[0].primary_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedChild.parents[0].primary_phone}
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-bubbly p-4">
                          <div className="text-sm font-bold text-gray-500 mb-1">Email</div>
                          <div className="text-lg font-black text-gray-800">
                            {selectedChild.parents[0].primary_email}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {selectedChild.intake_forms && (
                    <div className="bg-kids-coral/10 rounded-bubbly p-6 border-2 border-kids-coral">
                      <h3 className="text-2xl font-black text-kids-coral mb-4">
                        Información Médica
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-bold text-gray-700">
                            Alergias
                          </div>
                          <div className="text-lg text-gray-800">
                            {selectedChild.intake_forms.allergies?.join(', ') ||
                              'Ninguna'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-700">
                            Condiciones Médicas
                          </div>
                          <div className="text-lg text-gray-800">
                            {selectedChild.intake_forms.medical_conditions ||
                              'Ninguna'}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-700">
                            Necesidades Especiales
                          </div>
                          <div className="text-lg text-gray-800">
                            {selectedChild.intake_forms.special_needs || 'Ninguna'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedChild.checked_in_today && (
                    <div className="bg-kids-mint/20 rounded-bubbly p-4 border-2 border-kids-mint">
                      <div className="text-lg font-black text-kids-mint">
                        ✓ Registrado Hoy a las{' '}
                        {new Date(selectedChild.check_in_time).toLocaleTimeString()}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
