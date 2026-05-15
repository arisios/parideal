const express = require('express');
const { getDb } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');
const { calcScore, buildProfile } = require('./profiles');

const router = express.Router();

function getMyProfile(userId) {
  return getDb().prepare('SELECT * FROM profiles WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(userId);
}

// Listar perfis compatíveis
router.get('/', authMiddleware, (req, res) => {
  const db = getDb();
  const mine = getMyProfile(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Crie seu perfil primeiro' });

  // Todos os perfis que autorizam divulgação e match, exceto o próprio
  const others = db.prepare(`
    SELECT * FROM profiles
    WHERE allow_divulgar = 1 AND allow_match = 1 AND id != ?
    ORDER BY created_at DESC
  `).all(mine.id);

  // Calcular score e verificar likes mútuos
  const result = others.map(o => {
    const score = calcScore(mine, o);
    const liked = !!db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(mine.id, o.id);
    const matched = liked && !!db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(o.id, mine.id);
    return {
      id: o.id, share_token: o.share_token, energia: o.energia,
      profile_name: o.profile_name, foto_path: o.foto_path,
      score, liked, matched,
      ...buildProfile(o.q1, o.q2, o.q3, o.q4),
    };
  }).sort((a, b) => b.score - a.score);

  res.json({ matches: result, myProfileId: mine.id });
});

// Dar like num perfil
router.post('/:profileId/like', authMiddleware, (req, res) => {
  const db = getDb();
  const mine = getMyProfile(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Crie seu perfil primeiro' });

  const targetId = parseInt(req.params.profileId);
  if (mine.id === targetId) return res.status(400).json({ error: 'Não pode curtir o próprio perfil' });

  try {
    db.prepare('INSERT OR IGNORE INTO likes (from_profile_id, to_profile_id) VALUES (?,?)').run(mine.id, targetId);
  } catch {}

  // Verificar match mútuo
  const mutual = !!db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(targetId, mine.id);
  res.json({ success: true, matched: mutual });
});

// Remover like
router.delete('/:profileId/like', authMiddleware, (req, res) => {
  const db = getDb();
  const mine = getMyProfile(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Perfil não encontrado' });
  db.prepare('DELETE FROM likes WHERE from_profile_id=? AND to_profile_id=?').run(mine.id, parseInt(req.params.profileId));
  res.json({ success: true });
});

// Matches mútuos (onde os dois se curtiram)
router.get('/mutual', authMiddleware, (req, res) => {
  const db = getDb();
  const mine = getMyProfile(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Crie seu perfil primeiro' });

  const mutuals = db.prepare(`
    SELECT p.*
    FROM likes l1
    JOIN likes l2 ON l1.from_profile_id = l2.to_profile_id AND l1.to_profile_id = l2.from_profile_id
    JOIN profiles p ON p.id = l1.to_profile_id
    WHERE l1.from_profile_id = ?
  `).all(mine.id);

  const result = mutuals.map(o => ({
    id: o.id, share_token: o.share_token, energia: o.energia,
    profile_name: o.profile_name, foto_path: o.foto_path,
    score: calcScore(mine, o),
    unread: db.prepare('SELECT COUNT(*) as c FROM messages WHERE from_profile_id=? AND to_profile_id=? AND read=0').get(o.id, mine.id)?.c || 0,
  }));

  res.json({ matches: result, myProfileId: mine.id });
});

module.exports = router;
