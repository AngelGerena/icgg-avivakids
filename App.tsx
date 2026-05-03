import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import confetti from 'canvas-confetti';
import { Plus, Trash2, Check, ChevronRight, ChevronLeft } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  administeredBy: string;
}

const STEPS = [
  { id: 1, nameEs: 'Información del Niño', nameEn: 'Child Information' },
  { id: 2, nameEs: 'Información de los Padres', nameEn: 'Parent Information' },
  { id: 3, nameEs: 'Salud y Alergias', nameEn: 'Health and Allergies' },
  { id: 4, nameEs: 'Necesidades Especiales', nameEn: 'Special Needs' },
  { id: 5, nameEs: 'Consentimiento Legal', nameEn: 'Legal Consent' },
];

export const IntakeFormWizard = () => {
  const { t, language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [sectionA, setSectionA] = useState({
    fullName: '',
    nickname: '',
    dob: '',
    gender: '',
    photoUrl: '',
    room: '',
  });

  const [sectionB, setSectionB] = useState({
    primaryName: '',
    primaryRelationship: '',
    primaryPhone: '',
    primaryEmail: '',
    secondaryName: '',
    secondaryRelationship: '',
    secondaryPhone: '',
  });

  const [sectionC, setSectionC] = useState({
    allergies: [] as string[],
    restrictedFoods: '',
    medicalConditions: '',
    specialNeeds: '',
    doctorName: '',
    doctorPhone: '',
  });

  const [medications, setMedications] = useState<Medication[]>([]);

  const [sectionD, setSectionD] = useState({
    behavioralNotes: '',
    triggers: '',
    communicationNotes: '',
  });

  const [sectionE, setSectionE] = useState({
    photoConsent: false,
    medicalConsent: false,
    digitalSignature: '',
  });

  const allergyOptions = [
    { value: 'nuts', label: t.intakeForm.allergyOptions.nuts },
    { value: 'dairy', label: t.intakeForm.allergyOptions.dairy },
    { value: 'gluten', label: t.intakeForm.allergyOptions.gluten },
    { value: 'shellfish', label: t.intakeForm.allergyOptions.shellfish },
    { value: 'other', label: t.intakeForm.allergyOptions.other },
  ];

  const handleAllergyToggle = (allergy: string) => {
    setSectionC({
      ...sectionC,
      allergies: sectionC.allergies.includes(allergy)
        ? sectionC.allergies.filter((a) => a !== allergy)
        : [...sectionC.allergies, allergy],
    });
  };

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dosage: '', frequency: '', administeredBy: '' },
    ]);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const updateMedication = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(sectionA.fullName && sectionA.dob);
      case 2:
        return !!(
          sectionB.primaryName &&
          sectionB.primaryRelationship &&
          sectionB.primaryPhone &&
          sectionB.primaryEmail
        );
      case 3:
        return true;
      case 4:
        return true;
      case 5:
        return !!(sectionE.medicalConsent && sectionE.digitalSignature);
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 5) {
      setCurrentStep(currentStep + 1);
    } else if (!validateStep(currentStep)) {
      alert('Por favor complete todos los campos requeridos');
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePDF = (childId: string, childName: string): string => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.setTextColor(206, 147, 216);
    doc.text('Formulario de Admisión', 105, 20, { align: 'center' });

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('ICGG Aviva Kids', 105, 30, { align: 'center' });
    doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 105, 40, {
      align: 'center',
    });

    doc.setFontSize(8);
    doc.setTextColor(150, 100, 0);
    const disclaimerText = 'CONFIDENCIAL: Esta información es confidencial y será utilizada únicamente para el cuidado del menor.';
    const splitDisclaimer = doc.splitTextToSize(disclaimerText, 170);
    doc.text(splitDisclaimer, 105, 48, { align: 'center' });

    let yPos = 60;

    doc.setFontSize(14);
    doc.setTextColor(79, 195, 247);
    doc.text('Información del Niño', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${sectionA.fullName}`, 20, yPos);
    yPos += 7;
    doc.text(`Apodo: ${sectionA.nickname || 'N/A'}`, 20, yPos);
    yPos += 7;
    doc.text(`Fecha de Nacimiento: ${sectionA.dob}`, 20, yPos);
    yPos += 7;
    doc.text(`Género: ${sectionA.gender || 'N/A'}`, 20, yPos);
    yPos += 15;

    doc.setFontSize(14);
    doc.setTextColor(79, 195, 247);
    doc.text('Información de los Padres', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Nombre: ${sectionB.primaryName}`, 20, yPos);
    yPos += 7;
    doc.text(`Relación: ${sectionB.primaryRelationship}`, 20, yPos);
    yPos += 7;
    doc.text(`Teléfono: ${sectionB.primaryPhone}`, 20, yPos);
    yPos += 7;
    doc.text(`Email: ${sectionB.primaryEmail}`, 20, yPos);
    yPos += 15;

    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(79, 195, 247);
    doc.text('Información Médica', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Alergias: ${sectionC.allergies.join(', ') || 'Ninguna'}`, 20, yPos);
    yPos += 7;
    doc.text(
      `Condiciones Médicas: ${sectionC.medicalConditions || 'Ninguna'}`,
      20,
      yPos
    );
    yPos += 15;

    doc.setFontSize(14);
    doc.setTextColor(79, 195, 247);
    doc.text('Consentimiento', 20, yPos);
    yPos += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.text(`Firma Digital: ${sectionE.digitalSignature}`, 20, yPos);

    const pdfBlob = doc.output('blob');
    return URL.createObjectURL(pdfBlob);
  };

  const generateUniqueNumber = async (): Promise<string> => {
    for (let attempt = 0; attempt < 10; attempt++) {
      const candidate = Math.floor(10000 + Math.random() * 90000).toString();
      const { data } = await supabase
        .from('children')
        .select('id')
        .eq('unique_number', candidate)
        .maybeSingle();
      if (!data) return candidate;
    }
    return Date.now().toString().slice(-5);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) {
      alert('Por favor complete todos los campos requeridos');
      return;
    }

    setLoading(true);

    try {
      const uniqueNumber = await generateUniqueNumber();

      const { data: childData, error: childError } = await supabase
        .from('children')
        .insert({
          full_name: sectionA.fullName,
          nickname: sectionA.nickname || null,
          dob: new Date(sectionA.dob + 'T12:00:00').toISOString().split('T')[0],
          gender: sectionA.gender || null,
          photo_url: sectionA.photoUrl || null,
          room: sectionA.room || 'general',
          unique_number: uniqueNumber,
          checked_in_today: false,
        })
        .select()
        .single();

      if (childError) throw childError;

      const { error: parentError } = await supabase.from('parents').insert({
        child_id: childData.id,
        primary_name: sectionB.primaryName,
        primary_relationship: sectionB.primaryRelationship,
        primary_phone: sectionB.primaryPhone,
        primary_email: sectionB.primaryEmail,
        secondary_name: sectionB.secondaryName || null,
        secondary_relationship: sectionB.secondaryRelationship || null,
        secondary_phone: sectionB.secondaryPhone || null,
      });

      if (parentError) throw parentError;

      const { error: intakeError } = await supabase.from('intake_forms').insert({
        child_id: childData.id,
        allergies: sectionC.allergies,
        restricted_foods: sectionC.restrictedFoods || null,
        medications: medications.length > 0 ? medications : null,
        medical_conditions: sectionC.medicalConditions || null,
        special_needs: sectionC.specialNeeds || null,
        doctor_name: sectionC.doctorName || null,
        doctor_phone: sectionC.doctorPhone || null,
        behavioral_notes: sectionD.behavioralNotes || null,
        triggers: sectionD.triggers || null,
        communication_notes: sectionD.communicationNotes || null,
        photo_consent: sectionE.photoConsent,
        medical_consent: sectionE.medicalConsent,
        digital_signature: sectionE.digitalSignature,
      });

      if (intakeError) throw intakeError;

      // Generate PDF for local download only — blob URLs cannot be stored in DB
      generatePDF(childData.id, sectionA.fullName);

      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#4FC3F7', '#FF6B6B', '#69F0AE', '#CE93D8'],
      });
    } catch (error: unknown) {
      console.error('Error submitting intake form:', error);
      const msg = error instanceof Error ? error.message : JSON.stringify(error);
      alert(`Error al enviar el formulario: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-gradient-to-br from-kids-yellow to-kids-mint rounded-bubbly p-12 shadow-2xl text-center max-w-2xl"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="flex justify-center mb-6"
          >
            <Check className="w-24 h-24 text-white" />
          </motion.div>
          <h2 className="text-5xl font-black text-white mb-6">
            {t.intakeForm.successMessage}
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.reload()}
            className="px-8 py-4 bg-white text-kids-purple text-xl font-black rounded-bubbly shadow-lg"
          >
            {t.common.close}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const slideVariants = {
    enter: (direction: number) => ({
      y: 30,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      y: -30,
      opacity: 0,
    }),
  };

  return (
    <div className="min-h-screen py-8 px-4 bg-white/95">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl md:text-6xl font-black text-kids-purple mb-8">
            {t.intakeForm.title}
          </h1>

          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <motion.div
                    animate={{
                      scale: currentStep === step.id ? 1.2 : 1,
                      backgroundColor:
                        currentStep >= step.id ? '#CE93D8' : '#E5E7EB',
                    }}
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-white shadow-lg`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-6 h-6" />
                    ) : (
                      step.id
                    )}
                  </motion.div>
                  <div className="text-xs md:text-sm font-bold text-gray-700 mt-2 text-center">
                    {language === 'es' ? step.nameEs : step.nameEn}
                  </div>
                </div>
                {index < STEPS.length - 1 && (
                  <motion.div
                    animate={{
                      backgroundColor:
                        currentStep > step.id ? '#CE93D8' : '#E5E7EB',
                    }}
                    className="h-2 flex-1 mx-2"
                  />
                )}
              </div>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'tween', duration: 0.4, ease: 'easeOut' }}
          >
            {currentStep === 1 && (
              <div className="bg-white rounded-bubbly p-8 shadow-xl border-4 border-kids-yellow">
                <h2 className="text-3xl font-black text-kids-yellow mb-6">
                  {STEPS[0].nameEs}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t.intakeForm.fullName + ' *'}
                    value={sectionA.fullName}
                    onChange={(e) =>
                      setSectionA({ ...sectionA, fullName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-yellow focus:outline-none font-semibold"
                  />
                  <input
                    type="text"
                    placeholder={t.intakeForm.nickname}
                    value={sectionA.nickname}
                    onChange={(e) =>
                      setSectionA({ ...sectionA, nickname: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-yellow focus:outline-none font-semibold"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-kids-purple mb-1">
                        {t.intakeForm.dob} <span className="text-kids-coral">*</span>
                      </label>
                      <input
                        type="date"
                        value={sectionA.dob}
                        onChange={(e) =>
                          setSectionA({ ...sectionA, dob: e.target.value })
                        }
                        required
                        className="w-full px-4 py-3 rounded-bubbly border-2 border-kids-yellow focus:border-kids-purple focus:outline-none font-semibold bg-kids-yellow/5"
                      />
                      <p className="text-xs text-gray-400 font-semibold mt-1">
                        {language === 'es' ? 'Seleccione la fecha de nacimiento del niño/a' : "Select the child's date of birth"}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-kids-purple mb-1">
                        {t.intakeForm.gender}
                      </label>
                      <input
                        type="text"
                        placeholder={t.intakeForm.gender}
                        value={sectionA.gender}
                        onChange={(e) =>
                          setSectionA({ ...sectionA, gender: e.target.value })
                        }
                        className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-yellow focus:outline-none font-semibold"
                      />
                    </div>
                  </div>
                  </div>
                  <select
                    value={sectionA.room}
                    onChange={(e) =>
                      setSectionA({ ...sectionA, room: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-yellow focus:outline-none font-semibold"
                  >
                    <option value="">{language === 'es' ? 'Sala/Clase *' : 'Classroom *'}</option>
                    <option value="babies">{language === 'es' ? 'Bebés (0-2 años)' : 'Babies (0-2 yrs)'}</option>
                    <option value="explorers">{language === 'es' ? 'Exploradores (3-4 años)' : 'Explorers (3-4 yrs)'}</option>
                    <option value="adventurers">{language === 'es' ? 'Principiantes/Primarios (5-8 años)' : 'Beginners/Primary (5-8 yrs)'}</option>
                    <option value="youth">{language === 'es' ? 'Jóvenes (9-12 años)' : 'Youth (9-12 yrs)'}</option>
                  </select>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="bg-white rounded-bubbly p-8 shadow-xl border-4 border-kids-blue">
                <h2 className="text-3xl font-black text-kids-blue mb-6">
                  {STEPS[1].nameEs}
                </h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder={t.intakeForm.primaryGuardian + ' *'}
                    value={sectionB.primaryName}
                    onChange={(e) =>
                      setSectionB({ ...sectionB, primaryName: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t.intakeForm.relationship + ' *'}
                      value={sectionB.primaryRelationship}
                      onChange={(e) =>
                        setSectionB({
                          ...sectionB,
                          primaryRelationship: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                    />
                    <input
                      type="tel"
                      placeholder={t.intakeForm.phone + ' *'}
                      value={sectionB.primaryPhone}
                      onChange={(e) =>
                        setSectionB({ ...sectionB, primaryPhone: e.target.value })
                      }
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder={t.intakeForm.email + ' *'}
                    value={sectionB.primaryEmail}
                    onChange={(e) =>
                      setSectionB({ ...sectionB, primaryEmail: e.target.value })
                    }
                    required
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                  />
                  <h3 className="text-xl font-bold text-gray-700 mt-6">
                    {t.intakeForm.secondaryContact}
                  </h3>
                  <input
                    type="text"
                    placeholder={t.intakeForm.primaryGuardian}
                    value={sectionB.secondaryName}
                    onChange={(e) =>
                      setSectionB({ ...sectionB, secondaryName: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t.intakeForm.relationship}
                      value={sectionB.secondaryRelationship}
                      onChange={(e) =>
                        setSectionB({
                          ...sectionB,
                          secondaryRelationship: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                    />
                    <input
                      type="tel"
                      placeholder={t.intakeForm.phone}
                      value={sectionB.secondaryPhone}
                      onChange={(e) =>
                        setSectionB({
                          ...sectionB,
                          secondaryPhone: e.target.value,
                        })
                      }
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-blue focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="bg-white rounded-bubbly p-8 shadow-xl border-4 border-kids-coral">
                <h2 className="text-3xl font-black text-kids-coral mb-6">
                  {STEPS[2].nameEs}
                </h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-3">
                      {t.intakeForm.allergies}
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {allergyOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => handleAllergyToggle(option.value)}
                          className={`px-4 py-2 rounded-bubbly font-bold transition-all ${
                            sectionC.allergies.includes(option.value)
                              ? 'bg-kids-coral text-white'
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    placeholder={t.intakeForm.restrictedFoods}
                    value={sectionC.restrictedFoods}
                    onChange={(e) =>
                      setSectionC({ ...sectionC, restrictedFoods: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold"
                  />

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-lg font-bold text-gray-700">
                        {t.intakeForm.medications}
                      </label>
                      <button
                        type="button"
                        onClick={addMedication}
                        className="flex items-center space-x-2 px-4 py-2 bg-kids-mint text-white rounded-bubbly font-bold hover:scale-105 transition-transform"
                      >
                        <Plus className="w-5 h-5" />
                        <span>{t.intakeForm.addMedication}</span>
                      </button>
                    </div>
                    {medications.map((med, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3 p-4 bg-gray-50 rounded-bubbly"
                      >
                        <input
                          type="text"
                          placeholder={t.intakeForm.medicationName}
                          value={med.name}
                          onChange={(e) =>
                            updateMedication(index, 'name', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border-2 border-gray-300 font-semibold"
                        />
                        <input
                          type="text"
                          placeholder={t.intakeForm.dosage}
                          value={med.dosage}
                          onChange={(e) =>
                            updateMedication(index, 'dosage', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border-2 border-gray-300 font-semibold"
                        />
                        <input
                          type="text"
                          placeholder={t.intakeForm.frequency}
                          value={med.frequency}
                          onChange={(e) =>
                            updateMedication(index, 'frequency', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border-2 border-gray-300 font-semibold"
                        />
                        <input
                          type="text"
                          placeholder={t.intakeForm.administeredBy}
                          value={med.administeredBy}
                          onChange={(e) =>
                            updateMedication(index, 'administeredBy', e.target.value)
                          }
                          className="px-3 py-2 rounded-lg border-2 border-gray-300 font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => removeMedication(index)}
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <Trash2 className="w-5 h-5 mx-auto" />
                        </button>
                      </div>
                    ))}
                  </div>

                  <textarea
                    placeholder={t.intakeForm.medicalConditions}
                    value={sectionC.medicalConditions}
                    onChange={(e) =>
                      setSectionC({
                        ...sectionC,
                        medicalConditions: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder={t.intakeForm.doctorName}
                      value={sectionC.doctorName}
                      onChange={(e) =>
                        setSectionC({ ...sectionC, doctorName: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold"
                    />
                    <input
                      type="tel"
                      placeholder={t.intakeForm.doctorPhone}
                      value={sectionC.doctorPhone}
                      onChange={(e) =>
                        setSectionC({ ...sectionC, doctorPhone: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-coral focus:outline-none font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-white rounded-bubbly p-8 shadow-xl border-4 border-kids-mint">
                <h2 className="text-3xl font-black text-kids-mint mb-6">
                  {STEPS[3].nameEs}
                </h2>
                <div className="space-y-4">
                  <textarea
                    placeholder={t.intakeForm.specialNeeds}
                    value={sectionC.specialNeeds}
                    onChange={(e) =>
                      setSectionC({ ...sectionC, specialNeeds: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-mint focus:outline-none font-semibold"
                  />
                  <textarea
                    placeholder={t.intakeForm.behavioralNotes}
                    value={sectionD.behavioralNotes}
                    onChange={(e) =>
                      setSectionD({ ...sectionD, behavioralNotes: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-mint focus:outline-none font-semibold"
                  />
                  <textarea
                    placeholder={t.intakeForm.triggers}
                    value={sectionD.triggers}
                    onChange={(e) =>
                      setSectionD({ ...sectionD, triggers: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-mint focus:outline-none font-semibold"
                  />
                  <textarea
                    placeholder={t.intakeForm.communicationNotes}
                    value={sectionD.communicationNotes}
                    onChange={(e) =>
                      setSectionD({
                        ...sectionD,
                        communicationNotes: e.target.value,
                      })
                    }
                    rows={3}
                    className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-mint focus:outline-none font-semibold"
                  />
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="bg-white rounded-bubbly p-8 shadow-xl border-4 border-kids-purple">
                <h2 className="text-3xl font-black text-kids-purple mb-6">
                  {STEPS[4].nameEs}
                </h2>

                <div className="bg-gray-50 rounded-bubbly p-6 mb-6">
                  <h3 className="text-2xl font-black text-kids-blue mb-4">
                    Resumen del Formulario
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <strong>Niño:</strong> {sectionA.fullName}
                    </div>
                    <div>
                      <strong>Fecha de Nacimiento:</strong> {sectionA.dob}
                    </div>
                    <div>
                      <strong>Padre/Tutor:</strong> {sectionB.primaryName}
                    </div>
                    <div>
                      <strong>Teléfono:</strong> {sectionB.primaryPhone}
                    </div>
                    <div>
                      <strong>Alergias:</strong>{' '}
                      {sectionC.allergies.join(', ') || 'Ninguna'}
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border-2 border-amber-400 rounded-bubbly p-6 mb-6">
                  <h3 className="text-lg font-black text-amber-800 mb-3">
                    Confidencialidad y Privacidad / Confidentiality & Privacy
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <p className="font-semibold">
                      Esta información es confidencial y será utilizada únicamente para el cuidado del menor.
                    </p>
                    <p className="text-xs leading-relaxed">
                      This information is confidential and will be used solely for the care of the child.
                      Under Florida law, including the Florida Educational Rights and Privacy Act (FERPA) and applicable federal regulations,
                      all personal, medical, and family information collected through this form is protected and will only be accessed by
                      authorized ministry personnel for the purposes of child safety, emergency contact, medical care, and program administration.
                      Information will not be shared with third parties without your express written consent, except as required by law or
                      in cases of emergency. As a non-profit religious organization, we maintain strict confidentiality protocols to protect
                      your family's privacy and the well-being of your child.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={sectionE.photoConsent}
                      onChange={(e) =>
                        setSectionE({ ...sectionE, photoConsent: e.target.checked })
                      }
                      className="w-6 h-6 rounded border-2 border-gray-300 mt-1"
                    />
                    <div>
                      <div className="text-lg font-bold text-gray-700">
                        {t.intakeForm.photoConsent}
                      </div>
                      <div className="text-sm text-gray-600">
                        {t.intakeForm.photoConsentText}
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={sectionE.medicalConsent}
                      onChange={(e) =>
                        setSectionE({
                          ...sectionE,
                          medicalConsent: e.target.checked,
                        })
                      }
                      required
                      className="w-6 h-6 rounded border-2 border-gray-300 mt-1"
                    />
                    <div>
                      <div className="text-lg font-bold text-gray-700">
                        {t.intakeForm.medicalConsent} *
                      </div>
                      <div className="text-sm text-gray-600">
                        {t.intakeForm.medicalConsentText}
                      </div>
                    </div>
                  </label>

                  <div>
                    <label className="block text-lg font-bold text-gray-700 mb-2">
                      {t.intakeForm.digitalSignature} *
                    </label>
                    <input
                      type="text"
                      placeholder={t.intakeForm.signaturePlaceholder}
                      value={sectionE.digitalSignature}
                      onChange={(e) =>
                        setSectionE({
                          ...sectionE,
                          digitalSignature: e.target.value,
                        })
                      }
                      required
                      className="w-full px-4 py-3 rounded-bubbly border-2 border-gray-300 focus:border-kids-purple focus:outline-none font-semibold text-2xl italic"
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between mt-8">
          {currentStep > 1 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={prevStep}
              className="flex items-center space-x-2 px-6 py-4 bg-gray-300 text-gray-700 rounded-bubbly font-bold shadow-lg"
            >
              <ChevronLeft className="w-6 h-6" />
              <span>Anterior</span>
            </motion.button>
          )}

          {currentStep < 5 ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={nextStep}
              className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-kids-blue to-kids-purple text-white rounded-bubbly font-bold shadow-lg ml-auto"
            >
              <span>Siguiente</span>
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-4 bg-gradient-to-r from-kids-mint to-kids-coral text-white rounded-bubbly font-bold shadow-lg ml-auto disabled:opacity-50"
            >
              <span>{loading ? 'Enviando...' : 'Enviar Formulario'}</span>
              <Check className="w-6 h-6" />
            </motion.button>
          )}
        </div>
      </div>
    </div>
  );
};
