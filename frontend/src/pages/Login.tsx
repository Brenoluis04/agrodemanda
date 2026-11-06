import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sprout, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { login } from '../api';
import { useAuth } from '../context/AuthContext';

export function Login() {
  const { setUser } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@agrodemanda.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await login(email, password);
      localStorage.setItem('agro_token', r.access_token);
      setUser(r.user);
      nav('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-art">
        <div className="brand inverse">
          <span className="brand-mark">
            <Sprout />
          </span>
          <span>
            AGRO<span>DEMANDA</span>
          </span>
        </div>
        <div className="art-copy">
          <span className="eyebrow">GESTÃO RURAL INTELIGENTE</span>
          <h1>A demanda da comunidade na palma da mão.</h1>
          <p>
            Conectando agricultores, associações e a Secretaria para fortalecer o desenvolvimento
            rural.
          </p>
        </div>
        <div className="art-footer">Santa Cruz do Capibaribe · Pernambuco</div>
      </div>

      <div className="login-panel">
        <div className="login-card">
          <div className="mobile-brand brand">
            <span className="brand-mark">
              <Sprout />
            </span>
            AGRODEMANDA
          </div>
          <span className="eyebrow green">BEM-VINDO DE VOLTA</span>
          <h2>Acesse sua conta</h2>
          <p className="muted">Entre para acompanhar e gerenciar as demandas rurais.</p>

          <form onSubmit={submit}>
            <label>
              E-mail
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label>
              Senha
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </label>
            {error && <div className="error">{error}</div>}
            <button className="btn primary full" disabled={busy}>
              {busy ? 'Entrando...' : 'Entrar na plataforma'} <ArrowUpRight size={17} />
            </button>
          </form>

          <div className="demo-note">
            <ShieldCheck size={16} />
            <span>Ambiente demonstrativo · credenciais iniciais no README</span>
          </div>
        </div>
      </div>
    </div>
  );
}
