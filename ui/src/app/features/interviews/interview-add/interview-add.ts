import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Dialog } from '@openng/optimus-ui/dialog';
import { PrimeTemplate } from '@openng/optimus-ui/api';
import { Button } from '@openng/optimus-ui/button';

@Component({
  selector: 'app-interview-add',
  imports: [Dialog, PrimeTemplate, Button],
  templateUrl: './interview-add.html',
})
export class InterviewAdd {
  private readonly router = inject(Router);

  protected close(): void {
    this.router.navigate(['/interviews']);
  }
}
