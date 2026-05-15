import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ENERGIA_COLORS } from '../utils/profiles';
import { BandeirinhaSVG } from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [shareToken, setShareToken] = useState(null);
  const [allowMatch, setAllowMatch] = useState(false);
  const [allowDivulgar, setAllowDivulgar] = useState(false);
  const [foto, setFoto] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [copied, setCopied] = useState(false);
  const fotoRef = useRef();

  if (!state?.profile) {
    return (
      <div className="min-h-screen bg-parideal flex flex-col items-center justify-center gap-4">
        <p style={{ color: '#6F2DA8' }}>Nenhum perfil encontrado.</p>
        <button onClick={() => navigate('/quiz')} className="btn-magenta">Fazer o quiz</button>
      </div>
    );
  }

  const { profile, respostas } = state;
  const cores = ENERGIA_COLORS[profile.energia] || ENERGIA_COLORS['Forró'];

  const handleFoto = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFoto(f);
    setFotoPreview(URL.createObjectURL(f));
  };

  async function salvarPerfil() {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('q1', respostas.q1); fd.append('q2', respostas.q2);
      fd.append('q3', respostas.q3); fd.append('q4', respostas.q4);
      fd.append('allow_match', allowMatch ? '1' : '0');
      fd.append('allow_divulgar', allowDivulgar ? '1' : '0');
      if (foto) fd.append('foto', foto);
      const res = await api.post('/profiles/save', fd);
      setShareToken(res.data.share_token);
      setSaved(true);
      toast.success('Perfil salvo! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro ao salvar perfil');
    } finally {
      setSaving(false);
    }
  }

  function copiarLink() {
    navigator.clipboard.writeText(`${window.location.origin}/p/${shareToken}`).then(() => {
      setCopied(true); toast.success('Link copiado! 📋');
      setTimeout(() => setCopied(false), 3000);
    });
  }

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      <div className="w-full overflow-hidden"><BandeirinhaSVG className="w-full h-8" /></div>
      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">

          <div className="text-center mb-6 animate-slide-up">
            <span className="text-3xl">🎉</span>
            <h1 className="font-display text-2xl font-bold mt-1" style={{ color: '#4B1E6D' }}>Seu perfil junino!</h1>
          </div>

          <div className="card-parideal p-6 mb-5 animate-slide-up" style={{ border: `2px solid ${cores.badge}30` }}>
            <div className="flex items-center gap-4 mb-4">
              {fotoPreview
                ? <img src={fotoPreview} alt="" className="w-16 h-16 rounded-full object-cover" style={{ border: `2px solid ${cores.badge}` }}/>
                : <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background: cores.light }}>💃</div>
              }
              <div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: cores.badge, color: '#fff' }}>{profile.energia}</span>
                <h2 className="font-display text-lg font-bold mt-1" style={{ color: '#4B1E6D' }}>{profile.profileName}</h2>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#3A1F14' }}>{profile.descricao}</p>
          </div>

          {!saved ? (
            <div className="card-parideal p-5 mb-4 animate-slide-up">
              <h3 className="font-semibold mb-4" style={{ color: '#4B1E6D' }}>Salvar e participar dos matches</h3>

              <div className="mb-4">
                <p className="text-xs font-bold mb-2 uppercase tracking-wider" style={{ color: '#C79A3B' }}>Sua foto (opcional)</p>
                <div className="flex items-center gap-3">
                  <div onClick={() => fotoRef.current?.click()} className="cursor-pointer w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ border: `2px dashed ${fotoPreview ? '#C21874' : 'rgba(199,154,59,0.4)'}`, background: 'rgba(255,255,255,0.5)' }}>
                    {fotoPreview ? <img src={fotoPreview} alt="" className="w-full h-full object-cover"/> : <span className="text-2xl">📷</span>}
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'rgba(58,31,20,0.6)' }}>Toque para adicionar sua foto</p>
                    {fotoPreview && <button onClick={() => { setFoto(null); setFotoPreview(null); }} className="text-xs mt-1" style={{ color: '#C21874' }}>Remover</button>}
                  </div>
                  <input ref={fotoRef} type="file" accept="image/*" className="hidden" onChange={handleFoto} />
                </div>
              </div>

              <div className="space-y-3 mb-5 rounded-xl p-3" style={{ background: 'rgba(199,154,59,0.08)' }}>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={allowDivulgar} onChange={e => { setAllowDivulgar(e.target.checked); if (!e.target.checked) setAllowMatch(false); }} className="mt-0.5 accent-pink-600" />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#4B1E6D' }}>Aparecer na busca de matches</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(58,31,20,0.5)' }}>Seu perfil fica visível para outros encontrarem você</p>
                  </div>
                </label>
                {allowDivulgar && (
                  <label className="flex items-start gap-3 cursor-pointer pl-6">
                    <input type="checkbox" checked={allowMatch} onChange={e => setAllowMatch(e.target.checked)} className="mt-0.5 accent-pink-600" />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: '#4B1E6D' }}>Aceitar matches e chat</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(58,31,20,0.5)' }}>Permite que matches entrem em contato via chat</p>
                    </div>
                  </label>
                )}
              </div>

              <button onClick={salvarPerfil} className="btn-magenta w-full" disabled={saving}>
                {saving ? <span className="flex items-center justify-center gap-2"><LoadingSpinner size="sm"/>Salvando...</span> : '💾 Salvar meu perfil'}
              </button>
            </div>
          ) : (
            <div className="card-parideal p-5 mb-4 animate-slide-up">
              <p className="text-center font-semibold mb-3" style={{ color: '#007C91' }}>✅ Perfil salvo!</p>
              <div className="flex gap-2 mb-4">
                <input readOnly value={`${window.location.origin}/p/${shareToken}`} className="input-junina text-xs flex-1" />
                <button onClick={copiarLink} className="btn-roxo text-sm px-3">{copied ? '✓' : '📋'}</button>
              </div>
              <div className="flex gap-2">
                <button onClick={() => navigate('/matches')} className="btn-magenta flex-1 text-sm">💘 Ver Matches</button>
                <button onClick={() => navigate('/')} className="btn-roxo flex-1 text-sm">Início</button>
              </div>
            </div>
          )}

          <button onClick={() => navigate('/quiz')} className="w-full text-sm py-2" style={{ color: 'rgba(58,31,20,0.4)' }}>Refazer o quiz</button>
        </div>
      </div>
      <div className="w-full overflow-hidden"><BandeirinhaSVG className="w-full h-8" /></div>
    </div>
  );
}
