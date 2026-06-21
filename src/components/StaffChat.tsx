import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { MessageCircle, X, Send, Smile, Paperclip, Image as ImageIcon, FileText, Download, Trash2 } from 'lucide-react';

// Only this account can moderate (delete messages / clear history). Enforced in the
// database via RLS too, so the controls below are useless to anyone else.
const SUPER_ADMIN_EMAIL = 'finessemediapro@gmail.com';

interface StaffMessage {
  id: string;
  author_id: string | null;
  author_name: string | null;
  body: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
  created_at: string;
}

const EMOJIS = [
  '😀','😂','😅','😍','🥳','😎','🤔','😴','🙏','👍','👎','👏','🙌','💪','🎉','🔥',
  '❤️','💜','💙','💚','💛','✨','⭐','🌟','✅','❌','⚠️','📌','📷','📎','🍕','☕',
  '👶','🧒','👦','👧','🎈','🎂','🐑','📖','🕊️','😇',
];

export const StaffChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<StaffMessage[]>([]);
  const [text, setText] = useState('');
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [me, setMe] = useState<{ id: string | null; name: string; email: string }>({ id: null, name: 'Maestro/a', email: '' });

  const isAdmin = !!me.email && me.email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();

  const listRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (u) {
        const name =
          (u.user_metadata && (u.user_metadata.full_name || u.user_metadata.name)) ||
          (u.email ? u.email.split('@')[0] : 'Maestro/a');
        setMe({ id: u.id, name, email: u.email || '' });
      }
    });

    const fetchMessages = async () => {
      const { data } = await supabase
        .from('staff_messages')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(200);
      if (data) setMessages(data as StaffMessage[]);
    };
    fetchMessages();

    const channel = supabase
      .channel('staff-chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const msg = payload.new as StaffMessage;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (!openRef.current) setUnread((u) => u + 1);
        } else if (payload.eventType === 'DELETE') {
          const oldId = (payload.old as { id?: string }).id;
          if (oldId) setMessages((prev) => prev.filter((m) => m.id !== oldId));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-scroll to newest message.
  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const send = async (
    body: string,
    attachment?: { url: string; type: string; name: string }
  ) => {
    if (!body.trim() && !attachment) return;
    await supabase.from('staff_messages').insert({
      author_id: me.id,
      author_name: me.name,
      body: body.trim() || null,
      attachment_url: attachment?.url || null,
      attachment_type: attachment?.type || null,
      attachment_name: attachment?.name || null,
    });
    setText('');
    setShowEmojis(false);
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from('staff-chat').upload(path, file, { upsert: true });
      if (error) throw error;
      const url = supabase.storage.from('staff-chat').getPublicUrl(path).data.publicUrl;
      const type = file.type.startsWith('image/') ? 'image' : 'file';
      await send('', { url, type, name: file.name });
    } catch (err) {
      console.error('staff-chat upload error', err);
      alert('No se pudo subir el archivo. Intenta de nuevo.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Admin-only: remove a single message (and its stored file).
  const handleDelete = async (msg: StaffMessage) => {
    if (!isAdmin) return;
    setMessages((prev) => prev.filter((m) => m.id !== msg.id));
    try {
      await supabase.from('staff_messages').delete().eq('id', msg.id);
      if (msg.attachment_url) {
        const marker = '/staff-chat/';
        const i = msg.attachment_url.indexOf(marker);
        if (i >= 0) {
          const path = msg.attachment_url.slice(i + marker.length);
          await supabase.storage.from('staff-chat').remove([path]);
        }
      }
    } catch (e) {
      console.error('delete message error', e);
    }
  };

  // Admin-only: wipe the entire chat history.
  const handleClearAll = async () => {
    if (!isAdmin) return;
    if (!window.confirm('¿Borrar TODO el historial del chat? Esta acción no se puede deshacer.')) return;
    setMessages([]);
    try {
      await supabase.from('staff_messages').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    } catch (e) {
      console.error('clear chat error', e);
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    send(text);
  };

  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Chat de Maestros"
        className="fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-kids-purple to-kids-blue text-white shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
      >
        {open ? <X className="w-6 h-6" /> : <MessageCircle className="w-7 h-7" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-kids-coral text-white text-xs font-black rounded-full flex items-center justify-center border-2 border-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed z-50 bg-white shadow-2xl border border-gray-200 flex flex-col overflow-hidden
                       inset-x-0 bottom-0 top-0 rounded-none
                       sm:inset-auto sm:bottom-24 sm:right-5 sm:top-auto sm:w-[380px] sm:h-[70vh] sm:max-h-[600px] sm:rounded-3xl"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-kids-purple to-kids-blue px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-black text-sm leading-none">Chat de Maestros</p>
                  <p className="text-white/80 text-xs">{isAdmin ? 'Admin · puedes moderar' : 'Equipo Aviva Kids'}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {isAdmin && messages.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    title="Borrar todo el historial"
                    className="h-8 px-2 rounded-full bg-white/20 hover:bg-kids-coral flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                    <span className="text-white text-xs font-bold">Limpiar</span>
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2 bg-gray-50">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 px-6">
                  <MessageCircle className="w-10 h-10 mb-2 text-gray-300" />
                  <p className="text-sm font-semibold">Aún no hay mensajes.</p>
                  <p className="text-xs">Saluda a tu equipo para comenzar.</p>
                </div>
              )}
              {messages.map((m) => {
                const mine = !!me.id && m.author_id === me.id;
                return (
                  <div key={m.id} className={`flex items-center gap-1 ${mine ? 'justify-end' : 'justify-start'}`}>
                    {isAdmin && mine && (
                      <button
                        onClick={() => handleDelete(m)}
                        title="Eliminar mensaje"
                        className="w-7 h-7 rounded-full hover:bg-kids-coral/10 flex items-center justify-center text-gray-300 hover:text-kids-coral flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                    <div className={`max-w-[78%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                      {!mine && (
                        <span className="text-xs font-bold text-kids-purple mb-0.5 px-1">{m.author_name || 'Maestro/a'}</span>
                      )}
                      <div
                        className={`rounded-2xl px-3 py-2 ${
                          mine ? 'bg-kids-blue text-white rounded-tr-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-sm'
                        }`}
                      >
                        {m.attachment_url && m.attachment_type === 'image' && (
                          <a href={m.attachment_url} target="_blank" rel="noopener noreferrer">
                            <img src={m.attachment_url} alt={m.attachment_name || 'imagen'} className="rounded-xl max-h-48 mb-1 object-cover" />
                          </a>
                        )}
                        {m.attachment_url && m.attachment_type === 'file' && (
                          <a
                            href={m.attachment_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`flex items-center gap-2 rounded-xl p-2 mb-1 ${mine ? 'bg-white/20' : 'bg-gray-100'}`}
                          >
                            <FileText className={`w-5 h-5 flex-shrink-0 ${mine ? 'text-white' : 'text-kids-purple'}`} />
                            <span className="text-xs font-semibold truncate max-w-[160px]">{m.attachment_name || 'Archivo'}</span>
                            <Download className={`w-4 h-4 flex-shrink-0 ${mine ? 'text-white' : 'text-gray-500'}`} />
                          </a>
                        )}
                        {m.body && <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>}
                      </div>
                      <span className="text-[10px] text-gray-400 mt-0.5 px-1">{fmtTime(m.created_at)}</span>
                    </div>
                    {isAdmin && !mine && (
                      <button
                        onClick={() => handleDelete(m)}
                        title="Eliminar mensaje"
                        className="w-7 h-7 rounded-full hover:bg-kids-coral/10 flex items-center justify-center text-gray-300 hover:text-kids-coral flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Emoji picker */}
            <AnimatePresence>
              {showEmojis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 bg-white px-2 py-2 flex flex-wrap gap-1 max-h-32 overflow-y-auto flex-shrink-0"
                >
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setText((t) => t + e)}
                      className="w-8 h-8 text-xl hover:bg-gray-100 rounded-lg flex items-center justify-center"
                    >
                      {e}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <form onSubmit={onSubmit} className="border-t border-gray-100 bg-white px-2 py-2 flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowEmojis((s) => !s)}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0"
                aria-label="Emojis"
              >
                <Smile className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500 flex-shrink-0 disabled:opacity-50"
                aria-label="Adjuntar"
              >
                {uploading ? <ImageIcon className="w-5 h-5 animate-pulse" /> : <Paperclip className="w-5 h-5" />}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
                onChange={handleFile}
                className="hidden"
              />
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 h-10 bg-gray-100 rounded-full px-4 text-sm focus:outline-none focus:ring-2 focus:ring-kids-blue/40 min-w-0"
              />
              <button
                type="submit"
                disabled={!text.trim() && !uploading}
                className="w-10 h-10 rounded-full bg-gradient-to-br from-kids-purple to-kids-blue text-white flex items-center justify-center flex-shrink-0 disabled:opacity-40 hover:scale-105 transition-transform"
                aria-label="Enviar"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
