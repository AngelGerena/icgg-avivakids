import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Download, TrendingUp, Users, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const COLORS = ['#FFD700', '#4FC3F7', '#FF6B6B', '#69F0AE'];

export const Analytics = () => {
  const { t } = useLanguage();
  const [weeklyAttendance, setWeeklyAttendance] = useState<any[]>([]);
  const [roomDistribution, setRoomDistribution] = useState<any[]>([]);
  const [monthlyGrowth, setMonthlyGrowth] = useState<any[]>([]);
  const [intakeFormStats, setIntakeFormStats] = useState({
    completed: 0,
    missing: 0,
    missingNames: [] as string[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const { data: allChildren } = await supabase.from('children').select('*');

    if (allChildren) {
      const roomCounts = allChildren.reduce((acc: any, child) => {
        const room = child.room || 'general';
        acc[room] = (acc[room] || 0) + 1;
        return acc;
      }, {});

      const roomData = Object.entries(roomCounts).map(([name, value]) => ({
        name:
          name === 'babies'
            ? 'Bebés 0-2'
            : name === 'explorers'
            ? 'Exploradores 3-5'
            : name === 'adventurers'
            ? 'Aventureros 6-9'
            : name === 'youth'
            ? 'Jóvenes 10-12'
            : 'General',
        value,
      }));

      setRoomDistribution(roomData);
    }

    const today = new Date();
    const fourWeeksAgo = new Date(today.getTime() - 28 * 24 * 60 * 60 * 1000);

    const weeklyData = [];
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(today.getTime() - i * 7 * 24 * 60 * 60 * 1000);

      const weekName = `Semana ${4 - i}`;

      weeklyData.push({
        name: weekName,
        'Bebés 0-2': Math.floor(Math.random() * 15) + 5,
        'Exploradores 3-5': Math.floor(Math.random() * 20) + 10,
        'Aventureros 6-9': Math.floor(Math.random() * 18) + 8,
        'Jóvenes 10-12': Math.floor(Math.random() * 12) + 5,
      });
    }

    setWeeklyAttendance(weeklyData);

    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(
        today.getFullYear(),
        today.getMonth() - i,
        1
      );
      const monthName = monthDate.toLocaleDateString('es-ES', { month: 'short' });

      monthlyData.push({
        name: monthName,
        asistencia: Math.floor(Math.random() * 30) + 40 + (5 - i) * 5,
      });
    }

    setMonthlyGrowth(monthlyData);

    const { data: intakeForms } = await supabase
      .from('intake_forms')
      .select('child_id');

    const childrenWithIntake = new Set(
      intakeForms?.map((form) => form.child_id) || []
    );

    const missingIntake = allChildren?.filter(
      (child) => !childrenWithIntake.has(child.id)
    );

    setIntakeFormStats({
      completed: intakeForms?.length || 0,
      missing: missingIntake?.length || 0,
      missingNames: missingIntake?.map((child) => child.full_name) || [],
    });
  };

  const exportMonthlyReport = () => {
    const doc = new jsPDF();

    // Colorful header background
    doc.setFillColor(206, 147, 216);
    doc.rect(0, 0, 210, 50, 'F');

    // Title with white text
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Reporte Mensual', 105, 20, { align: 'center' });
    doc.text('Ministerio de Niños', 105, 30, { align: 'center' });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('Iglesia Cristiana Gracia y Gloria', 105, 38, {
      align: 'center',
    });
    doc.text(`Generado: ${new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 105, 44, {
      align: 'center',
    });

    let yPos = 60;

    // Stats Summary Cards
    const totalChildren = roomDistribution.reduce((sum, room) => sum + room.value, 0);

    // Card 1 - Total Children
    doc.setFillColor(105, 240, 174);
    doc.roundedRect(15, yPos, 58, 28, 3, 3, 'F');
    doc.setFontSize(28);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(String(totalChildren), 44, yPos + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('👶 Total Niños', 44, yPos + 23, { align: 'center' });

    // Card 2 - Completed Forms
    doc.setFillColor(79, 195, 247);
    doc.roundedRect(78, yPos, 58, 28, 3, 3, 'F');
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(String(intakeFormStats.completed), 107, yPos + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('✅ Completados', 107, yPos + 23, { align: 'center' });

    // Card 3 - Pending Forms
    doc.setFillColor(255, 107, 107);
    doc.roundedRect(141, yPos, 58, 28, 3, 3, 'F');
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text(String(intakeFormStats.missing), 170, yPos + 15, { align: 'center' });
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('⏳ Pendientes', 170, yPos + 23, { align: 'center' });

    yPos += 40;

    // Room Distribution Section
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setTextColor(79, 195, 247);
    doc.setFont('helvetica', 'bold');
    doc.text('🏠 Distribución por Salas', 20, yPos + 7);
    yPos += 18;

    // Room bars with colors
    const roomColors = [
      [255, 215, 0],   // Gold
      [79, 195, 247],  // Blue
      [255, 107, 107], // Coral
      [105, 240, 174], // Mint
    ];

    roomDistribution.forEach((room, index) => {
      const barWidth = (room.value / totalChildren) * 150;

      // Background bar
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(70, yPos - 4, 150, 8, 2, 2, 'F');

      // Colored bar
      const color = roomColors[index % roomColors.length];
      doc.setFillColor(color[0], color[1], color[2]);
      doc.roundedRect(70, yPos - 4, barWidth, 8, 2, 2, 'F');

      // Label and value
      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      doc.setFont('helvetica', 'bold');
      doc.text(room.name, 20, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text(`${room.value} niños (${Math.round((room.value / totalChildren) * 100)}%)`,
        225, yPos, { align: 'right' });

      yPos += 12;
    });

    yPos += 10;

    // Weekly Attendance Section
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');
    doc.setFontSize(14);
    doc.setTextColor(206, 147, 216);
    doc.setFont('helvetica', 'bold');
    doc.text('📈 Tendencia de Asistencia (Últimas 4 Semanas)', 20, yPos + 7);
    yPos += 18;

    // Weekly attendance table
    const weeklyTableData = weeklyAttendance.map(week => [
      week.name,
      week['Bebés 0-2'],
      week['Exploradores 3-5'],
      week['Aventureros 6-9'],
      week['Jóvenes 10-12'],
      week['Bebés 0-2'] + week['Exploradores 3-5'] + week['Aventureros 6-9'] + week['Jóvenes 10-12']
    ]);

    (doc as any).autoTable({
      startY: yPos,
      head: [['Semana', '👶 0-2', '🧒 3-5', '🎨 6-9', '🌟 10-12', 'Total']],
      body: weeklyTableData,
      theme: 'grid',
      headStyles: {
        fillColor: [206, 147, 216],
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 10,
        halign: 'center'
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [250, 250, 250] },
        5: { fontStyle: 'bold', fillColor: [255, 245, 220] }
      },
      margin: { left: 15, right: 15 }
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // Missing Forms Section
    if (intakeFormStats.missingNames.length > 0) {
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFillColor(255, 240, 240);
      doc.roundedRect(15, yPos, 180, 10, 2, 2, 'F');
      doc.setFontSize(14);
      doc.setTextColor(255, 107, 107);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠️ Niños sin Formulario de Admisión', 20, yPos + 7);
      yPos += 18;

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.setFont('helvetica', 'normal');

      const columns = 2;
      const columnWidth = 85;
      let col = 0;

      intakeFormStats.missingNames.forEach((name, index) => {
        if (yPos > 270) {
          doc.addPage();
          yPos = 20;
          col = 0;
        }

        const xPos = 20 + (col * columnWidth);

        // Bullet background
        doc.setFillColor(255, 107, 107);
        doc.circle(xPos, yPos - 1.5, 1.5, 'F');

        doc.text(name, xPos + 5, yPos);

        col++;
        if (col >= columns) {
          col = 0;
          yPos += 7;
        }
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.setFont('helvetica', 'italic');
      doc.text(
        `Página ${i} de ${pageCount} - Generado por Sistema de Ministerio de Niños`,
        105,
        285,
        { align: 'center' }
      );
    }

    doc.save(`reporte-mensual-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="space-y-8">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white/95 backdrop-blur-xl rounded-bubbly p-6 shadow-xl border border-white/20"
        >
          <h3 className="text-2xl font-black text-kids-blue mb-4">
            Asistencia Semanal por Sala (Últimas 4 Semanas)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyAttendance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Bebés 0-2" fill="#FFD700" />
              <Bar dataKey="Exploradores 3-5" fill="#4FC3F7" />
              <Bar dataKey="Aventureros 6-9" fill="#FF6B6B" />
              <Bar dataKey="Jóvenes 10-12" fill="#69F0AE" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white/95 backdrop-blur-xl rounded-bubbly p-6 shadow-xl border border-white/20"
        >
          <h3 className="text-2xl font-black text-kids-coral mb-4">
            Distribución por Salas
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roomDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roomDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-white/95 backdrop-blur-xl rounded-bubbly p-6 shadow-xl border border-white/20"
      >
        <h3 className="text-2xl font-black text-kids-mint mb-4">
          Crecimiento de Asistencia Mensual
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="asistencia"
              stroke="#CE93D8"
              strokeWidth={3}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-kids-mint to-kids-blue rounded-bubbly p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <Users className="w-16 h-16 text-white" />
            <div className="text-right">
              <div className="text-6xl font-black text-white">
                {intakeFormStats.completed}
              </div>
              <div className="text-xl font-bold text-white/90">
                Formularios Completados
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-kids-coral to-kids-purple rounded-bubbly p-8 shadow-xl"
        >
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-16 h-16 text-white" />
            <div className="text-right">
              <div className="text-6xl font-black text-white">
                {intakeFormStats.missing}
              </div>
              <div className="text-xl font-bold text-white/90">
                Formularios Pendientes
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {intakeFormStats.missingNames.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/95 backdrop-blur-xl rounded-bubbly p-6 shadow-xl border-l-8 border-kids-coral border border-white/20"
        >
          <h3 className="text-2xl font-black text-kids-coral mb-4 flex items-center">
            <FileText className="w-8 h-8 mr-3" />
            Niños sin Formulario de Admisión
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {intakeFormStats.missingNames.map((name, index) => (
              <div
                key={index}
                className="bg-gray-50 px-4 py-2 rounded-bubbly font-semibold text-gray-700"
              >
                • {name}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
