import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { AuthLayout } from '@shared/components/auth-layout/auth-layout';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Button, InputText, AuthLayout],
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly canSubmit = computed(
    () => this.email().trim().length > 0 && this.password().length > 0,
  );

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected submit(): void {
    this.errorMessage.set(null);
    this.loading.set(true);

    this.authService.login(this.email(), this.password()).subscribe({
      next: ({ user }) => {
        this.loading.set(false);
        this.router.navigate([
          user.role === 'HR' ? '/dashboard' : '/candidate-home',
        ]);
      },
      error: (error: unknown) => {
        this.loading.set(false);
        this.errorMessage.set(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'Invalid email or password.'
            : 'Something went wrong. Please try again.',
        );
      },
    });
  }
}
