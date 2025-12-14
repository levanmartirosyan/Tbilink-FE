import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user-service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { env } from '../../../../enviroment/enviroment';
import { ApiService } from '../../../../core/services/api-service';

@Component({
  selector: 'app-profile-info',
  imports: [LucideAngularModule, CommonModule, RouterModule],
  templateUrl: './profile-info.html',
  styleUrl: './profile-info.scss',
})
export class ProfileInfo implements OnChanges {
  constructor(
    private userService: UserService,
    private router: Router,
    private api: ApiService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'].currentValue) {
      console.log(changes['userData'].currentValue);

      this.getFollowStats();
    }
  }

  // ngOnInit(): void {
  //   this.getFollowStats();
  // }

  @Input() userData?: any;
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
    this.api.toggleFollowUser(this.userData.id).subscribe((res: any) => {
      this.getFollowStats();
    });
  }

  public followStats: any;

  getFollowStats() {
    this.api.getFollowStats(this.userData.id).subscribe((res: any) => {
      this.userData.followersCount = res.data.followersCount;
      this.userData.followingCount = res.data.followingCount;
      this.followStats = res.data;
    });
  }
}
