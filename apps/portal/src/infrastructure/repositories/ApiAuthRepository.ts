import { AuthRepository, AuthenticatedStaff } from '../../domain/repositories/AuthRepository';
import ApiClient, { API_V1, unwrap } from '../api/ApiClient';

const AUTH_BASE_PATH = `${API_V1}/auth`;

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
    const response = await ApiClient.post(
      `${AUTH_BASE_PATH}/login`,
      { username, pin },
      // the login screen shows Thai messages
      { headers: { 'Accept-Language': 'th' } },
    );
    return { staff: toAuthenticatedStaff(unwrap<{ user: UserResponse }>(response).user) };
  }

  public async logout(): Promise<void> {
    await ApiClient.post(`${AUTH_BASE_PATH}/logout`);
  }

  public async getSession(): Promise<AuthenticatedStaff | null> {
    try {
      const response = await ApiClient.get(`${AUTH_BASE_PATH}/me`);
      return toAuthenticatedStaff(unwrap<{ user: UserResponse }>(response).user);
    } catch {
      return null;
    }
  }
}
