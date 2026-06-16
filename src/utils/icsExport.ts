import { Lesson } from '../lib/supabase';

// Build and download an .ics calendar file so the family devotional lands
// on the parent's phone. Defaults to 6:30pm on the lesson's week_of date.
export function downloadLessonICS(lesson: Lesson, lang: 'es' | 'en' = 'es') {
  const start = new Date(`${lesson.week_of}T18:30:00`);
  const end = new Date(start.getTime() + 30 * 60 * 1000);

  const fmt = (d: Date) =>
    d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  const title =
    lang === 'es' ? `Devocional Familiar: ${lesson.title}` : `Family Devotional: ${lesson.title}`;
  const desc = [
    lesson.memory_verse ? `${lang === 'es' ? 'Versículo' : 'Memory verse'}: ${lesson.memory_verse}` : '',
    lesson.story_summary || '',
  ]
    .filter(Boolean)
    .join('\\n')
    .replace(/\n/g, '\\n');

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Aviva Kids//Faith at Home//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${lesson.id}@avivakids`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    `DESCRIPTION:${title}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aviva-devocional-${lesson.week_of}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}
