import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase, Message } from '../lib/supabase';
import { Send, MessageCircle } from 'lucide-react';

export const ParentMessages = ({ childId }: { childId: string }) => {
  const { language } = useLanguage();
  const es = language === 'es';
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const T = es
    ? { title: 'Preguntar al maestro', placeholder: 'Escribe tu pregunta...', send: 'Enviar', empty: 'Aún no hay mensajes. ¡Escribe al maestro!', you: 'Tú', teacher: 'Maestro' }
    : { title: 'Ask the teacher', placeholder: 'Type your question...', send: 'Send', empty: 'No messages yet. Send the teacher a note!', you: 'You', teacher: 'Teacher' };

  useEffect(() => { load(); }, [childId]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const load = async () => {
    const { data } = await supabase.from('messages').select('*').eq('child_id', childId).order('created_at');
    setMessages(data || []);
  };

  const send = async () => {
    if (!body.trim()) return;
    setSending(true);
    try {
      const { data } = await supabase.from('messages').insert({
        child_id: childId, sender_role: 'parent', body: body.trim(),
      }).select().single();
      if (data) setMessages((m) => [...m, data]);
      setBody('');
      // Best-effort notify teachers (function is optional; ignore failures)
      supabase.functions.invoke('send-message-notification', { body: { childId, senderRole: 'parent', body: data?.body } }).catch(() => {});
    } finally { setSending(false); }
  };

  return (
    <div className="bg-white rounded-xl p-4 mt-3 border-2 border-kids-purple/10">
      <h4 className="font-black text-kids-purple flex items-center gap-2 mb-3"><MessageCircle className="w-5 h-5" />{T.title}</h4>
      <div className="max-h-64 overflow-y-auto space-y-2 mb-3">
        {messages.length === 0 && <p className="text-sm text-gray-400 font-semibold text-center py-4">{T.empty}</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.sender_role === 'parent' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] px-4 py-2 rounded-2xl ${m.sender_role === 'parent' ? 'bg-kids-blue text-white' : 'bg-gray-100 text-gray-800'}`}>
              <p className="text-xs font-black opacity-70 mb-0.5">{m.sender_role === 'parent' ? T.you : T.teacher}</p>
              <p className="text-sm font-semibold whitespace-pre-wrap">{m.body}</p>
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="flex gap-2">
        <input className="flex-1 px-4 py-2.5 rounded-xl border-2 border-gray-200 focus:border-kids-blue outline-none font-semibold"
          placeholder={T.placeholder} value={body} onChange={(e) => setBody(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && send()} />
        <button onClick={send} disabled={sending || !body.trim()} className="px-4 py-2.5 bg-kids-blue text-white rounded-xl font-bold disabled:opacity-50"><Send className="w-5 h-5" /></button>
      </div>
    </div>
  );
};
