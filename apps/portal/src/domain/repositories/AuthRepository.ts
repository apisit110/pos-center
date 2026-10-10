export interface AuthenticatedStaff {
  uid: string;
  name: string;
  role: string;
  merchantId: string;
}

export interface AuthRepository {
  login(username: string, pin: string): Promise<{ staff: AuthenticatedStaff }>;
  logout(): Promise<void>;
  getSession(): Promise<{ uid: string; role: string } | null>;
}
