import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'es' | 'en';

interface Translations {
  nav: {
    home: string;
    checkIn: string;
    intakeForm: string;
    calendar: string;
    birthdays: string;
    teacherPortal: string;
  };
  home: {
    welcome: string;
    subtitle: string;
    missionStatement: string;
    whatWeOffer: string;
    safeEnvironment: string;
    safeEnvironmentDesc: string;
    bibleTeaching: string;
    bibleTeachingDesc: string;
    ageGroups: string;
    ageGroupsDesc: string;
    ourAgeGroups: string;
    ages: string;
    firstTimeTitle: string;
    firstTimeDesc: string;
    checkInProcess: string;
    step1: string;
    step2: string;
    step3: string;
    step4: string;
  };
  checkIn: {
    title: string;
    childName: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    childAge: string;
    childDob: string;
    room: string;
    submitButton: string;
    successTitle: string;
    successMessage: string;
    keepNumber: string;
    alertInstruction: string;
    rooms: {
      babies: string;
      explorers: string;
      adventurers: string;
      youth: string;
    };
  };
  intakeForm: {
    title: string;
    sectionA: string;
    sectionB: string;
    sectionC: string;
    sectionD: string;
    sectionE: string;
    fullName: string;
    nickname: string;
    dob: string;
    gender: string;
    uploadPhoto: string;
    primaryGuardian: string;
    relationship: string;
    phone: string;
    email: string;
    secondaryContact: string;
    allergies: string;
    restrictedFoods: string;
    medications: string;
    medicationName: string;
    dosage: string;
    frequency: string;
    administeredBy: string;
    addMedication: string;
    medicalConditions: string;
    specialNeeds: string;
    authorizedMedication: string;
    doctorName: string;
    doctorPhone: string;
    behavioralNotes: string;
    triggers: string;
    communicationNotes: string;
    photoConsent: string;
    photoConsentText: string;
    medicalConsent: string;
    medicalConsentText: string;
    digitalSignature: string;
    signaturePlaceholder: string;
    submitButton: string;
    successMessage: string;
    allergyOptions: {
      nuts: string;
      dairy: string;
      gluten: string;
      shellfish: string;
      other: string;
    };
  };
  calendar: {
    title: string;
    addEvent: string;
    listView: string;
    calendarView: string;
    upcomingEvents: string;
    eventTitle: string;
    date: string;
    time: string;
    description: string;
    location: string;
    category: string;
    color: string;
    save: string;
    cancel: string;
    categories: {
      activity: string;
      celebration: string;
      retreat: string;
      special: string;
    };
  };
  birthdays: {
    title: string;
    thisMonth: string;
    upcoming: string;
    turnsAge: string;
    celebrated: string;
    noBirthdays: string;
  };
  teacherPortal: {
    title: string;
    login: string;
    password: string;
    loginButton: string;
    logout: string;
    dashboard: string;
    checkInList: string;
    searchIntake: string;
    alertPanel: string;
    eventManager: string;
    birthdayManager: string;
    exportCSV: string;
    childNumber: string;
    enterNumber: string;
    alertReason: string;
    triggerAlert: string;
    needsAttention: string;
    pickUpChild: string;
    searchPlaceholder: string;
    markCelebrated: string;
    noChildrenCheckedIn: string;
    checkedInAt: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    submit: string;
    edit: string;
    delete: string;
    yes: string;
    no: string;
    close: string;
  };
}

