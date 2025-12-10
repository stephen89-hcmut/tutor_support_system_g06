export interface AuthResponse {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}

export type AppRole = 'Student' | 'Tutor' | 'Manager';

export interface AuthSession {
  userId: string;
  email: string;
  fullName: string;
  role: AppRole;
  accessToken: string;
  accessTokenExpiresAt: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
}
