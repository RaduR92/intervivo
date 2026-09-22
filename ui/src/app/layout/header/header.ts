import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { ThemeService } from '@core/services/theme.service';
import { LayoutService } from '@core/services/layout.service';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.html',
  styles: ':host { display: contents; }',
})
export class Header {
  protected readonly theme = inject(ThemeService);
  protected readonly layout = inject(LayoutService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
