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
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';
import { LucideAngularModule } from 'lucide-angular';
import { FollowAction } from '../follow-action/follow-action';
import { UserService } from '../../../../core/services/user-service';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../../core/services/api-service';
import { CommonService } from '../../../../core/services/common-service';

@Component({
  selector: 'app-followers-counter',
  imports: [FormatNumberPipe, LucideAngularModule, RouterModule, FollowAction],
  templateUrl: './followers-counter.html',
  styleUrl: './followers-counter.scss',
})
export class FollowersCounter implements OnChanges {
  @Output() followToggled = new EventEmitter<any>();
  constructor(
    private userService: UserService,
    private router: Router,
    private api: ApiService,
    private commonService: CommonService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'] && changes['userData'].currentValue) {
      this.getUserPosts();
    }
  }

  @Input() userData?: any;
  @Input() followStats?: any;

  // handle follow events from the follow-action component
  onFollowToggled(event: any) {
    if (!event || !this.userData || this.userData.id !== event.userId) return;
    // apply optimistic state
    this.followStats = this.followStats || {};
    this.followStats.isFollowing = event.isFollowing;
    this.userData.followersCount = event.followersCount;

    // Re-emit event upward for the parent to handle authoritative sync
    this.followToggled.emit(event);
  }

  onMessage(_: any) {
    // placeholder — navigate or open message modal if needed
    this.router.navigate([`/messages/${this.userData?.id}`]);
  }

  public currentUserId?: string;

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

  getUserPosts() {
    this.api.getPostsByUserId(this.userData.id).subscribe((res: any) => {
      this.userData.postCount = res.data.length;
      this.commonService.setUserPostData(res.data);
    });
  }

  followUser() {
    // emit optimistic toggle request only; parent will perform API and authoritative sync
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
}
