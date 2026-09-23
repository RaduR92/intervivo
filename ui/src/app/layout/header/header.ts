import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Button } from '@openng/optimus-ui/button';
import { ThemeService } from '@core/services/theme.service';
import { LayoutService } from '@core/services/layout.service';
import { AuthService } from '@core/services/auth.service';

// A fixed palette rather than an arbitrary hue, so avatar colors stay
// consistent with the rest of the app's literal Tailwind color usage.
const AVATAR_PALETTE = [
  'bg-red-500',
  'bg-orange-500',
  'bg-amber-500',
  'bg-lime-500',
  'bg-green-500',
  'bg-teal-500',
  'bg-cyan-500',
  'bg-blue-500',
  'bg-indigo-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-rose-500',
];

@Component({
  selector: 'app-header',
  imports: [Button],
  templateUrl: './header.html',
  styles: ':host { display: contents; }',
})
export class Header implements OnInit {
  protected readonly theme = inject(ThemeService);
  protected readonly layout = inject(LayoutService);
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    // login/refresh only return the minimal session identity (no
    // firstName/lastName) — fetch the full profile once if we don't have
    // it yet, so the header's name/initials aren't blank right after login.
    if (!this.auth.currentUser()?.firstName) {
      this.auth.fetchCurrentUser().subscribe({ error: () => undefined });
    }
  }

  protected initials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  /** Stable per-person color: same initials always land on the same palette entry. */
  protected avatarColorClass(initials: string): string {
    let hash = 0;
    for (let i = 0; i < initials.length; i++) {
      hash = (hash * 31 + initials.charCodeAt(i)) | 0;
    }
    return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
  }

  protected logout(): void {
    this.auth.logout().subscribe({
      complete: () => this.router.navigate(['/auth/login']),
      error: () => this.router.navigate(['/auth/login']),
    });
  }
}
