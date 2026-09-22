import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../config/api.config';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let httpClient: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('queues concurrent 401s behind a single refresh call, then retries each', () => {
    const results: unknown[] = [];
    httpClient.get(`${API_BASE_URL}/a`).subscribe((r) => results.push(r));
    httpClient.get(`${API_BASE_URL}/b`).subscribe((r) => results.push(r));
    httpClient.get(`${API_BASE_URL}/c`).subscribe((r) => results.push(r));

    httpMock
      .expectOne(`${API_BASE_URL}/a`)
      .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${API_BASE_URL}/b`)
      .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });
    httpMock
      .expectOne(`${API_BASE_URL}/c`)
      .flush('unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Exactly one refresh call, even though three requests 401'd concurrently —
    // this is the mutex. httpMock.expectOne throws if more than one is pending.
    httpMock
      .expectOne(`${API_BASE_URL}/auth/refresh`)
      .flush({ user: { id: '1', email: 'x@y.com' } });

    // Each original request is retried once the shared refresh resolves.
    httpMock.expectOne(`${API_BASE_URL}/a`).flush('ok-a');
    httpMock.expectOne(`${API_BASE_URL}/b`).flush('ok-b');
    httpMock.expectOne(`${API_BASE_URL}/c`).flush('ok-c');

    expect(results).toEqual(['ok-a', 'ok-b', 'ok-c']);
  });

  it('does not attempt a refresh for a 401 on the login endpoint itself', () => {
    let error: unknown;
    httpClient
      .post(`${API_BASE_URL}/auth/login`, {})
      .subscribe({ error: (err) => (error = err) });

    httpMock
      .expectOne(`${API_BASE_URL}/auth/login`)
      .flush('bad credentials', { status: 401, statusText: 'Unauthorized' });

    expect(error).toBeDefined();
    httpMock.verify(); // throws if a stray /auth/refresh request was made
  });
});
