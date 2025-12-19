import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../core/services/api-service';
import { env } from '../../../../enviroment/enviroment';
import { IPost } from '../../../../core/interfaces/IPost';
import { switchMap } from 'rxjs';
import { LucideAngularModule } from 'lucide-angular';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { CommentModal } from '../../../feed/feed-components/comment-modal/comment-modal';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../../../core/services/common-service';
import { UserService } from '../../../../core/services/user-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-posts',
  imports: [LucideAngularModule, SpinnerLoader, CommentModal, CommonModule],
  templateUrl: './posts.html',
  styleUrl: './posts.scss',
})
export class Posts implements OnInit {
  public data: IPost[] = [];
  public isLoading = true;
  public commentModal: boolean = false;
  public selectedCommentPost: any = null;
  constructor(
    private apiService: ApiService,
    private activatedRoute: ActivatedRoute,
    public commonService: CommonService,
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

  toggleCommentModal(post: any) {
    this.commentModal = !this.commentModal;
    this.selectedCommentPost = post;
  }

  closeCommentModal = () => {
    this.commentModal = false;
  };

  commentAddedHandler(event: any) {
    const index = this.data.findIndex((p) => p.id === event.postId);
    if (index !== -1) {
      this.data[index].commentCount = event.commentCount;
    }
  }
}
