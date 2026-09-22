import { Component, OnInit, inject } from '@angular/core';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit {
  protected readonly auth = inject(AuthService);

  ngOnInit(): void {
    this.auth.fetchCurrentUser().subscribe({
      // On failure (including a failed refresh), the auth interceptor
      // already redirects to /auth/login — nothing further to do here.
      error: () => undefined,
    });
  }
}
