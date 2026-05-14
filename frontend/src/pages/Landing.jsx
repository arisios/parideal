import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BandeirinhaSVG } from '../components/Bandeirinhas';
import { useAuth } from '../hooks/useAuth';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      {/* Header bandeirinhas */}
      <div className="w-full overflow-hidden">
        <BandeirinhaSVG className="w-full h-10" />
      </div>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
        {/* Badge Juninas do Rio */}
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-6"
          style={{ background: 'rgba(111,45,168,0.1)', color: '#6F2DA8', border: '1px solid rgba(111,45,168,0.2)' }}
        >
          <span>🎪</span>
          <span>Juninas do Rio 2026</span>
        </div>

        {/* Coração animado */}
        <div className="text-7xl mb-4 animate-float select-none" style={{ filter: 'drop-shadow(0 4px 12px rgba(194,24,116,0.3))' }}>
          💜
        </div>

        {/* Título */}
        <h1 className="font-display text-4xl sm:text-5xl font-bold mb-3 leading-tight" style={{ color: '#4B1E6D' }}>
          Encontre Seu<br />
          <span style={{ color: '#C21874' }}>Par Junino</span>
        </h1>

        <p className="text-base sm:text-lg mb-2 max-w-sm" style={{ color: '#5a3040' }}>
          Responda 4 perguntas e descubra qual é o seu perfil junino — e com quem você combina mais!
        </p>

        <p className="text-sm mb-8" style={{ color: '#8a6070', fontStyle: 'italic' }}>
          256 combinações possíveis. Qual é a sua?
        </p>

        {/* CTA principal */}
        <button
          onClick={() => navigate('/quiz')}
          className="btn-magenta text-lg px-8 py-4 mb-4 w-full max-w-xs shadow-lg"
          style={{ boxShadow: '0 8px 24px rgba(194,24,116,0.25)' }}
        >
          Descobrir meu perfil ❤️
        </button>

        {/* Login / Admin link */}
        <div className="flex gap-4 text-sm mt-2">
          {user ? (
            <>
              <span style={{ color: '#6F2DA8' }}>Olá, {user.name?.split(' ')[0]}!</span>
              {user.role === 'admin' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="underline font-medium"
                  style={{ color: '#C21874' }}
                >
                  Painel Admin
                </button>
              )}
            </>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="underline"
              style={{ color: '#6F2DA8' }}
            >
              Entrar / Cadastrar
            </button>
          )}
        </div>

        {/* Cards ilustrativos */}
        <div className="grid grid-cols-2 gap-3 mt-12 w-full max-w-sm">
          {[
            { emoji: '🎵', titulo: 'Xote', sub: 'Romântico e suave' },
            { emoji: '🎶', titulo: 'Forró', sub: 'Animado e aberto' },
            { emoji: '🎸', titulo: 'Baião', sub: 'Raiz e autêntico' },
            { emoji: '💃', titulo: 'Xaxado', sub: 'Vibrante e intenso' },
          ].map(({ emoji, titulo, sub }) => (
            <div
              key={titulo}
              className="card-parideal p-4 text-center animate-fade-in"
            >
              <div className="text-2xl mb-1">{emoji}</div>
              <div className="font-semibold text-sm" style={{ color: '#4B1E6D' }}>{titulo}</div>
              <div className="text-xs mt-0.5" style={{ color: '#8a6070' }}>{sub}</div>
            </div>
          ))}
        </div>

        {/* Rodapé */}
        <p className="mt-10 text-xs" style={{ color: '#b09090' }}>
          Juninas do Rio 2026 · Parideal ✨
        </p>
      </div>

      {/* Footer bandeirinhas */}
      <div className="w-full overflow-hidden rotate-180">
        <BandeirinhaSVG className="w-full h-10" />
      </div>
    </div>
  );
}
