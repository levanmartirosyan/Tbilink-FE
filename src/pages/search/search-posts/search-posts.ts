import { Component, OnInit } from '@angular/core';
import { PostCard } from '../../feed/feed-components/post-card/post-card';
import { CommentModal } from '../../feed/feed-components/comment-modal/comment-modal';
import { EditPostModal } from '../../feed/feed-components/edit-post-modal/edit-post-modal';
import { CommonService } from '../../../core/services/common-service';
import { ApiService } from '../../../core/services/api-service';
import { CommonModule } from '@angular/common';
import { Overlay } from '../../../shared/overlay/overlay';
import { SpinnerLoader } from '../../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-search-posts',
  imports: [
    PostCard,
    CommentModal,
    EditPostModal,
    CommonModule,
    Overlay,
    SpinnerLoader,
  ],
  templateUrl: './search-posts.html',
  styleUrl: './search-posts.scss',
})
export class SearchPosts implements OnInit {
  constructor(private commonService: CommonService, private api: ApiService) {}

  public searchData: any;
  public commentModal: boolean = false;
  public selectedCommentPost: any = null;
  public editPostModal: boolean = false;
  public selectedEditPost: any = null;
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
        this.updateSearchData();
      }
    });

    if (!hasData) {
      this.loadDefaultData();
    }
  }

  private loadDefaultData(): void {
    this.isLoading = true;
    this.api.search('', 'posts', 1, 10).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.commonService.setSearchData(response.data);
          this.updateSearchData();
          this.isLoading = false;
        }
      },
      error: (err: any) => {
        console.error('Default data load error:', err);
        this.isLoading = false;
      },
    });
  }

  private updateSearchData(): void {
    this.commonService.getSearchData().subscribe((data) => {
      if (data !== null) {
        this.searchData = data;
      }
    });
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
}
