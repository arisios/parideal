import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ENERGIA_COLORS } from '../utils/profiles';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:3003';

export default function Chat() {
  const { profileId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [other, setOther] = useState(null);
  const [myProfileId, setMyProfileId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef();

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchMessages();
    const t = setInterval(fetchMessages, 4000);
    return () => clearInterval(t);
  }, [profileId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function fetchMessages(silent = false) {
    try {
      const { data } = await api.get(`/chat/${profileId}`);
      setMessages(data.messages);
      setOther(data.other);
      setMyProfileId(data.myProfileId);
    } catch (err) {
      if (!silent) {
        toast.error(err.response?.data?.error || 'Erro ao carregar chat');
        navigate('/matches');
      }
    } finally { if (!silent) setLoading(false); }
  }

  async function handleSend(e) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      const { data } = await api.post(`/chat/${profileId}`, { content: content.trim() });
      setMessages(prev => [...prev, data]);
      setContent('');
    } catch (err) { toast.error(err.response?.data?.error || 'Erro ao enviar'); }
    finally { setSending(false); }
  }

  if (loading) return <div className="min-h-screen bg-parideal flex items-center justify-center"><LoadingSpinner size="lg"/></div>;

  const cores = other ? (ENERGIA_COLORS[other.energia] || ENERGIA_COLORS['Forró']) : {};
  const fmtTime = (d) => new Date(d).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 sticky top-0 z-10" style={{ background: 'rgba(245,231,211,0.95)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(199,154,59,0.2)' }}>
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <button onClick={() => navigate('/matches')} className="text-xl p-1" style={{ color: '#6F2DA8' }}>←</button>
          {other?.foto_path
            ? <img src={`${API_URL}/uploads/${other.foto_path}`} alt="" className="w-10 h-10 rounded-full object-cover" style={{ border: `2px solid ${cores.badge}` }}/>
            : <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: cores.light }}>💃</div>
          }
          <div>
            <p className="font-bold text-sm" style={{ color: '#4B1E6D' }}>{other?.profile_name}</p>
            <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full" style={{ background: cores.badge, color: '#fff' }}>{other?.energia}</span>
          </div>
        </div>
      </header>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-lg mx-auto space-y-3">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">💘</span>
              <p className="font-display text-lg" style={{ color: '#4B1E6D' }}>Vocês deram match!</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(58,31,20,0.5)' }}>Diga oi e comece a conversa 👋</p>
            </div>
          )}
          {messages.map((msg, i) => {
            const mine = msg.is_mine === 1 || msg.from_profile_id === myProfileId;
            return (
              <div key={msg.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[75%]">
                  <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                    style={mine
                      ? { background: 'linear-gradient(135deg,#C21874,#6F2DA8)', color: '#fff', borderBottomRightRadius: 4 }
                      : { background: 'rgba(255,255,255,0.85)', color: '#3A1F14', border: '1px solid rgba(199,154,59,0.2)', borderBottomLeftRadius: 4 }
                    }>
                    {msg.content}
                  </div>
                  <p className="text-xs mt-0.5 px-1" style={{ color: 'rgba(58,31,20,0.35)', textAlign: mine ? 'right' : 'left' }}>{fmtTime(msg.created_at)}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef}/>
        </div>
      </div>

      {/* Input */}
      <div className="px-4 py-3 sticky bottom-0" style={{ background: 'rgba(245,231,211,0.95)', backdropFilter: 'blur(8px)', borderTop: '1px solid rgba(199,154,59,0.2)' }}>
        <form onSubmit={handleSend} className="max-w-lg mx-auto flex gap-2">
          <input type="text" className="input-junina flex-1 py-2.5 text-sm" placeholder="Escreva sua mensagem..."
            value={content} onChange={e => setContent(e.target.value.slice(0, 500))} maxLength={500} />
          <button type="submit" disabled={sending || !content.trim()} className="px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-all"
            style={{ background: content.trim() ? 'linear-gradient(135deg,#C21874,#6F2DA8)' : 'rgba(194,24,116,0.3)', minWidth: 64 }}>
            {sending ? <LoadingSpinner size="sm"/> : '➤'}
          </button>
        </form>
      </div>
    </div>
  );
}
