import { Request, Response, NextFunction } from 'express';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { loginSchema } from '../dtos/request/LoginRequestDto';

const COOKIE_NAME = 'token';
const COOKIE_MAX_AGE_MS = 30 * 60 * 1000;

export class AuthController {
  constructor(private loginUseCase: LoginUseCase) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { username, pin } = loginSchema.parse(req.body);
      const result = await this.loginUseCase.execute(username, pin);

      res.cookie(COOKIE_NAME, result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: COOKIE_MAX_AGE_MS,
        path: '/',
      });

      res.status(200).json({ staff: result.staff });
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(COOKIE_NAME, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
      });
      res.status(200).json({ message: 'Logged out' });
    } catch (error) {
      next(error);
    }
  }
}
