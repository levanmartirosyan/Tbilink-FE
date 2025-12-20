import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LucideAngularModule } from 'lucide-angular';
import { ApiService } from '../../../../core/services/api-service';
import { SignalRService } from '../../../../core/services/signal-r-service';

@Component({
  selector: 'app-counters',
  imports: [LucideAngularModule],
  templateUrl: './counters.html',
  styleUrl: './counters.scss',
})
export class Counters implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  constructor(private api: ApiService, public signalRService: SignalRService) {}

  ngOnInit(): void {
    this.getStats();
  }

  public totalUsers: number = 0;
  public totalPosts: number = 0;
  public totalComments: number = 0;

  getStats() {
    this.api
      .adminStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const data = res?.data ?? res;
          this.totalUsers = data?.userCount ?? 0;
          this.totalPosts = data?.postCount ?? 0;
          this.totalComments = data?.commentCount ?? 0;
        },
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
