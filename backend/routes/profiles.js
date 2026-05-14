const express = require('express');
const crypto = require('crypto');
const { getDb } = require('../database/db');
const { optionalAuth, authMiddleware } = require('../middleware/auth');

const router = express.Router();

const PROFILE_NAMES = [
  'Alma do Xote', 'Furacão do Arrasta-pé', 'Coração de Baião', 'Energia do Xaxado',
  'Emoção Junina', 'Forrozeiro(a) Raiz', 'Mistério da Quadrilha', 'Estrela do Arraiá',
  'Romance de São João', 'Turbilhão do Piseiro', 'Coração de Quadrilha', 'Vibe da Vila',
  'Encanto Junino', 'Lenda do Forró', 'Explosão de São João', 'Conexão do Arrasta-pé'
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

function buildProfile(q1, q2, q3, q4) {
  const profileId = (q1 - 1) * 64 + (q2 - 1) * 16 + (q3 - 1) * 4 + q4;
  const profileName = PROFILE_NAMES[(profileId - 1) % 16];
  const energia = ENERGIAS[q1 - 1];
  const personalidade = PERSONALIDADES[q2 - 1];
  const estilo = ESTILOS[q3 - 1];
  const parTipo = PARES[q4 - 1];
  const compatibilidade = `Alta compatibilidade com energia ${COMPAT_Q1[q1 - 1]}`;
  const descricao = `Você combina uma energia ${energia.toLowerCase()} com uma personalidade ${personalidade}. No amor, tende a ser ${estilo} e procura pessoas que ${parTipo}. Sua vibe junina transmite autenticidade, presença e conexão emocional.`;
  const tagline = 'Provavelmente já transformou um simples forró em história pra contar.';

  return { profileId, profileName, energia, personalidade, estilo, parTipo, compatibilidade, descricao, tagline };
}

// Salvar perfil (login opcional)
router.post('/save', optionalAuth, (req, res) => {
  const { q1, q2, q3, q4, name, instagram, allow_match } = req.body;

  if (!q1 || !q2 || !q3 || !q4) return res.status(400).json({ error: 'Respostas do quiz incompletas' });
  if (q1 < 1 || q1 > 4 || q2 < 1 || q2 > 4 || q3 < 1 || q3 > 4 || q4 < 1 || q4 > 4) {
    return res.status(400).json({ error: 'Respostas inválidas (devem ser de 1 a 4)' });
  }

  const profile = buildProfile(Number(q1), Number(q2), Number(q3), Number(q4));
  const share_token = crypto.randomBytes(8).toString('hex');

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO profiles (user_id, profile_id, profile_name, q1, q2, q3, q4, energia, allow_match, share_token)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user ? req.user.id : null,
    profile.profileId,
    profile.profileName,
    Number(q1), Number(q2), Number(q3), Number(q4),
    profile.energia,
    allow_match ? 1 : 0,
    share_token
  );

  res.status(201).json({
    id: result.lastInsertRowid,
    share_token,
    share_url: `/p/${share_token}`,
    ...profile
  });
});

// Buscar perfil público por token
router.get('/token/:token', (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profiles WHERE share_token = ?').get(req.params.token);
  if (!row) return res.status(404).json({ error: 'Perfil não encontrado' });

  const profile = buildProfile(row.q1, row.q2, row.q3, row.q4);

  res.json({
    id: row.id,
    share_token: row.share_token,
    created_at: row.created_at,
    allow_match: row.allow_match,
    ...profile
  });
});

// Calcular perfil sem salvar (só para preview)
router.post('/calculate', (req, res) => {
  const { q1, q2, q3, q4 } = req.body;
  if (!q1 || !q2 || !q3 || !q4) return res.status(400).json({ error: 'Respostas incompletas' });

  const profile = buildProfile(Number(q1), Number(q2), Number(q3), Number(q4));
  res.json(profile);
});

module.exports = router;
