import React, { useState } from 'react';

export default function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
  const res = await fetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Erro ao fazer login');
      } else {
        onLogin();
      }
    } catch {
      setError('Erro de rede');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: '2rem auto' }}>
      <h2>Entrar</h2>
      <input
        type="email"
        placeholder="E-mail"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
        style={{ width: '100%', marginBottom: 8 }}
      />
      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
        minLength={6}
        style={{ width: '100%', marginBottom: 8 }}
      />
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <button type="submit" disabled={loading} style={{ width: '100%' }}>
        {loading ? 'Entrando...' : 'Entrar'}
      </button>
    </form>
  );
}
