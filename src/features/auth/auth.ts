import { Component, OnDestroy, OnInit } from '@angular/core';
import { ThemeService } from '../../core/services/theme-service';
import { ThemeSwitcher } from '../../shared/theme-switcher/theme-switcher';
import { Title } from '@angular/platform-browser';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterModule,
} from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormSwither } from './auth-components/form-swither/form-swither';
import { AuthGreeting } from './auth-components/auth-greeting/auth-greeting';

@Component({
  selector: 'app-auth',
  imports: [
    ThemeSwitcher,
    RouterModule,
    CommonModule,
    FormSwither,
    AuthGreeting,
  ],
  templateUrl: './auth.html',
  styleUrl: './auth.scss',
})
export class Auth implements OnInit, OnDestroy {
  constructor(
    public themeService: ThemeService,
    private title: Title,
    private router: Router,
    private actR: ActivatedRoute
  ) {}

  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.listenToRoute();
    this.setTitleBasedOnAction(this.currentForm);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public Action: string = 'signin';
  public currentForm?: string = 'signin';
  public CurrentTheme?: string;
  public checkEnterCodeCase?: string;

  private setTitleBasedOnAction(currentForm: string | undefined): void {
    currentForm === 'signin'
      ? this.title.setTitle('Tbilink - Sign In')
      : currentForm === 'signup'
      ? this.title.setTitle('Tbilink - Sign Up')
      : this.title.setTitle('Tbilink - Password Recovery');
  }

  listenToRoute() {
    this.currentForm = this.actR.snapshot.firstChild?.routeConfig?.path;

    this.router.events.pipe(takeUntil(this.destroy$)).subscribe((event) => {
      if (event instanceof NavigationEnd) {
        let route = this.actR;

        while (route.firstChild) {
          route = route.firstChild;
        }

        this.currentForm = route.snapshot.routeConfig?.path;

        if (this.currentForm === 'recovery') {
        }

        this.setTitleBasedOnAction(route.snapshot.routeConfig?.path);
      }
    });
  }
}
