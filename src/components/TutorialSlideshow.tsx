import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, BookOpen, Download } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import jsPDF from 'jspdf';

interface Slide {
  title: string;
  titleEs: string;
  content: string;
  contentEs: string;
  bullets?: string[];
  bulletsEs?: string[];
  image?: string;
}

interface TutorialSlideshowProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TutorialSlideshow = ({ isOpen, onClose }: TutorialSlideshowProps) => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    {
      title: 'Welcome to Aviva Kids Management System',
      titleEs: 'Bienvenido al Sistema de Gestión de Aviva Kids',
      content: 'This tutorial will guide you through all the features of the Aviva Kids system.',
      contentEs: 'Este tutorial le guiará a través de todas las funciones del sistema Aviva Kids.',
      bullets: [
        'Child check-in and check-out',
        'Parent intake forms',
        'Emergency notifications',
        'Birthday tracking',
        'Event calendar',
        'QR code badge generation'
      ],
      bulletsEs: [
        'Registro de entrada y salida de niños',
        'Formularios de admisión de padres',
        'Notificaciones de emergencia',
        'Seguimiento de cumpleaños',
        'Calendario de eventos',
        'Generación de credenciales con código QR'
      ]
    },
    {
      title: 'Home Page Overview',
      titleEs: 'Descripción General de la Página Principal',
      content: 'The home page provides quick access to all major features and displays real-time statistics.',
      contentEs: 'La página principal proporciona acceso rápido a todas las funciones principales y muestra estadísticas en tiempo real.',
      bullets: [
        'View total registered children',
        'See current attendance count',
        'Quick navigation to all sections',
        'Colorful, child-friendly interface'
      ],
      bulletsEs: [
        'Ver total de niños registrados',
        'Ver conteo de asistencia actual',
        'Navegación rápida a todas las secciones',
        'Interfaz colorida y amigable para niños'
      ]
    },
    {
      title: 'Check-In Process',
      titleEs: 'Proceso de Registro de Entrada',
      content: 'Quickly check children in and out using QR codes or manual search.',
      contentEs: 'Registre rápidamente la entrada y salida de niños usando códigos QR o búsqueda manual.',
      bullets: [
        'Scan QR code badge for instant check-in',
        'Or search by child name',
        'See real-time check-in status',
        'Track who is currently present',
        'Quick check-out when parents arrive'
      ],
      bulletsEs: [
        'Escanear credencial con código QR para entrada instantánea',
        'O buscar por nombre del niño',
        'Ver estado de registro en tiempo real',
        'Rastrear quién está presente actualmente',
        'Salida rápida cuando llegan los padres'
      ]
    },
    {
      title: 'Intake Form - Step 1: Basic Information',
      titleEs: 'Formulario de Admisión - Paso 1: Información Básica',
      content: 'Parents complete a comprehensive intake form to register their child.',
      contentEs: 'Los padres completan un formulario de admisión completo para registrar a su hijo.',
      bullets: [
        'Child\'s full name and nickname',
        'Date of birth',
        'Grade level',
        'Parent/Guardian contact information',
        'Emergency contact numbers',
        'Available in English and Spanish'
      ],
      bulletsEs: [
        'Nombre completo y apodo del niño',
        'Fecha de nacimiento',
        'Nivel de grado',
        'Información de contacto de padres/tutores',
        'Números de contacto de emergencia',
        'Disponible en inglés y español'
      ]
    },
    {
      title: 'Intake Form - Step 2: Medical & Allergies',
      titleEs: 'Formulario de Admisión - Paso 2: Médico y Alergias',
      content: 'Critical health information to keep children safe.',
      contentEs: 'Información de salud crítica para mantener seguros a los niños.',
      bullets: [
        'List all allergies (food, environmental, medication)',
        'Medical conditions and special needs',
        'Current medications',
        'Dietary restrictions',
        'Emergency medical authorization'
      ],
      bulletsEs: [
        'Lista de todas las alergias (alimentos, ambientales, medicamentos)',
        'Condiciones médicas y necesidades especiales',
        'Medicamentos actuales',
        'Restricciones dietéticas',
        'Autorización médica de emergencia'
      ]
    },
    {
      title: 'Intake Form - Step 3: Emergency Contacts',
      titleEs: 'Formulario de Admisión - Paso 3: Contactos de Emergencia',
      content: 'Additional people authorized to pick up the child.',
      contentEs: 'Personas adicionales autorizadas para recoger al niño.',
      bullets: [
        'Add multiple emergency contacts',
        'Name, relationship, and phone number',
        'Pick-up authorization',
        'Important for safety and security'
      ],
      bulletsEs: [
        'Agregar múltiples contactos de emergencia',
        'Nombre, relación y número de teléfono',
        'Autorización de recogida',
        'Importante para la seguridad'
      ]
    },
    {
      title: 'Intake Form - Step 4: Photo & Completion',
      titleEs: 'Formulario de Admisión - Paso 4: Foto y Finalización',
      content: 'Upload a photo and generate the QR code badge.',
      contentEs: 'Cargar una foto y generar la credencial con código QR.',
      bullets: [
        'Upload child\'s photo',
        'Review all information',
        'Submit the form',
        'Automatically generates QR code badge',
        'Badge can be downloaded and printed'
      ],
      bulletsEs: [
        'Cargar foto del niño',
        'Revisar toda la información',
        'Enviar el formulario',
        'Genera automáticamente credencial con código QR',
        'La credencial se puede descargar e imprimir'
      ]
    },
    {
      title: 'QR Code Badges',
      titleEs: 'Credenciales con Código QR',
      content: 'Each child receives a unique QR code badge for quick check-in.',
      contentEs: 'Cada niño recibe una credencial única con código QR para registro rápido.',
      bullets: [
        'Generated automatically after intake',
        'Contains child\'s photo and name',
        'Unique QR code for scanning',
        'Download as PDF or print directly',
        'Makes check-in fast and secure'
      ],
      bulletsEs: [
        'Generado automáticamente después de la admisión',
        'Contiene foto y nombre del niño',
        'Código QR único para escanear',
        'Descargar como PDF o imprimir directamente',
        'Hace el registro rápido y seguro'
      ]
    },
    {
      title: 'Emergency Notifications',
      titleEs: 'Notificaciones de Emergencia',
      content: 'Send urgent alerts to parents via email and SMS.',
      contentEs: 'Enviar alertas urgentes a los padres por correo electrónico y SMS.',
      bullets: [
        'Access from Teacher Portal',
        'Select alert type (Emergency, Weather, Medical, General)',
        'Compose message in English and Spanish',
        'Send to all parents or specific groups',
        'Notifications sent via email instantly'
      ],
      bulletsEs: [
        'Acceder desde el Portal de Maestros',
        'Seleccionar tipo de alerta (Emergencia, Clima, Médica, General)',
        'Redactar mensaje en inglés y español',
        'Enviar a todos los padres o grupos específicos',
        'Notificaciones enviadas por correo electrónico instantáneamente'
      ]
    },
    {
      title: 'Birthday Tracking',
      titleEs: 'Seguimiento de Cumpleaños',
      content: 'Never miss a child\'s birthday celebration!',
      contentEs: '¡Nunca te pierdas la celebración del cumpleaños de un niño!',
      bullets: [
        'Automatic birthday calendar',
        'Upcoming birthdays highlighted',
        'Visual confetti celebrations',
        'Filter by month',
        'Plan birthday celebrations in advance'
      ],
      bulletsEs: [
        'Calendario automático de cumpleaños',
        'Próximos cumpleaños resaltados',
        'Celebraciones visuales con confeti',
        'Filtrar por mes',
        'Planificar celebraciones de cumpleaños con anticipación'
      ]
    },
    {
      title: 'Event Calendar',
      titleEs: 'Calendario de Eventos',
      content: 'Manage and track all ministry events and activities.',
      contentEs: 'Gestionar y rastrear todos los eventos y actividades del ministerio.',
      bullets: [
        'Add special events and activities',
        'Set event dates and times',
        'Include descriptions',
        'Visual calendar view',
        'Parents can see upcoming events'
      ],
      bulletsEs: [
        'Agregar eventos y actividades especiales',
        'Establecer fechas y horas de eventos',
        'Incluir descripciones',
        'Vista de calendario visual',
        'Los padres pueden ver próximos eventos'
      ]
    },
    {
      title: 'Teacher Portal - Analytics',
      titleEs: 'Portal de Maestros - Análisis',
      content: 'Comprehensive dashboard with attendance insights.',
      contentEs: 'Panel completo con información de asistencia.',
      bullets: [
        'View attendance trends over time',
        'See which children are checked in',
        'Track check-in/check-out history',
        'Monitor overall participation',
        'Export reports for record-keeping'
      ],
      bulletsEs: [
        'Ver tendencias de asistencia a lo largo del tiempo',
        'Ver qué niños están registrados',
        'Rastrear historial de entrada/salida',
        'Monitorear participación general',
        'Exportar informes para mantener registros'
      ]
    },
    {
      title: 'Export Complete Records',
      titleEs: 'Exportar Registros Completos',
      content: 'Export comprehensive child records with all parent and medical information in multiple formats.',
      contentEs: 'Exporte registros completos de niños con toda la información de padres y médica en múltiples formatos.',
      bullets: [
        'PDF Detailed Export: Includes photos, QR codes, complete parent info, addresses, and all medical/emergency data',
        'PDF Summary Table: Compact table format with essential information for quick reference',
        'Excel Export: Fully editable spreadsheet with all fields organized in columns',
        'Includes intake form data: allergies, medications, special needs, emergency contacts',
        'Perfect for official records, filing requirements, and emergency preparedness',
        'Access from "Todos los Niños Registrados" tab in Teacher Portal'
      ],
      bulletsEs: [
        'Exportación PDF Detallada: Incluye fotos, códigos QR, información completa de padres, direcciones y todos los datos médicos/emergencia',
        'Tabla PDF Resumen: Formato de tabla compacto con información esencial para referencia rápida',
        'Exportación Excel: Hoja de cálculo totalmente editable con todos los campos organizados en columnas',
        'Incluye datos del formulario de admisión: alergias, medicamentos, necesidades especiales, contactos de emergencia',
        'Perfecto para registros oficiales, requisitos de archivo y preparación para emergencias',
        'Acceda desde la pestaña "Todos los Niños Registrados" en el Portal de Maestros'
      ]
    },
    {
      title: 'Tips for Success',
      titleEs: 'Consejos para el Éxito',
      content: 'Best practices for using the Aviva Kids system.',
      contentEs: 'Mejores prácticas para usar el sistema Aviva Kids.',
      bullets: [
        'Print QR badges on durable card stock',
        'Laminate badges for longevity',
        'Keep a tablet at check-in station',
        'Review intake forms regularly',
        'Test emergency notifications before use',
        'Update parent contact info as needed'
      ],
      bulletsEs: [
        'Imprimir credenciales QR en cartulina duradera',
        'Laminar credenciales para mayor durabilidad',
        'Mantener una tableta en la estación de registro',
        'Revisar formularios de admisión regularmente',
        'Probar notificaciones de emergencia antes de usar',
        'Actualizar información de contacto de padres según sea necesario'
      ]
    },
    {
      title: 'Need Help?',
      titleEs: '¿Necesita Ayuda?',
      content: 'You can always revisit this tutorial from the Teacher Portal.',
      contentEs: 'Siempre puede volver a ver este tutorial desde el Portal de Maestros.',
      bullets: [
        'Click the "Tutorial" button anytime',
        'All features are designed to be intuitive',
        'The system works in English and Spanish',
        'Contact your ministry coordinator for support',
        'Thank you for serving at Aviva Kids!'
      ],
      bulletsEs: [
        'Haga clic en el botón "Tutorial" en cualquier momento',
        'Todas las funciones están diseñadas para ser intuitivas',
        'El sistema funciona en inglés y español',
        'Contacte a su coordinador del ministerio para soporte',
        '¡Gracias por servir en Aviva Kids!'
      ]
    }
  ];

  const currentSlideData = slides[currentSlide];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const downloadAsPDF = () => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    slides.forEach((slide, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      let yPosition = margin;

      pdf.setFillColor(206, 147, 216);
      pdf.rect(0, 0, pageWidth, 25, 'F');

      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Aviva Kids Tutorial', pageWidth / 2, 15, { align: 'center' });

      yPosition = 40;

      pdf.setTextColor(128, 90, 213);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      const title = language === 'es' ? slide.titleEs : slide.title;
      const titleLines = pdf.splitTextToSize(title, contentWidth);
      pdf.text(titleLines, margin, yPosition);
      yPosition += titleLines.length * 8 + 10;

      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const content = language === 'es' ? slide.contentEs : slide.content;
      const contentLines = pdf.splitTextToSize(content, contentWidth);
      pdf.text(contentLines, margin, yPosition);
      yPosition += contentLines.length * 6 + 10;

      if (slide.bullets) {
        const bullets = language === 'es' ? slide.bulletsEs : slide.bullets;
        bullets?.forEach((bullet) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = margin;
          }

          pdf.setFillColor(255, 107, 107);
          pdf.circle(margin + 2, yPosition - 1, 1.5, 'F');

          const bulletLines = pdf.splitTextToSize(bullet, contentWidth - 10);
          pdf.text(bulletLines, margin + 8, yPosition);
          yPosition += bulletLines.length * 6 + 4;
        });
      }

      pdf.setTextColor(150, 150, 150);
      pdf.setFontSize(8);
      pdf.text(`Página ${index + 1} de ${slides.length}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
    });

    pdf.save('Aviva-Kids-Tutorial.pdf');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-kids-yellow via-kids-blue to-kids-coral p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-kids-purple" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {language === 'es' ? 'Tutorial de Aviva Kids' : 'Aviva Kids Tutorial'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadAsPDF}
              className="flex items-center gap-2 px-4 py-2 bg-white text-kids-purple rounded-full shadow-lg hover:scale-110 transition-transform duration-300 font-bold"
            >
              <Download className="w-5 h-5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
            >
              <X className="w-6 h-6 text-kids-purple" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-gradient-to-r from-kids-yellow via-kids-blue to-kids-coral h-full transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
          />
        </div>

        {/* Slide Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold text-kids-purple mb-4">
              {language === 'es' ? currentSlideData.titleEs : currentSlideData.title}
            </h3>
            <p className="text-lg text-gray-700 mb-6">
              {language === 'es' ? currentSlideData.contentEs : currentSlideData.content}
            </p>

            {currentSlideData.bullets && (
              <ul className="space-y-3">
                {(language === 'es' ? currentSlideData.bulletsEs : currentSlideData.bullets)?.map((bullet, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-kids-coral rounded-full mt-2 flex-shrink-0" />
                    <span className="text-gray-700">{bullet}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Navigation Dots */}
        <div className="flex items-center justify-center gap-2 py-4">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-3 bg-kids-blue'
                  : 'w-3 h-3 bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="bg-gray-50 p-6 flex items-center justify-between border-t">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-bubbly font-semibold transition-all duration-300 ${
              currentSlide === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-kids-blue text-white hover:scale-105 hover:shadow-lg'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            {language === 'es' ? 'Anterior' : 'Previous'}
          </button>

          <span className="text-gray-600 font-semibold">
            {currentSlide + 1} / {slides.length}
          </span>

          {currentSlide === slides.length - 1 ? (
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gradient-to-r from-kids-coral to-kids-yellow text-white rounded-bubbly font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              {language === 'es' ? 'Finalizar' : 'Finish'}
            </button>
          ) : (
            <button
              onClick={nextSlide}
              className="flex items-center gap-2 px-6 py-3 bg-kids-blue text-white rounded-bubbly font-semibold hover:scale-105 hover:shadow-lg transition-all duration-300"
            >
              {language === 'es' ? 'Siguiente' : 'Next'}
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
