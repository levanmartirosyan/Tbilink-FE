import { Component, OnInit } from '@angular/core';
import { SegmentedSwitcher } from '../../../../shared/segmented-switcher/segmented-switcher';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../../core/services/user-service';
import { ApiService } from '../../../../core/services/api-service';
import { CommonService } from '../../../../core/services/common-service';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-profile-settings',
  imports: [
    SegmentedSwitcher,
    LucideAngularModule,
    RouterModule,
    SpinnerLoader,
  ],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettings implements OnInit {
  constructor(
    public userService: UserService,
    private api: ApiService,
    private commonService: CommonService
  ) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  public isLoading: boolean = false;

  loadUserData(): void {
    this.isLoading = true;
    this.api.getUserData().subscribe({
      next: (response: any) => {
        this.commonService.setProfileUserData(response.data);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading user data:', error);
        this.isLoading = false;
      },
    });
  }
}
