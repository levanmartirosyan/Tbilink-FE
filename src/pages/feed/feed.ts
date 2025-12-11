import { Component, OnInit } from '@angular/core';
import { AddPost } from './feed-components/add-post/add-post';
import { PostCard } from './feed-components/post-card/post-card';
import { ApiService } from '../../core/services/api-service';
import { Title } from '@angular/platform-browser';
import { EditPostModal } from './feed-components/edit-post-modal/edit-post-modal';
import { CommentModal } from './feed-components/comment-modal/comment-modal';
import { CommonModule } from '@angular/common';
import { SpinnerLoader } from '../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-feed',
  imports: [
    AddPost,
    PostCard,
    EditPostModal,
    CommentModal,
    CommonModule,
    SpinnerLoader,
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
  host: { '(scroll)': 'onScroll($event)' },
})
export class Feed implements OnInit {
  constructor(private api: ApiService, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Tbilink - Feed');
    this.getAllPosts();
  }

  public postData: any[] = [];
  public editPostModal: boolean = false;
  public selectedPost: any = null;
  public commentModal: boolean = false;
  public selectedCommentPost: any = null;
  public isLoading: boolean = false;

  private currentPage = 1;
  private pageSize = 5;
  private hasMorePosts = true;
  private scrollTimeout: any = null;

  getAllPosts() {
    if (this.isLoading || !this.hasMorePosts) {
      console.log(
        'Load blocked - isLoading:',
        this.isLoading,
        'hasMorePosts:',
        this.hasMorePosts
      );
      return;
    }

    this.isLoading = true;
    console.log('Loading page:', this.currentPage);
    this.api.getAllPostsPaginated(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        console.log(
          'Page',
          this.currentPage,
          'loaded:',
          response.data.data.length,
          'posts'
        );

        // Access response.data.data for paginated posts
        const newPosts = response.data.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        if (this.currentPage === 1) {
          this.postData = newPosts;
          console.log('First page. Total posts:', this.postData.length);
        } else {
          this.postData = [...this.postData, ...newPosts];
          console.log(
            'Appended page',
            this.currentPage,
            '. Total posts now:',
            this.postData.length
          );
        }

        this.hasMorePosts = response.data.hasNextPage;
        this.currentPage++;
        this.isLoading = false;
        console.log(
          'Next hasMorePosts:',
          this.hasMorePosts,
          'Next page will be:',
          this.currentPage
        );
      },
      error: (err: any) => {
        console.error('Error loading posts:', err);
        this.isLoading = false;
      },
    });
  }

  onScroll(event: any) {
    const scrollTop = event.target.scrollTop;
    const scrollHeight = event.target.scrollHeight;
    const clientHeight = event.target.clientHeight;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    // Load more when scrolled to 85% of page
    if (scrollPercentage > 0.85 && !this.isLoading && this.hasMorePosts) {
      // Debounce the scroll event
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        console.log(
          'Scroll threshold reached. Loading page:',
          this.currentPage
        );
        this.getAllPosts();
      }, 300);
    }
  }

  getNewPosts(event: any) {
    this.postData = event.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  toggleEditPostModal(post: any) {
    this.editPostModal = !this.editPostModal;
    this.selectedPost = post;
  }

  toggleCommentModal(post: any) {
    this.commentModal = !this.commentModal;
    this.selectedCommentPost = post;
  }

  closeEditPostModal = () => {
    this.editPostModal = false;
  };

  closeCommentModal = () => {
    this.commentModal = false;
  };
}
