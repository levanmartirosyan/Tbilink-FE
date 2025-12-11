import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { env } from '../../../../enviroment/enviroment';
import { IPost } from '../../../../core/interfaces/IPost';
import { switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../core/services/common-service';

@Component({
  selector: 'app-posts',
  imports: [LucideAngularModule, SpinnerLoader],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts implements OnInit {
  public data: IPost[] = [];
  public isLoading = true;
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public commonService: CommonService
  ) {}

  public env: any = env;
  public userData: any;

  public ngOnInit(): void {
    this.activatedRoute.parent?.params
      .pipe(
        switchMap((params) => {
          return this.apiService.getUserByUsername(params['username']).pipe(
            switchMap((response: any) => {
              this.userData = response.data;
              const userId = response.data.id;
              return this.apiService.getPostsByUserId(userId);
            })
          );
        })
      )
      .subscribe({
        next: (posts: any) => {
          this.data = posts.data;
          this.isLoading = false;
          console.log(this.data);
        },
        error: (err: any) => {
          console.error('Error loading posts:', err);
          this.isLoading = false;
        },
      });
  }
}
