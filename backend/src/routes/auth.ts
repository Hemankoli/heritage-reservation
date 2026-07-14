import { Router } from 'express';
import type { Request, Response } from 'express';
import { register, login } from '../controllers/authController';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    path: '/',
  });
  res.json({ message: 'Logged out' });
});
export default router;
