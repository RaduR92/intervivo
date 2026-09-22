import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { TableModule } from '@openng/optimus-ui/table';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Interview } from '@shared/models/interview.model';

@Component({
  selector: 'app-candidate-detail',
  imports: [FormsModule, Button, InputText, TableModule, PrimeTemplate],
  templateUrl: './candidate-detail.html',
})
export class CandidateDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly id = this.route.snapshot.paramMap.get('id');

  protected readonly name = signal('');
  protected readonly email = signal('');
  protected readonly position = signal('');
  protected readonly status = signal('');

  protected readonly interviewHistory = signal<Interview[]>([]);

  protected back(): void {
    this.router.navigate(['/candidates']);
  }

  protected save(): void {
    this.back();
  }
}
