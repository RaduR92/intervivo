import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { InputText } from '@openng/optimus-ui/inputtext';
import { AuthLayout } from '@shared/components/auth-layout/auth-layout';

@Component({
  selector: 'app-forgot-password',
  imports: [FormsModule, RouterLink, Button, InputText, AuthLayout],
  templateUrl: './forgot-password.html',
})
export class ForgotPassword {
  protected readonly email = signal('');
  protected readonly submitted = signal(false);

  protected submit(): void {
    this.submitted.set(true);
  }
}
