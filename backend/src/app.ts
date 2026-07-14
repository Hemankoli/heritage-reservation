import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
const compression = require('compression') as () => express.RequestHandler;
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import authRoutes from './routes/auth';
import siteRoutes from './routes/sites';
import slotRoutes from './routes/slots';
import reservationRoutes from './routes/reservations';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
  app.use(compression());
  app.use(morgan('dev'));
  app.use(express.json({ limit: '10kb' }));
  app.use(cookieParser());

  app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 200, standardHeaders: true, legacyHeaders: false }));

  app.get('/api/health', (_req, res) => { res.json({ status: 'ok' }); });
  app.use('/api/auth', authRoutes);
  app.use('/api/sites', siteRoutes);
  app.use('/api/sites', slotRoutes);
  app.use('/api/reservations', reservationRoutes);

  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  return app;
}
