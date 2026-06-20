import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { CheckCircle } from 'lucide-react';
import { QRCodeBadge } from '../components/QRCodeBadge';

export const CheckIn = () => {
  const { t } = useLanguage();
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

  const generateUniqueNumber = async (): Promise<string> => {
    let unique = false;
    let number = '';

    while (!unique) {
      number = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0');

      const { data } = await supabase
        .from('children')
        .select('unique_number')
        .eq('unique_number', number)
        .maybeSingle();

      if (!data) {
        unique = true;
      }
    }

    return number;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uniqueNumber = await generateUniqueNumber();

      const qrData = JSON.stringify({
        childId: '',
        childNumber: uniqueNumber,
        childName: formData.childName,
        type: 'child-profile',
      });

      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          full_name: formData.childName,
          dob: formData.childDob,
          room: formData.room,
          unique_number: uniqueNumber,
          checked_in_today: true,
          check_in_time: new Date().toISOString(),
          qr_code_data: qrData,
        })
        .select()
        .single();

      if (childError) throw childError;

      await supabase
        .from('children')
        .update({
          qr_code_data: JSON.stringify({
            childId: childData.id,
            childNumber: uniqueNumber,
            childName: formData.childName,
            type: 'child-profile',
          }),
        })
        .eq('id', childData.id);

      await supabase.from('parents').insert({
        child_id: childData.id,
        primary_name: formData.parentName,
        primary_relationship: 'Parent',
        primary_phone: formData.parentPhone,
        primary_email: formData.parentEmail,
      });

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
    } catch (error) {
      console.error('Error checking in child:', error);
      alert('Error al registrar. Por favor intente de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

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
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{ duration: 0.8 }}
                className="flex justify-center mb-6"
              >
                <CheckCircle className="w-24 h-24 text-white" />
              </motion.div>

              <h2 className="text-4xl font-black text-white mb-4">
                {t.checkIn.successTitle}
              </h2>

              <div className="bg-white rounded-bubbly p-8 mb-6">
                <p className="text-xl font-bold text-gray-700 mb-4">
                  {t.checkIn.successMessage.replace('{name}', formData.childName || 'el niño')}
                </p>
                <div className="text-8xl font-black text-kids-purple mb-4">
                  {childNumber}
                </div>
                <p className="text-lg font-semibold text-gray-600 mb-6">
                  {t.checkIn.keepNumber}
                </p>

                <div className="border-t-4 border-kids-yellow pt-6 mt-6">
                  <h3 className="text-2xl font-black text-kids-coral mb-4">
                    Tarjeta QR del Niño
                  </h3>
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
                onClick={() => {
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
                }}
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
