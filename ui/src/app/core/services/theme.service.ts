import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'theme';
export const DARK_MODE_CLASS = 'app-dark';

function getStoredTheme(): 'light' | 'dark' | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' || stored === 'light' ? stored : null;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  readonly dark = signal(getStoredTheme() === 'dark');

  constructor() {
    effect(() => {
      const isDark = this.dark();
      document.documentElement.classList.toggle(DARK_MODE_CLASS, isDark);
      try {
        localStorage.setItem(STORAGE_KEY, isDark ? 'dark' : 'light');
      } catch {
        // ignore storage failures (e.g. private browsing)
      }
    });
  }

  toggle(): void {
    this.dark.update((isDark) => !isDark);
  }
}
