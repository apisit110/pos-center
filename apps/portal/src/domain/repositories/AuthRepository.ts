export interface AuthenticatedStaff {
  uid: string;
  name: string;
  merchantId: string;
}

export interface AuthRepository {
  login(username: string, pin: string): Promise<{ staff: AuthenticatedStaff }>;
  logout(): Promise<void>;
  getSession(): Promise<AuthenticatedStaff | null>;
}
