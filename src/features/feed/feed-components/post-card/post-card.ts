import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { FormatNumberPipe } from '../../../../core/pipes/format-number-pipe';
import { Enviroment } from '../../../../enviroment/enviroment';
import { CommonModule } from '@angular/common';
import { RelativeTimePipePipe } from '../../../../core/pipes/relative-time-pipe-pipe';
import { SignalRService } from '../../../../core/services/signal-r-service';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { UserService } from '../../../../core/services/user-service';

@Component({
  selector: 'app-post-card',
  imports: [
    LucideAngularModule,
    FormatNumberPipe,
    CommonModule,
    RelativeTimePipePipe,
  ],
  templateUrl: './post-card.html',
  styleUrl: './post-card.scss',
})
export class PostCard {
  constructor(
    public env: Enviroment,
    public signalRService: SignalRService,
    private apiService: ApiService,
    private toastService: ToastService,
    public userService: UserService
  ) {}

  @Input() postData: any;

  @Output() deletePostNewData = new EventEmitter<void>();

  @ViewChild('settingsWrapper', { read: ElementRef })
  settingsWrapper!: ElementRef;

  public postSettingsMenu: boolean = false;
  togglepostSettingsMenu() {
    this.postSettingsMenu = !this.postSettingsMenu;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.postSettingsMenu) return;

    const target = event.target as Node | null;
    if (!target) {
      this.postSettingsMenu = false;
      return;
    }

    if (!this.settingsWrapper.nativeElement.contains(target)) {
      this.postSettingsMenu = false;
    }
  }

  deletePost() {
    if (!this.postData?.id) return;

    this.apiService.deletePost(this.postData.id).subscribe({
      next: (data: any) => {
        console.log(data);
        this.postSettingsMenu = false;
        this.toastService.success('Post deleted successfully.');
        this.getAllPosts();
      },
      error: (err: any) => {
        console.log(err);
        this.toastService.error(err.error.message || 'Failed to delete post.');
      },
    });
  }

  getAllPosts() {
    this.apiService.getAllPosts().subscribe({
      next: (data: any) => {
        console.log(data);
        this.deletePostNewData.emit(data.data);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }

  goToUserProfile() {}
}
