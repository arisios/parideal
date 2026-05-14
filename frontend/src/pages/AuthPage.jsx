import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BandeirinhaSVG } from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [modo, setModo] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: '', instagram: '', phone: '', password: '', identifier: ''
  });

  function atualizar(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function submeter(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let res;
      if (modo === 'login') {
        res = await api.post('/auth/login', {
          identifier: form.identifier,
          password: form.password,
        });
      } else {
        if (!form.name.trim()) return toast.error('Informe seu nome');
        if (!form.instagram && !form.phone) return toast.error('Informe @instagram ou telefone');
        res = await api.post('/auth/register', {
          name: form.name,
          instagram: form.instagram,
          phone: form.phone,
          password: form.password,
        });
      }

      login(res.data.token, res.data.user);
      toast.success(modo === 'login' ? 'Bem-vindo(a)! 🎉' : 'Conta criada! 🎉');
      navigate(res.data.user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      <div className="w-full overflow-hidden">
        <BandeirinhaSVG className="w-full h-8" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="text-4xl mb-2">💜</div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#4B1E6D' }}>
              Parideal
            </h1>
            <p className="text-sm mt-1" style={{ color: '#8a6070' }}>
              {modo === 'login' ? 'Entre na sua conta' : 'Crie sua conta junina'}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden mb-6 border" style={{ borderColor: 'rgba(111,45,168,0.2)' }}>
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => setModo(m)}
                className="flex-1 py-2.5 text-sm font-semibold transition-all"
                style={{
                  background: modo === m ? '#6F2DA8' : 'white',
                  color: modo === m ? 'white' : '#6F2DA8',
                }}
              >
                {m === 'login' ? 'Entrar' : 'Cadastrar'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={submeter} className="card-parideal p-5 flex flex-col gap-4">
            {modo === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6F2DA8' }}>Nome</label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={atualizar}
                    placeholder="Seu nome completo"
                    className="input-junina"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6F2DA8' }}>@Instagram</label>
                  <input
                    name="instagram"
                    value={form.instagram}
                    onChange={atualizar}
                    placeholder="@seuperfil (opcional)"
                    className="input-junina"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#6F2DA8' }}>Telefone</label>
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={atualizar}
                    placeholder="(21) 99999-9999 (opcional)"
                    className="input-junina"
                  />
                </div>
              </>
            )}

            {modo === 'login' && (
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#6F2DA8' }}>@Instagram ou Telefone</label>
                <input
                  name="identifier"
                  value={form.identifier}
                  onChange={atualizar}
                  placeholder="@instagram ou telefone"
                  className="input-junina"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#6F2DA8' }}>Senha</label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={atualizar}
                placeholder="Mínimo 6 caracteres"
                className="input-junina"
                required
                minLength={6}
              />
            </div>

            <button type="submit" disabled={loading} className="btn-magenta w-full mt-2">
              {loading ? <LoadingSpinner size="sm" /> : (modo === 'login' ? 'Entrar 💜' : 'Criar conta ✨')}
            </button>
          </form>

          <div className="text-center mt-4">
            <button
              onClick={() => navigate('/')}
              className="text-sm underline"
              style={{ color: '#8a6070' }}
            >
              ← Voltar ao início
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
