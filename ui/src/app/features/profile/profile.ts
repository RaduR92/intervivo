import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { InputNumber } from '@openng/optimus-ui/inputnumber';
import { Textarea } from '@openng/optimus-ui/textarea';
import { AuthService, Role } from '@core/services/auth.service';
import { CandidatesService, Candidate } from '@core/services/candidates.service';
import { SkillSelect } from '@shared/components/skill-select/skill-select';

/**
 * Shared by both roles — HR only ever sees/edits the basic-info section
 * (there's no CandidateProfile for them); a CANDIDATE also gets their
 * CandidateProfile fields, including skills.
 */
@Component({
  selector: 'app-profile',
  imports: [FormsModule, Button, InputText, InputNumber, Textarea, SkillSelect],
  templateUrl: './profile.html',
})
export class Profile implements OnInit {
  protected readonly auth = inject(AuthService);
  private readonly candidatesService = inject(CandidatesService);

  protected readonly isCandidate = computed(
    () => this.auth.currentUser()?.role === Role.CANDIDATE,
  );

  protected readonly firstName = signal('');
  protected readonly lastName = signal('');
  protected readonly savingBasicInfo = signal(false);
  protected readonly basicInfoMessage = signal<string | null>(null);

  protected readonly loadingProfile = signal(false);
  protected readonly savingProfile = signal(false);
  protected readonly profileMessage = signal<string | null>(null);

  protected readonly phone = signal('');
  protected readonly currentRole = signal('');
  protected readonly yearsExperience = signal<number | null>(null);
  protected readonly targetRole = signal('');
  protected readonly resumeUrl = signal('');
  protected readonly notes = signal('');
  protected readonly skills = signal<string[]>([]);

  ngOnInit(): void {
    this.auth.fetchCurrentUser().subscribe({
      next: (user) => {
        this.firstName.set(user.firstName ?? '');
        this.lastName.set(user.lastName ?? '');
      },
    });

    const userId = this.auth.currentUser()?.id;
    if (this.isCandidate() && userId) {
      this.loadingProfile.set(true);
      this.candidatesService.get(userId).subscribe({
        next: (candidate) => {
          this.applyCandidate(candidate);
          this.loadingProfile.set(false);
        },
        error: () => this.loadingProfile.set(false),
      });
    }
  }

  private applyCandidate(candidate: Candidate): void {
    this.phone.set(candidate.profile.phone ?? '');
    this.currentRole.set(candidate.profile.currentRole ?? '');
    this.yearsExperience.set(candidate.profile.yearsExperience);
    this.targetRole.set(candidate.profile.targetRole ?? '');
    this.resumeUrl.set(candidate.profile.resumeUrl ?? '');
    this.notes.set(candidate.profile.notes ?? '');
    this.skills.set(candidate.profile.skills);
  }

  protected saveBasicInfo(): void {
    this.savingBasicInfo.set(true);
    this.basicInfoMessage.set(null);
    this.auth
      .updateCurrentUser({ firstName: this.firstName(), lastName: this.lastName() })
      .subscribe({
        next: () => {
          this.savingBasicInfo.set(false);
          this.basicInfoMessage.set('Saved.');
        },
        error: () => {
          this.savingBasicInfo.set(false);
          this.basicInfoMessage.set('Something went wrong. Please try again.');
        },
      });
  }

  protected saveCandidateProfile(): void {
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;

    this.savingProfile.set(true);
    this.profileMessage.set(null);
    this.candidatesService
      .update(userId, {
        phone: this.phone() || undefined,
        currentRole: this.currentRole() || undefined,
        yearsExperience: this.yearsExperience() ?? undefined,
        targetRole: this.targetRole() || undefined,
        resumeUrl: this.resumeUrl() || undefined,
        notes: this.notes() || undefined,
        skills: this.skills(),
      })
      .subscribe({
        next: (candidate) => {
          this.applyCandidate(candidate);
          this.savingProfile.set(false);
          this.profileMessage.set('Saved.');
        },
        error: () => {
          this.savingProfile.set(false);
          this.profileMessage.set('Something went wrong. Please try again.');
        },
      });
  }
}
