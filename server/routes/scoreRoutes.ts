import { Router } from 'express';
import { queries } from '../db.js';
import { requireAuth, type AuthRequest } from '../auth.js';

export const scoreRouter = Router();

scoreRouter.post('/', requireAuth, (req: AuthRequest, res) => {
  const { score } = req.body ?? {};
  if (typeof score !== 'number') {
    res.status(400).json({ error: 'Score must be a number' });
    return;
  }
  queries.insertScore.run(req.user!.id, score);
  const saved = queries.getScoresByUser.all(req.user!.id)[0];
  res.status(201).json({ id: saved.id, score: saved.score, played_at: saved.played_at });
});

scoreRouter.get('/me', requireAuth, (req: AuthRequest, res) => {
  const scores = queries.getScoresByUser.all(req.user!.id);
  const bestRow = queries.getBestScore.get(req.user!.id);
  res.json({ scores, best: bestRow?.best ?? null });
});
