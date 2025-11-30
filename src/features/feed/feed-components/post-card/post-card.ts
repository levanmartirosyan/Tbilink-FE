import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';

@Component({
  selector: 'app-post-card',
  imports: [LucideAngularModule, FormatNumberPipe],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {}
