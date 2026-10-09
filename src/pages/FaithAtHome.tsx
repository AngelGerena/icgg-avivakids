import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, getParentChildIds, Lesson, Child } from '../lib/supabase';
import { ParentLogin } from '../components/ParentLogin';
import { LessonCard } from '../components/LessonCard';
import { Heart, LogOut, Loader } from 'lucide-react';

export const FaithAtHome = () => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [activeChild, setActiveChild] = useState<string>('');
  const [lessons, setLessons] = useState<Lesson[]>([]);

  const T = es
    ? { title: 'Fe en Casa', welcome: 'Bienvenido', signOut: 'Salir', noLessons: 'Aún no hay lecciones publicadas. ¡Vuelve pronto!',
        loading: 'Cargando...', forChild: 'Lecciones para' }
    : { title: 'Faith at Home', welcome: 'Welcome', signOut: 'Sign out', noLessons: 'No lessons published yet. Check back soon!',
        loading: 'Loading...', forChild: 'Lessons for' };

  useEffect(() => {
    const init = async () => {
      const { data: s } = await supabase.auth.getSession();
      if (!s.session) { setAuthed(false); setLoading(false); return; }
      setAuthed(true);
      await ensureLinked();
      setLoading(false);
    };
    init();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) { setAuthed(true); ensureLinked(); } else { setAuthed(false); }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Link this authenticated parent to their child via the secure edge function, then load data
  const ensureLinked = async () => {
    let childIds = await getParentChildIds();
    if (childIds.length === 0) {
      const pending = localStorage.getItem('aviva_pending_child');
      if (pending) {
        try {
          await supabase.functions.invoke('claim-child', { body: { childNumber: pending } });
          localStorage.removeItem('aviva_pending_child');
          childIds = await getParentChildIds();
        } catch { /* ignore */ }
      }
    }
    if (childIds.length === 0) { setChildren([]); return; }
    const { data: kids } = await supabase.from('children').select('*').in('id', childIds);
    setChildren(kids || []);
    if (kids && kids.length) {
      setActiveChild((prev) => prev || kids[0].id);
      loadLessons(kids[0]);
    }
  };

  const loadLessons = async (child: Child) => {
    const { data } = await supabase.from('lessons').select('*')
      .eq('status', 'published')
      .or(`room.eq.${child.room},room.eq.all`)
      .order('week_of', { ascending: false });
    setLessons(data || []);
  };

  const switchChild = (child: Child) => { setActiveChild(child.id); loadLessons(child); };
  const signOut = async () => { await supabase.auth.signOut(); setAuthed(false); setChildren([]); setLessons([]); };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader className="w-12 h-12 text-kids-purple animate-spin" /></div>;
  if (!authed) return <ParentLogin />;

  const current = children.find((c) => c.id === activeChild);

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="avk-title text-4xl md:text-5xl flex items-center gap-3"><span className="w-12 h-12 rounded-full bg-kids-coral flex items-center justify-center shadow-lg"><Heart className="w-7 h-7 text-white" strokeWidth={2.5} /></span>{T.title}</h1>
          <button onClick={signOut} className="flex items-center gap-2 px-5 py-2.5 bg-kids-coral text-white rounded-bubbly font-bold hover:scale-105 transition-transform">
            <LogOut className="w-4 h-4" />{T.signOut}
          </button>
        </div>

        {children.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {children.map((c) => (
              <button key={c.id} onClick={() => switchChild(c)}
                className={`px-5 py-2.5 rounded-bubbly font-bold transition-all ${activeChild === c.id ? 'avk-panel text-white' : 'bg-white text-[#2A1E57] border-2 border-[#2A1E57]/20'}`}>
                {c.nickname || c.full_name}
              </button>
            ))}
          </div>
        )}

        {current && <p className="text-[#2A1E57]/80 font-bold mb-4">{T.forChild} {current.nickname || current.full_name}</p>}

        {lessons.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16 avk-panel rounded-bubbly">
            <Heart className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-xl font-bold text-white/85">{T.noLessons}</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {activeChild && lessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} childId={activeChild} />)}
          </div>
        )}
      </div>
    </div>
  );
};
