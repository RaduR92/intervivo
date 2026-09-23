import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Textarea } from '@openng/optimus-ui/textarea';
import { MessageService } from '@openng/optimus-ui/api';
import { CandidatesService, Candidate } from '@core/services/candidates.service';
import {
  InterviewsService,
  InterviewSession,
  InterviewStatus,
  INTERVIEW_STATUS_LABELS,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';
import {
  FeedbackService,
  Feedback,
  Recommendation,
  RECOMMENDATION_LABELS,
} from '@core/services/feedback.service';
import { SkillSelect } from '@shared/components/skill-select/skill-select';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-candidate-detail',
  imports: [Button, FormsModule, InputText, InputNumber, Textarea, SkillSelect, DatePipe],
  templateUrl: './candidate-detail.html',
})
export class CandidateDetail implements OnInit {
  protected readonly InterviewStatus = InterviewStatus;
  protected readonly Recommendation = Recommendation;
  protected readonly statusLabels = INTERVIEW_STATUS_LABELS;
  protected readonly typeLabels = INTERVIEW_TYPE_LABELS;
  protected readonly recommendationLabels = RECOMMENDATION_LABELS;

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly candidatesService = inject(CandidatesService);
  private readonly interviewsService = inject(InterviewsService);
  private readonly feedbackService = inject(FeedbackService);
  private readonly messageService = inject(MessageService);

  protected readonly id = this.route.snapshot.paramMap.get('id') ?? '';

  protected readonly candidate = signal<Candidate | null>(null);
  protected readonly sessions = signal<InterviewSession[]>([]);
  protected readonly feedbackBySession = signal<Map<string, Feedback[]>>(new Map());
  protected readonly loading = signal(true);

  protected readonly avgScore = computed(() => {
    const ratings = [...this.feedbackBySession().values()]
      .flat()
      .map((f) => f.rating)
      .filter((r): r is number => r !== null);
    if (ratings.length === 0) return null;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  });

  protected readonly editing = signal(false);
  protected readonly saving = signal(false);
  protected readonly phone = signal('');
  protected readonly currentRole = signal('');
  protected readonly yearsExperience = signal<number | null>(null);
  protected readonly targetRole = signal('');
  protected readonly resumeUrl = signal('');
  protected readonly notes = signal('');
  protected readonly skills = signal<string[]>([]);

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    forkJoin({
      candidate: this.candidatesService.get(this.id),
      sessions: this.interviewsService.list({ candidateId: this.id, take: 100 }),
      feedback: this.feedbackService.list({ candidateId: this.id, take: 100 }),
    }).subscribe({
      next: ({ candidate, sessions, feedback }) => {
        this.candidate.set(candidate);
        this.applyProfileFields(candidate);
        this.sessions.set(
          [...sessions.data].sort(
            (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
          ),
        );

        const bySession = new Map<string, Feedback[]>();
        for (const item of feedback.data) {
          const existing = bySession.get(item.session.id) ?? [];
          existing.push(item);
          bySession.set(item.session.id, existing);
        }
        this.feedbackBySession.set(bySession);

        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load candidate',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }

  private applyProfileFields(candidate: Candidate): void {
    this.phone.set(candidate.profile.phone ?? '');
    this.currentRole.set(candidate.profile.currentRole ?? '');
    this.yearsExperience.set(candidate.profile.yearsExperience);
    this.targetRole.set(candidate.profile.targetRole ?? '');
    this.resumeUrl.set(candidate.profile.resumeUrl ?? '');
    this.notes.set(candidate.profile.notes ?? '');
    this.skills.set(candidate.profile.skills);
  }

  protected feedbackFor(sessionId: string): Feedback[] {
    return this.feedbackBySession().get(sessionId) ?? [];
  }

  protected back(): void {
    this.router.navigate(['/candidates']);
  }

  protected startEditing(): void {
    const candidate = this.candidate();
    if (candidate) this.applyProfileFields(candidate);
    this.editing.set(true);
  }

  protected cancelEditing(): void {
    const candidate = this.candidate();
    if (candidate) this.applyProfileFields(candidate);
    this.editing.set(false);
  }

  protected saveProfile(): void {
    this.saving.set(true);
    this.candidatesService
      .update(this.id, {
        phone: this.phone().trim() || undefined,
        currentRole: this.currentRole().trim() || undefined,
        yearsExperience: this.yearsExperience() ?? undefined,
        targetRole: this.targetRole().trim() || undefined,
        resumeUrl: this.resumeUrl().trim() || undefined,
        notes: this.notes().trim() || undefined,
        skills: this.skills(),
      })
      .subscribe({
        next: (candidate) => {
          this.candidate.set(candidate);
          this.saving.set(false);
          this.editing.set(false);
          this.messageService.add({ severity: 'success', summary: 'Profile updated' });
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Could not update profile',
            detail: getApiErrorMessage(error),
          });
        },
      });
  }
}
