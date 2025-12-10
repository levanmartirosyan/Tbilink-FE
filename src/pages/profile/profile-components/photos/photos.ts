import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { IPost } from '../../../../core/interfaces/IPost';
import { UserService } from '../../../../core/services/user-service';
import { map, switchMap, take } from 'rxjs';
import { env } from '../../../../enviroment/enviroment';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-photos',
  imports: [SpinnerLoader],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos implements OnInit {
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
