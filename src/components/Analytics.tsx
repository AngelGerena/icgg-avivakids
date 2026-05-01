import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell,
} from 'recharts';
import { Download, TrendingUp, Users, FileText, Star, Zap } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ROOM_COLORS = ['#FFD700', '#4FC3F7', '#FF6B6B', '#69F0AE'];
const ROOM_LABELS: Record<string, string> = {
  babies: 'Bebés 0-2',
  explorers: 'Exploradores 3-5',
  adventurers: 'Aventureros 6-9',
  youth: 'Jóvenes 10-12',
  general: 'General',
};

export const Analytics = () => {
  const { t } = useLanguage();
  const [roomDistribution, setRoomDistribution] = useState<any[]>([]);
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);
  const [totalChildren, setTotalChildren] = useState(0);
  const [checkedInToday, setCheckedInToday] = useState(0);
  const [intakeFormStats, setIntakeFormStats] = useState({
    completed: 0,
    missing: 0,
    missingNames: [] as string[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);

    // --- All children ---
    const { data: allChildren } = await supabase
      .from('children')
      .select('id, full_name, room, check_in_time, checked_in_today, created_at')
      .order('created_at', { ascending: true });

    if (allChildren) {
      setTotalChildren(allChildren.length);
      setCheckedInToday(allChildren.filter(c => c.checked_in_today).length);

      // Room distribution — real data
      const roomCounts = allChildren.reduce((acc: any, child) => {
        const room = child.room || 'general';
        acc[room] = (acc[room] || 0) + 1;
        return acc;
      }, {});
      const roomData = Object.entries(roomCounts).map(([key, value]) => ({
        name: ROOM_LABELS[key] || key,
        value,
      }));
      setRoomDistribution(roomData);

      // Monthly growth — registrations per month for last 6 months (real created_at)
      const today = new Date();
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const nextMonth = new Date(today.getFullYear(), today.getMonth() - i + 1, 1);
        const monthName = monthDate.toLocaleDateString('es-ES', { month: 'short' });
        const count = allChildren.filter(c => {
          const d = new Date(c.created_at);
          return d >= monthDate && d < nextMonth;
        }).length;
        // Cumulative total up to this month
        const cumulative = allChildren.filter(c => new Date(c.created_at) < nextMonth).length;
        monthlyData.push({ name: monthName, registrados: cumulative, nuevos: count });
      }
      setMonthlyGrowth(monthlyData);

      // Weekly attendance — pull from attendance history table
      const { data: attendanceRecords } = await supabase
        .from('attendance')
        .select('room, checked_in_at, service_date')
        .gte('checked_in_at', new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000).toISOString());

      const weeklyData = [];
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
        const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        const weekLabel = `Sem ${4 - i}`;

        const weekRecords = (attendanceRecords || []).filter(r => {
          const d = new Date(r.checked_in_at);
          return d >= weekStart && d < weekEnd;
        });

        weeklyData.push({
          name: weekLabel,
          'Bebés 0-2': weekRecords.filter(r => r.room === 'babies').length,
          'Exploradores 3-5': weekRecords.filter(r => r.room === 'explorers').length,
          'Aventureros 6-9': weekRecords.filter(r => r.room === 'adventurers').length,
          'Jóvenes 10-12': weekRecords.filter(r => r.room === 'youth').length,
        });
      }
      setWeeklyAttendance(weeklyData);
    }

    // Intake form completion — real data
    const { data: intakeForms } = await supabase
      .from('intake_forms')
      .select('child_id');

    const childrenWithIntake = new Set(intakeForms?.map(f => f.child_id) || []);
    const allChildrenData = (await supabase.from('children').select('id, full_name')).data || [];
    const missingIntake = allChildrenData.filter(c => !childrenWithIntake.has(c.id));

    setIntakeFormStats({
      completed: intakeForms?.length || 0,
      missing: missingIntake.length,
      missingNames: missingIntake.map(c => c.full_name),
    });

    setLoading(false);
  };

  const exportMonthlyReport = () => {
    const doc = new jsPDF();
    const today = new Date();

    // Header
    doc.setFillColor(206, 147, 216);
    doc.rect(0, 0, 210, 50, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Reporte Mensual del Ministerio de Ninos', 105, 18, { align: 'center' });
    doc.text('Iglesia Cristiana Gracia y Gloria', 105, 28, { align: 'center' });
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${today.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`, 105, 38, { align: 'center' });
    doc.text(`Mes: ${today.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}`, 105, 45, { align: 'center' });

    let yPos = 60;

    // Summary cards
    const cards = [
      { label: 'Total Ninos', value: totalChildren, color: [105, 240, 174] },
      { label: 'Hoy Presentes', value: checkedInToday, color: [79, 195, 247] },
      { label: 'Formularios', value: intakeFormStats.completed, color: [206, 147, 216] },
      { label: 'Pendientes', value: intakeFormStats.missing, color: [255, 107, 107] },
    ];
    cards.forEach((card, i) => {
      const x = 15 + i * 46;
      doc.setFillColor(card.color[0], card.color[1], card.color[2]);
      doc.roundedRect(x, yPos, 42, 26, 3, 3, 'F');
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text(String(card.value), x + 21, yPos + 14, { align: 'center' });
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(card.label, x + 21, yPos + 22, { align: 'center' });
    });
    yPos += 36;

    // Room distribution table
    doc.setFontSize(13);
    doc.setTextColor(79, 195, 247);
    doc.setFont('helvetica', 'bold');
    doc.text('Distribucion por Salas', 15, yPos + 7);
    yPos += 14;

    const roomTableData = roomDistribution.map((room, i) => [
      room.name,
      room.value,
      `${Math.round((room.value / totalChildren) * 100)}%`,
    ]);
    autoTable(doc, {
      startY: yPos,
      head: [['Sala', 'Ninos', 'Porcentaje']],
      body: roomTableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 195, 247], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center', fontSize: 10 },
      margin: { left: 15, right: 15 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Weekly attendance table
    doc.setFontSize(13);
    doc.setTextColor(206, 147, 216);
    doc.setFont('helvetica', 'bold');
    doc.text('Asistencia por Semana (Ultimas 4 Semanas)', 15, yPos + 7);
    yPos += 14;

    const weeklyTableData = weeklyAttendance.map(week => [
      week.name,
      week['Bebés 0-2'],
      week['Exploradores 3-5'],
      week['Aventureros 6-9'],
      week['Jóvenes 10-12'],
      week['Bebés 0-2'] + week['Exploradores 3-5'] + week['Aventureros 6-9'] + week['Jóvenes 10-12'],
    ]);
    autoTable(doc, {
      startY: yPos,
      head: [['Semana', 'Bebes', 'Exploradores', 'Aventureros', 'Jovenes', 'Total']],
      body: weeklyTableData,
      theme: 'grid',
      headStyles: { fillColor: [206, 147, 216], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center', fontSize: 10 },
      columnStyles: { 5: { fontStyle: 'bold', fillColor: [255, 245, 220] } },
      margin: { left: 15, right: 15 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Monthly registrations table
    if (yPos > 220) { doc.addPage(); yPos = 20; }
    doc.setFontSize(13);
    doc.setTextColor(105, 240, 174);
    doc.setFont('helvetica', 'bold');
    doc.text('Crecimiento de Registros (Ultimos 6 Meses)', 15, yPos + 7);
    yPos += 14;

    const monthlyTableData = monthlyGrowth.map(m => [m.name, m.nuevos, m.registrados]);
    autoTable(doc, {
      startY: yPos,
      head: [['Mes', 'Nuevos', 'Total Acumulado']],
      body: monthlyTableData,
      theme: 'grid',
      headStyles: { fillColor: [105, 240, 174], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center' },
      bodyStyles: { halign: 'center', fontSize: 10 },
      margin: { left: 15, right: 15 },
    });
    yPos = (doc as any).lastAutoTable.finalY + 12;

    // Pending families section
    if (intakeFormStats.missingNames.length > 0) {
      if (yPos > 230) { doc.addPage(); yPos = 20; }
      doc.setFontSize(13);
      doc.setTextColor(255, 107, 107);
      doc.setFont('helvetica', 'bold');
      doc.text('Familias Pendientes de Admision', 15, yPos + 7);
      yPos += 12;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.setFont('helvetica', 'italic');
      doc.text('Estos ninos asistieron via registro rapido pero aun no han completado el Formulario de Admision oficial.', 15, yPos);
      doc.text('Se recomienda hacer seguimiento con estas familias antes del proximo servicio.', 15, yPos + 5);
      yPos += 12;
      autoTable(doc, {
        startY: yPos,
        head: [['#', 'Nombre del Nino', 'Accion Requerida']],
        body: intakeFormStats.missingNames.map((n, i) => [i + 1, n, 'Enviar formulario de admision']),
        theme: 'grid',
        headStyles: { fillColor: [255, 107, 107], textColor: [255, 255, 255], fontStyle: 'bold' },
        bodyStyles: { fontSize: 10 },
        columnStyles: { 2: { textColor: [255, 107, 107], fontStyle: 'italic' } },
        margin: { left: 15, right: 15 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 8;
      doc.setFontSize(9);
      doc.setTextColor(180, 140, 0);
      doc.setFont('helvetica', 'bold');
      doc.text('Enlace del formulario: icgg-avivakids.org/intake-form', 15, yPos);
      yPos += 12;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text(`Pagina ${i} de ${pageCount} - Sistema Aviva Kids - ICGG`, 105, 287, { align: 'center' });
    }

    doc.save(`reporte-mensual-icgg-${today.toISOString().split('T')[0]}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-kids-purple" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-4xl font-black text-kids-purple flex items-center">
          <TrendingUp className="w-10 h-10 mr-3" />
          Analíticas
        </h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={exportMonthlyReport}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-kids-coral to-kids-purple text-white rounded-bubbly font-bold shadow-lg"
        >
          <Download className="w-5 h-5" />
          <span>Exportar Reporte Mensual</span>
        </motion.button>
      </div>

      {/* Top stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Registrados', value: totalChildren, icon: Users, gradient: 'from-kids-mint to-kids-blue' },
          { label: 'Presentes Hoy', value: checkedInToday, icon: Star, gradient: 'from-kids-yellow to-kids-coral' },
          { label: 'Formularios Completos', value: intakeFormStats.completed, icon: FileText, gradient: 'from-kids-blue to-kids-purple' },
          { label: 'Admisión Pendiente', value: intakeFormStats.missing, icon: Zap, gradient: 'from-kids-coral to-kids-purple' },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-gradient-to-br ${card.gradient} rounded-bubbly p-6 shadow-xl text-white`}
          >
            <card.icon className="w-8 h-8 mb-2 opacity-80" />
            <div className="text-4xl font-black">{card.value}</div>
            <div className="text-sm font-bold opacity-90 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Weekly attendance — real check-in data */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100"
        >
          <h3 className="text-xl font-black text-kids-blue mb-1">
            Asistencia Semanal por Sala
          </h3>
          <p className="text-xs text-gray-400 font-semibold mb-4">Últimas 4 semanas — datos reales de check-in</p>
          {weeklyAttendance.every(w =>
            w['Bebés 0-2'] + w['Exploradores 3-5'] + w['Aventureros 6-9'] + w['Jóvenes 10-12'] === 0
          ) ? (
            <div className="flex items-center justify-center h-48 text-gray-400 font-bold text-sm">
              No hay registros de check-in aún.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={weeklyAttendance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Bebés 0-2" fill="#FFD700" />
                <Bar dataKey="Exploradores 3-5" fill="#4FC3F7" />
                <Bar dataKey="Aventureros 6-9" fill="#FF6B6B" />
                <Bar dataKey="Jóvenes 10-12" fill="#69F0AE" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Room distribution — real */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100"
        >
          <h3 className="text-xl font-black text-kids-coral mb-1">
            Distribución por Salas
          </h3>
          <p className="text-xs text-gray-400 font-semibold mb-4">Todos los niños registrados</p>
          {roomDistribution.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-gray-400 font-bold text-sm">
              No hay niños registrados aún.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={roomDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  dataKey="value"
                >
                  {roomDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={ROOM_COLORS[index % ROOM_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* Monthly growth — real registration dates */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-bubbly p-6 shadow-xl border border-gray-100"
      >
        <h3 className="text-xl font-black text-kids-mint mb-1">
          Crecimiento del Ministerio
        </h3>
        <p className="text-xs text-gray-400 font-semibold mb-4">Total acumulado de niños registrados — últimos 6 meses</p>
        {monthlyGrowth.every(m => m.registrados === 0) ? (
          <div className="flex items-center justify-center h-48 text-gray-400 font-bold text-sm">
            No hay datos de crecimiento aún.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="registrados" name="Total Acumulado" stroke="#CE93D8" strokeWidth={3} activeDot={{ r: 8 }} />
              <Line type="monotone" dataKey="nuevos" name="Nuevos ese Mes" stroke="#4FC3F7" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* Missing forms list */}
      {intakeFormStats.missingNames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-bubbly p-6 shadow-xl border-l-8 border-kids-coral border border-gray-100"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black text-kids-coral flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Familias Pendientes de Admisión ({intakeFormStats.missing})
            </h3>
          </div>
          <p className="text-sm text-gray-500 font-semibold mb-4">
            Estos niños asistieron vía registro rápido pero aún no han completado el Formulario de Admisión oficial.
            Por favor haga seguimiento con estas familias antes del próximo servicio.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {intakeFormStats.missingNames.map((name, index) => (
              <div key={index} className="bg-red-50 px-4 py-3 rounded-bubbly border border-red-100 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-kids-coral flex-shrink-0" />
                <span className="font-semibold text-gray-700">{name}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-bubbly px-4 py-3">
            <p className="text-xs font-bold text-yellow-700">
              Acción requerida: Envíe el enlace del Formulario de Admisión a estas familias — icgg-avivakids.org/intake-form
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
};
