import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useLanguage } from '../contexts/LanguageContext';
import {
  supabase,
  uploadFile,
  publicAssetUrl,
  signedHomeworkUrl,
  Lesson,
  Assignment,
  HomeworkSubmission,
} from '../lib/supabase';
import {
  BookOpen, Plus, Trash2, Image as ImageIcon, Paperclip, Upload, Eye,
  CheckCircle, Star, X, Pencil, Send, ClipboardList,
} from 'lucide-react';

type View = 'list' | 'edit' | 'submissions';

const blank: Partial<Lesson> = {
  title: '', week_of: new Date().toISOString().slice(0, 10), room: 'all',
  language: 'es', bible_passage: '', memory_verse: '', story_summary: '',
  activity: '', song_title: '', song_url: '', status: 'draft',
  discussion_questions: [],
};

export const TeacherLessons = () => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [view, setView] = useState<View>('list');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [editing, setEditing] = useState<Partial<Lesson>>(blank);
  const [questions, setQuestions] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [attachFile, setAttachFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [submissions, setSubmissions] = useState<(HomeworkSubmission & { childName?: string; assignmentTitle?: string })[]>([]);
  const [newAssignment, setNewAssignment] = useState({ title: '', instructions: '', due_date: '', submission_type: 'any' as Assignment['submission_type'] });
  const [assignmentFile, setAssignmentFile] = useState<File | null>(null);

  const T = es
    ? {
        title: 'Lecciones y Tareas', subtitle: 'Publica la clase de cada semana y la tarea para que los padres refuercen en casa',
        newLesson: 'Nueva Lección', edit: 'Editar', publish: 'Publicar', unpublish: 'Despublicar',
        published: 'Publicada', draft: 'Borrador', delete: 'Eliminar', save: 'Guardar Lección',
        lessonTitle: 'Título de la lección', weekOf: 'Semana del', room: 'Salón / Edad', lang: 'Idioma',
        passage: 'Pasaje bíblico', verse: 'Versículo para memorizar', story: 'Resumen de la historia',
        question: 'Pregunta de conversación', addQuestion: 'Agregar pregunta', activity: 'Actividad en casa',
        song: 'Canción', songUrl: 'Enlace de la canción (YouTube)', coverImage: 'Imagen de portada',
        attachment: 'Material adjunto (hoja para colorear, PDF)', uploadImg: 'Subir imagen', uploadFile: 'Subir archivo',
        assignments: 'Tareas (Retos de Fe)', addAssignment: 'Agregar tarea', assignmentTitle: 'Título de la tarea',
        instructions: 'Instrucciones', dueDate: 'Fecha límite', type: 'Tipo', any: 'Cualquiera', photo: 'Foto', video: 'Video', text: 'Texto',
        viewSubmissions: 'Ver Entregas', submissions: 'Entregas de Tareas', noSubmissions: 'Aún no hay entregas',
        markReviewed: 'Marcar revisada', markComplete: '¡Completar y celebrar! ⭐', viewFile: 'Ver archivo',
        backToList: 'Volver a lecciones', saving: 'Guardando...', noLessons: 'No hay lecciones todavía. ¡Crea la primera!',
        stars: 'estrellas', feedback: 'Comentario para la familia (opcional)', send: 'Enviar', allRooms: 'Todos los salones',
      }
    : {
        title: 'Lessons & Homework', subtitle: 'Publish each week\'s class and homework so parents can reinforce it at home',
        newLesson: 'New Lesson', edit: 'Edit', publish: 'Publish', unpublish: 'Unpublish',
        published: 'Published', draft: 'Draft', delete: 'Delete', save: 'Save Lesson',
        lessonTitle: 'Lesson title', weekOf: 'Week of', room: 'Room / Age', lang: 'Language',
        passage: 'Bible passage', verse: 'Memory verse', story: 'Story summary',
        question: 'Discussion question', addQuestion: 'Add question', activity: 'At-home activity',
        song: 'Song', songUrl: 'Song link (YouTube)', coverImage: 'Cover image',
        attachment: 'Attachment (coloring page, PDF)', uploadImg: 'Upload image', uploadFile: 'Upload file',
        assignments: 'Homework (Faith Challenges)', addAssignment: 'Add homework', assignmentTitle: 'Homework title',
        instructions: 'Instructions', dueDate: 'Due date', type: 'Type', any: 'Any', photo: 'Photo', video: 'Video', text: 'Text',
        viewSubmissions: 'View Submissions', submissions: 'Homework Submissions', noSubmissions: 'No submissions yet',
        markReviewed: 'Mark reviewed', markComplete: 'Complete & celebrate! ⭐', viewFile: 'View file',
        backToList: 'Back to lessons', saving: 'Saving...', noLessons: 'No lessons yet. Create the first one!',
        stars: 'stars', feedback: 'Feedback for the family (optional)', send: 'Send', allRooms: 'All rooms',
      };

  useEffect(() => { fetchLessons(); }, []);

  const fetchLessons = async () => {
    const { data } = await supabase.from('lessons').select('*').order('week_of', { ascending: false });
    if (data) setLessons(data);
  };

  const openNew = () => {
    setEditing({ ...blank }); setQuestions([]); setAssignments([]);
    setImageFile(null); setAttachFile(null); setView('edit');
  };

  const openEdit = async (lesson: Lesson) => {
    setEditing(lesson);
    setQuestions(lesson.discussion_questions || []);
    setImageFile(null); setAttachFile(null);
    const { data } = await supabase.from('assignments').select('*').eq('lesson_id', lesson.id).order('created_at');
    setAssignments(data || []);
    setView('edit');
  };

  const saveLesson = async () => {
    setSaving(true);
    try {
      const payload: any = {
        title: editing.title, week_of: editing.week_of, room: editing.room || 'all',
        language: editing.language || 'es', bible_passage: editing.bible_passage,
        memory_verse: editing.memory_verse, story_summary: editing.story_summary,
        activity: editing.activity, song_title: editing.song_title, song_url: editing.song_url,
        discussion_questions: questions.filter((q) => q.trim()), status: editing.status || 'draft',
        updated_at: new Date().toISOString(),
      };

      let lessonId = editing.id;
      if (lessonId) {
        await supabase.from('lessons').update(payload).eq('id', lessonId);
      } else {
        const { data } = await supabase.from('lessons').insert(payload).select().single();
        lessonId = data?.id;
      }
      if (!lessonId) throw new Error('Could not save lesson');

      // Uploads (image + attachment) go to the public lesson-assets bucket
      const patch: any = {};
      if (imageFile) {
        const path = `lessons/${lessonId}/cover-${Date.now()}-${imageFile.name}`;
        await uploadFile('lesson-assets', path, imageFile);
        patch.image_url = publicAssetUrl(path);
      }
      if (attachFile) {
        const path = `lessons/${lessonId}/attach-${Date.now()}-${attachFile.name}`;
        await uploadFile('lesson-assets', path, attachFile);
        patch.attachment_url = publicAssetUrl(path);
      }
      if (Object.keys(patch).length) await supabase.from('lessons').update(patch).eq('id', lessonId);

      await fetchLessons();
      setView('list');
    } catch (e: any) {
      alert((es ? 'Error al guardar: ' : 'Error saving: ') + (e.message || e));
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (lesson: Lesson) => {
    await supabase.from('lessons').update({ status: lesson.status === 'published' ? 'draft' : 'published' }).eq('id', lesson.id);
    fetchLessons();
  };

  const deleteLesson = async (lesson: Lesson) => {
    if (!confirm(es ? '¿Eliminar esta lección?' : 'Delete this lesson?')) return;
    await supabase.from('lessons').delete().eq('id', lesson.id);
    fetchLessons();
  };

  const addAssignment = async () => {
    if (!editing.id || !newAssignment.title.trim()) return;
    let attachment_url: string | undefined;
    if (assignmentFile) {
      const path = `lessons/${editing.id}/hw-${Date.now()}-${assignmentFile.name}`;
      await uploadFile('lesson-assets', path, assignmentFile);
      attachment_url = publicAssetUrl(path);
    }
    const { data } = await supabase.from('assignments').insert({
      lesson_id: editing.id, title: newAssignment.title, instructions: newAssignment.instructions,
      due_date: newAssignment.due_date || null, submission_type: newAssignment.submission_type, attachment_url,
    }).select().single();
    if (data) setAssignments((a) => [...a, data]);
    setNewAssignment({ title: '', instructions: '', due_date: '', submission_type: 'any' });
    setAssignmentFile(null);
  };

  const removeAssignment = async (id: string) => {
    await supabase.from('assignments').delete().eq('id', id);
    setAssignments((a) => a.filter((x) => x.id !== id));
  };

  const openSubmissions = async (lesson: Lesson) => {
    const { data: asg } = await supabase.from('assignments').select('id,title').eq('lesson_id', lesson.id);
    const ids = (asg || []).map((a) => a.id);
    if (!ids.length) { setSubmissions([]); setView('submissions'); return; }
    const { data: subs } = await supabase
      .from('homework_submissions').select('*').in('assignment_id', ids).order('created_at', { ascending: false });
    const childIds = [...new Set((subs || []).map((s) => s.child_id))];
    const { data: kids } = await supabase.from('children').select('id,full_name').in('id', childIds.length ? childIds : ['00000000-0000-0000-0000-000000000000']);
    const nameMap = Object.fromEntries((kids || []).map((k) => [k.id, k.full_name]));
    const titleMap = Object.fromEntries((asg || []).map((a) => [a.id, a.title]));
    setSubmissions((subs || []).map((s) => ({ ...s, childName: nameMap[s.child_id], assignmentTitle: titleMap[s.assignment_id] })));
    setView('submissions');
  };

  const reviewSubmission = async (s: HomeworkSubmission, status: 'reviewed' | 'completed') => {
    const stars = status === 'completed' ? 3 : s.stars_awarded;
    await supabase.from('homework_submissions').update({
      status, stars_awarded: stars, reviewed_at: new Date().toISOString(),
    }).eq('id', s.id);
    if (status === 'completed') confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
    setSubmissions((arr) => arr.map((x) => (x.id === s.id ? { ...x, status, stars_awarded: stars } : x)));
  };

  const viewFile = async (path?: string) => {
    if (!path) return;
    const url = await signedHomeworkUrl(path);
    if (url) window.open(url, '_blank');
  };

  const input = 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-kids-blue outline-none font-semibold';
  const labelCls = 'block text-sm font-black text-gray-600 mb-1';

  // ---------- LIST ----------
  if (view === 'list') {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-black text-kids-purple flex items-center"><BookOpen className="w-8 h-8 mr-3" />{T.title}</h2>
            <p className="text-gray-500 font-semibold mt-1">{T.subtitle}</p>
          </div>
          <button onClick={openNew} className="flex items-center space-x-2 px-6 py-3 bg-kids-blue text-white rounded-bubbly font-bold hover:scale-105 transition-transform shadow-lg">
            <Plus className="w-5 h-5" /><span>{T.newLesson}</span>
          </button>
        </div>

        {lessons.length === 0 ? (
          <div className="text-center py-16 bg-white/90 rounded-bubbly shadow-xl">
            <BookOpen className="w-16 h-16 text-kids-purple/30 mx-auto mb-4" />
            <p className="text-xl font-bold text-gray-400">{T.noLessons}</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {lessons.map((lesson) => (
              <motion.div key={lesson.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-bubbly p-5 shadow-xl border-2 border-gray-100">
                <div className="flex gap-4">
                  {lesson.image_url && <img src={lesson.image_url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full ${lesson.status === 'published' ? 'bg-kids-mint text-green-800' : 'bg-gray-200 text-gray-600'}`}>
                        {lesson.status === 'published' ? T.published : T.draft}
                      </span>
                      <span className="text-xs font-bold text-gray-400">{new Date(lesson.week_of).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-black text-gray-800 truncate">{lesson.title}</h3>
                    {lesson.memory_verse && <p className="text-sm text-gray-500 font-semibold line-clamp-2 italic">"{lesson.memory_verse}"</p>}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button onClick={() => openEdit(lesson)} className="flex items-center gap-1 px-3 py-2 bg-kids-blue/10 text-kids-blue rounded-lg font-bold text-sm hover:bg-kids-blue/20"><Pencil className="w-4 h-4" />{T.edit}</button>
                  <button onClick={() => openSubmissions(lesson)} className="flex items-center gap-1 px-3 py-2 bg-kids-purple/10 text-kids-purple rounded-lg font-bold text-sm hover:bg-kids-purple/20"><ClipboardList className="w-4 h-4" />{T.viewSubmissions}</button>
                  <button onClick={() => togglePublish(lesson)} className="flex items-center gap-1 px-3 py-2 bg-kids-mint/40 text-green-800 rounded-lg font-bold text-sm hover:bg-kids-mint/60"><CheckCircle className="w-4 h-4" />{lesson.status === 'published' ? T.unpublish : T.publish}</button>
                  <button onClick={() => deleteLesson(lesson)} className="flex items-center gap-1 px-3 py-2 bg-kids-coral/10 text-kids-coral rounded-lg font-bold text-sm hover:bg-kids-coral/20"><Trash2 className="w-4 h-4" /></button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- SUBMISSIONS ----------
  if (view === 'submissions') {
    return (
      <div>
        <button onClick={() => setView('list')} className="mb-4 text-kids-blue font-bold flex items-center gap-1"><X className="w-4 h-4" />{T.backToList}</button>
        <h2 className="text-3xl font-black text-kids-purple flex items-center mb-6"><ClipboardList className="w-8 h-8 mr-3" />{T.submissions}</h2>
        {submissions.length === 0 ? (
          <div className="text-center py-16 bg-white/90 rounded-bubbly shadow-xl"><p className="text-xl font-bold text-gray-400">{T.noSubmissions}</p></div>
        ) : (
          <div className="space-y-4">
            {submissions.map((s) => (
              <div key={s.id} className="bg-white rounded-bubbly p-5 shadow-xl border-2 border-gray-100 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-black text-gray-800">{s.childName || '—'}</h3>
                  <p className="text-sm font-bold text-kids-blue">{s.assignmentTitle}</p>
                  {s.parent_note && <p className="text-sm text-gray-500 italic mt-1">"{s.parent_note}"</p>}
                  <div className="flex items-center gap-1 mt-1">
                    {Array.from({ length: s.stars_awarded }).map((_, i) => <Star key={i} className="w-4 h-4 text-kids-yellow fill-kids-yellow" />)}
                    <span className="text-xs font-bold text-gray-400 ml-2 uppercase">{s.status}</span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.file_url && <button onClick={() => viewFile(s.file_url)} className="flex items-center gap-1 px-3 py-2 bg-kids-blue/10 text-kids-blue rounded-lg font-bold text-sm"><Eye className="w-4 h-4" />{T.viewFile}</button>}
                  {s.status === 'submitted' && <button onClick={() => reviewSubmission(s, 'reviewed')} className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm">{T.markReviewed}</button>}
                  {s.status !== 'completed' && <button onClick={() => reviewSubmission(s, 'completed')} className="px-3 py-2 bg-kids-mint/50 text-green-800 rounded-lg font-bold text-sm">{T.markComplete}</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ---------- EDIT ----------
  return (
    <div className="max-w-3xl">
      <button onClick={() => setView('list')} className="mb-4 text-kids-blue font-bold flex items-center gap-1"><X className="w-4 h-4" />{T.backToList}</button>
      <div className="bg-white rounded-bubbly p-6 md:p-8 shadow-xl space-y-5">
        <div>
          <label className={labelCls}>{T.lessonTitle}</label>
          <input className={input} value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div><label className={labelCls}>{T.weekOf}</label><input type="date" className={input} value={editing.week_of || ''} onChange={(e) => setEditing({ ...editing, week_of: e.target.value })} /></div>
          <div><label className={labelCls}>{T.room}</label><input className={input} placeholder={T.allRooms} value={editing.room || ''} onChange={(e) => setEditing({ ...editing, room: e.target.value })} /></div>
          <div><label className={labelCls}>{T.lang}</label>
            <select className={input} value={editing.language || 'es'} onChange={(e) => setEditing({ ...editing, language: e.target.value })}>
              <option value="es">Español</option><option value="en">English</option>
            </select>
          </div>
        </div>
        <div><label className={labelCls}>{T.passage}</label><input className={input} value={editing.bible_passage || ''} onChange={(e) => setEditing({ ...editing, bible_passage: e.target.value })} /></div>
        <div><label className={labelCls}>{T.verse}</label><textarea className={input} rows={2} value={editing.memory_verse || ''} onChange={(e) => setEditing({ ...editing, memory_verse: e.target.value })} /></div>
        <div><label className={labelCls}>{T.story}</label><textarea className={input} rows={4} value={editing.story_summary || ''} onChange={(e) => setEditing({ ...editing, story_summary: e.target.value })} /></div>

        {/* Discussion questions */}
        <div>
          <label className={labelCls}>{T.question}</label>
          <div className="space-y-2">
            {questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <input className={input} value={q} onChange={(e) => setQuestions(questions.map((x, j) => (j === i ? e.target.value : x)))} />
                <button onClick={() => setQuestions(questions.filter((_, j) => j !== i))} className="px-3 bg-kids-coral/10 text-kids-coral rounded-lg"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <button onClick={() => setQuestions([...questions, ''])} className="flex items-center gap-1 text-kids-blue font-bold text-sm"><Plus className="w-4 h-4" />{T.addQuestion}</button>
          </div>
        </div>

        <div><label className={labelCls}>{T.activity}</label><textarea className={input} rows={3} value={editing.activity || ''} onChange={(e) => setEditing({ ...editing, activity: e.target.value })} /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><label className={labelCls}>{T.song}</label><input className={input} value={editing.song_title || ''} onChange={(e) => setEditing({ ...editing, song_title: e.target.value })} /></div>
          <div><label className={labelCls}>{T.songUrl}</label><input className={input} value={editing.song_url || ''} onChange={(e) => setEditing({ ...editing, song_url: e.target.value })} /></div>
        </div>

        {/* Uploads: image + attachment */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}><ImageIcon className="w-4 h-4 inline mr-1" />{T.coverImage}</label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-kids-blue/40 text-kids-blue font-bold cursor-pointer hover:bg-kids-blue/5">
              <Upload className="w-4 h-4" />{imageFile ? imageFile.name : (editing.image_url ? '✓ ' + T.uploadImg : T.uploadImg)}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
            </label>
          </div>
          <div>
            <label className={labelCls}><Paperclip className="w-4 h-4 inline mr-1" />{T.attachment}</label>
            <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-kids-purple/40 text-kids-purple font-bold cursor-pointer hover:bg-kids-purple/5">
              <Upload className="w-4 h-4" />{attachFile ? attachFile.name : (editing.attachment_url ? '✓ ' + T.uploadFile : T.uploadFile)}
              <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setAttachFile(e.target.files?.[0] || null)} />
            </label>
          </div>
        </div>

        {/* Status + Save */}
        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 font-bold text-gray-700">
            <input type="checkbox" className="w-5 h-5 accent-kids-mint" checked={editing.status === 'published'} onChange={(e) => setEditing({ ...editing, status: e.target.checked ? 'published' : 'draft' })} />
            {T.publish}
          </label>
          <button onClick={saveLesson} disabled={saving || !editing.title} className="flex items-center gap-2 px-8 py-3 bg-kids-blue text-white rounded-bubbly font-black hover:scale-105 transition-transform shadow-lg disabled:opacity-50">
            <Send className="w-5 h-5" />{saving ? T.saving : T.save}
          </button>
        </div>
      </div>

      {/* Assignments — only after the lesson exists */}
      {editing.id && (
        <div className="bg-white rounded-bubbly p-6 md:p-8 shadow-xl mt-6">
          <h3 className="text-2xl font-black text-kids-purple flex items-center mb-4"><ClipboardList className="w-6 h-6 mr-2" />{T.assignments}</h3>
          <AnimatePresence>
            {assignments.map((a) => (
              <motion.div key={a.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-kids-purple/5 mb-2">
                <div><p className="font-black text-gray-800">{a.title}</p>{a.instructions && <p className="text-sm text-gray-500">{a.instructions}</p>}</div>
                <button onClick={() => removeAssignment(a.id)} className="text-kids-coral"><Trash2 className="w-4 h-4" /></button>
              </motion.div>
            ))}
          </AnimatePresence>
          <div className="space-y-3 mt-3 border-t-2 border-dashed border-gray-100 pt-4">
            <input className={input} placeholder={T.assignmentTitle} value={newAssignment.title} onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })} />
            <textarea className={input} rows={2} placeholder={T.instructions} value={newAssignment.instructions} onChange={(e) => setNewAssignment({ ...newAssignment, instructions: e.target.value })} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div><label className={labelCls}>{T.dueDate}</label><input type="date" className={input} value={newAssignment.due_date} onChange={(e) => setNewAssignment({ ...newAssignment, due_date: e.target.value })} /></div>
              <div><label className={labelCls}>{T.type}</label>
                <select className={input} value={newAssignment.submission_type} onChange={(e) => setNewAssignment({ ...newAssignment, submission_type: e.target.value as Assignment['submission_type'] })}>
                  <option value="any">{T.any}</option><option value="photo">{T.photo}</option><option value="video">{T.video}</option><option value="text">{T.text}</option>
                </select>
              </div>
              <div><label className={labelCls}><Paperclip className="w-4 h-4 inline mr-1" />{T.attachment}</label>
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-kids-purple/40 text-kids-purple font-bold cursor-pointer text-sm">
                  <Upload className="w-4 h-4" />{assignmentFile ? assignmentFile.name : T.uploadFile}
                  <input type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)} />
                </label>
              </div>
            </div>
            <button onClick={addAssignment} disabled={!newAssignment.title.trim()} className="flex items-center gap-1 px-5 py-2 bg-kids-purple text-white rounded-bubbly font-bold disabled:opacity-50"><Plus className="w-4 h-4" />{T.addAssignment}</button>
          </div>
        </div>
      )}
    </div>
  );
};
