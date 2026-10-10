import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { LoginUseCase } from '../../application/usecases/LoginUseCase';
import { GetProfileUseCase } from '../../application/usecases/GetProfileUseCase';
import { ValidationError } from '../../application/errors/ValidationError';
import { ServiceError } from '../../application/errors/ServiceError';
import { ACCESS_TOKEN_MAX_AGE_MS } from '../../domain/constants/token';
import { loginSchema } from '../dtos/request/LoginRequestDto';
import { LoginResponseDto, ProfileResponseDto, toProfileResponseDto, toUserResponseDto } from '../dtos/response/AuthResponseDto';
import { Ok } from '../dtos/response/Ok';

const COOKIE_NAME = 'token';

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
});

export class AuthController {
  constructor(
    private loginUseCase: LoginUseCase,
    private getProfileUseCase: GetProfileUseCase,
  ) {}

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw ValidationError.ErrInvalidRequest(this.toDetails(parsed.error));
      }

      const result = await this.loginUseCase.execute(parsed.data.username, parsed.data.pin);

      res.cookie(COOKIE_NAME, result.token, { ...cookieOptions(), maxAge: ACCESS_TOKEN_MAX_AGE_MS });

      const ok = Ok.success<LoginResponseDto>({ token: result.token, user: toUserResponseDto(result.user) });
      res.status(ok.httpStatus).json(ok.toBody());
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      res.clearCookie(COOKIE_NAME, cookieOptions());

      const ok = Ok.success();
      res.status(ok.httpStatus).json(ok.toBody());
    } catch (error) {
      next(error);
    }
  }

  async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.auth) throw ServiceError.ErrTokenInvalide();

      const staff = await this.getProfileUseCase.execute(req.auth.uid);

      const ok = Ok.success<ProfileResponseDto>(toProfileResponseDto(staff));
      res.status(ok.httpStatus).json(ok.toBody());
    } catch (error) {
      next(error);
    }
  }

  private toDetails(error: ZodError): string {
    return error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`).join('; ');
  }
}
