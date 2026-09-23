import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';
import { PersonSummary } from '@core/models/person-summary.model';

export const InterviewStatus = {
  SCHEDULED: 'SCHEDULED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type InterviewStatus = (typeof InterviewStatus)[keyof typeof InterviewStatus];

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: 'Scheduled',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const InterviewType = {
  TECHNICAL: 'TECHNICAL',
  BEHAVIORAL: 'BEHAVIORAL',
  SYSTEM_DESIGN: 'SYSTEM_DESIGN',
  CASE_STUDY: 'CASE_STUDY',
  CULTURE_FIT: 'CULTURE_FIT',
} as const;

export type InterviewType = (typeof InterviewType)[keyof typeof InterviewType];

export const INTERVIEW_TYPE_LABELS: Record<InterviewType, string> = {
  TECHNICAL: 'Technical',
  BEHAVIORAL: 'Behavioral',
  SYSTEM_DESIGN: 'System Design',
  CASE_STUDY: 'Case Study',
  CULTURE_FIT: 'Culture Fit',
};

export interface InterviewSession {
  id: string;
  candidate: PersonSummary;
  interviewer: PersonSummary;
  scheduledAt: string;
  durationMinutes: number;
  position: string;
  type: InterviewType;
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
  type: InterviewType;
  meetingLink?: string;
  notes?: string;
}

export interface UpdateInterviewSessionPayload {
  interviewerId?: string;
  scheduledAt?: string;
  durationMinutes?: number;
  position?: string;
  type?: InterviewType;
  status?: InterviewStatus;
  meetingLink?: string;
  notes?: string;
}

export interface ListInterviewSessionsParams {
  section?: 'upcoming' | 'history';
  status?: InterviewStatus;
  type?: InterviewType;
  search?: string;
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
    if (params.status) httpParams = httpParams.set('status', params.status);
    if (params.type) httpParams = httpParams.set('type', params.type);
    if (params.search) httpParams = httpParams.set('search', params.search);
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
