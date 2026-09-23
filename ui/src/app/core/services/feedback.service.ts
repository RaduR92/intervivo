import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { PersonSummary } from '@core/models/person-summary.model';

export const Recommendation = {
  HIRE: 'HIRE',
  NO_HIRE: 'NO_HIRE',
  MAYBE: 'MAYBE',
} as const;

export type Recommendation = (typeof Recommendation)[keyof typeof Recommendation];

export const RECOMMENDATION_LABELS: Record<Recommendation, string> = {
  HIRE: 'Hire',
  NO_HIRE: 'No Hire',
  MAYBE: 'Maybe',
};

export interface FeedbackSessionSummary {
  id: string;
  position: string;
  scheduledAt: string;
}

export interface Feedback {
  id: string;
  session: FeedbackSessionSummary;
  author: PersonSummary;
  rating: number | null;
  recommendation: Recommendation;
  comments: string;
  strengths: string | null;
  improvementAreas: string | null;
  isPublished: boolean;
  publishedAt: string | null;
  createdAt: string;
}

export interface PaginatedFeedback {
  data: Feedback[];
  total: number;
  take: number;
  skip: number;
}

export interface CreateFeedbackPayload {
  sessionId: string;
  rating?: number;
  recommendation: Recommendation;
  comments: string;
  strengths?: string;
  improvementAreas?: string;
  isPublished?: boolean;
}

export interface UpdateFeedbackPayload {
  rating?: number;
  recommendation?: Recommendation;
  comments?: string;
  strengths?: string;
  improvementAreas?: string;
  isPublished?: boolean;
}

export interface ListFeedbackParams {
  candidateId?: string;
  sessionId?: string;
  take?: number;
  skip?: number;
}

/**
 * Used by both roles: HR writes/publishes feedback for any candidate, a
 * CANDIDATE only ever sees their own published feedback — the backend
 * enforces that scoping, this service just passes params through.
 */
@Injectable({ providedIn: 'root' })
export class FeedbackService {
  private readonly http = inject(HttpClient);

  list(params: ListFeedbackParams = {}): Observable<PaginatedFeedback> {
    let httpParams = new HttpParams();
    if (params.candidateId) httpParams = httpParams.set('candidateId', params.candidateId);
    if (params.sessionId) httpParams = httpParams.set('sessionId', params.sessionId);
    if (params.take !== undefined) httpParams = httpParams.set('take', params.take);
    if (params.skip !== undefined) httpParams = httpParams.set('skip', params.skip);

    return this.http.get<PaginatedFeedback>(`${API_BASE_URL}/feedback`, {
      withCredentials: true,
      params: httpParams,
    });
  }

  get(id: string): Observable<Feedback> {
    return this.http.get<Feedback>(`${API_BASE_URL}/feedback/${id}`, {
      withCredentials: true,
    });
  }

  create(payload: CreateFeedbackPayload): Observable<Feedback> {
    return this.http.post<Feedback>(`${API_BASE_URL}/feedback`, payload, {
      withCredentials: true,
    });
  }

  update(id: string, payload: UpdateFeedbackPayload): Observable<Feedback> {
    return this.http.patch<Feedback>(`${API_BASE_URL}/feedback/${id}`, payload, {
      withCredentials: true,
    });
  }
}
