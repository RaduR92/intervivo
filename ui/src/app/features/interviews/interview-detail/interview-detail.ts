import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';

@Component({
  selector: 'app-interview-detail',
  imports: [Button],
  templateUrl: './interview-detail.html',
})
export class InterviewDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly id = this.route.snapshot.paramMap.get('id');

  protected back(): void {
    this.router.navigate(['/interviews']);
  }
}
