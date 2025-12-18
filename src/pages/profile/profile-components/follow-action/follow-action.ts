import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule } from 'lucide-angular';
import { CommonService } from '../../../../core/services/common-service';
import { Router } from '@angular/router';
import { ChatParticipantDto } from '../../../../core/interfaces/message-interface';

@Component({
  selector: 'app-follow-action',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './follow-action.html',
  styleUrl: './follow-action.scss',
})
export class FollowAction {
  @Input() userData?: any;
  @Input() followStats?: any;
  @Output() followToggled = new EventEmitter<any>();
  @Output() message = new EventEmitter<any>();

  public isToggling: boolean = false;

  constructor(private commonService: CommonService, private router: Router) {}

  toggleFollow() {
    if (!this.userData || this.isToggling) return;
    this.isToggling = true;

    const userId = this.userData.id;
    const optimisticIsFollowing = !this.followStats?.isFollowing;
    let optimisticFollowersCount =
      (this.followStats?.followersCount ?? this.userData.followersCount ?? 0) +
      (optimisticIsFollowing ? 1 : -1);

    if (optimisticFollowersCount < 0) optimisticFollowersCount = 0;

    this.followToggled.emit({
      userId,
      isFollowing: optimisticIsFollowing,
      followersCount: optimisticFollowersCount,
      optimistic: true,
    });

    setTimeout(() => (this.isToggling = false), 300);
  }

  onMessage() {
    const user: ChatParticipantDto = {
      id: this.userData.id,
      firstName: this.userData.firstName,
      lastName: this.userData.lastName,
      userName: this.userData.userName,
      profilePhotoUrl: this.userData.profilePhotoUrl,
      email: this.userData.email,
      isEmailVerified: this.userData.isEmailVerified,
      role: this.userData.role,
    };
    this.commonService.setChatRecipientId(user);
    this.router.navigate(['/messenger']);
  }
}
