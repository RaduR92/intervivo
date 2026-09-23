import { Injectable, inject } from '@angular/core';
import { Observable, forkJoin, map } from 'rxjs';
import { CandidatesService } from './candidates.service';
import { InterviewsService, InterviewSession, InterviewStatus } from './interviews.service';
import { FeedbackService, Feedback, Recommendation } from './feedback.service';

export interface HrStats {
  totalCandidates: number;
  sessionsTotal: number;
  scheduledCount: number;
  inProgressCount: number;
  completedCount: number;
  cancelledCount: number;
  avgScore: number | null;
  hireRate: number | null;
  evaluatedCount: number;
  /**
   * Raw batches (capped at BATCH_SIZE, the API's own max `take`) behind the
   * aggregates above, for callers that need to slice/group further
   * (recent/upcoming lists, per-type or per-candidate breakdowns) without a
   * second round-trip. Counts above come from each endpoint's own `total`,
   * so they stay correct even when a dataset exceeds this cap — only charts
   * built from these raw arrays are subject to it.
   */
  sessions: InterviewSession[];
  feedback: Feedback[];
}

// The API rejects `take` above 100 (see ListInterviewSessionsQueryDto /
// ListFeedbackQueryDto) — this is the largest batch a single request can
// pull down.
const BATCH_SIZE = 100;

/**
 * Shared aggregation for the HR dashboard and reports pages, so the two
 * never drift on how "avg score" or "hire rate" are defined.
 */
@Injectable({ providedIn: 'root' })
export class HrStatsService {
  private readonly candidatesService = inject(CandidatesService);
  private readonly interviewsService = inject(InterviewsService);
  private readonly feedbackService = inject(FeedbackService);

  load(): Observable<HrStats> {
    return forkJoin({
      candidatesCount: this.candidatesService.list({ take: 1 }),
      sessionsCount: this.interviewsService.list({ take: 1 }),
      scheduled: this.interviewsService.list({ take: 1, status: InterviewStatus.SCHEDULED }),
      inProgress: this.interviewsService.list({ take: 1, status: InterviewStatus.IN_PROGRESS }),
      completed: this.interviewsService.list({ take: 1, status: InterviewStatus.COMPLETED }),
      cancelled: this.interviewsService.list({ take: 1, status: InterviewStatus.CANCELLED }),
      sessions: this.interviewsService.list({ take: BATCH_SIZE }),
      feedback: this.feedbackService.list({ take: BATCH_SIZE }),
    }).pipe(
      map((result) => {
        const feedback = result.feedback.data;
        const ratings = feedback.map((f) => f.rating).filter((r): r is number => r !== null);
        const avgScore = ratings.length
          ? ratings.reduce((sum, r) => sum + r, 0) / ratings.length
          : null;
        const hireCount = feedback.filter((f) => f.recommendation === Recommendation.HIRE).length;
        const hireRate = feedback.length ? Math.round((hireCount / feedback.length) * 100) : null;

        return {
          totalCandidates: result.candidatesCount.total,
          sessionsTotal: result.sessionsCount.total,
          scheduledCount: result.scheduled.total,
          inProgressCount: result.inProgress.total,
          completedCount: result.completed.total,
          cancelledCount: result.cancelled.total,
          avgScore,
          hireRate,
          evaluatedCount: feedback.length,
          sessions: result.sessions.data,
          feedback,
        };
      }),
    );
  }
}
