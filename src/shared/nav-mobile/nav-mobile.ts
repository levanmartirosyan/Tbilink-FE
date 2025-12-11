import { Component, OnDestroy, OnInit } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { RouterModule } from '@angular/router';
import { SignalRService } from '../../core/services/signal-r-service';
import { User } from '../../core/types/user';
import { Subject, takeUntil } from 'rxjs';
import { UserService } from '../../core/services/user-service';

@Component({
  selector: 'app-nav-mobile',
  imports: [LucideAngularModule, ThemeSwitcher, RouterModule],
  templateUrl: './nav-mobile.html',
  styleUrl: './nav-mobile.scss',
})
export class NavMobile implements OnInit, OnDestroy {
  constructor(
    public signalRService: SignalRService,
    private userService: UserService
  ) {}

  public userData!: User | null;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentUser() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((u) => {
      this.userData = u;
    });
  }
}
