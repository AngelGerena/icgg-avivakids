import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import { Mail, Hash, Send, CheckCircle, Heart } from 'lucide-react';

export const ParentLogin = () => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [childNumber, setChildNumber] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const T = es
    ? {
        title: 'Portal de Padres', subtitle: 'Sigue en casa lo que tu hijo aprende en la Escuela Dominical',
        childNumber: 'Número del niño/a', email: 'Tu correo electrónico',
        send: 'Enviar enlace de acceso', sending: 'Enviando...',
        sentTitle: '¡Revisa tu correo!', sentBody: 'Te enviamos un enlace mágico. Haz clic en él para entrar — sin contraseña.',
        help: 'Usa el mismo correo que registraste en la ficha de tu hijo/a.',
        errMissing: 'Ingresa el número del niño y tu correo.',
        errMatch: 'No encontramos ese correo para ese número. Verifica los datos.',
      }
    : {
        title: 'Parent Portal', subtitle: "Follow along at home with what your child learns in Sunday school",
        childNumber: "Child's number", email: 'Your email address',
        send: 'Send my access link', sending: 'Sending...',
        sentTitle: 'Check your email!', sentBody: 'We sent you a magic link. Click it to sign in — no password needed.',
        help: "Use the same email you registered on your child's intake form.",
        errMissing: "Enter the child's number and your email.",
        errMatch: "We couldn't match that email to that number. Please check the details.",
      };

  const submit = async () => {
    setError('');
    if (!childNumber.trim() || !email.trim()) { setError(T.errMissing); return; }
    setLoading(true);
    try {
      // Verify the email belongs to a parent of this child before sending a link
      const { data: child } = await supabase.from('children').select('id').eq('unique_number', childNumber.trim()).maybeSingle();
      if (!child) { setError(T.errMatch); setLoading(false); return; }
      const { data: parent } = await supabase
        .from('parents').select('id').eq('child_id', child.id).ilike('primary_email', email.trim()).maybeSingle();
      if (!parent) { setError(T.errMatch); setLoading(false); return; }

      localStorage.setItem('aviva_pending_child', childNumber.trim());
      const { error: otpErr } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${window.location.origin}/faith-at-home` },
      });
      if (otpErr) { setError(otpErr.message); setLoading(false); return; }
      setSent(true);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  const input = 'w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-kids-blue outline-none font-semibold';

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white/95 backdrop-blur-md rounded-bubbly p-8 shadow-2xl max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex p-4 bg-kids-purple/10 rounded-full mb-3"><Heart className="w-10 h-10 text-kids-purple" /></div>
          <h1 className="text-3xl font-black text-kids-purple">{T.title}</h1>
          <p className="text-gray-500 font-semibold mt-2">{T.subtitle}</p>
        </div>

        {sent ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-kids-mint mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-800 mb-2">{T.sentTitle}</h2>
            <p className="text-gray-500 font-semibold">{T.sentBody}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative">
              <Hash className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input className={input} placeholder={T.childNumber} value={childNumber} onChange={(e) => setChildNumber(e.target.value)} />
            </div>
            <div className="relative">
              <Mail className="w-5 h-5 text-gray-400 absolute left-4 top-3.5" />
              <input type="email" className={input} placeholder={T.email} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {error && <p className="text-kids-coral font-bold text-sm text-center">{error}</p>}
            <button onClick={submit} disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-kids-blue text-white rounded-bubbly font-black hover:scale-105 transition-transform shadow-lg disabled:opacity-50">
              <Send className="w-5 h-5" />{loading ? T.sending : T.send}
            </button>
            <p className="text-xs text-gray-400 text-center font-semibold">{T.help}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};
