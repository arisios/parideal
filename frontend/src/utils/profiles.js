// Lógica pura dos 256 perfis — sem API, roda no frontend

export const PROFILE_NAMES = [
  'Alma do Xote', 'Furacão do Arrasta-pé', 'Coração de Baião', 'Energia do Xaxado',
  'Emoção Junina', 'Forrozeiro(a) Raiz', 'Mistério da Quadrilha', 'Estrela do Arraiá',
  'Romance de São João', 'Turbilhão do Piseiro', 'Coração de Quadrilha', 'Vibe da Vila',
  'Encanto Junino', 'Lenda do Forró', 'Explosão de São João', 'Conexão do Arrasta-pé'
];

export const QUIZ_QUESTIONS = [
  {
    id: 1,
    pergunta: 'Qual é o seu ritmo?',
    emoji: '🎵',
    opcoes: [
      { valor: 1, texto: 'Xote', descricao: 'Suave, romântico e cheio de sentimento' },
      { valor: 2, texto: 'Forró', descricao: 'Animado, contagiante e de coração aberto' },
      { valor: 3, texto: 'Baião', descricao: 'Raiz, autêntico e com personalidade forte' },
      { valor: 4, texto: 'Xaxado', descricao: 'Vibrante, marcado e cheio de energia' },
    ]
  },
  {
    id: 2,
    pergunta: 'Como você age no arraiá?',
    emoji: '🏮',
    opcoes: [
      { valor: 1, texto: 'Observa antes', descricao: 'Prefere entender o ambiente antes de agir' },
      { valor: 2, texto: 'Entra no clima', descricao: 'Se joga na festa desde o primeiro segundo' },
      { valor: 3, texto: 'Circula com todos', descricao: 'Conhece todo mundo e espalha alegria' },
      { valor: 4, texto: 'Foca em uma conexão', descricao: 'Prefere uma conversa profunda a várias superficiais' },
    ]
  },
  {
    id: 3,
    pergunta: 'Como você demonstra interesse?',
    emoji: '💜',
    opcoes: [
      { valor: 1, texto: 'Se envolve rápido', descricao: 'Entrega o coração logo de início' },
      { valor: 2, texto: 'Mantém controle', descricao: 'Estratégico(a), não se entrega facilmente' },
      { valor: 3, texto: 'Demonstra na hora', descricao: 'Direto(a) e transparente no que sente' },
      { valor: 4, texto: 'Cria conexão aos poucos', descricao: 'Constrói o vínculo com cuidado e consistência' },
    ]
  },
  {
    id: 4,
    pergunta: 'Seu par ideal é quem...',
    emoji: '🌟',
    opcoes: [
      { valor: 1, texto: 'Dança agarradinho', descricao: 'Valoriza intimidade, presença e carinho' },
      { valor: 2, texto: 'Transforma em diversão', descricao: 'Ama leveza, humor e boa energia' },
      { valor: 3, texto: 'Vive o arrasta-pé', descricao: 'Tem energia alta e paixão pela festa' },
      { valor: 4, texto: 'Transmite calma', descricao: 'Faz os outros se sentirem confortáveis' },
    ]
  }
];

const ENERGIAS = ['Xote', 'Forró', 'Baião', 'Xaxado'];
const PERSONALIDADES = [
  'analítico(a) e reservado(a)',
  'espontâneo(a) e energético(a)',
  'social e comunicativo(a)',
  'emocional e profundo(a)'
];
const ESTILOS = [
  'emocionalmente intenso(a)',
  'controlado(a) e estratégico(a)',
  'direto(a) e transparente',
  'cuidadoso(a) e consistente'
];
const PARES = [
  'valoriza intimidade e presença',
  'ama leveza e humor',
  'tem energia alta e paixão pela festa',
  'faz os outros se sentirem confortáveis'
];
const COMPAT_Q1 = ['Xote e Baião', 'Forró e Xaxado', 'Baião e Xote', 'Xaxado e Forró'];

// Cores para cada energia
export const ENERGIA_COLORS = {
  Xote: { bg: 'from-pink-600 to-rose-500', badge: '#C21874', light: 'rgba(194,24,116,0.12)' },
  Forró: { bg: 'from-purple-700 to-purple-500', badge: '#6F2DA8', light: 'rgba(111,45,168,0.12)' },
  Baião: { bg: 'from-orange-600 to-amber-500', badge: '#D96C2F', light: 'rgba(217,108,47,0.12)' },
  Xaxado: { bg: 'from-teal-700 to-cyan-600', badge: '#007C91', light: 'rgba(0,124,145,0.12)' },
};

export function buildProfile(q1, q2, q3, q4) {
  const profileId = (q1 - 1) * 64 + (q2 - 1) * 16 + (q3 - 1) * 4 + q4;
  const profileName = PROFILE_NAMES[(profileId - 1) % 16];
  const energia = ENERGIAS[q1 - 1];
  const personalidade = PERSONALIDADES[q2 - 1];
  const estilo = ESTILOS[q3 - 1];
  const parTipo = PARES[q4 - 1];
  const compatibilidade = `Alta compatibilidade com energia ${COMPAT_Q1[q1 - 1]}`;
  const descricao = `Você combina uma energia ${energia.toLowerCase()} com uma personalidade ${personalidade}. No amor, tende a ser ${estilo} e procura pessoas que ${parTipo}. Sua vibe junina transmite autenticidade, presença e conexão emocional.`;
  const tagline = 'Provavelmente já transformou um simples forró em história pra contar.';

  return {
    profileId,
    profileName,
    energia,
    personalidade,
    estilo,
    parTipo,
    compatibilidade,
    descricao,
    tagline,
    q1, q2, q3, q4
  };
}
