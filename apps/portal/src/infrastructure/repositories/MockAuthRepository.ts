import { AuthRepository } from '../../application/repositories/AuthRepository';

export class MockAuthRepository implements AuthRepository {
  public async login(username: string, password: string): Promise<{ token: string }> {
    // In a real app, this would call the portal-service
    // For now, we simulate the logic as requested
    if (username === 'admin' && password === 'admin') {
      return { token: 'mock-jwt-token-with-uid-admin-id-123' };
    }
    throw new Error('Invalid credentials');
  }
}
