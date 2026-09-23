import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@openng/optimus-ui/dialog';
import { PrimeTemplate, MessageService } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Textarea } from '@openng/optimus-ui/textarea';
import { Select } from '@openng/optimus-ui/select';
import { DatePicker } from '@openng/optimus-ui/datepicker';
import { AuthService } from '@core/services/auth.service';
import { CandidatesService } from '@core/services/candidates.service';
import {
  InterviewsService,
  InterviewType,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';
import { getApiErrorMessage } from '@core/utils/api-error.util';

interface CandidateOption {
  label: string;
  value: string;
}

@Component({
  selector: 'app-interview-add',
  imports: [
    Dialog,
    PrimeTemplate,
    Button,
    FormsModule,
    InputText,
    InputNumber,
    Textarea,
    Select,
    DatePicker,
  ],
  templateUrl: './interview-add.html',
})
export class InterviewAdd implements OnInit {
  protected readonly typeOptions = Object.values(InterviewType).map((value) => ({
    label: INTERVIEW_TYPE_LABELS[value],
    value,
  }));

  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly candidatesService = inject(CandidatesService);
  private readonly interviewsService = inject(InterviewsService);
  private readonly messageService = inject(MessageService);

  protected readonly candidateOptions = signal<CandidateOption[]>([]);
  protected readonly loadingCandidates = signal(true);
  protected readonly saving = signal(false);

  protected readonly candidateId = signal<string | null>(null);
  protected readonly scheduledAt = signal<Date | null>(null);
  protected readonly durationMinutes = signal<number | null>(60);
  protected readonly position = signal('');
  protected readonly type = signal<InterviewType | null>(null);
  protected readonly meetingLink = signal('');
  protected readonly notes = signal('');

  ngOnInit(): void {
    this.candidatesService.list({ take: 100 }).subscribe({
      next: (result) => {
        this.candidateOptions.set(
          result.data.map((c) => ({
            label: `${c.firstName} ${c.lastName} (${c.email})`,
            value: c.id,
          })),
        );
        this.loadingCandidates.set(false);
      },
      error: (error: unknown) => {
        this.loadingCandidates.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Could not load candidates',
          detail: getApiErrorMessage(error),
        });
      },
    });
  }

  protected get canSubmit(): boolean {
    return (
      !!this.candidateId() &&
      !!this.scheduledAt() &&
      !!this.durationMinutes() &&
      !!this.type() &&
      this.position().trim().length > 0
    );
  }

  protected close(): void {
    this.router.navigate(['/interviews']);
  }

  protected save(): void {
    const interviewerId = this.auth.currentUser()?.id;
    const candidateId = this.candidateId();
    const scheduledAt = this.scheduledAt();
    const durationMinutes = this.durationMinutes();
    const type = this.type();
    if (!interviewerId || !candidateId || !scheduledAt || !durationMinutes || !type) {
      return;
    }

    this.saving.set(true);
    this.interviewsService
      .create({
        candidateId,
        interviewerId,
        scheduledAt: scheduledAt.toISOString(),
        durationMinutes,
        position: this.position().trim(),
        type,
        meetingLink: this.meetingLink().trim() || undefined,
        notes: this.notes().trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'success',
            summary: 'Interview scheduled',
          });
          this.router.navigate(['/interviews']);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Could not schedule interview',
            detail: getApiErrorMessage(error),
          });
        },
      });
  }
}
