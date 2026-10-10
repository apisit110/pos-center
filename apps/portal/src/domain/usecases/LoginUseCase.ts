import { AuthRepository, AuthenticatedStaff } from '../repositories/AuthRepository';

export class LoginUseCase {
  constructor(private authRepository: AuthRepository) {}

  public async execute(username: string, pin: string): Promise<{ staff: AuthenticatedStaff }> {
    if (!username || !pin) {
      throw new Error('Username and pin are required');
    }
    return this.authRepository.login(username, pin);
  }
}
