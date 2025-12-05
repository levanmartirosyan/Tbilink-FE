import {
  Component,
  ElementRef,
  HostListener,
  Input,
  ViewChild,
} from '@angular/core';
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '../../../../core/services/user-service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-followers-counter',
  imports: [FormatNumberPipe, LucideAngularModule, RouterModule],
  templateUrl: './followers-counter.html',
  styleUrl: './followers-counter.scss',
})
export class FollowersCounter {
  constructor(private userService: UserService, private router: Router) {
    this.currentUserId = this.userService.getUser()?.data.id;
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
}
