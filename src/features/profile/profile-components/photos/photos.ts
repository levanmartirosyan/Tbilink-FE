import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { Enviroment } from '../../../../enviroment/enviroment';
import { IPost } from '../../../../core/interfaces/IPost';
import { UserService } from '../../../../core/services/user-service';
import { map, switchMap, take } from 'rxjs';

@Component({
  selector: 'app-photos',
  imports: [],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos implements OnInit {
  public data: IPost[] = [];
  constructor(
    private apiService: ApiService,
    public env: Enviroment,
    private user: UserService
  ) {}

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
