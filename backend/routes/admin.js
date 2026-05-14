const express = require('express');
const { getDb } = require('../database/db');
const { adminMiddleware } = require('../middleware/auth');
const { getAllUsers } = require('../../../../shared/users-db');

const router = express.Router();

// Listar todos os perfis
router.get('/profiles', adminMiddleware, (req, res) => {
  const db = getDb();
  const profiles = db.prepare(`
    SELECT * FROM profiles ORDER BY created_at DESC
  `).all();
  res.json({ profiles, total: profiles.length });
});

// Stats gerais
router.get('/stats', adminMiddleware, (req, res) => {
  const db = getDb();

  const total = db.prepare('SELECT COUNT(*) as count FROM profiles').get().count;
  const withMatch = db.prepare('SELECT COUNT(*) as count FROM profiles WHERE allow_match = 1').get().count;
  const byEnergia = db.prepare(`
    SELECT energia, COUNT(*) as count FROM profiles GROUP BY energia ORDER BY count DESC
  `).all();
  const byProfile = db.prepare(`
    SELECT profile_name, COUNT(*) as count FROM profiles GROUP BY profile_name ORDER BY count DESC LIMIT 10
  `).all();

  res.json({ total, withMatch, byEnergia, byProfile });
});

// Listar usuários do banco compartilhado
router.get('/users', adminMiddleware, (req, res) => {
  const users = getAllUsers();
  res.json({ users, total: users.length });
});

module.exports = router;
