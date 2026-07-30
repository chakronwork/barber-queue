'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'login failed');
        return;
      }

      router.push('/queues');
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 360, margin: '80px auto', padding: 16 }}>
      <h1>Login</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 12 }}>
        <input
          placeholder="username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          style={{ padding: 8 }}
        />

        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          style={{ padding: 8 }}
        />

        {error ? <p style={{ color: 'red' }}>{error}</p> : null}

        <button type="submit" disabled={loading} style={{ padding: 10 }}>
          {loading ? 'Loading...' : 'Login'}
        </button>
      </form>
    </main>
  );
}
