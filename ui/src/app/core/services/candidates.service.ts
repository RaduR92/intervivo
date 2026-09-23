import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@core/config/api.config';

export interface CandidateProfile {
  phone: string | null;
  currentRole: string | null;
  yearsExperience: number | null;
  targetRole: string | null;
  resumeUrl: string | null;
  notes: string | null;
  skills: string[];
}

export interface Candidate {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  createdAt: string;
  profile: CandidateProfile;
}

export interface PaginatedCandidates {
  data: Candidate[];
  total: number;
  take: number;
  skip: number;
}

export interface CreateCandidatePayload {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  phone?: string;
  currentRole?: string;
  yearsExperience?: number;
  targetRole?: string;
  resumeUrl?: string;
  notes?: string;
  skills: string[];
}

export interface UpdateCandidateProfilePayload {
  phone?: string;
  currentRole?: string;
  yearsExperience?: number;
  targetRole?: string;
  resumeUrl?: string;
  notes?: string;
  skills?: string[];
}

export interface ListCandidatesParams {
  take?: number;
  skip?: number;
}

/**
 * `/users/candidates` — list/create are HR-only server-side (list also
 * powers the future candidates directory). get/update work for HR (any
 * candidate) or a CANDIDATE fetching/editing themself — this service is
 * shared by both, the backend enforces who can touch what.
 */
@Injectable({ providedIn: 'root' })
export class CandidatesService {
  private readonly http = inject(HttpClient);

  list(params: ListCandidatesParams = {}): Observable<PaginatedCandidates> {
    let httpParams = new HttpParams();
    if (params.take !== undefined) httpParams = httpParams.set('take', params.take);
    if (params.skip !== undefined) httpParams = httpParams.set('skip', params.skip);

    return this.http.get<PaginatedCandidates>(`${API_BASE_URL}/users/candidates`, {
      withCredentials: true,
      params: httpParams,
    });
  }

  get(id: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${API_BASE_URL}/users/candidates/${id}`, {
      withCredentials: true,
    });
  }

  create(payload: CreateCandidatePayload): Observable<Candidate> {
    return this.http.post<Candidate>(`${API_BASE_URL}/users/candidates`, payload, {
      withCredentials: true,
    });
  }

  update(id: string, payload: UpdateCandidateProfilePayload): Observable<Candidate> {
    return this.http.patch<Candidate>(`${API_BASE_URL}/users/candidates/${id}`, payload, {
      withCredentials: true,
    });
  }
}
