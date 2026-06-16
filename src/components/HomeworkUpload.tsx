import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, uploadFile, signedHomeworkUrl, Assignment, HomeworkSubmission } from '../lib/supabase';
import { Upload, CheckCircle, Star, Eye, Paperclip, Loader } from 'lucide-react';

export const HomeworkUpload = ({ assignment, childId }: { assignment: Assignment; childId: string }) => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [submission, setSubmission] = useState<HomeworkSubmission | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);

  const T = es
    ? { instructions: 'Instrucciones', upload: 'Subir trabajo terminado', choose: 'Elegir foto / archivo', note: 'Nota para el maestro (opcional)',
        submit: 'Entregar tarea', submitting: 'Enviando...', worksheet: 'Descargar material',
        submitted: 'Entregada ✓', reviewed: 'Revisada por el maestro', completed: '¡Completada!', view: 'Ver mi entrega',
        due: 'Entregar antes de' }
    : { instructions: 'Instructions', upload: 'Upload completed work', choose: 'Choose photo / file', note: 'Note for the teacher (optional)',
        submit: 'Turn in homework', submitting: 'Submitting...', worksheet: 'Download material',
        submitted: 'Submitted ✓', reviewed: 'Reviewed by teacher', completed: 'Completed!', view: 'View my submission',
        due: 'Due by' };

  useEffect(() => { load(); }, [assignment.id, childId]);

  const load = async () => {
    const { data } = await supabase.from('homework_submissions').select('*')
      .eq('assignment_id', assignment.id).eq('child_id', childId).order('created_at', { ascending: false }).maybeSingle();
    setSubmission(data);
  };

  const submit = async () => {
    if (!file) return;
    setBusy(true);
    try {
      const path = `${childId}/${assignment.id}/${Date.now()}-${file.name}`;
      await uploadFile('homework', path, file);
      const { data } = await supabase.from('homework_submissions').insert({
        assignment_id: assignment.id, child_id: childId, file_url: path, parent_note: note, status: 'submitted',
      }).select().single();
      setSubmission(data);
      setFile(null); setNote('');
    } catch (e: any) {
      alert((es ? 'Error: ' : 'Error: ') + (e.message || e));
    } finally { setBusy(false); }
  };

  const viewMine = async () => {
    if (!submission?.file_url) return;
    const url = await signedHomeworkUrl(submission.file_url);
    if (url) window.open(url, '_blank');
  };

  const input = 'w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-kids-blue outline-none font-semibold';

  return (
    <div className="bg-kids-purple/5 rounded-xl p-4 mt-3">
      <h4 className="font-black text-kids-purple">{assignment.title}</h4>
      {assignment.instructions && <p className="text-sm text-gray-600 font-semibold mt-1">{assignment.instructions}</p>}
      {assignment.due_date && <p className="text-xs text-kids-coral font-bold mt-1">{T.due} {new Date(assignment.due_date).toLocaleDateString()}</p>}
      {assignment.attachment_url && (
        <a href={assignment.attachment_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-kids-blue font-bold text-sm mt-2">
          <Paperclip className="w-4 h-4" />{T.worksheet}
        </a>
      )}

      {submission ? (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-black text-sm ${
            submission.status === 'completed' ? 'bg-kids-mint/50 text-green-800' : submission.status === 'reviewed' ? 'bg-kids-blue/10 text-kids-blue' : 'bg-gray-100 text-gray-600'}`}>
            <CheckCircle className="w-4 h-4" />
            {submission.status === 'completed' ? T.completed : submission.status === 'reviewed' ? T.reviewed : T.submitted}
          </span>
          {submission.stars_awarded > 0 && (
            <span className="inline-flex items-center">{Array.from({ length: submission.stars_awarded }).map((_, i) => <Star key={i} className="w-5 h-5 text-kids-yellow fill-kids-yellow" />)}</span>
          )}
          {submission.file_url && <button onClick={viewMine} className="inline-flex items-center gap-1 text-kids-blue font-bold text-sm"><Eye className="w-4 h-4" />{T.view}</button>}
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          <label className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-kids-blue/40 text-kids-blue font-bold cursor-pointer hover:bg-kids-blue/5">
            <Upload className="w-4 h-4" />{file ? file.name : T.choose}
            <input type="file" accept="image/*,video/*,application/pdf" capture="environment" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </label>
          <input className={input} placeholder={T.note} value={note} onChange={(e) => setNote(e.target.value)} />
          <button onClick={submit} disabled={!file || busy}
            className="flex items-center gap-2 px-6 py-2.5 bg-kids-blue text-white rounded-bubbly font-black hover:scale-105 transition-transform disabled:opacity-50">
            {busy ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}{busy ? T.submitting : T.submit}
          </button>
        </div>
      )}
    </div>
  );
};
