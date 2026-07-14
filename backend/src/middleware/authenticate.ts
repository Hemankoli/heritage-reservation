import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/jwtService';

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  // Prefer HttpOnly cookie; fall back to Bearer header for API clients / backwards compat
  const cookieToken: string | undefined = req.cookies['auth_token'];
  const authHeader = req.headers.authorization;
  const token = cookieToken ?? (authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined);

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
