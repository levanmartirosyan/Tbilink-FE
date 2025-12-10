import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { UserService } from '../../../../core/services/user-service';
import { env } from '../../../../enviroment/enviroment';
import { IPost } from '../../../../core/interfaces/IPost';
import { map, switchMap, take } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-posts',
  imports: [LucideAngularModule, SpinnerLoader],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts implements OnInit {
  public data: IPost[] = [];
  constructor(private apiService: ApiService, private user: UserService) {}

  public env: any = env;

  public ngOnInit(): void {
    this.apiService
      .getPostsByUserId(this.user.getUser()?.data?.id)
      .subscribe((posts) => {
        this.data = posts.data;
        console.log(this.data);
      });
  }
}
