const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? '/api';

export async function signup(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Signup failed');
  return data as { token: string; username: string };
}

export async function signin(username: string, password: string) {
  const res = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? 'Sign in failed');
  return data as { token: string; username: string };
}

export async function saveScore(score: number, token: string) {
  const res = await fetch(`${BASE}/scores`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ score }),
  });
  if (!res.ok) throw new Error('Score save failed');
  return res.json();
}

export async function getMyScores(token: string) {
  const res = await fetch(`${BASE}/scores/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Failed to fetch scores');
  return res.json() as Promise<{
    scores: Array<{ score: number; played_at: string }>;
    best: number | null;
  }>;
}
