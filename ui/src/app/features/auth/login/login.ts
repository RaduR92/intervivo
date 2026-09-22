import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { AuthLayout } from '@shared/components/auth-layout/auth-layout';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, Button, InputText, AuthLayout],
  templateUrl: './login.html',
})
export class Login {
  private readonly router = inject(Router);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);

  protected togglePasswordVisibility(): void {
    this.showPassword.update((visible) => !visible);
  }

  protected submit(): void {
    this.router.navigate(['/dashboard']);
  }
}
