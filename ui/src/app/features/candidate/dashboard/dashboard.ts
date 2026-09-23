import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { AuthService } from '@core/services/auth.service';
import { InterviewsService, InterviewSession } from '@core/services/interviews.service';
import { FeedbackService } from '@core/services/feedback.service';
import { CandidatesService, Candidate } from '@core/services/candidates.service';

@Component({
  selector: 'app-candidate-dashboard',
  imports: [RouterLink, DatePipe],
  templateUrl: './dashboard.html',
})
export class CandidateDashboard implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly interviewsService = inject(InterviewsService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly candidatesService = inject(CandidatesService);

  protected readonly loading = signal(true);
  protected readonly nextSession = signal<InterviewSession | null>(null);
  protected readonly upcomingCount = signal(0);
  protected readonly feedbackCount = signal(0);
  protected readonly profile = signal<Candidate | null>(null);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) {
      this.loading.set(false);
      return;
    }

    forkJoin({
      upcoming: this.interviewsService.list({ section: 'upcoming', take: 1 }),
      feedback: this.feedbackService.list({ take: 1 }),
      profile: this.candidatesService.get(userId),
    }).subscribe({
      next: ({ upcoming, feedback, profile }) => {
        this.nextSession.set(upcoming.data[0] ?? null);
        this.upcomingCount.set(upcoming.total);
        this.feedbackCount.set(feedback.total);
        this.profile.set(profile);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  protected get profileIncomplete(): boolean {
    return this.profile()?.profile.skills.length === 0;
  }
}
