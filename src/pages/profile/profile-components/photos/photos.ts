import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { IPost } from '../../../../core/interfaces/IPost';
import { UserService } from '../../../../core/services/user-service';
import { map, switchMap, take } from 'rxjs';
import { env } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-photos',
  imports: [],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos implements OnInit {
  public data: IPost[] = [];
  constructor(private apiService: ApiService, private user: UserService) {}

  public env: any = env;

  public ngOnInit(): void {
    this.user.user$
      .pipe(
        take(1),
        switchMap((user) =>
          this.apiService
            .getAllPosts()
            .pipe(
              map((res) =>
                res.data.filter((d) => d.userId === Number(user?.data.id))
              )
            )
        )
      )
      .subscribe((filteredPosts) => {
        this.data = filteredPosts;
        console.log(this.data);
      });
  }
}
