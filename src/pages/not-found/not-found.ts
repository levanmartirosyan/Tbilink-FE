import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeSwitcher } from '../../shared/theme-switcher/theme-switcher';

@Component({
  selector: 'app-not-found',
  imports: [LucideAngularModule, RouterModule, ThemeSwitcher],
  templateUrl: './not-found.html',
  styleUrl: './not-found.scss',
})
export class NotFound {}
