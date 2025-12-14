import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../../core/services/api-service';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-user-card',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-card.html',
  styleUrl: './user-card.scss',
})
export class UserCard {
  @Input() userData: any;
  @Output() followToggled = new EventEmitter<any>();

  public env = env;

  constructor(private router: Router, private api: ApiService) {}

  public goToProfile(): void {
    if (!this.userData?.userName) return;
    this.router.navigate([`/profile/${this.userData.userName}`]);
  }

  public toggleFollow(event: Event): void {
    event.stopPropagation();
    if (!this.userData?.id) return;

    this.api.toggleFollowUser(this.userData.id).subscribe({
      next: () => {
        this.getFollowStats();
        this.followToggled.emit(this.userData);
      },
      error: (err: any) => {
        console.error('Follow error:', err);
      },
    });
  }

  public getFollowStats(): void {
    this.api.getFollowStats(this.userData.id).subscribe({
      next: (res: any) => {
        this.userData.followersCount = res.data.followersCount;
        this.userData.isFollowedByCurrentUser = res.data.isFollowing;
      },
      error: (err: any) => {
        console.error('Get follow stats error:', err);
      },
    });
  }
}
