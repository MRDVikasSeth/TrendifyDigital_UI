import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private currentTheme = 'theme-default';

  setTheme(theme: string): void {
    // Remove old theme class from <body>
    document.body.classList.remove(this.currentTheme);

    // Add new theme class
    document.body.classList.add(theme);
    this.currentTheme = theme;

    // Save preference in localStorage
    localStorage.setItem('app-theme', theme);
  }

  loadSavedTheme(): void {
    const savedTheme = localStorage.getItem('app-theme') || 'theme-default';
    this.setTheme(savedTheme);
  }

  getCurrentTheme(): string {
    return this.currentTheme;
  }
}
