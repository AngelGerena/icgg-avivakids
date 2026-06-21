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
  Camera,
  Footprints,
  MessageCircle,
  GraduationCap,
  Send,
  Mail,
  Volume2,
  UserCheck,
  Smartphone,
  Sparkles,
  Home,
} from 'lucide-react';

interface TutorialSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SlideSection {
  part: 'parents' | 'admin' | 'faith';
  label: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  content: React.ReactNode;
}

const slides: SlideSection[] = [
  // ─── PARTE 1 — PARA PADRES ────────────────────────────────────────────────
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Bienvenida a Aviva Kids',
    subtitle: 'What Parents Experience',
    icon: <Baby className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-700 text-lg leading-relaxed">
          Aviva Kids es el sistema digital del ministerio infantil. Los padres registran a sus hijos con foto,
          reciben un código QR único, hacen check-in cada domingo, reciben alertas en tiempo real y siguen las
          lecciones en casa con Fe en Casa.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <Camera className="w-5 h-5 text-kids-blue" />, label: 'Registro con Foto', desc: 'Cada niño con su foto' },
            { icon: <QrCode className="w-5 h-5 text-kids-purple" />, label: 'Código QR y Perfil', desc: 'Credencial y perfil en línea' },
            { icon: <Bell className="w-5 h-5 text-kids-coral" />, label: 'Alertas en Vivo', desc: 'Con foto, PIN y respuesta' },
            { icon: <Home className="w-5 h-5 text-kids-mint" />, label: 'Fe en Casa', desc: 'Lecciones y tareas en casa' },
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
            Flujo del padre: Registro de Niños → Admisión → Código QR → Check-In cada domingo.
          </p>
        </div>
      </div>
    ),
  },
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Registro de Niños',
    subtitle: 'Quick Register with Photo — the first step',
    icon: <Camera className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Lo primero es el <strong>Registro de Niños</strong>. Aquí se crea el perfil del niño y se sube su{' '}
          <strong>foto</strong>, que luego aparece en su credencial, en las alertas y en la salida.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-black text-kids-blue uppercase tracking-widest">Registro de Niños</p>
          <div className="flex flex-col items-center gap-2">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-kids-blue to-kids-mint flex items-center justify-center shadow-md">
              <Camera className="w-10 h-10 text-white" />
            </div>
            <div className="h-8 px-4 bg-kids-blue/10 border border-kids-blue/30 rounded-xl flex items-center gap-1">
              <Camera className="w-3 h-3 text-kids-blue" />
              <span className="text-xs font-bold text-kids-blue">Tomar o subir foto</span>
            </div>
            <p className="text-xs text-gray-400">Toma o sube una foto (opcional)</p>
          </div>
          {[
            { label: 'Nombre del Niño', placeholder: 'ej. Sofía Martínez' },
            { label: 'Edad / Fecha de Nacimiento', placeholder: 'MM/DD/AAAA' },
            { label: 'Sala', placeholder: 'Bebés, Exploradores, Aventureros, Jóvenes' },
            { label: 'Padre/Madre, Teléfono y Email', placeholder: 'Datos de contacto' },
          ].map((field, i) => (
            <div key={i}>
              <p className="text-xs font-bold text-gray-600 mb-1">{field.label}</p>
              <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
                <span className="text-xs text-gray-400">{field.placeholder}</span>
              </div>
            </div>
          ))}
          <div className="w-full h-10 bg-gradient-to-r from-kids-blue to-kids-purple rounded-xl flex items-center justify-center">
            <span className="text-white font-black text-sm">Registrar Niño</span>
          </div>
        </div>
        <div className="flex items-start gap-2 text-sm text-gray-600">
          <Star className="w-4 h-4 text-kids-yellow mt-0.5 flex-shrink-0" />
          <span>Al registrar, el sistema crea el número del niño y su código QR automáticamente.</span>
        </div>
      </div>
    ),
  },
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Formulario de Admisión',
    subtitle: 'Intake Form — medical info & authorized pickup',
    icon: <ClipboardList className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          La Admisión completa el perfil con información médica y las personas autorizadas a recoger al niño.
          Si el niño ya existe, búscalo por su número y los datos se rellenan solos (incluida la foto).
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
              <span className="text-xs text-gray-400">Buscar por número de niño (ej. 0042)</span>
            </div>
            <div className="h-9 px-3 bg-kids-purple rounded-xl flex items-center">
              <span className="text-white text-xs font-bold">Buscar</span>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-3">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Información Médica</p>
            {[
              { label: 'Alergias', placeholder: 'ej. maní, penicilina...' },
              { label: 'Condiciones Médicas', placeholder: 'ej. asma, diabetes...' },
              { label: 'Autorización de Medicamentos', placeholder: 'Sí / No + detalles' },
            ].map((field, i) => (
              <div key={i}>
                <p className="text-xs font-bold text-gray-600 mb-1">{field.label}</p>
                <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
                  <span className="text-xs text-gray-400">{field.placeholder}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-xs font-black text-gray-500 uppercase tracking-wider">Personas Autorizadas a Recoger</p>
            {[
              { name: 'Padre / Madre principal', tag: 'Con foto' },
              { name: 'Segundo tutor', tag: 'Con foto' },
              { name: 'Persona autorizada extra', tag: 'Con foto + teléfono' },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2 border border-gray-100">
                <div className="w-8 h-8 rounded-full bg-kids-coral/20 flex items-center justify-center flex-shrink-0">
                  <UserCheck className="w-4 h-4 text-kids-coral" />
                </div>
                <p className="text-xs font-bold text-gray-800 flex-1">{p.name}</p>
                <span className="text-xs text-kids-coral font-bold">{p.tag}</span>
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
    title: 'Código QR y Perfil del Niño',
    subtitle: 'QR Code opens a live profile page',
    icon: <QrCode className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Cada niño recibe un <strong>código QR único</strong>. Al escanearlo se abre una{' '}
          <strong>página de perfil en vivo</strong> con su foto, número, sala y tutor — perfecta para verificar
          identidad en segundos.
        </p>
        <div className="flex justify-center gap-4 items-center">
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-5 shadow-lg w-44 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-kids-blue to-kids-mint rounded-full mx-auto mb-2 flex items-center justify-center">
              <Baby className="w-6 h-6 text-white" />
            </div>
            <p className="font-black text-gray-800 text-sm">Sofía Martínez</p>
            <div className="w-20 h-20 mx-auto bg-gray-900 rounded-xl p-2 grid grid-cols-7 gap-0.5 my-2">
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
            <div className="bg-kids-purple/10 rounded-xl px-3 py-1">
              <p className="text-kids-purple font-black text-base tracking-widest">#0042</p>
            </div>
          </div>
          <ChevronRight className="w-6 h-6 text-gray-300 flex-shrink-0" />
          <div className="bg-white border-2 border-kids-purple/30 rounded-3xl p-4 shadow-lg w-40 text-center">
            <p className="text-xs font-black text-kids-purple uppercase tracking-widest mb-2">Perfil en vivo</p>
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-kids-blue to-kids-mint mx-auto mb-2 flex items-center justify-center">
              <Baby className="w-7 h-7 text-white" />
            </div>
            <p className="font-black text-gray-800 text-sm">Sofía Martínez</p>
            <p className="text-xs text-gray-500">Preescolar · #0042</p>
            <p className="text-xs text-gray-500 mt-1">Tutor: Ana Martínez</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <Download className="w-4 h-4" />, text: 'Descargable / imprimible' },
            { icon: <CheckCircle className="w-4 h-4" />, text: 'Único por cada niño' },
            { icon: <QrCode className="w-4 h-4" />, text: 'Abre el perfil en vivo' },
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
        <div className="space-y-3">
          {[
            { step: '1', color: 'bg-kids-blue', title: 'Llegar a la estación', desc: 'El personal tiene una tableta con la pantalla de Check-In abierta.' },
            { step: '2', color: 'bg-kids-purple', title: 'Escanear el código QR', desc: 'El padre muestra su credencial QR o el staff escanea con la cámara.' },
            { step: '3', color: 'bg-kids-mint', title: 'O ingresar número de niño', desc: 'Alternativamente, escribir el número asignado (ej. #0042).' },
            { step: '4', color: 'bg-kids-coral', title: 'Confirmación inmediata', desc: 'El niño aparece como "Presente" en el dashboard del maestro al instante.' },
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
      </div>
    ),
  },
  {
    part: 'parents',
    label: 'PARTE 1 — Para Padres',
    title: 'Alertas y "Voy en Camino"',
    subtitle: 'Real-time alerts + on-my-way response',
    icon: <Footprints className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Si el maestro necesita al padre, aparece una alerta en la pantalla <strong>con la foto del niño, su número
          (PIN) y el mensaje</strong>, suena un aviso y llega un <strong>SMS de respaldo</strong>. El padre toca{' '}
          <strong>"Voy en camino"</strong> y la alerta cambia de roja a verde para el maestro al instante.
        </p>
        {/* Red alert mock */}
        <div className="bg-white rounded-2xl shadow-lg border-4 border-kids-coral overflow-hidden">
          <div className="py-1.5 px-3 bg-gradient-to-r from-kids-yellow via-kids-coral to-kids-purple flex items-center gap-2">
            <Bell className="w-4 h-4 text-white" />
            <span className="text-white font-black text-xs">Atención — Ministerio de Niños</span>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-kids-coral/10 border-4 border-kids-coral flex items-center justify-center flex-shrink-0">
              <Baby className="w-8 h-8 text-kids-coral" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-black text-kids-coral uppercase">Número del niño/a</p>
              <p className="text-4xl font-black text-kids-purple leading-none">0042</p>
              <p className="text-sm font-black text-gray-800 mt-1">Por favor venga al salón</p>
              <div className="mt-2 inline-flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-kids-mint to-green-500 text-white rounded-2xl font-black text-xs shadow">
                <Footprints className="w-4 h-4" />
                Voy en camino
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center"><ChevronRight className="w-5 h-5 text-gray-300 rotate-90" /></div>
        {/* Green confirmed mock */}
        <div className="bg-white rounded-2xl shadow-lg border-4 border-kids-mint overflow-hidden">
          <div className="py-1.5 px-3 bg-gradient-to-r from-kids-mint to-green-500 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-white" />
            <span className="text-white font-black text-xs">El padre/madre viene en camino</span>
          </div>
          <div className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-kids-mint/10 border-4 border-kids-mint flex items-center justify-center flex-shrink-0">
              <Baby className="w-8 h-8 text-kids-mint" />
            </div>
            <div className="flex-1">
              <p className="text-4xl font-black text-kids-purple leading-none">0042</p>
              <div className="mt-1 inline-flex items-center gap-1 text-green-600 font-black text-sm">
                <Footprints className="w-4 h-4" /> Viene en camino
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
          <Volume2 className="w-4 h-4 text-kids-purple flex-shrink-0" />
          <span className="text-xs text-gray-600 font-semibold">Suena un aviso al recibir la alerta y otro al confirmar "Voy en camino".</span>
        </div>
      </div>
    ),
  },

  // ─── PARTE 2 — PORTAL DE MAESTROS ─────────────────────────────────────────
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
    subtitle: 'Overview, Tabs & Stats',
    icon: <LayoutDashboard className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Al iniciar sesión verás el Dashboard con estadísticas en tiempo real y pestañas para cada función:
          Alertas, Salidas, Eventos, Cumpleaños, Analíticas, Niños y Fe en Casa.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Dashboard</p>
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
          <div className="flex gap-1 bg-gray-100 rounded-xl p-1 flex-wrap">
            {['Control', 'Alertas', 'Salidas', 'Eventos', 'Cumpleaños', 'Analíticas', 'Niños', 'Fe en Casa'].map((tab, i) => (
              <div key={i} className={`text-center py-1 px-2 rounded-lg text-xs font-bold ${i === 0 ? 'bg-white shadow-sm text-kids-purple' : 'text-gray-400'}`}>
                {tab}
              </div>
            ))}
          </div>
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
        </div>
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Panel de Alertas',
    subtitle: 'Banner with photo + PIN + message, SMS backup & sound',
    icon: <Bell className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Desde el Panel de Alertas avisas al padre al instante. La alerta aparece en pantalla con la{' '}
          <strong>foto del niño, su número (PIN) y tu mensaje</strong>, suena un aviso y además se envía un{' '}
          <strong>SMS de respaldo</strong> por si no están mirando la pantalla.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-kids-coral uppercase tracking-widest">Panel de Alertas</p>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Número del Niño <span className="text-kids-coral">*</span></p>
            <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
              <span className="text-xs text-gray-400">ej. 0042</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-600 mb-1">Mensaje de la Alerta</p>
            <div className="grid grid-cols-2 gap-2">
              {['Venga al salón', 'Emergencia Médica', 'Comportamiento', 'Mensaje General'].map((reason, i) => (
                <div key={i} className={`text-center py-2 px-3 rounded-xl text-xs font-bold border ${i === 0 ? 'bg-kids-coral text-white border-kids-coral' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                  {reason}
                </div>
              ))}
            </div>
          </div>
          <div className="h-9 bg-gradient-to-r from-kids-coral to-kids-yellow rounded-xl flex items-center justify-center gap-1">
            <Bell className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-black">Enviar Alerta</span>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {[
            { icon: <Bell className="w-4 h-4 text-kids-coral" />, text: 'La alerta aparece en pantalla en todas las páginas con foto + PIN + mensaje.' },
            { icon: <Smartphone className="w-4 h-4 text-kids-blue" />, text: 'Se envía un SMS de respaldo al teléfono del padre (vía Twilio).' },
            { icon: <Volume2 className="w-4 h-4 text-kids-purple" />, text: 'Suena un aviso al enviarse, para que nadie la pierda.' },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl p-2 border border-gray-100">
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
    title: 'Respuesta del Padre: Rojo → Verde',
    subtitle: 'The on-my-way handshake, live',
    icon: <Footprints className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Cuando el padre toca <strong>"Voy en camino"</strong>, tu alerta cambia de <strong>roja a verde</strong> en
          tiempo real y suena un aviso de confirmación. Así sabes que el padre ya viene sin tener que llamar.
        </p>
        <div className="flex items-stretch gap-3">
          <div className="flex-1 bg-white rounded-2xl shadow border-4 border-kids-coral overflow-hidden">
            <div className="py-1 px-2 bg-gradient-to-r from-kids-yellow via-kids-coral to-kids-purple">
              <span className="text-white font-black text-xs">Alerta enviada</span>
            </div>
            <div className="p-3 text-center">
              <p className="text-3xl font-black text-kids-purple leading-none">0042</p>
              <p className="text-xs font-bold text-gray-700 mt-1">Esperando respuesta...</p>
            </div>
          </div>
          <div className="flex items-center"><ChevronRight className="w-6 h-6 text-gray-300" /></div>
          <div className="flex-1 bg-white rounded-2xl shadow border-4 border-kids-mint overflow-hidden">
            <div className="py-1 px-2 bg-gradient-to-r from-kids-mint to-green-500 flex items-center gap-1">
              <CheckCircle className="w-3 h-3 text-white" />
              <span className="text-white font-black text-xs">Viene en camino</span>
            </div>
            <div className="p-3 text-center">
              <p className="text-3xl font-black text-kids-purple leading-none">0042</p>
              <div className="inline-flex items-center gap-1 text-green-600 font-black text-xs mt-1">
                <Footprints className="w-3 h-3" /> En camino
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {[
            'El cambio es en tiempo real — no necesitas refrescar la página.',
            'La alerta permanece visible hasta que el padre llega (no desaparece sola).',
            'Suena un aviso de confirmación cuando el padre responde.',
          ].map((text, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
              <div className="w-5 h-5 bg-kids-mint rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
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
    title: 'Registrar Salida (Checkout)',
    subtitle: 'Secure pickup with photo + confirmation',
    icon: <UserCheck className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Al recoger al niño, el maestro abre <strong>Registrar Salida</strong> desde el Panel de Control. Selecciona
          a la <strong>persona autorizada</strong> (con su foto), confirma y el sistema registra la salida, muestra una
          confirmación verde y envía un <strong>SMS</strong> al padre.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-green-600 uppercase tracking-widest">Registrar Salida — #0042</p>
          <p className="text-xs font-bold text-gray-600">¿Quién recoge al niño?</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { name: 'Ana M.', sel: true },
              { name: 'Carlos M.', sel: false },
              { name: 'Tía Rosa', sel: false },
            ].map((p, i) => (
              <div key={i} className={`rounded-xl p-2 border text-center ${p.sel ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-200'}`}>
                <div className={`w-10 h-10 rounded-full mx-auto mb-1 flex items-center justify-center ${p.sel ? 'bg-green-400' : 'bg-gray-200'}`}>
                  <UserCheck className={`w-5 h-5 ${p.sel ? 'text-white' : 'text-gray-400'}`} />
                </div>
                <p className="text-xs font-bold text-gray-700">{p.name}</p>
              </div>
            ))}
          </div>
          <div className="h-9 bg-gradient-to-r from-green-500 to-kids-mint rounded-xl flex items-center justify-center gap-1">
            <CheckCircle className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-black">Confirmar Salida</span>
          </div>
        </div>
        {/* Confirmation banner */}
        <div className="bg-green-600 rounded-2xl p-4 shadow-lg flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-sm">Salida confirmada - #0042</p>
            <p className="text-white/90 text-xs">Recogido por Ana Martínez (Madre)</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-2 border border-gray-100">
          <Smartphone className="w-4 h-4 text-kids-blue flex-shrink-0" />
          <span className="text-xs text-gray-600 font-semibold">El padre recibe un SMS confirmando que el niño fue recogido, y el niño se marca como "no presente".</span>
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
          Agrega, visualiza y elimina eventos del ministerio. Los eventos aparecen en el calendario público y en el
          dashboard de los maestros.
        </p>
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
          <div className="h-9 bg-gradient-to-r from-kids-blue to-kids-mint rounded-xl flex items-center justify-center gap-1">
            <Plus className="w-3 h-3 text-white" />
            <span className="text-white text-xs font-black">Agregar Evento</span>
          </div>
          <div className="border-t border-gray-100 pt-2 space-y-2">
            {[
              { title: 'Día de Pijamas', date: 'May 4, 2025', cat: 'Especial' },
              { title: 'Domingo Regular', date: 'May 11, 2025', cat: 'Regular' },
            ].map((ev, i) => (
              <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
                <div>
                  <p className="text-xs font-bold text-gray-800">{ev.title}</p>
                  <p className="text-xs text-gray-500">{ev.date} · {ev.cat}</p>
                </div>
                <X className="w-4 h-4 text-gray-400" />
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
          La pestaña de Cumpleaños muestra los niños que cumplen años este mes. Márcalos como celebrados para llevar
          registro. Se calculan solos a partir de la fecha de nacimiento.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-kids-yellow uppercase tracking-widest">Cumpleaños — Mayo</p>
            <span className="bg-kids-yellow/20 text-kids-yellow font-black text-xs px-2 py-0.5 rounded-full border border-kids-yellow/40">3 este mes</span>
          </div>
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
          La sección de Analíticas ofrece gráficos de asistencia, tendencias y estadísticas a lo largo del tiempo.
          Los datos se actualizan con cada check-in.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-4">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Analíticas de Asistencia</p>
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
      </div>
    ),
  },
  {
    part: 'admin',
    label: 'PARTE 2 — Portal de Maestros',
    title: 'Todos los Niños y Exportar',
    subtitle: 'Children Registry & Export',
    icon: <Users className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Ve todos los niños registrados, busca por nombre, abre sus códigos QR y exporta los registros completos
          en PDF o Excel.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 flex items-center gap-2 px-3">
            <Search className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-400">Buscar por nombre...</span>
          </div>
          {[
            { name: 'Sofía Martínez', num: '#0042', room: 'Preescolar' },
            { name: 'Lucas Herrera', num: '#0017', room: 'Primaria' },
          ].map((child, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-xl p-2 border border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-800">{child.name}</p>
                <p className="text-xs text-gray-500">{child.num} · {child.room}</p>
              </div>
              <QrCode className="w-5 h-5 text-kids-purple" />
            </div>
          ))}
          <div className="border-t border-gray-100 pt-3 space-y-2">
            <p className="text-xs font-bold text-gray-500 mb-2">Exportar Registros</p>
            {[
              { label: 'PDF Detallado', desc: 'Fotos, QR, info médica completa', color: 'from-kids-purple to-kids-blue' },
              { label: 'PDF Resumen', desc: 'Tabla compacta de referencia', color: 'from-kids-blue to-kids-mint' },
              { label: 'Excel', desc: 'Hoja de cálculo editable', color: 'from-kids-mint to-kids-yellow' },
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

  // ─── PARTE 3 — FE EN CASA ─────────────────────────────────────────────────
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
    title: '¿Qué es Fe en Casa?',
    subtitle: 'Faith at Home — ministry beyond Sunday',
    icon: <Home className="w-8 h-8" />,
    content: (
      <div className="space-y-6">
        <p className="text-gray-700 text-lg leading-relaxed">
          Fe en Casa extiende el ministerio a la casa. Los maestros publican lecciones y tareas, y los padres las
          siguen, envían la tarea del niño y se comunican con el maestro — todo desde su celular.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { icon: <GraduationCap className="w-5 h-5 text-kids-purple" />, label: 'Lecciones', desc: 'Versículo, historia y video' },
            { icon: <Star className="w-5 h-5 text-kids-yellow" />, label: 'Tareas y Estrellas', desc: 'El niño gana estrellas' },
            { icon: <MessageCircle className="w-5 h-5 text-kids-blue" />, label: 'Mensajes', desc: 'Padre ↔ maestro' },
            { icon: <Mail className="w-5 h-5 text-kids-coral" />, label: 'Acceso sin Contraseña', desc: 'Enlace mágico por email' },
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
        <div className="bg-kids-coral/10 border border-kids-coral/30 rounded-2xl p-4">
          <p className="text-kids-coral font-bold text-sm">
            Fe en Casa convierte la lección del domingo en algo que la familia vive durante toda la semana.
          </p>
        </div>
      </div>
    ),
  },
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
    title: 'Acceso de Padres (Enlace Mágico)',
    subtitle: 'Magic-link login — no password needed',
    icon: <Mail className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Los padres entran a Fe en Casa sin contraseña. Escriben su email, reciben un <strong>enlace mágico</strong>{' '}
          y al tocarlo entran directo al hub de su hijo.
        </p>
        <div className="space-y-3">
          {[
            { step: '1', color: 'bg-kids-coral', title: 'Escribir el email', desc: 'El mismo email que usaron en el registro del niño.' },
            { step: '2', color: 'bg-kids-purple', title: 'Recibir el enlace', desc: 'Llega un correo con un botón de acceso seguro.' },
            { step: '3', color: 'bg-kids-blue', title: 'Tocar y entrar', desc: 'El enlace los lleva directo al hub — sin recordar contraseñas.' },
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
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 shadow-sm max-w-sm mx-auto space-y-3">
          <p className="text-xs font-black text-kids-coral uppercase tracking-widest text-center">Fe en Casa</p>
          <div className="w-full h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
            <span className="text-xs text-gray-400">correo@ejemplo.com</span>
          </div>
          <div className="w-full h-10 bg-gradient-to-r from-kids-coral to-kids-purple rounded-xl flex items-center justify-center gap-1">
            <Send className="w-4 h-4 text-white" />
            <span className="text-white font-black text-sm">Enviarme el enlace</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
    title: 'Lecciones',
    subtitle: 'Weekly lessons with verse, story & video',
    icon: <GraduationCap className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Cada semana el maestro publica una lección. El padre ve el <strong>pasaje bíblico</strong>, el{' '}
          <strong>versículo para memorizar</strong>, un resumen de la historia, preguntas para conversar y, si hay,
          un video o canción.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Lección de la Semana</p>
            <span className="bg-green-100 text-green-700 font-black text-xs px-2 py-0.5 rounded-full">Publicada</span>
          </div>
          <p className="font-black text-gray-800">El Buen Pastor</p>
          <div className="bg-kids-purple/5 border border-kids-purple/20 rounded-xl p-3">
            <p className="text-xs font-bold text-kids-purple">Pasaje: Juan 10:11-16</p>
            <p className="text-xs text-gray-600 italic mt-1">"Yo soy el buen pastor; el buen pastor su vida da por las ovejas."</p>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 h-16 bg-gray-100 rounded-xl border border-gray-200 flex items-center justify-center gap-1">
              <BookOpen className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-400">Historia</span>
            </div>
            <div className="flex-1 h-16 bg-gray-900 rounded-xl flex items-center justify-center">
              <span className="text-white text-xs font-bold">▶ Video</span>
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1">Preguntas para conversar</p>
            <div className="space-y-1">
              {['¿Quién es el buen pastor?', '¿Cómo cuida Jesús de ti?'].map((q, i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-2 border border-gray-100 text-xs text-gray-600">{q}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
    title: 'Tareas y Estrellas',
    subtitle: 'Assignments, submissions & star rewards',
    icon: <Star className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          El maestro asigna tareas. El padre sube la tarea del niño (foto, video o texto), el maestro la revisa y{' '}
          <strong>otorga estrellas</strong> como reconocimiento.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black text-kids-yellow uppercase tracking-widest">Tarea: Dibuja al Buen Pastor</p>
            <span className="bg-kids-yellow/20 text-kids-yellow font-black text-xs px-2 py-0.5 rounded-full">Pendiente</span>
          </div>
          <p className="text-xs text-gray-600">Sube una foto del dibujo de tu hijo/a sobre la lección.</p>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: <Camera className="w-4 h-4" />, label: 'Foto' },
              { icon: <FileText className="w-4 h-4" />, label: 'Texto' },
              { icon: <Send className="w-4 h-4" />, label: 'Enviar' },
            ].map((b, i) => (
              <div key={i} className={`rounded-xl p-2 text-center border ${i === 2 ? 'bg-gradient-to-r from-kids-yellow to-kids-coral text-white border-transparent' : 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                <div className="flex justify-center mb-1">{b.icon}</div>
                <span className="text-xs font-bold">{b.label}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
            <p className="text-xs font-bold text-gray-500">Estrellas ganadas</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`w-4 h-4 ${s <= 4 ? 'text-kids-yellow fill-kids-yellow' : 'text-gray-300'}`} />
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-kids-yellow/10 rounded-xl p-3 border border-kids-yellow/30">
          <Sparkles className="w-4 h-4 text-kids-yellow flex-shrink-0" />
          <span className="text-xs text-gray-700 font-semibold">Las estrellas motivan a los niños y el maestro puede dejar comentarios alentadores.</span>
        </div>
      </div>
    ),
  },
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
    title: 'Mensajes',
    subtitle: 'Parent ↔ teacher messaging per child',
    icon: <MessageCircle className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Padres y maestros pueden conversar de forma privada sobre cada niño — para dudas sobre la lección, avisos
          o aliento. Todo queda guardado en el hilo del niño.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-kids-blue uppercase tracking-widest">Mensajes — Sofía</p>
          <div className="space-y-2">
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[80%]">
                <p className="text-xs text-gray-700">¡Hola! Sofía hizo un dibujo precioso de la lección. 🐑</p>
                <p className="text-[10px] text-gray-400 mt-0.5">Maestra · 10:10 AM</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="bg-kids-blue text-white rounded-2xl rounded-tr-sm px-3 py-2 max-w-[80%]">
                <p className="text-xs">¡Gracias! Le encantó la historia. ¿Hay tarea para esta semana?</p>
                <p className="text-[10px] text-white/70 mt-0.5">Mamá · 10:14 AM</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-9 bg-gray-100 rounded-xl border border-gray-200 px-3 flex items-center">
              <span className="text-xs text-gray-400">Escribe un mensaje...</span>
            </div>
            <div className="w-9 h-9 bg-kids-blue rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
    title: 'Panel del Maestro: Fe en Casa',
    subtitle: 'Create lessons, post tasks, review & reward',
    icon: <LayoutDashboard className="w-8 h-8" />,
    content: (
      <div className="space-y-5">
        <p className="text-gray-700 leading-relaxed">
          Desde la pestaña <strong>Fe en Casa</strong> del portal, el maestro crea y publica lecciones, agrega tareas,
          revisa lo que envían los padres, otorga estrellas y responde mensajes.
        </p>
        <div className="bg-white border-2 border-gray-200 rounded-2xl p-4 shadow-sm space-y-3">
          <p className="text-xs font-black text-kids-purple uppercase tracking-widest">Fe en Casa — Maestro</p>
          {[
            { icon: <GraduationCap className="w-4 h-4 text-kids-purple" />, title: 'Crear / publicar lección', desc: 'Pasaje, versículo, historia, video' },
            { icon: <ClipboardList className="w-4 h-4 text-kids-blue" />, title: 'Agregar tarea', desc: 'Tipo foto, video, texto o cualquiera' },
            { icon: <Star className="w-4 h-4 text-kids-yellow" />, title: 'Revisar y dar estrellas', desc: 'Con comentario para la familia' },
            { icon: <MessageCircle className="w-4 h-4 text-kids-coral" />, title: 'Responder mensajes', desc: 'Por cada niño, privado' },
          ].map((row, i) => (
            <div key={i} className="flex items-start gap-3 bg-gray-50 rounded-xl p-2 border border-gray-100">
              <div className="w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center flex-shrink-0">{row.icon}</div>
              <div>
                <p className="text-xs font-bold text-gray-800">{row.title}</p>
                <p className="text-xs text-gray-500">{row.desc}</p>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="h-9 bg-gradient-to-r from-kids-purple to-kids-blue rounded-xl flex items-center justify-center gap-1">
              <Plus className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-black">Nueva Lección</span>
            </div>
            <div className="h-9 bg-gray-100 rounded-xl flex items-center justify-center">
              <span className="text-gray-600 text-xs font-bold">Ver Entregas</span>
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    part: 'faith',
    label: 'PARTE 3 — Fe en Casa',
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
          <p className="text-gray-800 font-black text-xl">Contacta al administrador del sistema</p>
          <p className="text-gray-600 text-sm leading-relaxed">
            Reach out to your system administrator for any technical issues, account access, or questions about the platform.
          </p>
        </div>
        <div className="space-y-3">
          {[
            { icon: <BookOpen className="w-4 h-4 text-kids-purple" />, text: 'Puedes volver a ver este tutorial en cualquier momento desde el botón "Tutorial" en el dashboard.' },
            { icon: <Volume2 className="w-4 h-4 text-kids-blue" />, text: 'Para que suenen las alertas, toca la pantalla una vez al abrir el sitio (los navegadores requieren una interacción para habilitar el sonido).' },
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
  parents: { label: 'PARTE 1 — Para Padres', gradient: 'from-kids-blue to-kids-mint', dot: 'bg-kids-blue', dotIdle: 'bg-kids-blue/30 hover:bg-kids-blue/60' },
  admin: { label: 'PARTE 2 — Portal de Maestros', gradient: 'from-kids-purple to-kids-blue', dot: 'bg-kids-purple', dotIdle: 'bg-kids-purple/30 hover:bg-kids-purple/60' },
  faith: { label: 'PARTE 3 — Fe en Casa', gradient: 'from-kids-coral to-kids-purple', dot: 'bg-kids-coral', dotIdle: 'bg-kids-coral/30 hover:bg-kids-coral/60' },
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
          <button
            onClick={onClose}
            className="w-9 h-9 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
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
        <div className="flex items-center justify-center gap-1.5 py-3 flex-shrink-0 px-4 flex-wrap">
          {slides.map((s, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                i === currentSlide
                  ? `w-6 h-2.5 ${PART_META[s.part].dot}`
                  : `w-2 h-2 ${PART_META[s.part].dotIdle}`
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
