import {
  HttpClient,
  HttpErrorResponse,
  HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  switchMap,
  throwError,
} from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { AuthService } from '../services/auth.service';

// Module-level so it's shared across every call site of this interceptor —
// this is the mutex: concurrent 401s all await the SAME in-flight refresh
// instead of each firing their own, which would race the server into
// rotating the token multiple times for the same session.
let refresh$: Observable<unknown> | null = null;

function isAuthRoute(url: string): boolean {
  return (
    url.startsWith(`${API_BASE_URL}/auth/login`) ||
    url.startsWith(`${API_BASE_URL}/auth/refresh`)
  );
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const http = inject(HttpClient);
  const router = inject(Router);
  const authService = inject(AuthService);

  const request = req.url.startsWith(API_BASE_URL)
    ? req.clone({ withCredentials: true })
    : req;

  return next(request).pipe(
    catchError((error: unknown) => {
      const isUnauthorized =
        error instanceof HttpErrorResponse && error.status === 401;
      if (!isUnauthorized || isAuthRoute(request.url)) {
        return throwError(() => error);
      }

      if (!refresh$) {
        refresh$ = http
          .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
          .pipe(
            shareReplay(1),
            finalize(() => {
              refresh$ = null;
            }),
          );
      }

      return refresh$.pipe(
        switchMap(() => next(request)),
        catchError((refreshError: unknown) => {
          authService.clearSession();
          router.navigate(['/auth/login']);
          return throwError(() => refreshError);
        }),
      );
    }),
  );
};
