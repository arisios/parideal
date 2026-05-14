import React, { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
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
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [allowMatch, setAllowMatch] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!state?.profile) {
    return (
      <div className="min-h-screen bg-parideal flex flex-col items-center justify-center gap-4">
        <p style={{ color: '#6F2DA8' }}>Nenhum perfil encontrado.</p>
        <button onClick={() => navigate('/quiz')} className="btn-magenta">
          Fazer o quiz
        </button>
      </div>
    );
  }

  const { profile, respostas } = state;
  const cores = ENERGIA_COLORS[profile.energia] || ENERGIA_COLORS['Forró'];

  async function salvarPerfil() {
    setSaving(true);
    try {
      const res = await api.post('/profiles/save', {
        q1: respostas.q1,
        q2: respostas.q2,
        q3: respostas.q3,
        q4: respostas.q4,
        allow_match: allowMatch,
      });
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
    const url = `${window.location.origin}/p/${shareToken}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      toast.success('Link copiado! 📋');
      setTimeout(() => setCopied(false), 3000);
    });
  }

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      <div className="w-full overflow-hidden">
        <BandeirinhaSVG className="w-full h-8" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Título */}
          <div className="text-center mb-6 animate-slide-up">
            <span className="text-3xl">🎉</span>
            <h1 className="font-display text-2xl font-bold mt-1" style={{ color: '#4B1E6D' }}>
              Seu perfil junino!
            </h1>
          </div>

          {/* Card principal do perfil */}
          <div
            className="rounded-3xl overflow-hidden shadow-xl mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s', boxShadow: '0 16px 48px rgba(75,30,109,0.2)' }}
          >
            {/* Header gradiente */}
            <div
              className={`bg-gradient-to-br ${cores.bg} p-6 text-white text-center relative`}
            >
              {/* Decoração */}
              <div className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'repeating-linear-gradient(45deg, white 0, white 1px, transparent 0, transparent 50%)',
                  backgroundSize: '10px 10px'
                }}
              />

              <div className="relative">
                <div className="text-5xl mb-3">✨</div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3 uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.2)' }}
                >
                  Perfil #{profile.profileId}
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-bold leading-tight">
                  {profile.profileName}
                </h2>
                <div
                  className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
                >
                  Energia {profile.energia}
                </div>
              </div>
            </div>

            {/* Corpo do card */}
            <div className="bg-white p-6">
              {/* Tagline */}
              <p
                className="text-center text-sm italic mb-4 pb-4 border-b"
                style={{ color: '#8a6070', borderColor: 'rgba(111,45,168,0.1)' }}
              >
                "{profile.tagline}"
              </p>

              {/* Descrição */}
              <p className="text-sm leading-relaxed mb-5" style={{ color: '#5a3040' }}>
                {profile.descricao}
              </p>

              {/* Tags de atributos */}
              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  { label: '🎵 ' + profile.energia },
                  { label: '💡 ' + profile.personalidade },
                  { label: '💜 ' + profile.estilo },
                ].map(({ label }) => (
                  <span
                    key={label}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: cores.light, color: '#4B1E6D' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

              {/* Compatibilidade */}
              <div
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: 'linear-gradient(135deg, rgba(194,24,116,0.06), rgba(111,45,168,0.06))' }}
              >
                <span className="text-2xl">💘</span>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#C21874' }}>
                    Compatibilidade
                  </div>
                  <div className="text-sm font-medium mt-0.5" style={{ color: '#4B1E6D' }}>
                    {profile.compatibilidade}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Ações */}
          {!saved ? (
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              {!showSaveForm ? (
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => setShowSaveForm(true)}
                    className="btn-magenta w-full text-center"
                  >
                    Salvar e compartilhar 📤
                  </button>
                  <button
                    onClick={() => navigate('/quiz')}
                    className="btn-roxo w-full text-center opacity-70"
                  >
                    Refazer o quiz
                  </button>
                </div>
              ) : (
                <div className="card-parideal p-5">
                  <h3 className="font-semibold text-base mb-4" style={{ color: '#4B1E6D' }}>
                    Salvar meu perfil
                  </h3>

                  {/* Aceitar matches */}
                  <label className="flex items-start gap-3 mb-5 cursor-pointer">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={allowMatch}
                        onChange={(e) => setAllowMatch(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center transition-all"
                        style={{
                          background: allowMatch ? '#C21874' : 'white',
                          border: `2px solid ${allowMatch ? '#C21874' : '#d0b0b8'}`,
                        }}
                      >
                        {allowMatch && <span className="text-white text-xs">✓</span>}
                      </div>
                    </div>
                    <span className="text-sm" style={{ color: '#5a3040' }}>
                      Aceito receber matches com outros perfis compatíveis ❤️
                    </span>
                  </label>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSaveForm(false)}
                      className="flex-1 py-3 rounded-xl text-sm font-medium border transition-colors"
                      style={{ borderColor: 'rgba(111,45,168,0.2)', color: '#6F2DA8' }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={salvarPerfil}
                      disabled={saving}
                      className="flex-1 btn-magenta py-3 text-sm"
                    >
                      {saving ? <LoadingSpinner size="sm" /> : 'Salvar ✨'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Perfil salvo — mostrar link de compartilhamento */
            <div className="card-parideal p-5 animate-slide-up">
              <div className="text-center mb-4">
                <span className="text-3xl">🎊</span>
                <h3 className="font-semibold mt-1" style={{ color: '#4B1E6D' }}>
                  Perfil salvo com sucesso!
                </h3>
                <p className="text-xs mt-1" style={{ color: '#8a6070' }}>
                  Compartilhe seu link junino
                </p>
              </div>

              <div
                className="flex items-center gap-2 p-3 rounded-xl mb-3 text-sm break-all"
                style={{ background: 'rgba(111,45,168,0.06)', color: '#4B1E6D' }}
              >
                <span className="flex-1 font-mono text-xs">
                  {window.location.origin}/p/{shareToken}
                </span>
              </div>

              <button
                onClick={copiarLink}
                className="btn-magenta w-full mb-2"
              >
                {copied ? 'Copiado! ✓' : 'Copiar link 📋'}
              </button>

              <Link
                to={`/p/${shareToken}`}
                className="block text-center text-sm underline mt-2"
                style={{ color: '#6F2DA8' }}
              >
                Ver página do perfil →
              </Link>
            </div>
          )}

          {/* Fazer de novo */}
          <div className="text-center mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-sm underline"
              style={{ color: '#8a6070' }}
            >
              ← Voltar ao início
            </button>
          </div>
        </div>
      </div>

      <div className="w-full overflow-hidden rotate-180">
        <BandeirinhaSVG className="w-full h-8" />
      </div>
    </div>
  );
}