const translations: Record<Language, Translations> = {
  es: {
    nav: {
      home: 'Inicio',
      checkIn: 'Registro de Niños',
      intakeForm: 'Formulario de Admisión',
      calendar: 'Calendario de Eventos',
      birthdays: 'Cumpleaños',
      teacherPortal: 'Portal del Maestro',
    },
    home: {
      welcome: '¡Bienvenidos a ICGG Aviva Kids!',
      subtitle: 'Iglesia Cristiana Gracia y Gloria',
      missionStatement: 'Un lugar seguro donde los niños aprenden sobre el amor de Jesús, hacen amigos y crecen en su fe a través de enseñanzas bíblicas apropiadas para su edad, adoración y actividades divertidas.',
      whatWeOffer: '¿Qué Ofrecemos?',
      safeEnvironment: 'Ambiente Seguro',
      safeEnvironmentDesc: 'Ambiente protegido y cuidadosamente supervisado con personal verificado y capacitado que prioriza la seguridad de su hijo.',
      bibleTeaching: 'Enseñanza Bíblica',
      bibleTeachingDesc: 'Lecciones apropiadas para la edad que ayudan a los niños a entender la Biblia y aplicar sus principios en la vida diaria.',
      ageGroups: 'Grupos por Edad',
      ageGroupsDesc: 'Clases adaptadas al desarrollo diseñadas específicamente para cada grupo de edad, asegurando experiencias de aprendizaje óptimas.',
      ourAgeGroups: 'Nuestros Grupos por Edad',
      ages: 'Edades',
      firstTimeTitle: '¿Primera Vez Visitando?',
      firstTimeDesc: '¡Estamos emocionados de conocer a su familia! Así es como funciona nuestro proceso de registro para garantizar la seguridad y comodidad de su hijo.',
      checkInProcess: 'Proceso de Registro:',
      step1: 'Complete el formulario de admisión en línea antes de su visita (o llegue temprano para completarlo)',
      step2: 'Al llegar, un miembro del personal le asistirá en el registro de su hijo/a',
      step3: 'Recibirá un número único para usted y su hijo',
      step4: 'Si necesitamos contactarlo durante el servicio, su número aparecerá en las pantallas',
    },
    checkIn: {
      title: 'Registro de Niños',
      childName: 'Nombre completo del niño',
      parentName: 'Nombre del padre/tutor',
      parentPhone: 'Teléfono',
      parentEmail: 'Correo electrónico',
      childAge: 'Edad del niño',
      childDob: 'Fecha de nacimiento',
      room: 'Sala/Clase',
      submitButton: 'Registrar Niño',
      successTitle: '¡Registro Exitoso!',
      successMessage: 'Número asignado a {name}',
      keepNumber: 'Guarda este número. Si tu hijo necesita atención, este número aparecerá en pantalla.',
      alertInstruction: 'Por favor, mantén este número visible.',
      rooms: {
        babies: 'Cuna/Guardería 0-3 años',
        explorers: 'Párvulos/Preescolares 3-5 años',
        adventurers: 'Principiantes/Primarios 5-6 o 7-8 años',
        youth: 'Primarios/Junior 7-10 o 11 años',
      },
    },
    intakeForm: {
      title: 'Formulario de Admisión',
      sectionA: 'Sección A - Información del Niño',
      sectionB: 'Sección B - Información del Padre/Tutor',
      sectionC: 'Sección C - Información Médica y de Salud',
      sectionD: 'Sección D - Comportamiento y Notas Especiales',
      sectionE: 'Sección E - Consentimiento Legal',
      fullName: 'Nombre legal completo',
      nickname: 'Apodo',
      dob: 'Fecha de nacimiento',
      gender: 'Género',
      uploadPhoto: 'Subir foto (opcional)',
      primaryGuardian: 'Tutor principal',
      relationship: 'Relación',
      phone: 'Teléfono',
      email: 'Correo electrónico',
      secondaryContact: 'Contacto secundario/emergencia',
      allergies: 'Alergias alimentarias',
      restrictedFoods: 'Alimentos o bebidas que el niño no puede consumir',
      medications: 'Medicamentos actuales',
      medicationName: 'Nombre del medicamento',
      dosage: 'Dosis',
      frequency: 'Frecuencia',
      administeredBy: 'Administrado por',
      addMedication: 'Agregar medicamento',
      medicalConditions: 'Condiciones o diagnósticos médicos',
      specialNeeds: 'Necesidades especiales o adaptaciones requeridas',
      authorizedMedication: '¿Autorizado para administrar medicamentos?',
      doctorName: 'Nombre del médico',
      doctorPhone: 'Teléfono del médico',
      behavioralNotes: 'Consideraciones de comportamiento que el maestro debe conocer',
      triggers: 'Desencadenantes o sensibilidades',
      communicationNotes: 'Estilo o preferencias de comunicación',
      photoConsent: 'Consentimiento de foto/video',
      photoConsentText: 'Autorizo que se tomen y usen fotos/videos de mi hijo para fines del ministerio',
      medicalConsent: 'Consentimiento de emergencia médica',
      medicalConsentText: 'Autorizo tratamiento médico de emergencia para mi hijo si es necesario',
      digitalSignature: 'Firma digital',
      signaturePlaceholder: 'Escriba su nombre completo como firma',
      submitButton: 'Enviar Formulario',
      successMessage: '¡Formulario enviado exitosamente!',
      allergyOptions: {
        nuts: 'Nueces',
        dairy: 'Lácteos',
        gluten: 'Gluten',
        shellfish: 'Mariscos',
        other: 'Otro',
      },
    },
    calendar: {
      title: 'Calendario de Eventos',
      addEvent: 'Agregar Evento',
      listView: 'Vista de Lista',
      calendarView: 'Vista de Calendario',
      upcomingEvents: 'Próximos Eventos',
      eventTitle: 'Título del evento',
      date: 'Fecha',
      time: 'Hora',
      description: 'Descripción',
      location: 'Ubicación',
      category: 'Categoría',
      color: 'Color',
      save: 'Guardar',
      cancel: 'Cancelar',
      categories: {
        activity: 'Actividad',
        celebration: 'Celebración',
        retreat: 'Retiro',
        special: 'Especial',
      },
    },
    birthdays: {
      title: 'Cumpleaños',
      thisMonth: 'Cumpleaños Este Mes',
      upcoming: 'Próximos Cumpleaños (30 días)',
      turnsAge: 'cumple {age} años',
      celebrated: 'Celebrado',
      noBirthdays: 'No hay cumpleaños',
    },
    teacherPortal: {
      title: 'Portal del Maestro',
      login: 'Iniciar Sesión',
      password: 'Contraseña',
      loginButton: 'Entrar',
      logout: 'Cerrar Sesión',
      dashboard: 'Panel de Control',
      checkInList: 'Lista de Registro de Hoy',
      searchIntake: 'Buscar Formulario de Admisión',
      alertPanel: 'Panel de Alertas',
      eventManager: 'Gestor de Eventos',
      birthdayManager: 'Gestor de Cumpleaños',
      exportCSV: 'Exportar CSV',
      childNumber: 'Número del Niño',
      enterNumber: 'Ingrese el número',
      alertReason: 'Razón de la alerta',
      triggerAlert: 'Activar Alerta',
      needsAttention: 'Su hijo necesita su atención',
      pickUpChild: 'Por favor recoja a su hijo',
      searchPlaceholder: 'Buscar por nombre o número...',
      markCelebrated: 'Marcar como celebrado',
      noChildrenCheckedIn: 'No hay niños registrados hoy',
      checkedInAt: 'Registrado a las',
    },
    common: {
      loading: 'Cargando...',
      error: 'Error',
      success: 'Éxito',
      submit: 'Enviar',
      edit: 'Editar',
      delete: 'Eliminar',
      yes: 'Sí',
      no: 'No',
      close: 'Cerrar',
    },
  },
  en: {
    nav: {
      home: 'Home',
      checkIn: 'Child Check-In',
      intakeForm: 'Intake Form',
      calendar: 'Event Calendar',
      birthdays: 'Birthdays',
      teacherPortal: 'Teacher Portal',
    },
    home: {
      welcome: 'Welcome to ICGG Aviva Kids!',
      subtitle: 'Iglesia Cristiana Gracia y Gloria',
      missionStatement: 'A safe place where children learn about Jesus\' love, make friends, and grow in their faith through age-appropriate Bible teaching, worship, and fun activities.',
      whatWeOffer: 'What We Offer',
      safeEnvironment: 'Safe Environment',
      safeEnvironmentDesc: 'A secure and carefully supervised environment with background-checked and trained staff who prioritize your child\'s safety.',
      bibleTeaching: 'Bible Teaching',
      bibleTeachingDesc: 'Age-appropriate lessons that help children understand the Bible and apply its principles to everyday life.',
      ageGroups: 'Age Groups',
      ageGroupsDesc: 'Developmentally tailored classes designed specifically for each age group, ensuring optimal learning experiences.',
      ourAgeGroups: 'Our Age Groups',
      ages: 'Ages',
      firstTimeTitle: 'First Time Visiting?',
      firstTimeDesc: 'We\'re excited to meet your family! Here\'s how our check-in process works to ensure your child\'s safety and comfort.',
      checkInProcess: 'Check-In Process:',
      step1: 'Complete the intake form online before your visit (or arrive early to fill it out)',
      step2: 'Upon arrival, a staff member will assist you with your child\'s check-in',
      step3: 'You\'ll receive a unique number for you and your child',
      step4: 'If we need to reach you during service, your number will appear on screens',
    },
    checkIn: {
      title: 'Child Check-In',
      childName: 'Child\'s full name',
      parentName: 'Parent/guardian full name',
      parentPhone: 'Phone number',
      parentEmail: 'Email address',
      childAge: 'Child\'s age',
      childDob: 'Date of birth',
      room: 'Room/Class',
      submitButton: 'Check In Child',
      successTitle: 'Check-In Successful!',
      successMessage: 'Number assigned to {name}',
      keepNumber: 'Keep this number. If your child needs attention, this number will appear on screen.',
      alertInstruction: 'Please keep this number visible.',
      rooms: {
        babies: 'Nursery 0-3 years',
        explorers: 'Preschool 3-5 years',
        adventurers: 'Beginners/Primary 5-6 or 7-8 years',
        youth: 'Primary/Junior 7-10 or 11 years',
      },
    },
    intakeForm: {
      title: 'Intake Form',
      sectionA: 'Section A - Child Information',
      sectionB: 'Section B - Parent/Guardian Information',
      sectionC: 'Section C - Medical & Health Information',
      sectionD: 'Section D - Behavior & Special Notes',
      sectionE: 'Section E - Legal Consent',
      fullName: 'Full legal name',
      nickname: 'Nickname',
      dob: 'Date of birth',
      gender: 'Gender',
      uploadPhoto: 'Upload photo (optional)',
      primaryGuardian: 'Primary guardian',
      relationship: 'Relationship',
      phone: 'Phone',
      email: 'Email',
      secondaryContact: 'Secondary/emergency contact',
      allergies: 'Food allergies',
      restrictedFoods: 'Foods or drinks child cannot consume',
      medications: 'Current medications',
      medicationName: 'Medication name',
      dosage: 'Dosage',
      frequency: 'Frequency',
      administeredBy: 'Administered by',
      addMedication: 'Add medication',
      medicalConditions: 'Medical conditions or diagnoses',
      specialNeeds: 'Special needs or accommodations required',
      authorizedMedication: 'Authorized to administer medication?',
      doctorName: 'Doctor\'s name',
      doctorPhone: 'Doctor\'s phone',
      behavioralNotes: 'Behavioral considerations the teacher should know',
      triggers: 'Triggers or sensitivities',
      communicationNotes: 'Communication style or preferences',
      photoConsent: 'Photo/video consent',
      photoConsentText: 'I authorize photos/videos of my child to be taken and used for ministry purposes',
      medicalConsent: 'Medical emergency consent',
      medicalConsentText: 'I authorize emergency medical treatment for my child if necessary',
      digitalSignature: 'Digital signature',
      signaturePlaceholder: 'Type your full name as signature',
      submitButton: 'Submit Form',
      successMessage: 'Form submitted successfully!',
      allergyOptions: {
        nuts: 'Nuts',
        dairy: 'Dairy',
        gluten: 'Gluten',
        shellfish: 'Shellfish',
        other: 'Other',
      },
    },
    calendar: {
      title: 'Event Calendar',
      addEvent: 'Add Event',
      listView: 'List View',
      calendarView: 'Calendar View',
      upcomingEvents: 'Upcoming Events',
      eventTitle: 'Event title',
      date: 'Date',
      time: 'Time',
      description: 'Description',
      location: 'Location',
      category: 'Category',
      color: 'Color',
      save: 'Save',
      cancel: 'Cancel',
      categories: {
        activity: 'Activity',
        celebration: 'Celebration',
        retreat: 'Retreat',
        special: 'Special',
      },
    },
    birthdays: {
      title: 'Birthdays',
      thisMonth: 'Birthdays This Month',
      upcoming: 'Upcoming Birthdays (30 days)',
      turnsAge: 'turns {age}',
      celebrated: 'Celebrated',
      noBirthdays: 'No birthdays',
    },
    teacherPortal: {
      title: 'Teacher Portal',
      login: 'Login',
      password: 'Password',
      loginButton: 'Sign In',
      logout: 'Logout',
      dashboard: 'Dashboard',
      checkInList: 'Today\'s Check-In List',
      searchIntake: 'Search Intake Form',
      alertPanel: 'Alert Panel',
      eventManager: 'Event Manager',
      birthdayManager: 'Birthday Manager',
      exportCSV: 'Export CSV',
      childNumber: 'Child Number',
      enterNumber: 'Enter number',
      alertReason: 'Alert reason',
      triggerAlert: 'Trigger Alert',
      needsAttention: 'Your child needs your attention',
      pickUpChild: 'Please pick up your child',
      searchPlaceholder: 'Search by name or number...',
      markCelebrated: 'Mark as celebrated',
      noChildrenCheckedIn: 'No children checked in today',
      checkedInAt: 'Checked in at',
    },
    common: {
      loading: 'Loading...',
      error: 'Error',
      success: 'Success',
      submit: 'Submit',
      edit: 'Edit',
      delete: 'Delete',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
    },
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('es');

  const value = {
    language,
    setLanguage,
    t: translations[language],
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
