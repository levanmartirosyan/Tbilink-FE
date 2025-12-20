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
  public videoThumbnails: Record<string, string> = {};
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
          // generate thumbnails for video posts (deferred)
          setTimeout(() => this.generateVideoThumbnails(), 200);
          this.isLoading = false;
          console.log(this.data);
        },
        error: (err: any) => {
          console.error('Error loading posts:', err);
          this.isLoading = false;
        },
      });
  }

  isVideoUrl(path: string | undefined | null): boolean {
    if (!path) return false;
    const lower = path.toLowerCase();
    return /\.(mp4|webm|ogg)$/i.test(lower);
  }

  private async generateVideoThumbnails() {
    if (!Array.isArray(this.data)) return;
    for (const post of this.data) {
      const url = post?.imageUrl;
      if (!url) continue;
      if (!this.isVideoUrl(url)) continue;
      if (this.videoThumbnails[url]) continue;
      this.createThumbnail(env.storageUrl + url)
        .then((thumb) => {
          if (thumb) this.videoThumbnails[url] = thumb;
        })
        .catch(() => {});
      // small delay to avoid blocking
      await new Promise((r) => setTimeout(r, 80));
    }
  }

  private createThumbnail(videoSrc: string): Promise<string | null> {
    return new Promise((resolve) => {
      try {
        const video = document.createElement('video');
        video.crossOrigin = 'anonymous';
        video.preload = 'metadata';
        video.muted = true;
        video.playsInline = true;
        video.src = videoSrc;

        const cleanup = () => {
          video.pause();
          video.src = '';
          video.load && video.load();
        };

        const onError = () => {
          cleanup();
          resolve(null);
        };

        video.addEventListener(
          'loadeddata',
          () => {
            try {
              const seekTime = 0.05;
              const onSeeked = () => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = Math.min(640, video.videoWidth || 640);
                  canvas.height =
                    (canvas.width * (video.videoHeight || 360)) /
                    (video.videoWidth || 640);
                  const ctx = canvas.getContext('2d');
                  if (ctx)
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                  cleanup();
                  resolve(dataUrl);
                } catch (e) {
                  cleanup();
                  resolve(null);
                }
              };

              video.addEventListener('seeked', onSeeked, { once: true });
              video.currentTime = Math.min(video.duration || 0, 0.05);
              setTimeout(() => {
                try {
                  const canvas = document.createElement('canvas');
                  canvas.width = Math.min(640, video.videoWidth || 640);
                  canvas.height =
                    (canvas.width * (video.videoHeight || 360)) /
                    (video.videoWidth || 640);
                  const ctx = canvas.getContext('2d');
                  if (ctx)
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                  const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
                  cleanup();
                  resolve(dataUrl);
                } catch (e) {
                  cleanup();
                  resolve(null);
                }
              }, 700);
            } catch (err) {
              onError();
            }
          },
          { once: true }
        );

        video.addEventListener('error', onError, { once: true });
      } catch (err) {
        resolve(null);
      }
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
