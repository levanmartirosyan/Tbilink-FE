import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav-mobile',
  imports: [LucideAngularModule, ThemeSwitcher, RouterModule],
  templateUrl: './nav-mobile.html',
  styleUrl: './nav-mobile.scss',
})
export class NavMobile {
  constructor() {}
}
