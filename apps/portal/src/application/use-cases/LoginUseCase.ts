import { AuthRepository } from '../repositories/AuthRepository';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  public async execute(username: string, password: string): Promise<{ token: string }> {
    if (!username || !password) {
      throw new Error('Username and password are required');
    }
    return this.authRepository.login(username, password);
  }
}
