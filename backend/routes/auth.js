const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByLogin, createUser } = require('../../../../shared/users-db');
const { JWT_SECRET, authMiddleware } = require('../middleware/auth');

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, phone, instagram, password } = req.body;
  if (!password || password.length < 6) return res.status(400).json({ error: 'Senha deve ter pelo menos 6 caracteres' });
  if (!phone && !instagram) return res.status(400).json({ error: 'Informe @instagram ou telefone' });
  if (!name?.trim()) return res.status(400).json({ error: 'Informe seu nome' });

  try {
    const user = createUser({ instagram, phone, password, name: name.trim() });
    const token = jwt.sign(
      { id: user.id, name: user.name, instagram: user.instagram, phone: user.phone, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(409).json({ error: err.message });
  }
});

router.post('/login', (req, res) => {
  const { identifier, phone, instagram, password } = req.body;
  const login = identifier || phone || instagram;

  if (!login || !password) return res.status(400).json({ error: 'Preencha todos os campos' });

  const user = findUserByLogin(login);
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Credenciais incorretas' });
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, instagram: user.instagram, phone: user.phone, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ token, user: { id: user.id, name: user.name, instagram: user.instagram, phone: user.phone, role: user.role } });
});

router.get('/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
