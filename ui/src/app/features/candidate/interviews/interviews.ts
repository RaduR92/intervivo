import { Component, OnInit, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { InterviewsService, InterviewSession } from '@core/services/interviews.service';
import { InterviewSessionsTable } from '@shared/components/interview-sessions-table/interview-sessions-table';

@Component({
  selector: 'app-candidate-interviews',
  imports: [InterviewSessionsTable],
  templateUrl: './interviews.html',
})
export class CandidateInterviews implements OnInit {
  private readonly interviewsService = inject(InterviewsService);

  protected readonly loading = signal(true);
  protected readonly upcoming = signal<InterviewSession[]>([]);
  protected readonly history = signal<InterviewSession[]>([]);

  ngOnInit(): void {
    forkJoin({
      upcoming: this.interviewsService.list({ section: 'upcoming', take: 100 }),
      history: this.interviewsService.list({ section: 'history', take: 100 }),
    }).subscribe({
      next: ({ upcoming, history }) => {
        this.upcoming.set(upcoming.data);
        this.history.set(history.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
