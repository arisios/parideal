import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ENERGIA_COLORS } from '../utils/profiles';
import { BandeirinhaSVG } from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';

export default function SharedProfile() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!token) return;
    api.get(`/profiles/token/${token}`)
      .then((res) => setProfile(res.data))
      .catch((err) => {
        if (err.response?.status === 404) {
          setError('Perfil não encontrado');
        } else {
          setError('Erro ao carregar perfil');
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  function copiarLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-parideal flex items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando perfil..." />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-parideal flex flex-col items-center justify-center gap-4 px-4">
        <span className="text-5xl">💔</span>
        <p className="font-display text-xl" style={{ color: '#4B1E6D' }}>{error || 'Perfil não encontrado'}</p>
        <button onClick={() => navigate('/quiz')} className="btn-magenta">
          Fazer meu perfil
        </button>
      </div>
    );
  }

  const cores = ENERGIA_COLORS[profile.energia] || ENERGIA_COLORS['Forró'];

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      <div className="w-full overflow-hidden">
        <BandeirinhaSVG className="w-full h-8" />
      </div>

      <div className="flex-1 flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Intro */}
          <div className="text-center mb-6 animate-slide-up">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
              style={{ background: 'rgba(111,45,168,0.1)', color: '#6F2DA8' }}
            >
              🎪 Juninas do Rio 2026
            </div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#4B1E6D' }}>
              Perfil Junino Compartilhado
            </h1>
          </div>

          {/* Card do perfil */}
          <div
            className="rounded-3xl overflow-hidden shadow-xl mb-6 animate-slide-up"
            style={{ animationDelay: '0.1s', boxShadow: '0 16px 48px rgba(75,30,109,0.2)' }}
          >
            {/* Header */}
            <div className={`bg-gradient-to-br ${cores.bg} p-6 text-white text-center relative`}>
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
                <h2 className="font-display text-2xl sm:text-3xl font-bold">
                  {profile.profileName}
                </h2>
                <div
                  className="inline-block mt-3 px-4 py-1.5 rounded-full text-sm font-semibold"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  Energia {profile.energia}
                </div>
              </div>
            </div>

            {/* Corpo */}
            <div className="bg-white p-6">
              <p
                className="text-center text-sm italic mb-4 pb-4 border-b"
                style={{ color: '#8a6070', borderColor: 'rgba(111,45,168,0.1)' }}
              >
                "{profile.tagline}"
              </p>

              <p className="text-sm leading-relaxed mb-5" style={{ color: '#5a3040' }}>
                {profile.descricao}
              </p>

              <div className="flex flex-wrap gap-2 mb-5">
                {[
                  '🎵 ' + profile.energia,
                  '💡 ' + profile.personalidade,
                  '💜 ' + profile.estilo,
                ].map((label) => (
                  <span
                    key={label}
                    className="px-3 py-1 rounded-full text-xs font-medium"
                    style={{ background: cores.light, color: '#4B1E6D' }}
                  >
                    {label}
                  </span>
                ))}
              </div>

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

              {profile.allow_match === 1 && (
                <div
                  className="mt-4 rounded-xl p-3 text-center text-xs font-medium"
                  style={{ background: 'rgba(194,24,116,0.08)', color: '#C21874' }}
                >
                  💌 Esta pessoa está aberta para receber matches!
                </div>
              )}
            </div>
          </div>

          {/* Ações */}
          <div className="flex flex-col gap-3 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button onClick={copiarLink} className="btn-roxo w-full">
              {copied ? 'Link copiado! ✓' : 'Compartilhar este perfil 📤'}
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="btn-magenta w-full"
            >
              Descobrir meu perfil ❤️
            </button>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: '#b09090' }}>
            Juninas do Rio 2026 · Parideal ✨
          </p>
        </div>
      </div>

      <div className="w-full overflow-hidden rotate-180">
        <BandeirinhaSVG className="w-full h-8" />
      </div>
    </div>
  );
}
