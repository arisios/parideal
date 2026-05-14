const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const { initDb } = require('./database/db');

const authRoutes = require('./routes/auth');
const profilesRoutes = require('./routes/profiles');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3003;

app.set('trust proxy', 1);

const allowedOrigins = [
  'https://parideal.festasjuninasdorio.com',
  'http://localhost:5175',
  'http://localhost:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS: origem não permitida: ' + origin));
    }
  },
  credentials: true
}));

app.use(express.json({ limit: '1mb' }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'Muitas tentativas. Tente novamente em 15 minutos.' }
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' }
});

app.use('/api', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/admin', adminLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/profiles', profilesRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', app: 'Parideal - Encontre Seu Par', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada' });
});

initDb();
app.listen(PORT, () => {
  console.log(`🎪 Parideal rodando na porta ${PORT}`);
  console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
});
