import jsPDF from 'jspdf';
import { Lesson } from '../lib/supabase';

const C = {
  purple: [142, 68, 173] as [number, number, number],
  blue: [52, 152, 219] as [number, number, number],
  coral: [231, 111, 81] as [number, number, number],
  gray: [60, 60, 60] as [number, number, number],
  light: [245, 240, 250] as [number, number, number],
};

// Generate a branded "Family Devotional" PDF the parent can print and follow at home.
export function downloadDevotionalPdf(lesson: Lesson, lang: 'es' | 'en' = 'es') {
  const L =
    lang === 'es'
      ? {
          header: 'Devocional Familiar',
          subtitle: 'Refuerza en casa lo aprendido en la Escuela Dominical',
          passage: 'Pasaje Bíblico',
          verse: 'Versículo para Memorizar',
          story: 'La Historia de Esta Semana',
          questions: 'Preguntas para Conversar en Familia',
          activity: 'Actividad en Casa',
          song: 'Canción',
          weekOf: 'Semana del',
          footer: 'Aviva Kids — Creciendo juntos en la fe',
        }
      : {
          header: 'Family Devotional',
          subtitle: "Reinforce this week's Sunday school lesson at home",
          passage: 'Bible Passage',
          verse: 'Memory Verse',
          story: "This Week's Story",
          questions: 'Family Discussion Questions',
          activity: 'At-Home Activity',
          song: 'Song',
          weekOf: 'Week of',
          footer: 'Aviva Kids — Growing together in faith',
        };

  const doc = new jsPDF({ unit: 'pt', format: 'letter' });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 48;
  const contentW = pageW - margin * 2;
  let y = margin;

  // Header band
  doc.setFillColor(...C.purple);
  doc.rect(0, 0, pageW, 96, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(L.header, margin, 50);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(L.subtitle, margin, 72);
  y = 124;

  // Lesson title + week
  doc.setTextColor(...C.purple);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  const titleLines = doc.splitTextToSize(lesson.title, contentW);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 22 + 4;
  doc.setTextColor(...C.gray);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  doc.text(`${L.weekOf} ${new Date(lesson.week_of).toLocaleDateString()}`, margin, y);
  y += 24;

  const section = (label: string, body?: string, color: [number, number, number] = C.blue) => {
    if (!body) return;
    if (y > 700) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(...color);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(label, margin, y);
    y += 16;
    doc.setTextColor(...C.gray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const lines = doc.splitTextToSize(body, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 15 + 14;
  };

  section(L.passage, lesson.bible_passage, C.coral);

  // Memory verse highlighted box
  if (lesson.memory_verse) {
    if (y > 660) {
      doc.addPage();
      y = margin;
    }
    const vLines = doc.splitTextToSize(`"${lesson.memory_verse}"`, contentW - 24);
    const boxH = vLines.length * 16 + 44;
    doc.setFillColor(...C.light);
    doc.roundedRect(margin, y, contentW, boxH, 8, 8, 'F');
    doc.setTextColor(...C.purple);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(L.verse, margin + 12, y + 22);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...C.gray);
    doc.text(vLines, margin + 12, y + 40);
    y += boxH + 18;
  }

  section(L.story, lesson.story_summary, C.blue);

  // Discussion questions as a numbered list
  if (lesson.discussion_questions && lesson.discussion_questions.length) {
    if (y > 680) {
      doc.addPage();
      y = margin;
    }
    doc.setTextColor(...C.coral);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(L.questions, margin, y);
    y += 18;
    doc.setTextColor(...C.gray);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    lesson.discussion_questions.forEach((q, i) => {
      const qLines = doc.splitTextToSize(`${i + 1}. ${q}`, contentW - 12);
      if (y + qLines.length * 15 > 740) {
        doc.addPage();
        y = margin;
      }
      doc.text(qLines, margin + 6, y);
      y += qLines.length * 15 + 6;
    });
    y += 10;
  }

  section(L.activity, lesson.activity, C.blue);
  if (lesson.song_title) section(L.song, `${lesson.song_title}${lesson.song_url ? `  (${lesson.song_url})` : ''}`, C.purple);

  // Footer
  const ph = doc.internal.pageSize.getHeight();
  doc.setTextColor(...C.purple);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.text(L.footer, margin, ph - 28);

  doc.save(`aviva-devocional-${lesson.week_of}.pdf`);
}
