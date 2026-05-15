const express = require('express');
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const { getDb } = require('../database/db');
const { optionalAuth, authMiddleware } = require('../middleware/auth');

const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../uploads'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${path.extname(file.originalname)}`),
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const PROFILE_NAMES = [
  'Alma do Xote', 'Furacão do Arrasta-pé', 'Coração de Baião', 'Energia do Xaxado',
  'Emoção Junina', 'Forrozeiro(a) Raiz', 'Mistério da Quadrilha', 'Estrela do Arraiá',
  'Romance de São João', 'Turbilhão do Piseiro', 'Coração de Quadrilha', 'Vibe da Vila',
  'Encanto Junino', 'Lenda do Forró', 'Explosão de São João', 'Conexão do Arrasta-pé'
];
const ENERGIAS = ['Xote', 'Forró', 'Baião', 'Xaxado'];
const PERSONALIDADES = ['analítico(a) e reservado(a)', 'espontâneo(a) e energético(a)', 'social e comunicativo(a)', 'emocional e profundo(a)'];
const ESTILOS = ['emocionalmente intenso(a)', 'controlado(a) e estratégico(a)', 'direto(a) e transparente', 'cuidadoso(a) e consistente'];
const PARES = ['valoriza intimidade e presença', 'ama leveza e humor', 'tem energia alta e paixão pela festa', 'faz os outros se sentirem confortáveis'];

function buildProfile(q1, q2, q3, q4) {
  const profileId = (q1 - 1) * 64 + (q2 - 1) * 16 + (q3 - 1) * 4 + q4;
  const profileName = PROFILE_NAMES[(profileId - 1) % 16];
  const energia = ENERGIAS[q1 - 1];
  const personalidade = PERSONALIDADES[q2 - 1];
  const estilo = ESTILOS[q3 - 1];
  const parTipo = PARES[q4 - 1];
  const descricao = `Você combina uma energia ${energia.toLowerCase()} com uma personalidade ${personalidade}. No amor, tende a ser ${estilo} e procura pessoas que ${parTipo}.`;
  return { profileId, profileName, energia, personalidade, estilo, parTipo, descricao };
}

// Algoritmo de compatibilidade: 0-100
function calcScore(a, b) {
  let score = 0;
  // q1 energia: pares complementares (Xote↔Baião, Forró↔Xaxado)
  const COMP_Q1 = { 1:3, 2:4, 3:1, 4:2 };
  if (COMP_Q1[a.q1] === b.q1) score += 35;
  else if (a.q1 === b.q1) score += 15;
  else score += 5;
  // q4 (o que A quer) vs q2 (como B é): quanto o comportamento de B bate com o que A busca
  if (a.q4 === b.q2) score += 25;
  else if (Math.abs(a.q4 - b.q2) === 1) score += 12;
  // q4 de B vs q2 de A (simétrico)
  if (b.q4 === a.q2) score += 25;
  else if (Math.abs(b.q4 - a.q2) === 1) score += 12;
  // q3 compatível: estilo de interesse
  if (a.q3 === b.q3) score += 15;
  else if (Math.abs(a.q3 - b.q3) === 1) score += 8;
  return Math.min(score, 100);
}

// Salvar perfil com foto opcional
router.post('/save', optionalAuth, upload.single('foto'), (req, res) => {
  const { q1, q2, q3, q4, allow_match, allow_divulgar } = req.body;
  if (!q1 || !q2 || !q3 || !q4) return res.status(400).json({ error: 'Respostas do quiz incompletas' });

  const profile = buildProfile(Number(q1), Number(q2), Number(q3), Number(q4));
  const share_token = crypto.randomBytes(8).toString('hex');
  const foto_path = req.file ? req.file.filename : null;

  const db = getDb();

  // Se o usuário já tem perfil, atualiza
  if (req.user) {
    const existing = db.prepare('SELECT id FROM profiles WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
    if (existing) {
      db.prepare(`UPDATE profiles SET profile_id=?,profile_name=?,q1=?,q2=?,q3=?,q4=?,energia=?,allow_match=?,allow_divulgar=?,foto_path=COALESCE(?,foto_path),share_token=? WHERE id=?`)
        .run(profile.profileId, profile.profileName, Number(q1), Number(q2), Number(q3), Number(q4), profile.energia,
          allow_match ? 1 : 0, allow_divulgar ? 1 : 0, foto_path, share_token, existing.id);
      const updated = db.prepare('SELECT * FROM profiles WHERE id=?').get(existing.id);
      return res.json({ id: updated.id, share_token: updated.share_token, share_url: `/p/${updated.share_token}`, ...profile });
    }
  }

  const result = db.prepare(`INSERT INTO profiles (user_id,profile_id,profile_name,q1,q2,q3,q4,energia,allow_match,allow_divulgar,foto_path,share_token) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(req.user?.id || null, profile.profileId, profile.profileName, Number(q1), Number(q2), Number(q3), Number(q4), profile.energia,
      allow_match ? 1 : 0, allow_divulgar ? 1 : 0, foto_path, share_token);

  res.status(201).json({ id: result.lastInsertRowid, share_token, share_url: `/p/${share_token}`, ...profile });
});

// Meu perfil (autenticado)
router.get('/me', authMiddleware, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profiles WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
  if (!row) return res.status(404).json({ error: 'Perfil não encontrado' });
  res.json({ ...row, ...buildProfile(row.q1, row.q2, row.q3, row.q4) });
});

// Perfil público por token
router.get('/token/:token', optionalAuth, (req, res) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM profiles WHERE share_token=?').get(req.params.token);
  if (!row) return res.status(404).json({ error: 'Perfil não encontrado' });
  const profile = buildProfile(row.q1, row.q2, row.q3, row.q4);

  // Verificar se já deu like / se é match
  let liked = false, matched = false;
  if (req.user) {
    const mine = db.prepare('SELECT id FROM profiles WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(req.user.id);
    if (mine && mine.id !== row.id) {
      liked = !!db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(mine.id, row.id);
      matched = liked && !!db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(row.id, mine.id);
    }
  }

  res.json({ id: row.id, share_token: row.share_token, allow_match: row.allow_match, allow_divulgar: row.allow_divulgar,
    foto_path: row.foto_path, created_at: row.created_at, liked, matched, ...profile });
});

router.post('/calculate', (req, res) => {
  const { q1, q2, q3, q4 } = req.body;
  if (!q1 || !q2 || !q3 || !q4) return res.status(400).json({ error: 'Respostas incompletas' });
  res.json(buildProfile(Number(q1), Number(q2), Number(q3), Number(q4)));
});

module.exports = router;
module.exports.buildProfile = buildProfile;
module.exports.calcScore = calcScore;
