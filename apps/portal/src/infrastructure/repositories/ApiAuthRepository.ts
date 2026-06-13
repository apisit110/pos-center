import { AuthRepository } from '../../domain/repositories/AuthRepository';
import ApiClient from '../api/ApiClient';

export class ApiAuthRepository implements AuthRepository {
  public async login(username: string, password: string): Promise<{ token: string }> {
    const response = await ApiClient.post('/login', { username, password });
    const { token } = response.data;
    
    // Store token in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
    
    return { token };
  }
}
