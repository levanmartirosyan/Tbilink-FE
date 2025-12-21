import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  ViewChild,
  ElementRef,
} from '@angular/core';
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
  host: {
    '(scroll)': 'onScroll($event)',
    '(window:scroll)': 'onWindowScroll($event)',
  },
})
export class Feed implements OnInit, AfterViewInit, OnDestroy {
  constructor(private api: ApiService, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Tbilink - Feed');
    this.getAllPosts();
  }

  ngAfterViewInit(): void {
    if (!this.feedSentinel) return;

    this.sentinelObserver = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting && !this.isLoading && this.hasMorePosts) {
          if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
          this.scrollTimeout = setTimeout(() => {
            console.log(
              'Sentinel intersecting — loading page:',
              this.currentPage
            );
            this.getAllPosts();
          }, 150);
        }
      },
      { root: null, threshold: 0.25 }
    );

    this.sentinelObserver.observe(this.feedSentinel.nativeElement);
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
  private sentinelObserver: IntersectionObserver | null = null;

  @ViewChild('feedSentinel', { static: false }) feedSentinel?: ElementRef;

  getAllPosts(currentPage?: number) {
    if (this.isLoading || !this.hasMorePosts) {
      console.log(
        'Load blocked - isLoading:',
        this.isLoading,
        'hasMorePosts:',
        this.hasMorePosts
      );
      return;
    }
    if (currentPage) {
      this.currentPage = currentPage;
      this.hasMorePosts = true;
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

    if (scrollPercentage > 0.85 && !this.isLoading && this.hasMorePosts) {
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

  onWindowScroll(event: any) {
    const scrollTop =
      window.scrollY ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0;
    const clientHeight =
      window.innerHeight || document.documentElement.clientHeight || 0;
    const scrollHeight =
      document.documentElement.scrollHeight || document.body.scrollHeight || 0;

    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;

    if (scrollPercentage > 0.85 && !this.isLoading && this.hasMorePosts) {
      if (this.scrollTimeout) clearTimeout(this.scrollTimeout);

      this.scrollTimeout = setTimeout(() => {
        console.log(
          'Window scroll threshold reached. Loading page:',
          this.currentPage
        );
        this.getAllPosts();
      }, 300);
    }
  }

  getNewPosts(event: any) {
    this.postData = [event, ...this.postData];
  }

  deletePostNewData(event: any) {
    this.postData = this.postData.filter((post) => post.id !== event);
  }

  postUpdated(event: any) {
    const index = this.postData.findIndex((post) => post.id === event.id);
    if (index !== -1) {
      this.postData[index] = event;
    }
  }

  commentAdded(event: any) {
    const index = this.postData.findIndex((post) => post.id === event.postId);
    if (index !== -1) {
      this.postData[index].commentCount = event.commentCount;
    }
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

  ngOnDestroy(): void {
    if (this.sentinelObserver) {
      this.sentinelObserver.disconnect();
      this.sentinelObserver = null;
    }
    if (this.scrollTimeout) clearTimeout(this.scrollTimeout);
  }
}
