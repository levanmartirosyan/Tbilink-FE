import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-user-avatar',
  imports: [CommonModule],
  templateUrl: './user-avatar.html',
  styleUrl: './user-avatar.scss',
})
export class UserAvatar {
  constructor(
    private router: Router,
    private api: ApiService,
    private toastService: ToastService
  ) {}

  @Input() userData: any;
  @Output() followToggled = new EventEmitter<any>();

  public env = env;
  public showMenu = false;

  goToProfile(): void {
    if (!this.userData?.username) return;
    this.router.navigate([`/profile/${this.userData.username}`]);
  }

  toggleFollow(event: Event): void {
    event.stopPropagation();

    if (!this.userData?.userId) return;

    this.api.toggleFollowUser(this.userData.userId).subscribe({
      next: (response: any) => {
        this.userData.isFollowedByCurrentUser =
          !this.userData.isFollowedByCurrentUser;
        this.toastService.success(
          this.userData.isFollowedByCurrentUser
            ? 'Following user'
            : 'Unfollowed user'
        );
        this.followToggled.emit(this.userData);
        this.showMenu = false;
      },
      error: (err: any) => {
        console.error('Follow error:', err);
        this.toastService.error('Failed to update follow status');
      },
    });
  }

  toggleMenu(event: Event): void {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
  }

  closeMenu(): void {
    this.showMenu = false;
  }
}
