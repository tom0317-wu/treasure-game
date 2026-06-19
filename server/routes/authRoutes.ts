import { Router } from 'express';
import bcrypt from 'bcrypt';
import { queries } from '../db.js';
import { signToken } from '../auth.js';

export const authRouter = Router();

authRouter.post('/signup', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const existing = queries.findUserByUsername.get(username.trim());
  if (existing) {
    res.status(409).json({ error: 'Username already taken' });
    return;
  }
  const hashed = await bcrypt.hash(password, 10);
  queries.createUser.run(username.trim(), hashed);
  const user = queries.findUserByUsername.get(username.trim())!;
  const token = signToken(user.id, user.username);
  res.status(201).json({ token, username: user.username });
});

authRouter.post('/signin', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username?.trim() || !password?.trim()) {
    res.status(400).json({ error: 'Username and password required' });
    return;
  }
  const user = queries.findUserByUsername.get(username.trim());
  if (!user) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = signToken(user.id, user.username);
  res.status(200).json({ token, username: user.username });
});
