import { Component, inject, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';
import { Interview } from '../interview.model';

@Component({
  selector: 'app-interviews-list',
  imports: [RouterOutlet, TableModule, PrimeTemplate, Button],
  templateUrl: './interviews-list.html',
})
export class InterviewsList {
  private readonly router = inject(Router);

  protected readonly interviews = signal<Interview[]>([]);

  protected openDetail(id: string): void {
    this.router.navigate(['/interviews', id]);
  }

  protected openAddDialog(): void {
    this.router.navigate(['/interviews', 'new']);
  }
}
