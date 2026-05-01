import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Users,
  QrCode,
  Bell,
  Calendar,
  Cake,
  TrendingUp,
  LogIn,
  LayoutDashboard,
  Search,
  Download,
  ClipboardList,
  CheckCircle,
  Phone,
  Heart,
  AlertTriangle,
  Plus,
  Star,
  HelpCircle,
  Baby,
  FileText,
} from 'lucide-react';

interface TutorialSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
}

const PART_COLORS = {
  parents: 'from-kids-blue to-kids-mint',
  admin: 'from-kids-purple to-kids-blue',
};

interface SlideSection {
  part: 'parents' | 'admin';
  label: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const slides: SlideSection[] = [
  // ─── PART 1 ───────────────────────────────────────────────────────────────
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Bienvenida a Aviva Kids',
    subtitle: 'What Parents Experience',
    icon: <Baby className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-700 text-lg leading-relaxed">
          Aviva Kids es el sistema de gestión digital del ministerio infantil. Permite a los padres registrar a sus
          hijos, obtener un código QR único y hacer check-in cada domingo de forma rápida y segura.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <ClipboardList className="w-5 h-5 text-kids-blue" />, label: 'Formulario de Admisión', desc: 'Registro en línea fácil' },
            { icon: <QrCode className="w-5 h-5 text-kids-purple" />, label: 'Código QR Único', desc: 'Credencial personal por niño' },
            { icon: <CheckCircle className="w-5 h-5 text-kids-mint" />, label: 'Check-In Rápido', desc: 'Escaneo en segundos' },
            { icon: <Bell className="w-5 h-5 text-kids-coral" />, label: 'Alertas en Tiempo Real', desc: 'Notificaciones al instante' },
          ].map((item, i) => (
            <div key={i} className="bg-gray-50 rounded-2xl p-4 flex items-start gap-3 border border-gray-100">
              <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                {item.icon}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-kids-blue/10 border border-kids-blue/30 rounded-2xl p-4">
          <p className="text-kids-blue font-bold text-sm">
            El flujo para los padres es simple: Formulario → Código QR → Check-In cada domingo.
          </p>
        </div>
      </div>
    ),
  },
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Formulario de Admisión',
    subtitle: 'Intake Form — Step by Step',
    icon: <ClipboardList className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Los padres completan este formulario una sola vez. Toda la información queda guardada en el sistema.
        </p>
        {/* Mock form UI */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest mb-3">Vista del Formulario</p>
          {[
            { label: 'Nombre del Niño', placeholder: 'ej. Sofía Martínez', required: true },
            { label: 'Fecha de Nacimiento', placeholder: 'MM/DD/AAAA', required: true },
            { label: 'Sala / Grado', placeholder: 'ej. Preescolar, Primaria', required: true },
          ].map((field, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-gray-600 mb-1">
                {field.label} {field.required && <span className="text-kids-coral">*</span>}
              </p>
              <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
                <span className="text-xs text-gray-400">{field.placeholder}</span>
              </div>
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Información de Padres</p>
            {[
              { label: 'Nombre del Padre / Madre', placeholder: 'Nombre completo' },
              { label: 'Teléfono', placeholder: '+1 (___) ___-____' },
              { label: 'Email', placeholder: 'correo@ejemplo.com' },
            ].map((field, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-gray-600 mb-1">{field.label}</p>
                <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
                  <span className="text-xs text-gray-400">{field.placeholder}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Información Médica</p>
            {[
              { label: 'Alergias', placeholder: 'ej. maní, penicilina...' },
              { label: 'Condiciones Médicas', placeholder: 'ej. asma, diabetes...' },
              { label: 'Contacto de Emergencia', placeholder: 'Nombre y teléfono' },
            ].map((field, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-gray-600 mb-1">{field.label}</p>
                <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
                  <span className="text-xs text-gray-400">{field.placeholder}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Heart className="w-4 h-4 text-kids-coral mt-0.5 flex-shrink-0" />
          <span>La información médica es confidencial y solo visible para el personal autorizado.</span>
        </div>
      </div>
    ),
  },
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Código QR del Niño',
    subtitle: 'QR Code & Child Number',
    icon: <QrCode className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Al completar el formulario, el sistema genera automáticamente un <strong>código QR único</strong> y un{' '}
          <strong>número de niño</strong>. Los padres pueden descargarlo o imprimirlo como credencial.
        </p>
        {/* Mock QR badge */}
        <div className="flex justify-center">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-lg w-64 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-kids-blue to-kids-mint rounded-full mx-auto mb-3 flex items-center justify-center">
              <Baby className="w-8 h-8 text-white" />
            </div>
            <p className="font-black text-gray-800 text-lg">Sofía Martínez</p>
            <p className="text-kids-purple font-bold text-sm mb-3">Preescolar</p>
            {/* Fake QR */}
            <div className="w-28 h-28 mx-auto bg-gray-900 rounded-xl p-2 grid grid-cols-7 gap-0.5 mb-3">
              {Array.from({ length: 49 }).map((_, i) => (
                <div
                  key={i}
                  className={`rounded-sm ${
                    [0,1,2,3,4,5,6,7,14,21,28,35,42,43,44,45,46,47,48,8,15,22,29,36,13,20,27,34,41,10,11,12,17,18,19,23,25,30,31,32].includes(i)
                      ? 'bg-white'
                      : 'bg-gray-900'
                  }`}
                />
              ))}
            </div>
            <div className="bg-kids-purple/10 rounded-xl px-4 py-2">
              <p className="text-xs text-gray-500 font-semibold">Número de Niño</p>
              <p className="text-kids-purple font-black text-xl tracking-widest">#0042</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Download className="w-4 h-4" />, text: 'Descargable como PDF' },
            { icon: <CheckCircle className="w-4 h-4" />, text: 'Único por cada niño' },
            { icon: <QrCode className="w-4 h-4" />, text: 'Válido cada domingo' },
            { icon: <Phone className="w-4 h-4" />, text: 'Funciona en celular' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
              <span className="text-kids-blue">{item.icon}</span>
              <span className="text-gray-700 text-sm font-semibold">{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Check-In los Domingos',
    subtitle: 'Sunday Check-In Process',
    icon: <CheckCircle className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Cada domingo, los padres hacen check-in en la estación de registro usando su código QR o el número de su hijo.
        </p>
        {/* Step by step */}
        <div className="space-y-3">
          {[
            {
              step: '1',
              color: 'bg-kids-blue',
              title: 'Llegar a la estación',
              desc: 'El personal tiene una tableta con la pantalla de Check-In abierta.',
            },
            {
              step: '2',
              color: 'bg-kids-purple',
              title: 'Escanear el código QR',
              desc: 'El padre muestra su credencial QR o el staff escanea con la cámara.',
            },
            {
              step: '3',
              color: 'bg-kids-mint',
              title: 'O ingresar número de niño',
              desc: 'Alternativamente, escribir el número asignado (ej. #0042).',
            },
            {
              step: '4',
              color: 'bg-kids-coral',
              title: 'Confirmación inmediata',
              desc: 'El niño aparece como "Presente" en el dashboard del maestro al instante.',
            },
          ].map((s, i) => (
            <div key={i} className="flex items-start gap-4">
              <div className={`w-9 h-9 ${s.color} rounded-full flex items-center justify-center flex-shrink-0 shadow-md`}>
                <span className="text-white font-black text-sm">{s.step}</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-3 flex-1 border border-gray-100">
                <p className="font-bold text-gray-800 text-sm">{s.title}</p>
                <p className="text-gray-600 text-xs mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        {/* Mock check-in screen */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-black text-kids-blue uppercase tracking-widest mb-3">Pantalla de Check-In</p>
          <div className="w-full h-10 bg-gray-100 rounded-xl border border-gray-200 flex items-center gap-2 px-3 mb-2">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Buscar por nombre o número de niño...</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Sofía Martínez', num: '#0042', in: true },
              { name: 'Lucas Herrera', num: '#0017', in: false },
            ].map((child, i) => (
              <div key={i} className={`flex items-center justify-between rounded-xl p-2 px-3 ${child.in ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                <div>
                  <p className="text-sm font-bold text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.num}</p>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${child.in ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'}`}>
                  {child.in ? 'Presente' : 'Ausente'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },

  // ─── PART 2 ───────────────────────────────────────────────────────────────
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Cómo Iniciar Sesión',
    subtitle: 'Login & Password Recovery',
    icon: <LogIn className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          El Portal del Maestro es accesible desde el menú de navegación. Solo el personal autorizado con una cuenta
          puede entrar.
        </p>
        {/* Login mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm max-w-sm mx-auto space-y-4">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest text-center">Portal del Maestro</p>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Email</p>
            <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
              <span className="text-xs text-gray-400">maestro@avivakids.com</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <p className="text-xs font-bold text-gray-600">Contraseña</p>
              <span className="text-xs font-bold text-kids-blue">Olvidé mi contraseña</span>
            </div>
            <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
              <span className="text-xs text-gray-400">••••••••••</span>
            </div>
          </div>
          <div className="w-full h-10 bg-gradient-to-r from-kids-purple to-kids-blue rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">Entrar</span>
          </div>
          <p className="text-center text-xs text-kids-purple font-bold">¿No tienes cuenta? Regístrate</p>
        </div>
        <div className="space-y-2">
          {[
            { icon: <CheckCircle className="w-4 h-4 text-green-500" />, text: 'Usa tu email y contraseña para acceder.' },
            { icon: <AlertTriangle className="w-4 h-4 text-kids-yellow" />, text: 'Si olvidaste tu contraseña, haz clic en "Olvidé mi contraseña" — recibirás un enlace por email.' },
            { icon: <Heart className="w-4 h-4 text-kids-coral" />, text: 'Contacta al administrador si necesitas una cuenta nueva.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Dashboard Principal',
    subtitle: 'Overview & Stats',
    icon: <LayoutDashboard className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Al iniciar sesión verás el Dashboard con estadísticas en tiempo real y acceso a todas las funciones.
        </p>
        {/* Dashboard mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Dashboard</p>
          {/* Stats cards */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Registrados', value: '47', color: 'bg-kids-purple/10 border-kids-purple/30 text-kids-purple' },
              { label: 'Hoy', value: '12', color: 'bg-green-50 border-green-300 text-green-700' },
              { label: 'Eventos', value: '3', color: 'bg-kids-blue/10 border-kids-blue/30 text-kids-blue' },
            ].map((stat, i) => (
              <div key={i} className={`rounded-xl p-2 border text-center ${stat.color}`}>
                <p className="text-xl font-black">{stat.value}</p>
                <p className="text-xs font-bold opacity-80">{stat.label}</p>
              </div>
            ))}
          </div>
          {/* Tabs */}
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
            {['Dashboard', 'Alertas', 'Eventos', 'Cumpleaños', 'Analíticas', 'Niños'].map((tab, i) => (
              <div key={i} className={`flex-1 text-center py-1 rounded-lg text-xs font-bold ${i === 0 ? 'bg-white shadow-sm text-kids-purple' : 'text-gray-400'}`}>
                {tab}
              </div>
            ))}
          </div>
          {/* Children list */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-500">Niños presentes hoy</p>
            {[
              { name: 'Sofía Martínez', time: '9:05 AM', room: 'Preescolar' },
              { name: 'Lucas Herrera', time: '9:12 AM', room: 'Primaria' },
            ].map((child, i) => (
              <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl p-2">
                <div>
                  <p className="text-xs font-bold text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.room} · {child.time}</p>
                </div>
                <span className="w-2 h-2 bg-green-400 rounded-full" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-8 bg-gradient-to-r from-kids-purple to-kids-blue rounded-xl flex items-center justify-center gap-1">
              <QrCode className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-bold">Escanear QR</span>
            </div>
            <div className="flex-1 h-8 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-600 text-xs font-bold">Tutorial</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Panel de Alertas',
    subtitle: 'Emergency Notifications',
    icon: <Bell className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Desde el Panel de Alertas puedes enviar notificaciones urgentes a los padres por email de forma inmediata.
        </p>
        {/* Alert panel mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-kids-coral uppercase tracking-widest">Panel de Alertas</p>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Número del Niño <span className="text-kids-coral">*</span></p>
            <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
              <span className="text-xs text-gray-400">ej. #0042</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Razón de la Alerta</p>
            <div className="grid grid-cols-2 gap-2">
              {['Recogida Urgente', 'Emergencia Médica', 'Comportamiento', 'Mensaje General'].map((reason, i) => (
                <div key={i} className={`text-center py-2 px-3 rounded-xl text-xs font-bold border ${i === 0 ? 'bg-kids-coral text-white border-kids-coral' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {reason}
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-gradient-to-r from-kids-coral to-kids-yellow rounded-xl flex items-center justify-center gap-1">
              <Bell className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-black">Enviar Alerta</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2">
            <p className="text-xs font-bold text-gray-500 mb-2">Historial de Alertas</p>
            {[
              { name: 'Sofía Martínez', reason: 'Recogida Urgente', time: 'Hoy 10:32 AM' },
            ].map((alert, i) => (
              <div key={i} className="bg-red-50 border border-red-200 rounded-xl p-2 flex justify-between items-center">
                <div>
                  <p className="text-xs font-bold text-gray-800">{alert.name}</p>
                  <p className="text-xs text-gray-500">{alert.reason}</p>
                </div>
                <p className="text-xs text-gray-400">{alert.time}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Ingresa el número del niño para identificar a quién pertenece la alerta.',
            'Selecciona el tipo de alerta según la situación.',
            'El sistema envía un email automático al padre o madre registrado.',
            'Todas las alertas quedan guardadas en el historial.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <div className="w-5 h-5 bg-kids-coral rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-black">{i + 1}</span>
              </div>
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Gestor de Eventos',
    subtitle: 'Event Manager',
    icon: <Calendar className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Agrega, visualiza y elimina eventos del ministerio. Los eventos aparecen en el calendario público y
          en el dashboard de los maestros.
        </p>
        {/* Event manager mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-kids-blue uppercase tracking-widest">Agregar Nuevo Evento</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Título', placeholder: 'ej. Día de Pijamas' },
              { label: 'Fecha', placeholder: 'MM/DD/AAAA' },
              { label: 'Hora', placeholder: '9:00 AM' },
              { label: 'Lugar', placeholder: 'ej. Salón Principal' },
            ].map((field, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-gray-600 mb-1">{field.label}</p>
                <div className="w-full h-8 bg-gray-100 rounded-lg border border-gray-200 px-2 flex items-center">
                  <span className="text-xs text-gray-400">{field.placeholder}</span>
                </div>
              </div>
            ))}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Descripción</p>
            <div className="w-full h-16 bg-gray-100 rounded-xl border border-gray-200 px-3 py-2">
              <span className="text-xs text-gray-400">Descripción del evento...</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Categoría</p>
            <div className="flex gap-2 flex-wrap">
              {['Especial', 'Regular', 'Feriado', 'Capacitación'].map((cat, i) => (
                <span key={i} className={`text-xs font-bold px-3 py-1 rounded-full border ${i === 0 ? 'bg-kids-blue text-white border-kids-blue' : 'bg-white text-gray-600 border-gray-300'}`}>{cat}</span>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-9 bg-gradient-to-r from-kids-blue to-kids-mint rounded-xl flex items-center justify-center gap-1">
              <Plus className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-black">Agregar Evento</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-2 space-y-2">
            <p className="text-xs font-bold text-gray-500">Próximos Eventos</p>
            {[
              { title: 'Día de Pijamas', date: 'May 4, 2025', cat: 'Especial' },
              { title: 'Domingo Regular', date: 'May 11, 2025', cat: 'Regular' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-800">{ev.title}</p>
                  <p className="text-xs text-gray-500">{ev.date} · {ev.cat}</p>
                </div>
                <X className="w-4 h-4 text-gray-400 cursor-pointer hover:text-kids-coral" />
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Cumpleaños',
    subtitle: 'Birthday Tracker',
    icon: <Cake className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          La pestaña de Cumpleaños muestra todos los niños que cumplen años este mes. Puedes marcarlos como
          celebrados para llevar registro.
        </p>
        {/* Birthday mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-kids-yellow uppercase tracking-widest">Cumpleaños — Mayo 2025</p>
            <span className="bg-kids-yellow/20 text-kids-yellow font-black text-xs px-2 py-0.5 rounded-full border border-kids-yellow/40">3 este mes</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Sofía Martínez', date: 'Mayo 3', age: '6 años', celebrated: true },
              { name: 'Diego López', date: 'Mayo 14', age: '8 años', celebrated: false },
              { name: 'Valeria Ruiz', date: 'Mayo 28', age: '5 años', celebrated: false },
            ].map((child, i) => (
              <div key={i} className={`flex items-center justify-between rounded-xl p-3 border ${child.celebrated ? 'bg-green-50 border-green-200' : 'bg-kids-yellow/5 border-kids-yellow/30'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${child.celebrated ? 'bg-green-400' : 'bg-kids-yellow/30'}`}>
                    {child.celebrated ? <CheckCircle className="w-5 h-5 text-white" /> : <Cake className="w-5 h-5 text-kids-yellow" />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-800">{child.name}</p>
                    <p className="text-xs text-gray-500">{child.date} · {child.age}</p>
                  </div>
                </div>
                {child.celebrated ? (
                  <span className="text-xs text-green-600 font-bold">Celebrado</span>
                ) : (
                  <div className="h-7 px-3 bg-kids-yellow rounded-xl flex items-center">
                    <span className="text-white text-xs font-black">Marcar</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="bg-kids-yellow/10 border border-kids-yellow/30 rounded-2xl p-4">
          <p className="text-gray-700 font-semibold text-sm">
            Los cumpleaños se calculan automáticamente a partir de la fecha de nacimiento ingresada en el formulario de admisión. No requiere ninguna acción adicional.
          </p>
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Analíticas',
    subtitle: 'Attendance Analytics',
    icon: <TrendingUp className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          La sección de Analíticas ofrece gráficos de asistencia, tendencias y estadísticas del ministerio a lo largo
          del tiempo.
        </p>
        {/* Analytics mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Analíticas de Asistencia</p>
          {/* Bar chart mock */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-2">Asistencia por Semana</p>
            <div className="flex items-end gap-2 h-24">
              {[8, 14, 11, 17, 12, 20, 15].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-lg"
                    style={{
                      height: `${(val / 20) * 80}px`,
                      background: i === 5 ? 'linear-gradient(to top, #CE93D8, #7C3AED)' : '#E5E7EB',
                    }}
                  />
                  <span className="text-xs text-gray-400">{['E', 'F', 'M', 'A', 'M', 'J', 'J'][i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Promedio semanal', value: '14', icon: <Users className="w-3 h-3" /> },
              { label: 'Máx. asistencia', value: '20', icon: <Star className="w-3 h-3" /> },
              { label: 'Total registros', value: '47', icon: <CheckCircle className="w-3 h-3" /> },
            ].map((stat, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-2 text-center border border-gray-100">
                <div className="flex justify-center text-kids-purple mb-1">{stat.icon}</div>
                <p className="text-lg font-black text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-500 leading-tight">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          {[
            'Los datos se actualizan automáticamente con cada check-in.',
            'Usa las analíticas para planificar el personal necesario cada domingo.',
            'Identifica tendencias de crecimiento o disminución de asistencia.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <TrendingUp className="w-4 h-4 text-kids-purple mt-0.5 flex-shrink-0" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Todos los Niños',
    subtitle: 'Children Registry & Export',
    icon: <Users className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Aquí puedes ver todos los niños registrados, buscar por nombre, ver sus códigos QR individuales y exportar
          los registros completos.
        </p>
        {/* Children list mock */}
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Todos los Niños Registrados</p>
          <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Buscar por nombre...</span>
          </div>
          <div className="space-y-2">
            {[
              { name: 'Sofía Martínez', num: '#0042', room: 'Preescolar', dob: '03/May/2019' },
              { name: 'Lucas Herrera', num: '#0017', room: 'Primaria', dob: '22/Sep/2016' },
            ].map((child, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                <div>
                  <p className="text-sm font-bold text-gray-800">{child.name}</p>
                  <p className="text-xs text-gray-500">{child.num} · {child.room} · {child.dob}</p>
                </div>
                <QrCode className="w-5 h-5 text-kids-purple" />
              </div>
            ))}
          </div>
          {/* Export buttons */}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-xs font-bold text-gray-500 mb-2">Exportar Registros</p>
            {[
              { label: 'PDF Detallado', desc: 'Fotos, QR, info médica completa', color: 'from-kids-purple to-kids-blue' },
              { label: 'PDF Resumen', desc: 'Tabla compacta de referencia rápida', color: 'from-kids-blue to-kids-mint' },
              { label: 'Excel', desc: 'Hoja de cálculo editable con todos los datos', color: 'from-kids-mint to-kids-yellow' },
            ].map((btn, i) => (
              <div key={i} className={`flex items-center gap-3 rounded-xl p-2 bg-gradient-to-r ${btn.color} text-white`}>
                <Download className="w-4 h-4 flex-shrink-0" />
                <div>
                  <p className="text-xs font-black">{btn.label}</p>
                  <p className="text-xs opacity-80">{btn.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: '¿Necesitas Ayuda?',
    subtitle: 'Support & Contact',
    icon: <HelpCircle className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-700 text-lg leading-relaxed text-center">
          Si tienes dudas o encuentras algún problema, estamos aquí para ayudarte.
        </p>
        <div className="bg-gradient-to-br from-kids-blue/10 to-kids-mint/10 border-2 border-kids-blue/20 rounded-3xl p-6 text-center space-y-3">
          <div className="w-16 h-16 bg-gradient-to-br from-kids-blue to-kids-mint rounded-full mx-auto flex items-center justify-center shadow-lg">
            <HelpCircle className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-800 font-black text-xl">
            Contacta al administrador del sistema
          </p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Reach out to your system administrator for any technical issues, account access, or questions about the platform.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: <BookOpen className="w-4 h-4 text-kids-purple" />, text: 'Puedes volver a ver este tutorial en cualquier momento desde el botón "Tutorial" en el dashboard.' },
            { icon: <FileText className="w-4 h-4 text-kids-blue" />, text: 'Descarga el PDF de este tutorial usando el botón en la parte superior para tener una guía de referencia.' },
            { icon: <Star className="w-4 h-4 text-kids-yellow" />, text: 'Gracias por servir en Aviva Kids. Tu trabajo hace una diferencia en la vida de los niños.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 bg-white border border-gray-200 rounded-2xl p-3 shadow-sm">
              <span className="flex-shrink-0 mt-0.5">{item.icon}</span>
              <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-2xl font-black text-kids-purple">¡Gracias por servir!</p>
          <p className="text-gray-500 text-sm mt-1">Aviva Kids Ministry System</p>
        </div>
      </div>
    ),
  },
];

const PART_META = {
  parents: { label: 'PARTE 1 — Para Padres', gradient: 'from-kids-blue to-kids-mint', dot: 'bg-kids-blue' },
  admin: { label: 'PARTE 2 — Portal de Maestros', gradient: 'from-kids-purple to-kids-blue', dot: 'bg-kids-purple' },
};

export const TutorialSlideshow = ({ isOpen, onClose }: TutorialSlideshowProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);

  const goTo = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const next = () => { if (currentSlide < slides.length - 1) goTo(currentSlide + 1); };
  const prev = () => { if (currentSlide > 0) goTo(currentSlide - 1); };

  const slide = slides[currentSlide];
  const meta = PART_META[slide.part];
  const progress = ((currentSlide + 1) / slides.length) * 100;

  // Group dots by part
  const partACount = slides.filter(s => s.part === 'parents').length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-3 sm:p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.25 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className={`bg-gradient-to-r ${meta.gradient} p-5 flex items-center justify-between flex-shrink-0`}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-white">
              {slide.icon}
            </div>
            <div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest leading-none mb-0.5">
                {meta.label}
              </p>
              <p className="text-white font-black text-base leading-tight">{slide.title}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/guia-del-maestro-aviva-kids.pdf"
              download="Guia-del-Maestro-Aviva-Kids.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-white text-xs font-bold transition-colors"
              title="Descargar Guía PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Guía PDF</span>
            </a>
            <button
              onClick={onClose}
              className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-gray-100 flex-shrink-0">
          <motion.div
            className={`h-full bg-gradient-to-r ${meta.gradient}`}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>

        {/* Slide content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -40 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="p-5 sm:p-7"
            >
              <p className="text-gray-500 text-sm font-semibold mb-4">{slide.subtitle}</p>
              {slide.content}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Dot navigation */}
        <div className="flex items-center justify-center gap-1.5 py-3 flex-shrink-0 px-4">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? `w-6 h-2.5 ${PART_META[s.part].dot}`
                  : i < partACount
                  ? 'w-2 h-2 bg-kids-blue/30 hover:bg-kids-blue/60'
                  : 'w-2 h-2 bg-kids-purple/30 hover:bg-kids-purple/60'
              }`}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-100 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <button
            onClick={prev}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 ${
              currentSlide === 0
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Anterior
          </button>

          <span className="text-gray-400 font-semibold text-sm tabular-nums">
            {currentSlide + 1} / {slides.length}
          </span>

          {currentSlide === slides.length - 1 ? (
            <button
              onClick={onClose}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r ${meta.gradient} shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200`}
            >
              <CheckCircle className="w-4 h-4" />
              Finalizar
            </button>
          ) : (
            <button
              onClick={next}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-sm text-white bg-gradient-to-r ${meta.gradient} shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200`}
            >
              Siguiente
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
