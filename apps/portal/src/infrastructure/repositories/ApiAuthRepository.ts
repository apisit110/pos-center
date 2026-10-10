import { AuthRepository, AuthenticatedStaff } from '../../domain/repositories/AuthRepository';
import ApiClient from '../api/ApiClient';

export class ApiAuthRepository implements AuthRepository {
  public async login(username: string, pin: string): Promise<{ staff: AuthenticatedStaff }> {
    const response = await ApiClient.post('/login', { username, pin });
    return { staff: response.data.staff };
  }

  public async logout(): Promise<void> {
    await ApiClient.post('/logout');
  }

  public async getSession(): Promise<{ uid: string; role: string } | null> {
    try {
      const response = await ApiClient.get('/me');
      return response.data.auth;
    } catch {
      return null;
    }
  }
}
