export interface AuthRepository {
  login(username: string, password: string): Promise<{ token: string }>;
}
