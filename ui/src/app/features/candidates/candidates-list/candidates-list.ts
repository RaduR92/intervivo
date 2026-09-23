import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate, MessageService } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { CandidatesService, Candidate } from '@core/services/candidates.service';
import { getApiErrorMessage } from '@core/utils/api-error.util';

@Component({
  selector: 'app-candidates-list',
  imports: [RouterOutlet, TableModule, PrimeTemplate, Button, FormsModule, InputText, DatePipe],
  templateUrl: './candidates-list.html',
})
export class CandidatesList implements OnInit {
  private readonly router = inject(Router);
  private readonly candidatesService = inject(CandidatesService);
  private readonly messageService = inject(MessageService);

  protected readonly candidates = signal<Candidate[]>([]);
  protected readonly loading = signal(true);
  protected readonly search = signal('');

  private readonly searchInput$ = new Subject<string>();

  ngOnInit(): void {
    this.load();

    this.searchInput$.pipe(debounceTime(300), distinctUntilChanged()).subscribe((value) => {
      this.search.set(value);
      this.load();
    });

    // The add dialog is a child route; reload when navigation lands back
    // here (after a save or a cancel) so a newly created candidate shows up.
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        if (event.urlAfterRedirects === '/candidates') {
          this.load();
        }
      });
  }

  protected onSearchInput(value: string): void {
    this.searchInput$.next(value);
  }

  private load(): void {
    this.loading.set(true);
    this.candidatesService
      .list({ take: 100, search: this.search().trim() || undefined })
      .subscribe({
        next: (result) => {
          this.candidates.set(result.data);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: 'Could not load candidates',
            detail: getApiErrorMessage(error),
          });
        },
      });
  }

  protected openDetail(id: string): void {
    this.router.navigate(['/candidates', id]);
  }

  protected openAddDialog(): void {
    this.router.navigate(['/candidates', 'new']);
  }
}
