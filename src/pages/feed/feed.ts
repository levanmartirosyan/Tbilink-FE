import { Component, OnInit } from '@angular/core';
import { AddPost } from './feed-components/add-post/add-post';
import { PostCard } from './feed-components/post-card/post-card';
import { ApiService } from '../../core/services/api-service';
import { Title } from '@angular/platform-browser';
import { EditPostModal } from './feed-components/edit-post-modal/edit-post-modal';
import { CommentModal } from './feed-components/comment-modal/comment-modal';

@Component({
  selector: 'app-feed',
  imports: [AddPost, PostCard, EditPostModal, CommentModal],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit {
  constructor(private api: ApiService, private title: Title) {}

  ngOnInit(): void {
    this.title.setTitle('Tbilink - Feed');
    this.getAllPosts();
  }

  public postData: any;

  public editPostModal: boolean = false;

  public selectedPost: any = null;

  public commentModal: boolean = false;

  public selectedCommentPost: any = null;

  getAllPosts() {
    this.api.getAllPosts().subscribe({
      next: (data: any) => {
        console.log(data);

        this.postData = data.data.sort(
          (a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
      error: (err: any) => {
        console.log(err);
      },
    });
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
