import { AuthRepository, AuthenticatedStaff } from '../../domain/repositories/AuthRepository';
import ApiClient from '../api/ApiClient';

const AUTH_BASE_PATH = '/api/v1/auth';

interface UserResponse {
  uid: string;
  name: string;
  merchant_id: string;
}

const toAuthenticatedStaff = (user: UserResponse): AuthenticatedStaff => ({
  uid: user.uid,
  name: user.name,
  merchantId: user.merchant_id,
});

export class ApiAuthRepository implements AuthRepository {
  public async login(username: string, pin: string): Promise<{ staff: AuthenticatedStaff }> {
    const response = await ApiClient.post(`${AUTH_BASE_PATH}/login`, { username, pin });
    return { staff: toAuthenticatedStaff(response.data.data.user) };
  }

  public async logout(): Promise<void> {
    await ApiClient.post(`${AUTH_BASE_PATH}/logout`);
  }

  public async getSession(): Promise<AuthenticatedStaff | null> {
    try {
      const response = await ApiClient.get(`${AUTH_BASE_PATH}/me`);
      return toAuthenticatedStaff(response.data.data.user);
    } catch {
      return null;
    }
  }
}
