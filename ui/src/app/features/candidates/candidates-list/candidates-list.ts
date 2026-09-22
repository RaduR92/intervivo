import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Candidate } from '../candidate.model';

@Component({
  selector: 'app-candidates-list',
  imports: [RouterOutlet, TableModule, PrimeTemplate, Button],
  templateUrl: './candidates-list.html',
})
export class CandidatesList {
  private readonly router = inject(Router);

  protected readonly candidates = signal<Candidate[]>([]);

  protected openDetail(id: string): void {
    this.router.navigate(['/candidates', id]);
  }

  protected openAddDialog(): void {
    this.router.navigate(['/candidates', 'new']);
  }
}
