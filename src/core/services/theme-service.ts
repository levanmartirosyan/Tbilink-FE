import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private themeKey = 'theme';

  constructor() {
    const saved = localStorage.getItem(this.themeKey);

    if (saved === 'light' || saved === 'dark') {
      this.setTheme(saved);
    } else {
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches;
      this.setTheme(prefersDark ? 'dark' : 'light');
    }
  }

  setTheme(theme: 'light' | 'dark') {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(this.themeKey, theme);
  }

  toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme') as
      | 'light'
      | 'dark';
    this.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  getCurrentTheme(): 'light' | 'dark' {
    return (
      (document.documentElement.getAttribute('data-theme') as
        | 'light'
        | 'dark') || 'light'
    );
  }
}
