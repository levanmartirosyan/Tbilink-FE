import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user-service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FollowAction } from '../follow-action/follow-action';
import { env } from '../../../../enviroment/enviroment';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';

@Component({
  selector: 'app-profile-info',
  imports: [LucideAngularModule, CommonModule, RouterModule, FollowAction],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.scss',
})
export class ProfileInfo implements OnChanges {
  @Output() followToggled = new EventEmitter<any>();
  constructor(
    private userService: UserService,
    private router: Router,
    private api: ApiService,
    private toast: ToastService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'] && changes['userData'].currentValue) {
      console.log(changes['userData'].currentValue);
    }
  }

  // ngOnInit(): void {
  //   this.getFollowStats();
  // }

  @Input() userData?: any;
  @Input() followStats?: any;
  public currentUserId?: string;

  @ViewChild('settingsWrapper', { read: ElementRef })
  settingsWrapper!: ElementRef;

  public env: any = env;

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

  followUser() {
    if (!this.userData) return;
    const userId = this.userData.id;
    const baseCount =
      this.followStats?.followersCount ?? this.userData.followersCount ?? 0;
    const optimisticIsFollowing = !this.followStats?.isFollowing;
    let optimisticFollowersCount = baseCount + (optimisticIsFollowing ? 1 : -1);
    if (optimisticFollowersCount < 0) optimisticFollowersCount = 0;

    this.followToggled.emit({
      userId,
      isFollowing: optimisticIsFollowing,
      followersCount: optimisticFollowersCount,
      optimistic: true,
    });
  }

  onFollowToggled(event: any) {
    if (!event || !this.userData || this.userData.id !== event.userId) return;
    this.followStats = this.followStats || {};
    this.followStats.isFollowing = event.isFollowing;
    this.userData.followersCount = event.followersCount;

    this.followToggled.emit(event);
  }

  shareProfile() {
    const profileUrl = `${window.location.origin}/profile/${this.userData.userName}`;
    navigator.clipboard.writeText(profileUrl).then(() => {
      this.toast.info('Profile link copied to clipboard!');
    });
  }
}
