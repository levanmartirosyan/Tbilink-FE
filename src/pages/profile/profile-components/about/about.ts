import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../core/services/common-service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { UserService } from '../../../../core/services/user-service';
import { ActivatedRoute } from '@angular/router';
import { filter, map, switchMap } from 'rxjs';
import { ApiService } from '../../../../core/services/api-service';

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
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public currentUserId?: string;
  public isLoading: boolean = false;

  ngOnInit() {
    this.isLoading = true;
    const parent = this.activatedRoute.parent;
    if (!parent) return;

    const usernameSnapshot =
      parent.snapshot.params['username'] ??
      parent.snapshot.queryParams['username'];

    if (usernameSnapshot) {
      this.apiService.getUserByUsername(usernameSnapshot).subscribe({
        next: (response: any) => {
          this.userData = response.data;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading user data:', err);
          this.isLoading = false;
        },
      });
      return;
    }

    parent.params
      .pipe(
        map((p: any) => p['username']),
        filter((u) => !!u),
        switchMap((username: string) =>
          this.apiService.getUserByUsername(username)
        )
      )
      .subscribe({
        next: (response: any) => {
          this.userData = response.data;
          this.isLoading = false;
        },
        error: (err: any) => {
          console.error('Error loading user data:', err);
          this.isLoading = false;
        },
      });
  }
}
