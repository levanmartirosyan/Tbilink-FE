import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { IPost } from '../../../../core/interfaces/IPost';
import { switchMap } from 'rxjs';
import { env } from '../../../../enviroment/enviroment';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { LucideAngularModule } from 'lucide-angular';
import { ModalComponent } from '../../../../shared/modal/modal';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../core/services/user-service';

@Component({
  selector: 'app-photos',
  imports: [SpinnerLoader, LucideAngularModule, ModalComponent],
  templateUrl: './photos.html',
  styleUrl: './photos.scss',
})
export class Photos implements OnInit {
  public data: IPost[] = [];
  public isLoading = true;
  public imageModal: boolean = false;
  public selectedImageUrl: string | null = null;
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    private userService: UserService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public env: any = env;
  public userData: any;

  public currentUserId?: string;

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

  openImageModal(photo: any) {
    const url = photo?.imageUrl
      ? `${this.env.storageUrl}${photo.imageUrl}`
      : null;
    this.selectedImageUrl = url;
    this.imageModal = true;
  }

  closeImageModal = () => {
    this.imageModal = false;
    this.selectedImageUrl = null;
  };
}
