import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  FeedbackService,
  Feedback,
  Recommendation,
  RECOMMENDATION_LABELS,
} from '@core/services/feedback.service';

@Component({
  selector: 'app-candidate-feedback',
  imports: [DatePipe],
  templateUrl: './feedback.html',
})
export class CandidateFeedback implements OnInit {
  protected readonly Recommendation = Recommendation;
  protected readonly recommendationLabels = RECOMMENDATION_LABELS;

  private readonly feedbackService = inject(FeedbackService);

  protected readonly loading = signal(true);
  protected readonly items = signal<Feedback[]>([]);

  ngOnInit(): void {
    this.feedbackService.list({ take: 100 }).subscribe({
      next: (result) => {
        this.items.set(result.data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }
}
