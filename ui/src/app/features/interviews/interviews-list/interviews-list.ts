import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { Select } from '@openng/optimus-ui/select';
import { MessageService } from '@openng/optimus-ui/api';
import {
  InterviewsService,
  InterviewSession,
  InterviewStatus,
  INTERVIEW_STATUS_LABELS,
  InterviewType,
  INTERVIEW_TYPE_LABELS,
} from '@core/services/interviews.service';
import { InterviewSessionsTable } from '@shared/components/interview-sessions-table/interview-sessions-table';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-interviews-list',
  imports: [RouterOutlet, Button, FormsModule, InputText, Select, InterviewSessionsTable],
  templateUrl: './interviews-list.html',
})
export class InterviewsList implements OnInit {
  protected readonly statusOptions: { label: string; value: InterviewStatus | null }[] = [
    { label: 'All Statuses', value: null },
    ...Object.values(InterviewStatus).map((value) => ({
      label: INTERVIEW_STATUS_LABELS[value],
      value,
    })),
  ];
  protected readonly typeOptions: { label: string; value: InterviewType | null }[] = [
    { label: 'All Types', value: null },
    ...Object.values(InterviewType).map((value) => ({
      label: INTERVIEW_TYPE_LABELS[value],
      value,
    })),
  ];

  private readonly router = inject(Router);
  private readonly interviewsService = inject(InterviewsService);
  private readonly messageService = inject(MessageService);

  protected readonly interviews = signal<InterviewSession[]>([]);
  protected readonly loading = signal(true);

  protected readonly search = signal('');
  protected readonly status = signal<InterviewStatus | null>(null);
  protected readonly type = signal<InterviewType | null>(null);

  private readonly searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.load();

    this.searchInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.search.set(value);
      this.load();
    });

    // The add dialog is a child route; reload when navigation lands back
    // here (after a save or a cancel) so a newly created session shows up.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.urlAfterRedirects === '/interviews') {
          this.load();
        }
      });
  }

  protected onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  protected onStatusChange(value: InterviewStatus | null): void {
    this.status.set(value);
    this.load();
  }

  protected onTypeChange(value: InterviewType | null): void {
    this.type.set(value);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.interviewsService
      .list({
        take: 100,
        search: this.search().trim() || undefined,
        status: this.status() ?? undefined,
        type: this.type() ?? undefined,
      })
      .subscribe({
        next: (result) => {
          this.interviews.set(result.data);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Could not load interviews',
            detail: getApiErrorMessage(error),
          });
        },
      });
  }

  protected openDetail(session: InterviewSession): void {
    this.router.navigate(['/interviews', session.id]);
  }

  protected openAddDialog(): void {
    this.router.navigate(['/interviews', 'new']);
  }
}
