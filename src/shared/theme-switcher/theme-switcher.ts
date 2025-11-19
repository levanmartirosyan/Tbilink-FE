import { Component, Input, OnInit } from '@angular/core';
import { ThemeService } from '../../core/services/theme-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-theme-switcher',
  imports: [LucideAngularModule],
  templateUrl: './theme-switcher.html',
  styleUrl: './theme-switcher.scss',
})
export class ThemeSwitcher implements OnInit {
  constructor(public themeService: ThemeService) {}

  ngOnInit(): void {
    this.theme = this.themeService.getCurrentTheme();
  }

  @Input() size?: number;

  public theme?: string;
  onToggle() {
    this.themeService.toggleTheme();

    this.theme = this.themeService.getCurrentTheme();
  }
}
