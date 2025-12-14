import {
  Component,
  ElementRef,
  HostListener,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '../../../../core/services/user-service';
import { Router, RouterModule } from '@angular/router';
import { appConfig } from '../../../../app/app.config';
import { ApiService } from '../../../../core/services/api-service';
import { CommonService } from '../../../../core/services/common-service';

@Component({
  selector: 'app-followers-counter',
  imports: [FormatNumberPipe, LucideAngularModule, RouterModule],
  templateUrl: './followers-counter.html',
  styleUrl: './followers-counter.scss',
})
export class FollowersCounter implements OnChanges {
  constructor(
    private userService: UserService,
    private router: Router,
    private api: ApiService,
    private commonService: CommonService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['userData'].currentValue) {
      this.getUserPosts();
    }
  }

  @Input() userData?: any;

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
}
