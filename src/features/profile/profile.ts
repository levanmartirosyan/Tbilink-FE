import {
  Component,
  ElementRef,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ApiService } from '../../core/services/api-service';
import { FullUser } from '../../core/types/user';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { FormatNumberPipe } from '../../core/pipes/format-number-pipe';
import { NavSwitcher } from '../../shared/nav-switcher/nav-switcher';
import { UserService } from '../../core/services/user-service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [
    LucideAngularModule,
    CommonModule,
    FormatNumberPipe,
    NavSwitcher,
    RouterModule,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  constructor(
    private api: ApiService,
    private el: ElementRef,
    private userService: UserService,
    private router: Router
  ) {}

  @ViewChild('settingsWrapper', { read: ElementRef })
  settingsWrapper!: ElementRef;

  ngOnInit(): void {
    this.getUserData();
  }

  public userData?: FullUser;

  getUserData() {
    this.api.getUserData().subscribe({
      next: (data: any) => {
        console.log(data);

        this.userData = data.data;
      },
      error: (error: any) => {
        console.log(error);
      },
    });
  }

  public settingsMenu: boolean = false;
  toggleSettingsMenu() {
    this.settingsMenu = !this.settingsMenu;
  }

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

  logout() {
    this.userService.logout();

    this.router.navigate(['/']);
  }
}
