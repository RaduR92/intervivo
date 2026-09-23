import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  ActivatedRouteSnapshot,
  provideRouter,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { firstValueFrom, Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { AuthService } from '@core/services/auth.service';
import { candidateGuard, hrGuard } from './role.guard';

describe('role guards', () => {
  let httpMock: HttpTestingController;
  let router: Router;
  const route = {} as ActivatedRouteSnapshot;
  const state = {} as RouterStateSnapshot;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    httpMock.verify();
  });

  function runGuard(guard: typeof hrGuard) {
    return TestBed.runInInjectionContext(() =>
      firstValueFrom(
        guard(route, state) as Observable<boolean | UrlTree>,
      ),
    );
  }

  it('lets an already-loaded HR user through hrGuard', async () => {
    TestBed.inject(AuthService).currentUser.set({
      id: '1',
      email: 'hr@test.internal',
      role: 'HR',
    });

    await expect(runGuard(hrGuard)).resolves.toBe(true);
  });

  it('redirects an already-loaded CANDIDATE away from hrGuard to their own home', async () => {
    TestBed.inject(AuthService).currentUser.set({
      id: '1',
      email: 'candidate@test.internal',
      role: 'CANDIDATE',
    });

    const result = await runGuard(hrGuard);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/candidate-home');
  });

  it('redirects an already-loaded HR user away from candidateGuard to their own home', async () => {
    TestBed.inject(AuthService).currentUser.set({
      id: '1',
      email: 'hr@test.internal',
      role: 'HR',
    });

    const result = await runGuard(candidateGuard);
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/dashboard');
  });

  it('resolves the session via /auth/me when nothing is loaded yet, then allows a matching role', async () => {
    const resultPromise = runGuard(hrGuard);

    httpMock
      .expectOne(`${API_BASE_URL}/auth/me`)
      .flush({ id: '1', email: 'hr@test.internal', role: 'HR' });

    await expect(resultPromise).resolves.toBe(true);
  });

  it('sends an unauthenticated visitor to /auth/login', async () => {
    const resultPromise = runGuard(hrGuard);

    httpMock
      .expectOne(`${API_BASE_URL}/auth/me`)
      .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    const result = await resultPromise;
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login');
  });
});
