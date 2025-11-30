import { Component, Input } from '@angular/core';
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';

@Component({
  selector: 'app-followers-counter',
  imports: [FormatNumberPipe],
  templateUrl: './followers-counter.html',
  styleUrl: './followers-counter.scss',
})
export class FollowersCounter {
  @Input() userData?: any;
}
