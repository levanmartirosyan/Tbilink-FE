import { Component } from '@angular/core';
import { AddPost } from './feed-components/add-post/add-post';
import { PostCard } from './feed-components/post-card/post-card';

@Component({
  selector: 'app-feed',
  imports: [AddPost, PostCard],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed {}
