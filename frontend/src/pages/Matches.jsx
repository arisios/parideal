import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ENERGIA_COLORS } from '../utils/profiles';
import { BandeirinhaSVG } from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL?.replace('/api','') || 'http://localhost:3003';

function FotoAvatar({ foto_path, energia, size = 56 }) {
  const cores = ENERGIA_COLORS[energia] || ENERGIA_COLORS['Forró'];
  if (foto_path) return <img src={`${API_URL}/uploads/${foto_path}`} alt="" className="rounded-full object-cover" style={{ width: size, height: size, border: `2px solid ${cores.badge}` }} />;
  return <div className="rounded-full flex items-center justify-center text-xl" style={{ width: size, height: size, background: cores.light, border: `2px solid ${cores.badge}30` }}>💃</div>;
}

export default function Matches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('discover');
  const [matches, setMatches] = useState([]);
  const [mutual, setMutual] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(null);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    fetchAll();
  }, [user]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [r1, r2] = await Promise.all([api.get('/matches'), api.get('/matches/mutual')]);
      setMatches(r1.data.matches || []);
      setMutual(r2.data.matches || []);
    } catch (err) {
      if (err.response?.status === 404) toast.error('Crie seu perfil primeiro!');
      else toast.error('Erro ao carregar matches');
    } finally { setLoading(false); }
  }

  async function handleLike(profileId, currentlyLiked) {
    setLiking(profileId);
    try {
      if (currentlyLiked) {
        await api.delete(`/matches/${profileId}/like`);
        toast('Like removido');
      } else {
        const { data } = await api.post(`/matches/${profileId}/like`);
        if (data.matched) { toast.success('💘 É um match! Podem conversar agora!', { duration: 5000 }); fetchAll(); return; }
        else toast.success('💜 Curtida enviada!');
      }
      setMatches(prev => prev.map(m => m.id === profileId ? { ...m, liked: !currentlyLiked } : m));
    } catch (err) { toast.error(err.response?.data?.error || 'Erro'); }
    finally { setLiking(null); }
  }

  if (loading) return <div className="min-h-screen bg-parideal flex items-center justify-center"><LoadingSpinner size="lg" text="Buscando seu par..."/></div>;

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      <div className="w-full overflow-hidden"><BandeirinhaSVG className="w-full h-8" /></div>

      <header className="px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold" style={{ color: '#4B1E6D' }}>Par Ideal</h1>
            <p className="text-xs" style={{ color: '#C79A3B' }}>Encontre sua conexão junina 💘</p>
          </div>
          <button onClick={() => navigate('/')} className="text-xs font-medium px-3 py-1.5 rounded-lg" style={{ color: '#6F2DA8' }}>← Voltar</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 mb-4">
        <div className="max-w-lg mx-auto flex rounded-xl p-1" style={{ background: 'rgba(199,154,59,0.15)' }}>
          {[
            { id: 'discover', label: `💘 Descobrir (${matches.length})` },
            { id: 'mutual', label: `🔥 Matches (${mutual.length})` },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className="flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all"
              style={tab === t.id ? { background: '#fff', color: '#4B1E6D', boxShadow: '0 2px 8px rgba(75,30,109,0.1)' } : { color: '#6F2DA8' }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 px-4 pb-8">
        <div className="max-w-lg mx-auto">

          {tab === 'discover' && (
            <>
              {matches.length === 0 ? (
                <div className="card-parideal p-10 text-center">
                  <span className="text-5xl block mb-3">💔</span>
                  <p className="font-display text-lg" style={{ color: '#4B1E6D' }}>Nenhum perfil disponível</p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(58,31,20,0.5)' }}>Aguarde mais pessoas participarem!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {matches.map(m => {
                    const cores = ENERGIA_COLORS[m.energia] || ENERGIA_COLORS['Forró'];
                    return (
                      <div key={m.id} className="card-parideal p-4" style={{ border: m.matched ? '2px solid #C21874' : undefined }}>
                        {m.matched && <div className="text-xs font-bold text-center mb-2 py-1 rounded-lg" style={{ background: 'rgba(194,24,116,0.1)', color: '#C21874' }}>💘 Match mútuo!</div>}
                        <div className="flex items-center gap-3">
                          <FotoAvatar foto_path={m.foto_path} energia={m.energia} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: cores.badge, color: '#fff' }}>{m.energia}</span>
                              <span className="text-xs font-black" style={{ color: m.score >= 70 ? '#C21874' : m.score >= 50 ? '#6F2DA8' : '#C79A3B' }}>{m.score}% compat.</span>
                            </div>
                            <p className="font-bold text-sm truncate" style={{ color: '#4B1E6D' }}>{m.profile_name}</p>
                            <p className="text-xs truncate" style={{ color: 'rgba(58,31,20,0.5)' }}>{m.personalidade}</p>
                          </div>
                          <div className="flex flex-col gap-2 shrink-0">
                            <button onClick={() => handleLike(m.id, m.liked)} disabled={liking === m.id}
                              className="w-10 h-10 rounded-full flex items-center justify-center text-xl transition-all"
                              style={{ background: m.liked ? 'linear-gradient(135deg,#C21874,#6F2DA8)' : 'rgba(194,24,116,0.1)' }}>
                              {liking === m.id ? <LoadingSpinner size="sm"/> : m.liked ? '💘' : '🤍'}
                            </button>
                            {m.matched && (
                              <button onClick={() => navigate(`/chat/${m.id}`)}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                                style={{ background: 'rgba(0,124,145,0.12)' }}>💬</button>
                            )}
                          </div>
                        </div>
                        {/* Barra de compatibilidade */}
                        <div className="mt-3">
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(58,31,20,0.08)' }}>
                            <div className="h-full rounded-full transition-all" style={{ width: `${m.score}%`, background: m.score >= 70 ? 'linear-gradient(90deg,#C21874,#6F2DA8)' : 'linear-gradient(90deg,#6F2DA8,#007C91)' }}/>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {tab === 'mutual' && (
            <>
              {mutual.length === 0 ? (
                <div className="card-parideal p-10 text-center">
                  <span className="text-5xl block mb-3">🎪</span>
                  <p className="font-display text-lg" style={{ color: '#4B1E6D' }}>Nenhum match ainda</p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(58,31,20,0.5)' }}>Curta perfis na aba Descobrir para dar match!</p>
                  <button onClick={() => setTab('discover')} className="btn-magenta mt-4 text-sm">Ver perfis</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {mutual.map(m => {
                    const cores = ENERGIA_COLORS[m.energia] || ENERGIA_COLORS['Forró'];
                    return (
                      <button key={m.id} onClick={() => navigate(`/chat/${m.id}`)} className="w-full text-left card-parideal p-4 hover:scale-[1.01] transition-all"
                        style={{ border: '2px solid rgba(194,24,116,0.2)' }}>
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <FotoAvatar foto_path={m.foto_path} energia={m.energia} />
                            {m.unread > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ background: '#C21874' }}>{m.unread}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-xs font-bold px-1.5 py-0.5 rounded-full" style={{ background: cores.badge, color: '#fff' }}>{m.energia}</span>
                              <span className="text-xs font-black" style={{ color: '#C21874' }}>{m.score}% compat.</span>
                            </div>
                            <p className="font-bold text-sm" style={{ color: '#4B1E6D' }}>{m.profile_name}</p>
                          </div>
                          <span className="text-2xl">💬</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <div className="w-full overflow-hidden"><BandeirinhaSVG className="w-full h-8" /></div>
    </div>
  );
}
