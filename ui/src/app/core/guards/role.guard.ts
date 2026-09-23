import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService, Role } from '@core/services/auth.service';

function homeForRole(role: Role): string {
  return role === 'HR' ? '/dashboard' : '/candidate-home';
}

/**
 * Builds a route guard for a single role: resolves the current session
 * (using the already-loaded signal if present, otherwise a fresh /auth/me
 * call) before deciding, so a page refresh doesn't briefly render a
 * protected route while the session is still unknown. An unauthenticated
 * visitor is sent to login; an authenticated visitor of the wrong role is
 * sent to their own home rather than shown an error.
 */
function roleGuard(allowedRole: Role): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    const decide = (role: Role): true | UrlTree =>
      role === allowedRole ? true : router.createUrlTree([homeForRole(role)]);

    const current = auth.currentUser();
    if (current) {
      return of(decide(current.role));
    }

    return auth.fetchCurrentUser().pipe(
      map((user) => decide(user.role)),
      catchError(() => of(router.createUrlTree(['/auth/login']))),
    );
  };
}

export const hrGuard: CanActivateFn = roleGuard('HR');
export const candidateGuard: CanActivateFn = roleGuard('CANDIDATE');
