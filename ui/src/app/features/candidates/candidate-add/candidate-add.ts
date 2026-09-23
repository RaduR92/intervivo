import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Dialog } from '@openng/optimus-ui/dialog';
import { PrimeTemplate, MessageService } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Textarea } from '@openng/optimus-ui/textarea';
import { CandidatesService } from '@core/services/candidates.service';
import { SkillSelect } from '@shared/components/skill-select/skill-select';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-candidate-add',
  imports: [
    Dialog,
    PrimeTemplate,
    Button,
    FormsModule,
    InputText,
    InputNumber,
    Textarea,
    SkillSelect,
  ],
  templateUrl: './candidate-add.html',
})
export class CandidateAdd {
  private readonly router = inject(Router);
  private readonly candidatesService = inject(CandidatesService);
  private readonly messageService = inject(MessageService);

  protected readonly saving = signal(false);

  protected readonly email = signal('');
  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly password = signal('');
  protected readonly phone = signal('');
  protected readonly currentRole = signal('');
  protected readonly yearsExperience = signal<number | null>(null);
  protected readonly targetRole = signal('');
  protected readonly resumeUrl = signal('');
  protected readonly notes = signal('');
  protected readonly skills = signal<string[]>([]);

  protected get canSubmit(): boolean {
    return (
      this.email().trim().length > 0 &&
      this.firstName().trim().length > 0 &&
      this.lastName().trim().length > 0 &&
      this.password().length >= 8
    );
  }

  protected close(): void {
    this.router.navigate(['/candidates']);
  }

  protected save(): void {
    if (!this.canSubmit) return;

    this.saving.set(true);
    this.candidatesService
      .create({
        email: this.email().trim(),
        firstName: this.firstName().trim(),
        lastName: this.lastName().trim(),
        password: this.password(),
        phone: this.phone().trim() || undefined,
        currentRole: this.currentRole().trim() || undefined,
        yearsExperience: this.yearsExperience() ?? undefined,
        targetRole: this.targetRole().trim() || undefined,
        resumeUrl: this.resumeUrl().trim() || undefined,
        notes: this.notes().trim() || undefined,
        skills: this.skills(),
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.messageService.add({ severity: 'success', summary: 'Candidate added' });
          this.router.navigate(['/candidates']);
        },
        error: (error: unknown) => {
          this.saving.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Could not add candidate',
            detail: getApiErrorMessage(error),
          });
        },
      });
  }
}
