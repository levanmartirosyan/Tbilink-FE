import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
  OnDestroy,
} from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import { CommonService } from '../../core/services/common-service';
import { FullUser } from '../../core/types/user';
import { LucideAngularModule } from 'lucide-angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FollowersCounter } from './profile-components/followers-counter/followers-counter';
import { ProfileInfo } from './profile-components/profile-info/profile-info';
import { SegmentedSwitcher } from '../../shared/segmented-switcher/segmented-switcher';
import { env } from '../../enviroment/enviroment';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { UserService } from '../../core/services/user-service';

@Component({
  selector: 'app-profile',
  imports: [
    LucideAngularModule,
    RouterModule,
    FollowersCounter,
    ProfileInfo,
    SegmentedSwitcher,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit, OnDestroy {
  constructor(
    private api: ApiService,
    private commonService: CommonService,
    private router: Router,
    private actR: ActivatedRoute,
    private userService: UserService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public currentUserId?: string;
  public userData?: FullUser;
  public profileRoute: any = '';
  public username: any;
  public env: any = env;
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.actR.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      console.log(params);
      this.getUserData(params['username']);
      const urlSegments = this.router.url.split('/').filter((s) => s);
      this.profileRoute = ['', ...urlSegments.slice(0, 2)];
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getUserData(username: string) {
    this.api
      .getUserByUsername(username)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          console.log(data);
          this.userData = data.data;
          this.commonService.setProfileUserData(this.userData);
        },
        error: (error: any) => {
          console.log(error);
          this.router.navigate(['/not-found']);
        },
      });
  }

  @ViewChild('settingsWrapper', { read: ElementRef })
  settingsWrapper!: ElementRef;

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.settingsWrapper) return;

    const target = event.target as Node | null;
    if (!target) {
      this.settingsMenu = false;
      return;
    }

    if (!this.settingsWrapper.nativeElement.contains(target)) {
      this.settingsMenu = false;
    }
  }

  public settingsMenu: boolean = false;
  toggleSettingsMenu() {
    this.settingsMenu = !this.settingsMenu;
  }

  logout() {
    this.userService.logout();

    this.router.navigate(['/']);
  }
}
