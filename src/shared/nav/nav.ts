import {
  Component,
  computed,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { LucideAngularModule } from 'lucide-angular';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { UserService } from '../../core/services/user-service';
import { CommonModule } from '@angular/common';
import { filter, Subject, Subscription, takeUntil } from 'rxjs';
import { SignalRService } from '../../core/services/signal-r-service';
import { User } from '../../core/types/user';
import { env } from '../../enviroment/enviroment';

@Component({
  selector: 'app-nav',
  imports: [ThemeSwitcher, LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav implements OnInit, OnDestroy {
  @ViewChildren('navItem') navItems!: QueryList<ElementRef>;
  indicator!: HTMLElement;

  @ViewChild('profileWrapper', { read: ElementRef })
  profileWrapper!: ElementRef;

  constructor(
    private router: Router,
    private el: ElementRef,
    public userService: UserService,
    public signalRService: SignalRService
  ) {}

  public userData!: User | null;
  private destroy$ = new Subject<void>();

  public env: any = env;

  private sub!: Subscription;

  ngOnInit(): void {
    this.getCurrentUser();

    this.sub = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.profileMenu = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    this.sub.unsubscribe();
  }

  getCurrentUser() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((u) => {
      this.userData = u;
    });
  }

  public profileMenu: boolean = false;
  toggleProfileMenu() {
    this.profileMenu = !this.profileMenu;
  }

  logout() {
    this.userService.logout();

    this.router.navigate(['/auth/signin']);
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.profileMenu) return;

    const target = event.target as Node | null;
    if (!target) {
      this.profileMenu = false;
      return;
    }

    if (!this.profileWrapper.nativeElement.contains(target)) {
      this.profileMenu = false;
    }
  }
}
