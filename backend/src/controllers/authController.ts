import type { Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { signToken } from '../services/jwtService';

const registerSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { name, email, password } = parsed.data;
  const existing = await User.findOne({ email });
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }
  const user = await User.create({ name, email, password });
  const token = signToken({ sub: user._id.toString(), email: user.email, role: user.role });
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.status(201).json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors });
    return;
  }
  const { email, password } = parsed.data;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }
  const token = signToken({ sub: user._id.toString(), email: user.email, role: user.role });
  res.cookie('auth_token', token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
}
