import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Child, Event, Alert, isRecoveryLink } from '../lib/supabase';
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
} from 'lucide-react';
import { QRScanner } from '../components/QRScanner';
import { Analytics } from '../components/Analytics';
import { QRCodeBadge } from '../components/QRCodeBadge';
import { TutorialSlideshow } from '../components/TutorialSlideshow';
import { exportToPDF, exportToExcel, exportSummaryTable } from '../utils/exportUtils';
import { TeacherLessons } from '../components/TeacherLessons';
import { StaffChat } from '../components/StaffChat';
import { PhotoUpload } from '../components/PhotoUpload';

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
  const [isResettingPassword, setIsResettingPassword] = useState(
    () => isRecoveryLink || (typeof window !== 'undefined' && window.localStorage.getItem('avk_pending_reset') === '1')
  );
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'alerts' | 'events' | 'birthdays' | 'analytics' | 'children' | 'lessons'
  >('dashboard');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [alertHistory, setAlertHistory] = useState<Alert[]>([]);
  const [selectedChild, setSelectedChild] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [idleLoggedOut, setIdleLoggedOut] = useState(false);

  const [checkedInChildren, setCheckedInChildren] = useState<Child[]>([]);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [alertNumber, setAlertNumber] = useState('');
  const [alertReason, setAlertReason] = useState('');
  const [alertCountdown, setAlertCountdown] = useState(0);
  const [alertSentMessage, setAlertSentMessage] = useState('');

  // Checkout state
  const [checkoutChildId, setCheckoutChildId] = useState<string | null>(null);
  const [checkoutForm, setCheckoutForm] = useState({ pickedUpBy: '', relationship: '', pin: '' });
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Photo upload state
  const [photoUploading, setPhotoUploading] = useState<Record<string, boolean>>({});

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
    flyer_url: '',
  });
  const [flyerUploading, setFlyerUploading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchDashboardData();
    }
  }, [authenticated]);

  // Auto-logout after 30 minutes of inactivity (shared-device safeguard).
  useEffect(() => {
    if (!authenticated) return;
    const IDLE_LIMIT_MS = 30 * 60 * 1000;
    let timer: ReturnType<typeof setTimeout>;
    const doIdleLogout = async () => {
      try { window.localStorage.removeItem('avk_pending_reset'); } catch (_e) { /* ignore */ }
      await supabase.auth.signOut();
      setAuthenticated(false);
      setIdleLoggedOut(true);
    };
    const reset = () => {
      clearTimeout(timer);
      timer = setTimeout(doIdleLogout, IDLE_LIMIT_MS);
    };
    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [authenticated]);

  const checkAuth = async () => {
    // Register the listener FIRST so the one-time PASSWORD_RECOVERY event is never missed.
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        try { window.localStorage.setItem('avk_pending_reset', '1'); } catch (_e) { /* ignore */ }
        setIsResettingPassword(true);
        setAuthenticated(false);
      } else if (event === 'SIGNED_OUT') {
        setAuthenticated(false);
      }
    });

    const { data } = await supabase.auth.getSession();

    // A password-recovery session must ALWAYS land on the reset screen, never the
    // dashboard — even if a valid session exists — until the password is actually reset.
    const pendingReset =
      isRecoveryLink ||
      (typeof window !== 'undefined' && window.localStorage.getItem('avk_pending_reset') === '1');

    if (pendingReset) {
      setIsResettingPassword(true);
      setAuthenticated(false);
    } else {
      setAuthenticated(!!data.session);
    }
    setLoading(false);
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

      try { window.localStorage.removeItem('avk_pending_reset'); } catch (_e) { /* ignore */ }
      setIdleLoggedOut(false);
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
      try { window.localStorage.removeItem('avk_pending_reset'); } catch (_e) { /* ignore */ }
      await supabase.auth.signOut();
      setAuthenticated(false);
      setResetSuccess(true);
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (error: any) {
      alert(error.message || 'Error al actualizar la contraseña');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try { window.localStorage.removeItem('avk_pending_reset'); } catch (_e) { /* ignore */ }
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
        const birthMonth = new Date(child.dob).getMonth() + 1;
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
    const raw = typeof data === 'string' ? data.trim() : JSON.stringify(data);
    let childId = '';
    let childNumber = '';

    // The printed badge QR encodes the profile URL: .../child/<uuid>
    const urlMatch = raw.match(/\/child\/([0-9a-fA-F-]{16,})/);
    if (urlMatch) {
      childId = urlMatch[1];
    } else {
      try {
        const parsed = JSON.parse(raw);
        childId = parsed.childId || parsed.child_id || '';
        childNumber = parsed.childNumber || parsed.child_number || '';
      } catch {
        childNumber = raw;
      }
    }

    const baseQuery = supabase.from('children').select('*, parents(*), intake_forms(*)');
    const { data: childData, error } = childId
      ? await baseQuery.eq('id', childId).maybeSingle()
      : await baseQuery.eq('unique_number', childNumber).maybeSingle();

    if (error) {
      console.error('QR scan error:', error.message);
      alert('Error al buscar el niño');
      return;
    }

    if (!childData) {
      alert('Niño no encontrado — verifique el código QR');
      return;
    }

    // Mark child as checked in today
    const now = new Date().toISOString();
    await supabase
      .from('children')
      .update({
        checked_in_today: true,
        check_in_time: now,
      })
      .eq('id', childData.id);

    // Insert attendance record for today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAttendance } = await supabase
      .from('attendance')
      .select('id')
      .eq('child_id', childData.id)
      .eq('date', today)
      .maybeSingle();

    if (!existingAttendance) {
      await supabase.from('attendance').insert({
        child_id: childData.id,
        child_number: childData.unique_number,
        date: today,
        checked_in_at: now,
        checked_in_by: 'qr-scan',
      });
    }

    setSelectedChild({ ...childData, checked_in_today: true, check_in_time: now });
    setShowQRScanner(false);
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

    // Backup SMS to the parent via Twilio (the on-screen red banner still shows regardless).
    if (parentData?.primary_phone) {
      try {
        const smsMsg = `ICGG Aviva Kids: Por favor venga al salon de su nino/a (#${alertNumber}). Motivo: ${alertReason}.`;
        await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ to: parentData.primary_phone, message: smsMsg }),
        });
        await supabase.from('alerts').update({ sms_sent: true }).eq('id', alertData.id);
      } catch (smsErr) {
        console.error('Alert SMS error (non-critical):', smsErr);
      }
    }

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

    // Start 12-second countdown then auto-clear
    setAlertSentMessage(`Alerta enviada — pantalla se limpiará en`);
    setAlertCountdown(12);
    const interval = setInterval(() => {
      setAlertCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setAlertSentMessage('');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const STAFF_PIN_PORTAL = import.meta.env.VITE_CHECKIN_PIN || '1234';

  const handleCheckout = async (child: any) => {
    if (!checkoutForm.pickedUpBy) {
      setCheckoutError('Seleccione quién recoge al niño.');
      return;
    }
    if (checkoutForm.pin !== STAFF_PIN_PORTAL) {
      setCheckoutError('PIN incorrecto.');
      return;
    }
    setCheckoutLoading(true);
    setCheckoutError('');
    try {
      const parent = child.parents?.[0];
      let relationship = '';
      let pickupPhoto: string | null = null;
      if (checkoutForm.pickedUpBy === parent?.primary_name) {
        relationship = parent?.primary_relationship || 'Padre/Madre';
        pickupPhoto = parent?.primary_photo_url || null;
      } else if (checkoutForm.pickedUpBy === parent?.secondary_name) {
        relationship = parent?.secondary_relationship || 'Contacto Secundario';
        pickupPhoto = parent?.secondary_photo_url || null;
      } else if (checkoutForm.pickedUpBy === parent?.approved_pickup_name) {
        relationship = 'Persona Autorizada';
        pickupPhoto = parent?.approved_pickup_photo_url || null;
      }

      const checkoutTime = new Date();
      const timeStr = checkoutTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      const dateStr = checkoutTime.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

      // 1. Record checkout
      const { error } = await supabase.from('checkouts').insert({
        child_id: child.id,
        child_number: child.unique_number,
        child_name: child.full_name,
        picked_up_by_name: checkoutForm.pickedUpBy,
        picked_up_by_relationship: relationship,
        released_by_teacher: email,
        checked_out_at: checkoutTime.toISOString(),
        checked_out_date: checkoutTime.toISOString().split('T')[0],
      });
      if (error) throw error;

      // 2. Send real-time notification to parent alerts page
      const notificationMessage = `✅ ${child.full_name} fue recogido/a a las ${timeStr} por ${checkoutForm.pickedUpBy} (${relationship}). Fecha: ${dateStr}. Autorizado por: ${email}.`;
      await supabase.from('alerts').insert({
        child_number: child.unique_number,
        child_id: child.id,
        reason: notificationMessage,
        resolved: false,
        parent_name: parent?.primary_name || '',
        parent_phone: parent?.primary_phone || '',
        sms_sent: false,
        alert_type: 'checkout',
        pickup_name: checkoutForm.pickedUpBy,
        pickup_photo_url: pickupPhoto,
      });

      // 3. Send SMS via Twilio if phone available
      const parentPhone = parent?.primary_phone;
      if (parentPhone) {
        try {
          const smsMessage = `ICGG Aviva Kids: ${child.full_name} fue recogido/a a las ${timeStr} por ${checkoutForm.pickedUpBy}. Si tiene preguntas llame a la iglesia.`;
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-sms`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ to: parentPhone, message: smsMessage }),
          });
        } catch (smsErr) {
          console.error('SMS send error (non-critical):', smsErr);
        }
      }

      // 4. Mark child as not checked in
      await supabase.from('children').update({ checked_in_today: false, check_in_time: null }).eq('id', child.id);

      setCheckoutChildId(null);
      setCheckoutForm({ pickedUpBy: '', relationship: '', pin: '' });
      fetchDashboardData();
    } catch (err: any) {
      setCheckoutError(err.message || 'Error al registrar salida');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleChildPhotoUpload = async (file: File, childId: string) => {
    setPhotoUploading(prev => ({ ...prev, [childId]: true }));
    try {
      const { uploadPhoto } = await import('../utils/photoUtils');
      const path = `child-${childId}-${Date.now()}.jpg`;
      const url = await uploadPhoto(file, 'child-photos', path);
      if (url) {
        await supabase.from('children').update({ photo_url: url }).eq('id', childId);
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Child photo upload error:', err);
    } finally {
      setPhotoUploading(prev => ({ ...prev, [childId]: false }));
    }
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
      flyer_url: '',
    });

    fetchDashboardData();
  };

  const handleFlyerUpload = async (file: File) => {
    setFlyerUploading(true);
    try {
      const { uploadPhoto } = await import('../utils/photoUtils');
      const path = `flyer-${Date.now()}.jpg`;
      const url = await uploadPhoto(file, 'child-photos', path);
      if (url) setNewEvent(prev => ({ ...prev, flyer_url: url }));
    } catch (err) {
      console.error('Flyer upload error:', err);
    } finally {
      setFlyerUploading(false);
    }
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
          className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 sm:p-12 shadow-2xl max-w-md w-full border-2 border-white/20"
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
              <button
                type="button"
                onClick={async () => {
                  try { window.localStorage.removeItem('avk_pending_reset'); } catch (_e) { /* ignore */ }
                  await supabase.auth.signOut();
                  setIsResettingPassword(false);
                  setAuthenticated(false);
                }}
                className="w-full text-center text-gray-500 font-bold text-sm hover:text-kids-purple"
              >
                Volver al inicio de sesion
              </button>
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
          className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 sm:p-12 shadow-2xl max-w-md w-full border-2 border-white/20"
        >
          {idleLoggedOut && (
            <div className="mb-6 bg-kids-yellow/15 border-2 border-kids-yellow rounded-bubbly p-4 text-center">
              <p className="text-sm font-bold text-gray-700">Tu sesion se cerro por inactividad. Inicia sesion de nuevo.</p>
            </div>
          )}
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
                    <button
                      type="button"
                      onClick={() => {
                        setIsSignUp(!isSignUp);
                        setPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-kids-purple font-bold hover:underline"
                    >
                      {isSignUp
                        ? 'Ya tienes cuenta? Inicia sesion'
                        : 'No tienes cuenta? Registrate'}
                    </button>
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
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-kids-purple">
            {t.teacherPortal.dashboard}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
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

        {/* Prominent QR check-in button — always visible at the top on every device (no nav overlap) */}
        <button
          onClick={() => setShowQRScanner(true)}
          className="w-full sm:w-auto mb-6 flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-kids-purple to-kids-blue text-white rounded-bubbly font-black text-xl shadow-xl hover:scale-[1.02] active:scale-95 transition-transform"
        >
          <QrCode className="w-7 h-7" />
          <span>Escanear QR — Registrar Niño</span>
        </button>

        <div className="flex flex-wrap gap-4 mb-8">
          {[
            { id: 'dashboard', label: t.teacherPortal.dashboard, icon: Users },
            { id: 'children', label: 'Todos los Niños', icon: Users },
            { id: 'alerts', label: t.teacherPortal.alertPanel, icon: Bell },
            { id: 'events', label: t.teacherPortal.eventManager, icon: Calendar },
            { id: 'birthdays', label: t.teacherPortal.birthdayManager, icon: Cake },
            { id: 'analytics', label: 'Analíticas', icon: TrendingUp },
            { id: 'lessons', label: 'Lecciones', icon: BookOpen },
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
                    {events.filter(e => new Date(e.date) >= new Date()).length}
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-700">
                  Próximos Eventos
                </div>
              </motion.div>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-black text-kids-blue flex items-center">
                  <Users className="w-8 h-8 mr-3 flex-shrink-0" />
                  {t.teacherPortal.checkInList}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setShowQRScanner(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-kids-purple text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                  >
                    <QrCode className="w-5 h-5" />
                    <span>Escanear QR</span>
                  </button>
                  <button
                    onClick={exportCSV}
                    className="flex items-center space-x-2 px-4 py-2 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                  >
                    <Download className="w-5 h-5" />
                    <span>{t.teacherPortal.exportCSV}</span>
                  </button>
                </div>
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
                          <div className="flex items-center gap-3">
                            {/* Child photo thumbnail */}
                            {child.photo_url ? (
                              <img src={child.photo_url} alt={child.full_name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-kids-purple flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-kids-purple/10 flex items-center justify-center flex-shrink-0 border-2 border-kids-purple/20">
                                <span className="text-kids-purple font-black text-lg">{child.full_name.charAt(0)}</span>
                              </div>
                            )}
                            <div>
                              <div className="text-xl font-black text-kids-purple">
                                {child.full_name}
                              </div>
                              <div className="text-sm font-semibold text-gray-600">
                                {t.teacherPortal.childNumber}: {child.unique_number} |{' '}
                                {child.room}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
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
                          {/* Checkout button */}
                          <button
                            onClick={() => {
                              setCheckoutChildId(checkoutChildId === child.id ? null : child.id);
                              setCheckoutForm({ pickedUpBy: '', relationship: '', pin: '' });
                              setCheckoutError('');
                            }}
                            className={`px-4 py-2 rounded-bubbly font-bold text-sm transition-all ${checkoutChildId === child.id ? 'bg-red-500 text-white' : 'bg-orange-100 text-orange-600 border-2 border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500'}`}
                          >
                            {checkoutChildId === child.id ? 'Cancelar' : '🚪 Check-Out'}
                          </button>
                        </div>
                      </div>

                      {/* Checkout panel */}
                      <AnimatePresence>
                        {checkoutChildId === child.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 pt-4 border-t-2 border-orange-200"
                          >
                            <p className="text-sm font-black text-orange-600 uppercase tracking-wide mb-3">Registrar Salida</p>
                            {(() => {
                              const parent = child.parents?.[0];
                              const approvedList = [
                                parent?.primary_name && { name: parent.primary_name, rel: parent.primary_relationship || 'Padre/Madre', photo: parent.primary_photo_url },
                                parent?.secondary_name && { name: parent.secondary_name, rel: parent.secondary_relationship || 'Contacto Secundario', photo: parent.secondary_photo_url },
                                parent?.approved_pickup_name && { name: parent.approved_pickup_name, rel: 'Persona Autorizada', photo: parent.approved_pickup_photo_url },
                              ].filter(Boolean) as { name: string; rel: string; photo?: string }[];

                              return (
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-black text-gray-600 mb-2">¿Quién recoge al niño?</label>
                                    {approvedList.length > 0 ? (
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                        {approvedList.map((person, i) => (
                                          <button key={i} type="button"
                                            onClick={() => setCheckoutForm(prev => ({ ...prev, pickedUpBy: person.name, relationship: person.rel }))}
                                            className={`flex items-center gap-3 p-3 rounded-bubbly border-2 transition-all text-left ${checkoutForm.pickedUpBy === person.name ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-300'}`}
                                          >
                                            {person.photo ? (
                                              <img src={person.photo} alt={person.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-orange-200" />
                                            ) : (
                                              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                                                <span className="text-orange-600 font-black">{person.name.charAt(0)}</span>
                                              </div>
                                            )}
                                            <div>
                                              <p className="font-black text-gray-800 text-sm">{person.name}</p>
                                              <p className="text-xs text-gray-500">{person.rel}</p>
                                            </div>
                                          </button>
                                        ))}
                                      </div>
                                    ) : (
                                      <input type="text" value={checkoutForm.pickedUpBy}
                                        onChange={e => setCheckoutForm(prev => ({ ...prev, pickedUpBy: e.target.value }))}
                                        placeholder="Nombre de quien recoge"
                                        className="w-full px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-orange-400 focus:outline-none font-semibold text-sm" />
                                    )}
                                  </div>
                                  <div>
                                    <label className="block text-xs font-black text-gray-600 mb-1">PIN de Personal</label>
                                    <input type="password" maxLength={4} value={checkoutForm.pin}
                                      onChange={e => { setCheckoutForm(prev => ({ ...prev, pin: e.target.value })); setCheckoutError(''); }}
                                      placeholder="••••"
                                      className="w-32 px-3 py-2 rounded-bubbly border-2 border-gray-300 focus:border-orange-400 focus:outline-none font-black text-center text-xl tracking-widest" />
                                  </div>
                                  {checkoutError && <p className="text-red-500 font-bold text-sm">{checkoutError}</p>}
                                  <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => handleCheckout(child)}
                                    disabled={checkoutLoading}
                                    className="px-6 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black rounded-bubbly shadow-lg disabled:opacity-50"
                                  >
                                    {checkoutLoading ? 'Registrando...' : '🚪 Confirmar Salida'}
                                  </motion.button>
                                </div>
                              );
                            })()}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 font-bold">
                  {t.teacherPortal.noChildrenCheckedIn}
                </div>
              )}
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
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
          <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
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
                <label className="block text-lg font-bold text-gray-700 mb-2">
                  {t.teacherPortal.alertReason}
                </label>
                <select
                  value={alertReason}
                  onChange={(e) => setAlertReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold"
                >
                  <option value="">Seleccione...</option>
                  <option value={t.teacherPortal.needsAttention}>
                    {t.teacherPortal.needsAttention}
                  </option>
                  <option value={t.teacherPortal.pickUpChild}>
                    {t.teacherPortal.pickUpChild}
                  </option>
                </select>
              </div>

              <button
                onClick={triggerAlert}
                className="w-full py-4 bg-gradient-to-r from-kids-coral to-red-500 text-white text-xl font-black rounded-bubbly shadow-lg hover:scale-105 transition-transform"
              >
                {t.teacherPortal.triggerAlert}
              </button>

              {/* Countdown banner after alert sent */}
              <AnimatePresence>
                {alertCountdown > 0 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-gradient-to-r from-kids-mint to-kids-blue rounded-bubbly p-5 text-center shadow-lg"
                  >
                    <div className="text-white font-black text-lg mb-1">
                      ✅ ¡Alerta enviada exitosamente!
                    </div>
                    <div className="text-white/80 font-semibold text-sm mb-3">
                      {alertSentMessage}
                    </div>
                    <motion.div
                      key={alertCountdown}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      className="text-white font-black text-5xl"
                    >
                      {alertCountdown}
                    </motion.div>
                    <div className="mt-2 h-2 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: '100%' }}
                        animate={{ width: `${(alertCountdown / 12) * 100}%` }}
                        transition={{ duration: 1, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20 mt-8">
              <h2 className="text-3xl font-black text-kids-purple mb-6">
                Historial de Alertas
              </h2>
              <div className="space-y-4">
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
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-8">
            <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
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

                {/* Flyer upload */}
                <div className="border-2 border-dashed border-kids-blue/40 rounded-bubbly p-4 bg-kids-blue/5">
                  <p className="text-sm font-black text-kids-blue mb-2">📋 Flyer del Evento (opcional)</p>
                  {newEvent.flyer_url ? (
                    <div className="flex items-center gap-3">
                      <img src={newEvent.flyer_url} alt="Flyer" className="w-20 h-20 object-cover rounded-lg border-2 border-kids-blue" />
                      <div>
                        <p className="text-xs font-bold text-green-600 mb-1">✓ Flyer subido</p>
                        <button type="button" onClick={() => setNewEvent(prev => ({ ...prev, flyer_url: '' }))}
                          className="text-xs text-red-500 font-bold hover:underline">Eliminar</button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div className={`px-4 py-2 rounded-bubbly font-bold text-sm transition-all ${flyerUploading ? 'bg-gray-100 text-gray-400' : 'bg-kids-blue text-white hover:bg-kids-blue/80'}`}>
                        {flyerUploading ? 'Subiendo...' : '📤 Subir Flyer'}
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">JPG, PNG — se comprime automáticamente</span>
                      <input type="file" accept="image/*" className="hidden" disabled={flyerUploading}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFlyerUpload(f); }} />
                    </label>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-kids-blue text-white text-xl font-black rounded-bubbly shadow-lg hover:scale-105 transition-transform"
                >
                  {t.calendar.addEvent}
                </button>
              </form>
            </div>

            <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
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
                        {new Date(event.date).toLocaleDateString()} |{' '}
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
          <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
            <h2 className="text-3xl font-black text-kids-yellow mb-6 flex items-center">
              <Cake className="w-8 h-8 mr-3" />
              {t.teacherPortal.birthdayManager}
            </h2>

            <div className="space-y-4">
              {birthdayChildren.map((child) => (
                <div
                  key={child.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-bubbly"
                >
                  <div>
                    <div className="text-xl font-black text-gray-800">
                      {child.full_name}
                    </div>
                    <div className="text-sm font-semibold text-gray-600">
                      {new Date(child.dob).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      toggleBirthdayCelebrated(child.id, child.birthday_celebrated)
                    }
                    className={`px-4 py-2 rounded-bubbly font-bold ${
                      child.birthday_celebrated
                        ? 'bg-kids-mint text-white'
                        : 'bg-gray-300 text-gray-700'
                    }`}
                  >
                    {child.birthday_celebrated
                      ? t.birthdays.celebrated
                      : t.teacherPortal.markCelebrated}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && <Analytics />}

        {activeTab === 'lessons' && <TeacherLessons />}

        {activeTab === 'children' && (
          <div className="bg-white/95 backdrop-blur-xl rounded-bubbly p-8 shadow-xl border border-white/20">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-kids-blue flex items-center">
                <Users className="w-8 h-8 mr-3 flex-shrink-0" />
                Todos los Niños Registrados
              </h2>
              <div className="flex flex-wrap items-center gap-4">
                <div className="text-lg font-bold text-gray-600">
                  Total: {allChildren.length}
                </div>
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-kids-mint to-kids-blue text-white rounded-bubbly font-bold hover:scale-105 transition-transform shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    <span>Exportar Registros</span>
                  </button>

                  <AnimatePresence>
                    {showExportMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-bubbly shadow-2xl border-2 border-kids-blue z-50 p-4"
                      >
                        <h3 className="text-lg font-black text-kids-purple mb-4">
                          Seleccione el formato de exportación
                        </h3>

                        <div className="space-y-3 mb-4">
                          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="export-format"
                              value="pdf-detailed"
                              checked={exportFormat === 'pdf-detailed'}
                              onChange={(e) => setExportFormat(e.target.value as any)}
                              className="mt-1 w-5 h-5 text-kids-purple"
                            />
                            <div>
                              <div className="font-bold text-gray-800">PDF Detallado</div>
                              <div className="text-xs text-gray-600">
                                Incluye foto, QR code, información completa de padres, contactos, dirección, y todos los datos médicos y de emergencia
                              </div>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="export-format"
                              value="pdf-summary"
                              checked={exportFormat === 'pdf-summary'}
                              onChange={(e) => setExportFormat(e.target.value as any)}
                              className="mt-1 w-5 h-5 text-kids-purple"
                            />
                            <div>
                              <div className="font-bold text-gray-800">PDF Tabla Resumen</div>
                              <div className="text-xs text-gray-600">
                                Tabla compacta con información esencial en formato horizontal
                              </div>
                            </div>
                          </label>

                          <label className="flex items-start space-x-3 cursor-pointer p-3 rounded-lg hover:bg-gray-50 transition-colors">
                            <input
                              type="radio"
                              name="export-format"
                              value="excel"
                              checked={exportFormat === 'excel'}
                              onChange={(e) => setExportFormat(e.target.value as any)}
                              className="mt-1 w-5 h-5 text-kids-purple"
                            />
                            <div>
                              <div className="font-bold text-gray-800">Excel (XLSX)</div>
                              <div className="text-xs text-gray-600">
                                Hoja de cálculo con toda la información en columnas editables
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={handleExport}
                            className="flex-1 py-3 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                          >
                            Exportar
                          </button>
                          <button
                            onClick={() => setShowExportMenu(false)}
                            className="px-4 py-3 bg-gray-300 text-gray-700 rounded-bubbly font-bold hover:scale-105 transition-transform"
                          >
                            Cancelar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
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
                              {new Date(child.dob).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-gray-600">Sala:</span>{' '}
                            <span className="text-gray-800">{child.room}</span>
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
                        {/* Child photo upload */}
                        <PhotoUpload
                          currentUrl={child.photo_url}
                          onUpload={(file) => handleChildPhotoUpload(file, child.id)}
                          label="Foto del niño"
                          uploading={photoUploading[child.id]}
                          size="md"
                        />
                        <button
                          onClick={() => setSelectedChild(child)}
                          className="px-4 py-2 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform w-full"
                        >
                          Ver QR Code
                        </button>
                      </div>
                    </div>
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

        {/* Floating staff chat — teachers only (rendered inside authenticated portal) */}
        <StaffChat />

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
                        {new Date(selectedChild.dob).toLocaleDateString()}
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
