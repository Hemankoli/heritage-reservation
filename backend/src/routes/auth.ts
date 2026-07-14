import { Router } from 'express';
import type { Request, Response } from 'express';
import { register, login } from '../controllers/authController';
import { env } from '../config/env';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', (_req: Request, res: Response) => {
  const isCrossOrigin = env.FRONTEND_URL.startsWith('https://');
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: isCrossOrigin,
    sameSite: isCrossOrigin ? 'none' : 'lax',
    path: '/',
  });
  res.json({ message: 'Logged out' });
});
export default router;
