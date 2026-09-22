import type { AuthenticatedUser } from '@auth/interfaces/jwt-payload.interface.js';

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export {};
