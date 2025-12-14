import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../core/services/common-service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { UserService } from '../../../../core/services/user-service';

@Component({
  selector: 'app-about',
  imports: [LucideAngularModule, CommonModule, SpinnerLoader],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  userData: any;

  constructor(
    private commonService: CommonService,
    private userService: UserService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public currentUserId?: string;

  ngOnInit() {
    this.commonService.getProfileUserData().subscribe({
      next: (data) => {
        this.userData = data;
        console.log('About component userData:', this.userData);
      },
    });
  }
}
