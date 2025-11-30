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
import { RouterModule } from '@angular/router';
import { FollowersCounter } from './profile-components/followers-counter/followers-counter';
import { ProfileInfo } from './profile-components/profile-info/profile-info';

@Component({
  selector: 'app-profile',
  imports: [LucideAngularModule, RouterModule, FollowersCounter, ProfileInfo],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  constructor(private api: ApiService) {}

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
}
