import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export const Role = {
  HR: 'HR',
  CANDIDATE: 'CANDIDATE',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export interface CurrentUser {
  id: string;
  email: string;
  role: Role;
  // Only present on GET/PATCH /auth/me — login/refresh return the minimal
  // session identity without these.
  firstName?: string;
  lastName?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly currentUser = signal<CurrentUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);

  login(email: string, password: string): Observable<{ user: CurrentUser }> {
    return this.http
      .post<{ user: CurrentUser }>(
        `${API_BASE_URL}/auth/login`,
        { email, password },
        { withCredentials: true },
      )
      .pipe(tap(({ user }) => this.currentUser.set(user)));
  }

  logout(): Observable<{ success: boolean }> {
    return this.http
      .post<{ success: boolean }>(
        `${API_BASE_URL}/auth/logout`,
        {},
        { withCredentials: true },
      )
      .pipe(tap(() => this.currentUser.set(null)));
  }

  fetchCurrentUser(): Observable<CurrentUser> {
    return this.http
      .get<CurrentUser>(`${API_BASE_URL}/auth/me`, { withCredentials: true })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  updateCurrentUser(dto: {
    firstName?: string;
    lastName?: string;
  }): Observable<CurrentUser> {
    return this.http
      .patch<CurrentUser>(`${API_BASE_URL}/auth/me`, dto, {
        withCredentials: true,
      })
      .pipe(tap((user) => this.currentUser.set(user)));
  }

  requestPasswordReset(
    email: string,
  ): Observable<{ message: string; resetToken?: string }> {
    return this.http.post<{ message: string; resetToken?: string }>(
      `${API_BASE_URL}/auth/password-reset/request`,
      { email },
    );
  }

  confirmPasswordReset(
    token: string,
    newPassword: string,
  ): Observable<{ success: boolean }> {
    return this.http.post<{ success: boolean }>(
      `${API_BASE_URL}/auth/password-reset/confirm`,
      { token, newPassword },
    );
  }

  clearSession(): void {
    this.currentUser.set(null);
  }
}
