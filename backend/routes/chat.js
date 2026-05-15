const express = require('express');
const { getDb } = require('../database/db');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function getMyProfile(userId) {
  return getDb().prepare('SELECT * FROM profiles WHERE user_id=? ORDER BY created_at DESC LIMIT 1').get(userId);
}

function isMutualMatch(db, profileId1, profileId2) {
  const a = db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(profileId1, profileId2);
  const b = db.prepare('SELECT id FROM likes WHERE from_profile_id=? AND to_profile_id=?').get(profileId2, profileId1);
  return !!(a && b);
}

// Buscar mensagens com um match
router.get('/:profileId', authMiddleware, (req, res) => {
  const db = getDb();
  const mine = getMyProfile(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Perfil não encontrado' });

  const otherId = parseInt(req.params.profileId);
  if (!isMutualMatch(db, mine.id, otherId)) return res.status(403).json({ error: 'Sem match com este perfil' });

  // Marcar como lidas
  db.prepare('UPDATE messages SET read=1 WHERE from_profile_id=? AND to_profile_id=? AND read=0').run(otherId, mine.id);

  const messages = db.prepare(`
    SELECT m.*,
      CASE WHEN m.from_profile_id = ? THEN 1 ELSE 0 END as is_mine
    FROM messages m
    WHERE (m.from_profile_id=? AND m.to_profile_id=?) OR (m.from_profile_id=? AND m.to_profile_id=?)
    ORDER BY m.created_at ASC
  `).all(mine.id, mine.id, otherId, otherId, mine.id);

  const other = db.prepare('SELECT id, profile_name, energia, foto_path, share_token FROM profiles WHERE id=?').get(otherId);
  res.json({ messages, other, myProfileId: mine.id });
});

// Enviar mensagem
router.post('/:profileId', authMiddleware, (req, res) => {
  const db = getDb();
  const mine = getMyProfile(req.user.id);
  if (!mine) return res.status(404).json({ error: 'Perfil não encontrado' });

  const otherId = parseInt(req.params.profileId);
  if (!isMutualMatch(db, mine.id, otherId)) return res.status(403).json({ error: 'Sem match com este perfil' });

  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: 'Mensagem vazia' });
  if (content.length > 500) return res.status(400).json({ error: 'Mensagem muito longa (máx 500 caracteres)' });

  const result = db.prepare('INSERT INTO messages (from_profile_id, to_profile_id, content) VALUES (?,?,?)').run(mine.id, otherId, content.trim());
  const msg = db.prepare('SELECT * FROM messages WHERE id=?').get(result.lastInsertRowid);
  res.status(201).json({ ...msg, is_mine: 1 });
});

module.exports = router;
