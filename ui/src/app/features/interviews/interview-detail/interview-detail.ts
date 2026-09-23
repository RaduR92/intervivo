import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Textarea } from '@openng/optimus-ui/textarea';
import { Select } from '@openng/optimus-ui/select';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { Dialog } from '@openng/optimus-ui/dialog';
import { ToggleSwitch } from '@openng/optimus-ui/toggleswitch';
import { MessageService, PrimeTemplate } from '@openng/optimus-ui/api';
import { AuthService } from '@core/services/auth.service';
import {
  InterviewsService,
  InterviewSession,
  InterviewStatus,
  INTERVIEW_STATUS_LABELS,
  InterviewType,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';
import {
  FeedbackService,
  Feedback,
  Recommendation,
  RECOMMENDATION_LABELS,
} from '@core/services/feedback.service';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-interview-detail',
  imports: [
    Button,
    FormsModule,
    InputText,
    InputNumber,
    Textarea,
    Select,
    DatePicker,
    Dialog,
    ToggleSwitch,
    PrimeTemplate,
    DatePipe,
  ],
  templateUrl: './interview-detail.html',
})
export class InterviewDetail implements OnInit {
  protected readonly InterviewStatus = InterviewStatus;
  protected readonly Recommendation = Recommendation;
  protected readonly recommendationLabels = RECOMMENDATION_LABELS;
  protected readonly statusOptions = Object.values(InterviewStatus).map((value) => ({
    label: INTERVIEW_STATUS_LABELS[value],
    value,
  }));
  protected readonly typeOptions = Object.values(InterviewType).map((value) => ({
    label: INTERVIEW_TYPE_LABELS[value],
    value,
  }));
  protected readonly recommendationOptions = Object.values(Recommendation).map((value) => ({
    label: RECOMMENDATION_LABELS[value],
    value,
  }));

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly interviewsService = inject(InterviewsService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly messageService = inject(MessageService);

  protected readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly session = signal<InterviewSession | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);

  protected readonly scheduledAt = signal<Date | null>(null);
  protected readonly durationMinutes = signal<number | null>(null);
  protected readonly position = signal('');
  protected readonly type = signal<InterviewType>(InterviewType.TECHNICAL);
  protected readonly status = signal<InterviewStatus>(InterviewStatus.SCHEDULED);
  protected readonly meetingLink = signal('');
  protected readonly notes = signal('');

  protected readonly feedbackItems = signal<Feedback[]>([]);
  protected readonly loadingFeedback = signal(true);
  protected readonly myFeedback = computed(() => {
    const userId = this.auth.currentUser()?.id;
    return this.feedbackItems().find((item) => item.author.id === userId) ?? null;
  });

  protected readonly feedbackDialogOpen = signal(false);
  protected readonly savingFeedback = signal(false);
  protected readonly feedbackRating = signal<number | null>(null);
  protected readonly feedbackRecommendation = signal<Recommendation>(Recommendation.MAYBE);
  protected readonly feedbackComments = signal('');
  protected readonly feedbackStrengths = signal('');
  protected readonly feedbackImprovementAreas = signal('');
  protected readonly feedbackPublished = signal(false);

  ngOnInit(): void {
    this.loadSession();
    this.loadFeedback();
  }

  private loadSession(): void {
    this.loading.set(true);
    this.interviewsService.get(this.id).subscribe({
      next: (session) => {
        this.session.set(session);
        this.scheduledAt.set(new Date(session.scheduledAt));
        this.durationMinutes.set(session.durationMinutes);
        this.position.set(session.position);
        this.type.set(session.type);
        this.status.set(session.status);
        this.meetingLink.set(session.meetingLink ?? '');
        this.notes.set(session.notes ?? '');
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load interview',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }

  private loadFeedback(): void {
    this.loadingFeedback.set(true);
    this.feedbackService.list({ sessionId: this.id, take: 50 }).subscribe({
      next: (result) => {
        this.feedbackItems.set(result.data);
        this.loadingFeedback.set(false);
      },
      error: (error: unknown) => {
        this.loadingFeedback.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load feedback',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }

  protected back(): void {
    this.router.navigate(['/interviews']);
  }

  protected get canSaveSession(): boolean {
    return !!this.durationMinutes() && !!this.scheduledAt() && this.position().trim().length > 0;
  }

  protected saveSession(): void {
    const durationMinutes = this.durationMinutes();
    const scheduledAt = this.scheduledAt();
    if (!durationMinutes || !scheduledAt || !this.canSaveSession) return;

    this.saving.set(true);
    this.interviewsService
      .update(this.id, {
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes,
        position: this.position().trim(),
        type: this.type(),
        status: this.status(),
        meetingLink: this.meetingLink().trim() || undefined,
        notes: this.notes().trim() || undefined,
      })
      .subscribe({
        next: (session) => {
          this.session.set(session);
          this.saving.set(false);
          this.messageService.add({ severity: 'success', summary: 'Interview updated' });
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Could not update interview',
            detail: getApiErrorMessage(error),
          });
        },
      });
  }

  protected openFeedbackDialog(): void {
    const mine = this.myFeedback();
    this.feedbackRating.set(mine?.rating ?? null);
    this.feedbackRecommendation.set(mine?.recommendation ?? Recommendation.MAYBE);
    this.feedbackComments.set(mine?.comments ?? '');
    this.feedbackStrengths.set(mine?.strengths ?? '');
    this.feedbackImprovementAreas.set(mine?.improvementAreas ?? '');
    this.feedbackPublished.set(mine?.isPublished ?? false);
    this.feedbackDialogOpen.set(true);
  }

  protected closeFeedbackDialog(): void {
    this.feedbackDialogOpen.set(false);
  }

  protected get canSubmitFeedback(): boolean {
    return this.feedbackComments().trim().length > 0;
  }

  protected saveFeedback(): void {
    if (!this.canSubmitFeedback) return;
    const mine = this.myFeedback();
    const payload = {
      rating: this.feedbackRating() ?? undefined,
      recommendation: this.feedbackRecommendation(),
      comments: this.feedbackComments().trim(),
      strengths: this.feedbackStrengths().trim() || undefined,
      improvementAreas: this.feedbackImprovementAreas().trim() || undefined,
      isPublished: this.feedbackPublished(),
    };

    this.savingFeedback.set(true);
    const request$ = mine
      ? this.feedbackService.update(mine.id, payload)
      : this.feedbackService.create({ sessionId: this.id, ...payload });

    request$.subscribe({
      next: () => {
        this.savingFeedback.set(false);
        this.feedbackDialogOpen.set(false);
        this.messageService.add({
          severity: 'success',
          summary: mine ? 'Feedback updated' : 'Feedback added',
        });
        this.loadFeedback();
      },
      error: (error: unknown) => {
        this.savingFeedback.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not save feedback',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }
}
