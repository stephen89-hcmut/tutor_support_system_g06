import { httpClient } from '@/lib/httpClient';
import { saveSession, loadSession, clearSession } from '@/lib/authStorage';
import type { AuthResponse, AuthSession, AppRole } from '@/types/auth';

class AuthService {
  async loginWithTicket(ticket: string, rememberMe: boolean): Promise<AuthSession> {
    const data = await httpClient.post<AuthResponse, { ticket: string }>('/Auth/login-sso', { ticket });

    const role = data.role as AppRole;
    const session: AuthSession = {
      userId: data.userId,
      email: data.email,
      fullName: data.fullName,
      role,
      accessToken: data.accessToken,
      accessTokenExpiresAt: data.accessTokenExpiresAt,
      refreshToken: data.refreshToken,
      refreshTokenExpiresAt: data.refreshTokenExpiresAt,
    };

    saveSession(session, rememberMe);
    return session;
  }

  getSession(): AuthSession | null {
    return loadSession();
  }

  logout() {
    clearSession();
  }
}

export const authService = new AuthService();




