import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QUIZ_QUESTIONS, buildProfile } from '../utils/profiles';
import { BandeirinhaSVG } from '../components/Bandeirinhas';

export default function Quiz() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0-3
  const [respostas, setRespostas] = useState({ q1: null, q2: null, q3: null, q4: null });
  const [animating, setAnimating] = useState(false);

  const questao = QUIZ_QUESTIONS[step];
  const total = QUIZ_QUESTIONS.length;
  const progresso = ((step) / total) * 100;

  function selecionar(valor) {
    if (animating) return;

    const novas = { ...respostas, [`q${step + 1}`]: valor };
    setRespostas(novas);

    if (step < total - 1) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step + 1);
        setAnimating(false);
      }, 350);
    } else {
      // Última pergunta — vai para resultado
      const profile = buildProfile(novas.q1, novas.q2, novas.q3, novas.q4);
      navigate('/resultado', { state: { profile, respostas: novas } });
    }
  }

  function voltar() {
    if (step > 0) {
      setAnimating(true);
      setTimeout(() => {
        setStep(step - 1);
        setAnimating(false);
      }, 200);
    } else {
      navigate('/');
    }
  }

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      {/* Header */}
      <div className="w-full overflow-hidden">
        <BandeirinhaSVG className="w-full h-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Top bar */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={voltar}
              className="flex items-center gap-1 text-sm font-medium transition-colors"
              style={{ color: '#6F2DA8' }}
            >
              ← {step === 0 ? 'Início' : 'Voltar'}
            </button>
            <span className="text-sm font-medium" style={{ color: '#8a6070' }}>
              {step + 1} de {total}
            </span>
          </div>

          {/* Progress bar */}
          <div className="progress-bar mb-8">
            <div className="progress-fill" style={{ width: `${progresso + (100 / total)}%` }} />
          </div>

          {/* Pergunta */}
          <div
            className={`transition-all duration-300 ${animating ? 'opacity-0 translate-x-4' : 'opacity-100 translate-x-0'}`}
          >
            <div className="text-center mb-8">
              <div className="text-5xl mb-3">{questao.emoji}</div>
              <h2 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: '#4B1E6D' }}>
                {questao.pergunta}
              </h2>
            </div>

            {/* Opções */}
            <div className="flex flex-col gap-3">
              {questao.opcoes.map((opcao) => {
                const selecionada = respostas[`q${step + 1}`] === opcao.valor;
                return (
                  <button
                    key={opcao.valor}
                    onClick={() => selecionar(opcao.valor)}
                    className={`quiz-option animate-slide-up ${selecionada ? 'selected' : ''}`}
                    style={{ animationDelay: `${(opcao.valor - 1) * 0.07}s` }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mt-0.5"
                        style={{
                          background: selecionada
                            ? 'linear-gradient(135deg, #C21874, #6F2DA8)'
                            : 'rgba(111,45,168,0.1)',
                          color: selecionada ? 'white' : '#6F2DA8',
                        }}
                      >
                        {opcao.valor}
                      </div>
                      <div>
                        <div className="font-semibold text-base">{opcao.texto}</div>
                        <div className="text-xs mt-0.5 opacity-70">{opcao.descricao}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dica */}
          <p className="text-center text-xs mt-6" style={{ color: '#b09090', fontStyle: 'italic' }}>
            Escolha a que mais combina com você
          </p>
        </div>
      </div>
    </div>
  );
}
