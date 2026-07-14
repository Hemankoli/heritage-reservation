import type { JwtPayload } from '../services/jwtService';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
