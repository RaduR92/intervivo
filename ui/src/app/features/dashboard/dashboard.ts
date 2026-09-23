import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MessageService } from '@openng/optimus-ui/api';
import { HrStatsService } from '@core/services/hr-stats.service';
import {
  InterviewSession,
  InterviewStatus,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';
import { Feedback, Recommendation, RECOMMENDATION_LABELS } from '@core/services/feedback.service';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  protected readonly InterviewStatus = InterviewStatus;
  protected readonly Recommendation = Recommendation;
  protected readonly statusLabels = INTERVIEW_STATUS_LABELS;
  protected readonly typeLabels = INTERVIEW_TYPE_LABELS;
  protected readonly recommendationLabels = RECOMMENDATION_LABELS;

  private readonly hrStatsService = inject(HrStatsService);
  private readonly messageService = inject(MessageService);

  protected readonly loading = signal(true);

  protected readonly totalCandidates = signal(0);
  protected readonly sessionsTotal = signal(0);
  protected readonly scheduledCount = signal(0);
  protected readonly inProgressCount = signal(0);
  protected readonly completedCount = signal(0);

  protected readonly avgScore = signal<number | null>(null);
  protected readonly hireRate = signal<number | null>(null);
  protected readonly evaluatedCount = signal(0);

  protected readonly recentSessions = signal<InterviewSession[]>([]);
  protected readonly upcomingSessions = signal<InterviewSession[]>([]);
  protected readonly recentFeedback = signal<Feedback[]>([]);

  ngOnInit(): void {
    this.hrStatsService.load().subscribe({
      next: (stats) => {
        this.totalCandidates.set(stats.totalCandidates);
        this.sessionsTotal.set(stats.sessionsTotal);
        this.scheduledCount.set(stats.scheduledCount);
        this.inProgressCount.set(stats.inProgressCount);
        this.completedCount.set(stats.completedCount);
        this.avgScore.set(stats.avgScore);
        this.hireRate.set(stats.hireRate);
        this.evaluatedCount.set(stats.evaluatedCount);

        this.recentSessions.set(
          [...stats.sessions]
            .sort(
              (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
            )
            .slice(0, 6),
        );
        // `stats.sessions` is already ascending by scheduledAt (the backend's
        // default order), so filtering to SCHEDULED and taking the first 4
        // gives the same "soonest upcoming" set the dedicated
        // `section: 'upcoming'` endpoint would.
        this.upcomingSessions.set(
          stats.sessions.filter((s) => s.status === InterviewStatus.SCHEDULED).slice(0, 4),
        );
        // `stats.feedback` is already newest-first (the backend's default
        // order for this endpoint), so no re-sort needed here.
        this.recentFeedback.set(stats.feedback.slice(0, 4));

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load dashboard',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }

  protected ratingDotClass(rating: number): string {
    if (rating >= 8) return 'bg-green-500';
    if (rating >= 6) return 'bg-amber-500';
    return 'bg-red-500';
  }
}
