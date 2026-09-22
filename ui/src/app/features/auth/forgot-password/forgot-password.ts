import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { AuthLayout } from '@shared/components/auth-layout/auth-layout';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, Button, InputText, AuthLayout],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  private readonly authService = inject(AuthService);

  protected readonly email = signal('');
  protected readonly submitted = signal(false);
  protected readonly loading = signal(false);

  protected submit(): void {
    this.loading.set(true);
    this.authService.requestPasswordReset(this.email()).subscribe({
      next: () => {
        this.loading.set(false);
        this.submitted.set(true);
      },
      error: () => {
        this.loading.set(false);
        // Always show the generic confirmation, even on error, so the
        // endpoint's no-user-enumeration behavior isn't undermined client-side.
        this.submitted.set(true);
      },
    });
  }
}
