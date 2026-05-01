import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { CheckCircle, Lock, Delete } from 'lucide-react';
import { QRCodeBadge } from '../components/QRCodeBadge';

const STAFF_PIN = import.meta.env.VITE_CHECKIN_PIN || '1234';

export const CheckIn = () => {
  const { t } = useLanguage();

  // PIN gate state
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    childName: '',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    childAge: '',
    childDob: '',
    room: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [childNumber, setChildNumber] = useState('');
  const [childId, setChildId] = useState('');

  // PIN pad handlers
  const handlePinDigit = (digit: string) => {
    if (pinEntry.length >= 4) return;
    const next = pinEntry + digit;
    setPinEntry(next);
    setPinError(false);
    if (next.length === 4) {
      setTimeout(() => {
        if (next === STAFF_PIN) {
          setPinUnlocked(true);
          setPinEntry('');
        } else {
          setPinError(true);
          setPinEntry('');
        }
      }, 200);
    }
  };

  const handlePinDelete = () => {
    setPinEntry((prev) => prev.slice(0, -1));
    setPinError(false);
  };

  const lockForm = () => {
    setPinUnlocked(false);
    setPinEntry('');
    setPinError(false);
    setSuccess(false);
    setFormData({
      childName: '',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      childAge: '',
      childDob: '',
      room: '',
    });
  };

  const generateUniqueNumber = async (): Promise<string> => {
    let unique = false;
    let number = '';
    while (!unique) {
      number = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      const { data } = await supabase
        .from('children')
        .select('unique_number')
        .eq('unique_number', number)
        .maybeSingle();
      if (!data) unique = true;
    }
    return number;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Duplicate check: same name + same DOB
      const formattedDob = new Date(formData.childDob).toISOString().split('T')[0];
      const { data: existing } = await supabase
        .from('children')
        .select('id, full_name, unique_number')
        .ilike('full_name', formData.childName.trim())
        .eq('dob', formattedDob)
        .maybeSingle();

      if (existing) {
        const confirm = window.confirm(
          `Ya existe un registro para ${existing.full_name} con ese nombre y fecha de nacimiento (Número: ${existing.unique_number}). ¿Desea registrar de todas formas?`
        );
        if (!confirm) {
          setLoading(false);
          return;
        }
      }

      const uniqueNumber = await generateUniqueNumber();

      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          full_name: formData.childName.trim(),
          dob: formattedDob,
          room: formData.room,
          unique_number: uniqueNumber,
          checked_in_today: true,
          check_in_time: new Date().toISOString(),
        })
        .select()
        .single();

      if (childError) throw childError;

      const { error: parentError } = await supabase.from('parents').insert({
        child_id: childData.id,
        primary_name: formData.parentName.trim(),
        primary_relationship: 'Parent',
        primary_phone: formData.parentPhone.trim(),
        primary_email: formData.parentEmail.trim(),
      });

      if (parentError) throw parentError;

      setChildNumber(uniqueNumber);
      setChildId(childData.id);
      setSuccess(true);

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#4FC3F7', '#FF6B6B', '#69F0AE', '#CE93D8'],
      });

      setFormData({
        childName: '',
        parentName: '',
        parentPhone: '',
        parentEmail: '',
        childAge: '',
        childDob: '',
        room: '',
      });
    } catch (error: unknown) {
      console.error('Error checking in child:', error);
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Error al registrar: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // PIN PAD SCREEN
  if (!pinUnlocked) {
    const pinDigits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-bubbly p-10 shadow-2xl max-w-sm w-full text-center"
        >
          <div className="flex justify-center mb-4">
            <div className="bg-kids-purple/10 rounded-full p-4">
              <Lock className="w-10 h-10 text-kids-purple" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-kids-purple mb-1">Acceso de Personal</h2>
          <p className="text-gray-500 font-semibold mb-6 text-sm">
            Ingrese el PIN de personal para continuar
          </p>

          {/* PIN display dots */}
          <div className="flex justify-center gap-4 mb-6">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{ scale: pinEntry.length > i ? 1.2 : 1 }}
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  pinEntry.length > i
                    ? 'bg-kids-purple border-kids-purple'
                    : 'bg-white border-gray-300'
                }`}
              />
            ))}
          </div>

          {pinError && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 font-bold text-sm mb-4"
            >
              PIN incorrecto. Intente de nuevo.
            </motion.p>
          )}

          {/* PIN pad */}
          <div className="grid grid-cols-3 gap-3">
            {pinDigits.map((digit, i) => {
              if (digit === '') return <div key={i} />;
              if (digit === 'del') {
                return (
                  <motion.button
                    key={i}
                    whileTap={{ scale: 0.92 }}
                    onClick={handlePinDelete}
                    className="flex items-center justify-center h-14 rounded-bubbly bg-gray-100 text-gray-600 font-bold text-lg shadow hover:bg-gray-200 transition-colors"
                  >
                    <Delete className="w-5 h-5" />
                  </motion.button>
                );
              }
              return (
                <motion.button
                  key={i}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => handlePinDigit(digit)}
                  className="flex items-center justify-center h-14 rounded-bubbly bg-kids-purple/10 text-kids-purple font-black text-xl shadow hover:bg-kids-purple/20 transition-colors"
                >
                  {digit}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      </div>
    );
  }

  // MAIN CHECK-IN FORM
  return (
    <div className="min-h-screen py-8 px-4 relative overflow-hidden">
      <div className="container mx-auto max-w-3xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-kids-purple mb-4">
            {t.checkIn.title}
          </h1>
          <button
            onClick={lockForm}
            className="text-sm text-gray-400 font-semibold hover:text-red-400 transition-colors underline"
          >
            Cerrar sesión de personal
          </button>
        </motion.div>

        <AnimatePresence mode="wait">
          {!success ? (
            <motion.form
              key="form"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              onSubmit={handleSubmit}
              className="bg-white rounded-bubbly p-8 shadow-2xl"
            >
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    {t.checkIn.childName}
                  </label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-blue focus:border-kids-purple focus:outline-none text-lg font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">
                      {t.checkIn.childAge}
                    </label>
                    <input
                      type="number"
                      name="childAge"
                      value={formData.childAge}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-yellow focus:border-kids-purple focus:outline-none text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">
                      {t.checkIn.childDob}
                    </label>
                    <input
                      type="date"
                      name="childDob"
                      value={formData.childDob}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-yellow focus:border-kids-purple focus:outline-none text-lg font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    {t.checkIn.room}
                  </label>
                  <select
                    name="room"
                    value={formData.room}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-mint focus:border-kids-purple focus:outline-none text-lg font-semibold"
                  >
                    <option value="">Seleccione...</option>
                    <option value="babies">{t.checkIn.rooms.babies}</option>
                    <option value="explorers">{t.checkIn.rooms.explorers}</option>
                    <option value="adventurers">{t.checkIn.rooms.adventurers}</option>
                    <option value="youth">{t.checkIn.rooms.youth}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-bold text-gray-700 mb-2">
                    {t.checkIn.parentName}
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-coral focus:border-kids-purple focus:outline-none text-lg font-semibold"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">
                      {t.checkIn.parentPhone}
                    </label>
                    <input
                      type="tel"
                      name="parentPhone"
                      value={formData.parentPhone}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-purple focus:border-kids-blue focus:outline-none text-lg font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">
                      {t.checkIn.parentEmail}
                    </label>
                    <input
                      type="email"
                      name="parentEmail"
                      value={formData.parentEmail}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-4 border-kids-purple focus:border-kids-blue focus:outline-none text-lg font-semibold"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white text-xl font-black rounded-bubbly shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? t.common.loading : t.checkIn.submitButton}
                </motion.button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-kids-mint to-kids-blue rounded-bubbly p-12 shadow-2xl text-center"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], rotate: [0, 360] }}
                transition={{ duration: 0.8 }}
                className="flex justify-center mb-6"
              >
                <CheckCircle className="w-24 h-24 text-white" />
              </motion.div>

              <h2 className="text-4xl font-black text-white mb-4">{t.checkIn.successTitle}</h2>

              <div className="bg-white rounded-bubbly p-8 mb-6">
                <p className="text-xl font-bold text-gray-700 mb-4">
                  {t.checkIn.successMessage.replace('{name}', formData.childName || 'el niño')}
                </p>
                <div className="text-8xl font-black text-kids-purple mb-4">{childNumber}</div>
                <p className="text-lg font-semibold text-gray-600 mb-6">{t.checkIn.keepNumber}</p>

                <div className="border-t-4 border-kids-yellow pt-6 mt-6">
                  <h3 className="text-2xl font-black text-kids-coral mb-4">Tarjeta QR del Niño</h3>
                  <QRCodeBadge
                    childName={formData.childName || 'Niño'}
                    childNumber={childNumber}
                    childId={childId}
                  />
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={lockForm}
                className="px-8 py-4 bg-white text-kids-purple text-xl font-black rounded-bubbly shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {t.common.close}
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
