import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../core/services/common-service';
import { ApiService } from '../../../core/services/api-service';
import { UserService } from '../../../core/services/user-service';
import { PostCard } from '../../feed/feed-components/post-card/post-card';
import { CommentModal } from '../../feed/feed-components/comment-modal/comment-modal';
import { EditPostModal } from '../../feed/feed-components/edit-post-modal/edit-post-modal';
import { UserCard } from '../search-components/user-card/user-card';
import { Overlay } from '../../../shared/overlay/overlay';
import { SpinnerLoader } from '../../../shared/loadings/spinner-loader/spinner-loader';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-all',
  imports: [
    CommonModule,
    PostCard,
    CommentModal,
    EditPostModal,
    UserCard,
    Overlay,
    SpinnerLoader,
    LucideAngularModule,
  ],
  templateUrl: './all.html',
  styleUrl: './all.scss',
})
export class All implements OnInit {
  constructor(
    private commonService: CommonService,
    private api: ApiService,
    private userService: UserService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public searchData: any;
  public commentModal: boolean = false;
  public selectedCommentPost: any = null;
  public editPostModal: boolean = false;
  public selectedEditPost: any = null;
  public currentUserId?: string;
  public isLoading: boolean = false;

  ngOnInit(): void {
    this.initializeSearchData();
  }

  private initializeSearchData(): void {
    const currentData = this.commonService.getSearchData();
    let hasData = false;

    currentData.subscribe((data) => {
      if (data !== null) {
        hasData = true;
        this.searchData = data;
        this.filterCurrentUser();
      }
    });

    if (!hasData) {
      this.loadDefaultData();
    }
  }

  private loadDefaultData(): void {
    this.isLoading = true;
    this.api.search('', 'all', 1, 10).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.commonService.setSearchData(response.data);
          this.searchData = response.data;
          this.filterCurrentUser();
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Default data load error:', err);
        this.isLoading = false;
      },
    });
  }

  private filterCurrentUser(): void {
    if (this.searchData?.users && this.currentUserId) {
      this.searchData.users = this.searchData.users.filter(
        (user: any) => user.id !== this.currentUserId
      );
    }
  }

  public toggleCommentModal(post: any): void {
    this.commentModal = !this.commentModal;
    this.selectedCommentPost = post;
  }

  public closeCommentModal(): void {
    this.commentModal = false;
    this.selectedCommentPost = null;
  }

  public toggleEditPostModal(post: any): void {
    this.editPostModal = !this.editPostModal;
    this.selectedEditPost = post;
  }

  public closeEditPostModal(): void {
    this.editPostModal = false;
    this.selectedEditPost = null;
  }

  public onPostDeleted(refreshData: any): void {
    // Reload search data instead of using getAllPosts data
    this.loadDefaultData();
  }

  public onPostUpdated(): void {
    this.loadDefaultData();
    this.closeEditPostModal();
  }

  public onFollowToggled(user: any): void {
    console.log('User followed/unfollowed:', user);
  }
}
