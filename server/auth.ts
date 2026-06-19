import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';

export function signToken(userId: number, username: string): string {
  return jwt.sign({ sub: userId, username }, SECRET, { expiresIn: '7d' });
}

export interface AuthRequest extends Request {
  user?: { id: number; username: string };
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(header.slice(7), SECRET) as { sub: number; username: string };
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
