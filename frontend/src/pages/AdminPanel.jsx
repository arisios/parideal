import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { BandeirinhaSVG } from '../components/Bandeirinhas';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AdminPanel() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('profiles');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    carregarDados();
  }, []);

  async function carregarDados() {
    setLoading(true);
    try {
      const [profRes, statsRes] = await Promise.all([
        api.get('/admin/profiles'),
        api.get('/admin/stats'),
      ]);
      setProfiles(profRes.data.profiles);
      setStats(statsRes.data);
    } catch (err) {
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dt) {
    return new Date(dt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }

  return (
    <div className="min-h-screen bg-parideal flex flex-col">
      <div className="w-full overflow-hidden">
        <BandeirinhaSVG className="w-full h-8" />
      </div>

      <div className="flex-1 px-4 py-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold" style={{ color: '#4B1E6D' }}>
              Painel Admin
            </h1>
            <p className="text-xs mt-0.5" style={{ color: '#8a6070' }}>Parideal · Juninas do Rio 2026</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="text-xs underline" style={{ color: '#6F2DA8' }}>
              Site
            </button>
            <button onClick={logout} className="text-xs underline" style={{ color: '#C21874' }}>
              Sair
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center mt-16">
            <LoadingSpinner size="lg" text="Carregando..." />
          </div>
        ) : (
          <>
            {/* Stats cards */}
            {stats && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                <div className="card-parideal p-4 text-center">
                  <div className="text-3xl font-bold" style={{ color: '#C21874' }}>{stats.total}</div>
                  <div className="text-xs mt-1" style={{ color: '#6F2DA8' }}>Total de Perfis</div>
                </div>
                <div className="card-parideal p-4 text-center">
                  <div className="text-3xl font-bold" style={{ color: '#6F2DA8' }}>{stats.withMatch}</div>
                  <div className="text-xs mt-1" style={{ color: '#6F2DA8' }}>Abertos para Match</div>
                </div>
                <div className="card-parideal p-4 text-center col-span-2 sm:col-span-1">
                  <div className="text-lg font-bold" style={{ color: '#007C91' }}>
                    {stats.byEnergia?.[0]?.energia || '—'}
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#6F2DA8' }}>Energia mais popular</div>
                </div>
              </div>
            )}

            {/* Por energia */}
            {stats?.byEnergia?.length > 0 && (
              <div className="card-parideal p-4 mb-6">
                <h3 className="font-semibold text-sm mb-3" style={{ color: '#4B1E6D' }}>Distribuição por Energia</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.byEnergia.map(({ energia, count }) => (
                    <div
                      key={energia}
                      className="px-3 py-1.5 rounded-full text-xs font-medium"
                      style={{ background: 'rgba(111,45,168,0.1)', color: '#4B1E6D' }}
                    >
                      {energia}: {count}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lista de perfis */}
            <div className="card-parideal overflow-hidden">
              <div className="p-4 border-b" style={{ borderColor: 'rgba(111,45,168,0.1)' }}>
                <h3 className="font-semibold text-sm" style={{ color: '#4B1E6D' }}>
                  Perfis Salvos ({profiles.length})
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(111,45,168,0.05)' }}>
                      {['ID', 'Perfil', 'Energia', 'Q1', 'Q2', 'Q3', 'Q4', 'Match', 'Data', 'Link'].map(col => (
                        <th
                          key={col}
                          className="text-left px-3 py-2 font-semibold"
                          style={{ color: '#6F2DA8' }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map((p) => (
                      <tr
                        key={p.id}
                        className="border-t transition-colors hover:bg-purple-50"
                        style={{ borderColor: 'rgba(111,45,168,0.06)' }}
                      >
                        <td className="px-3 py-2" style={{ color: '#8a6070' }}>#{p.id}</td>
                        <td className="px-3 py-2 font-medium" style={{ color: '#4B1E6D' }}>
                          {p.profile_name}
                        </td>
                        <td className="px-3 py-2" style={{ color: '#5a3040' }}>{p.energia}</td>
                        <td className="px-3 py-2" style={{ color: '#8a6070' }}>{p.q1}</td>
                        <td className="px-3 py-2" style={{ color: '#8a6070' }}>{p.q2}</td>
                        <td className="px-3 py-2" style={{ color: '#8a6070' }}>{p.q3}</td>
                        <td className="px-3 py-2" style={{ color: '#8a6070' }}>{p.q4}</td>
                        <td className="px-3 py-2">
                          {p.allow_match ? (
                            <span style={{ color: '#C21874' }}>✓</span>
                          ) : (
                            <span style={{ color: '#ccc' }}>—</span>
                          )}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap" style={{ color: '#8a6070' }}>
                          {formatDate(p.created_at)}
                        </td>
                        <td className="px-3 py-2">
                          {p.share_token && (
                            <a
                              href={`/p/${p.share_token}`}
                              target="_blank"
                              rel="noreferrer"
                              className="underline"
                              style={{ color: '#6F2DA8' }}
                            >
                              ver
                            </a>
                          )}
                        </td>
                      </tr>
                    ))}
                    {profiles.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-8" style={{ color: '#b09090' }}>
                          Nenhum perfil salvo ainda
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="w-full overflow-hidden rotate-180 mt-8">
        <BandeirinhaSVG className="w-full h-8" />
      </div>
    </div>
  );
}
