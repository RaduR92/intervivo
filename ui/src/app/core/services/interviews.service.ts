import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { PersonSummary } from '@core/models/person-summary.model';

export type InterviewStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

export interface InterviewSession {
  id: string;
  candidate: PersonSummary;
  interviewer: PersonSummary;
  scheduledAt: string;
  durationMinutes: number;
  position: string;
  status: InterviewStatus;
  meetingLink: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PaginatedInterviewSessions {
  data: InterviewSession[];
  total: number;
  take: number;
  skip: number;
}

export interface CreateInterviewSessionPayload {
  candidateId: string;
  interviewerId: string;
  scheduledAt: string;
  durationMinutes: number;
  position: string;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateInterviewSessionPayload {
  interviewerId?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  position?: string;
  status?: InterviewStatus;
  meetingLink?: string;
  notes?: string;
}

export interface ListInterviewSessionsParams {
  section?: 'upcoming' | 'history';
  candidateId?: string;
  take?: number;
  skip?: number;
}

/**
 * Used by both roles: HR schedules/manages sessions for any candidate, a
 * CANDIDATE only ever sees their own (the backend enforces that scoping —
 * this service just passes through whatever params it's given).
 */
@Injectable({ providedIn: 'root' })
export class InterviewsService {
  private readonly http = inject(HttpClient);

  list(params: ListInterviewSessionsParams = {}): Observable<PaginatedInterviewSessions> {
    let httpParams = new HttpParams();
    if (params.section) httpParams = httpParams.set('section', params.section);
    if (params.candidateId) httpParams = httpParams.set('candidateId', params.candidateId);
    if (params.take !== undefined) httpParams = httpParams.set('take', params.take);
    if (params.skip !== undefined) httpParams = httpParams.set('skip', params.skip);

    return this.http.get<PaginatedInterviewSessions>(`${API_BASE_URL}/interviews`, {
      withCredentials: true,
      params: httpParams,
    });
  }

  get(id: string): Observable<InterviewSession> {
    return this.http.get<InterviewSession>(`${API_BASE_URL}/interviews/${id}`, {
      withCredentials: true,
    });
  }

  create(payload: CreateInterviewSessionPayload): Observable<InterviewSession> {
    return this.http.post<InterviewSession>(`${API_BASE_URL}/interviews`, payload, {
      withCredentials: true,
    });
  }

  update(id: string, payload: UpdateInterviewSessionPayload): Observable<InterviewSession> {
    return this.http.patch<InterviewSession>(`${API_BASE_URL}/interviews/${id}`, payload, {
      withCredentials: true,
    });
  }
}
