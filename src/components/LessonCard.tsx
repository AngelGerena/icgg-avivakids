import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Lesson, Assignment } from '../lib/supabase';
import { downloadDevotionalPdf } from '../utils/devotionalPdf';
import { downloadLessonICS } from '../utils/icsExport';
import { Download, CalendarPlus, BookOpen, Music, MessageCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { HomeworkUpload } from './HomeworkUpload';
import { ParentMessages } from './ParentMessages';

export const LessonCard = ({ lesson, childId }: { lesson: Lesson; childId: string }) => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [open, setOpen] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const T = es
    ? { verse: 'Versículo', pdf: 'Descargar Devocional', ics: 'Agregar al calendario', homework: 'Tareas (Retos de Fe)',
        ask: 'Preguntar al maestro', activity: 'Actividad en casa', song: 'Canción', more: 'Ver lección', less: 'Ocultar' }
    : { verse: 'Memory verse', pdf: 'Download Devotional', ics: 'Add to calendar', homework: 'Homework (Faith Challenges)',
        ask: 'Ask the teacher', activity: 'At-home activity', song: 'Song', more: 'View lesson', less: 'Hide' };

  useEffect(() => {
    supabase.from('assignments').select('*').eq('lesson_id', lesson.id).order('created_at')
      .then(({ data }) => setAssignments(data || []));
  }, [lesson.id]);

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white/95 backdrop-blur-md rounded-bubbly shadow-xl overflow-hidden border-l-8 border-kids-purple">
      {lesson.image_url && <img src={lesson.image_url} alt="" className="w-full h-44 object-cover" />}
      <div className="p-6">
        <p className="text-xs font-black text-kids-blue uppercase">{new Date(lesson.week_of).toLocaleDateString()}</p>
        <h3 className="text-2xl font-black text-gray-800 mt-1">{lesson.title}</h3>
        {lesson.memory_verse && (
          <div className="bg-kids-purple/5 rounded-xl p-3 mt-3">
            <p className="text-xs font-black text-kids-purple uppercase">{T.verse}</p>
            <p className="text-gray-700 font-semibold italic">"{lesson.memory_verse}"</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={() => downloadDevotionalPdf(lesson, es ? 'es' : 'en')}
            className="flex items-center gap-2 px-4 py-2.5 bg-kids-blue text-white rounded-bubbly font-bold hover:scale-105 transition-transform shadow">
            <Download className="w-4 h-4" />{T.pdf}
          </button>
          <button onClick={() => downloadLessonICS(lesson, es ? 'es' : 'en')}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-kids-purple border-2 border-kids-purple rounded-bubbly font-bold hover:scale-105 transition-transform">
            <CalendarPlus className="w-4 h-4" />{T.ics}
          </button>
          <button onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-4 py-2.5 bg-kids-yellow/20 text-yellow-700 rounded-bubbly font-bold">
            {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}{open ? T.less : T.more}
          </button>
        </div>

        {open && (
          <div className="mt-4 space-y-3">
            {lesson.story_summary && <div><p className="font-black text-kids-blue flex items-center gap-1"><BookOpen className="w-4 h-4" /></p><p className="text-gray-700 font-semibold">{lesson.story_summary}</p></div>}
            {lesson.activity && <div><p className="font-black text-kids-coral">{T.activity}</p><p className="text-gray-700 font-semibold">{lesson.activity}</p></div>}
            {lesson.song_title && (
              <a href={lesson.song_url || '#'} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-kids-purple font-bold">
                <Music className="w-4 h-4" />{T.song}: {lesson.song_title}
              </a>
            )}
            {lesson.attachment_url && (
              <a href={lesson.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-kids-blue font-bold">
                <Download className="w-4 h-4" />{es ? 'Material adjunto' : 'Attachment'}
              </a>
            )}
          </div>
        )}

        {assignments.length > 0 && (
          <div className="mt-4">
            <h4 className="font-black text-kids-purple flex items-center gap-2"><Sparkles className="w-5 h-5 text-kids-yellow" />{T.homework}</h4>
            {assignments.map((a) => <HomeworkUpload key={a.id} assignment={a} childId={childId} />)}
          </div>
        )}

        <button onClick={() => setShowMessages(!showMessages)} className="flex items-center gap-2 mt-4 text-kids-purple font-bold">
          <MessageCircle className="w-4 h-4" />{T.ask}
        </button>
        {showMessages && <ParentMessages childId={childId} />}
      </div>
    </motion.div>
  );
};
