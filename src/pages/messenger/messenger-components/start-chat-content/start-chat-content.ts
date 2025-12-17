import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../../core/services/api-service';
import { LucideAngularModule } from 'lucide-angular';
import { env } from '../../../../enviroment/enviroment';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';
import { Router } from '@angular/router';

@Component({
  selector: 'app-start-chat-content',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, SpinnerLoader],
  templateUrl: './start-chat-content.html',
  styleUrl: './start-chat-content.scss',
})
export class StartChatContent implements OnInit {
  @Output() start = new EventEmitter<any>();

  followers: any[] = [];
  filteredFollowers: any[] = [];
  search: string = '';
  isLoading: boolean = true;

  public env = env;

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.getMutualFollowers().subscribe({
      next: (res: any) => {
        this.followers = res?.data || [];
        this.filteredFollowers = [...this.followers];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  onSearchInput(e: Event) {
    this.search = (e.target as HTMLInputElement).value || '';
    const term = this.search.trim().toLowerCase();
    this.filteredFollowers = this.followers.filter((f) => {
      const first = (f.firstName || '').toString();
      const last = (f.lastName || '').toString();
      const fullName =
        first || last ? `${first} ${last}`.trim() : f.fullName || '';
      const userName = (f.userName || '').toString();
      const hay = `${fullName} ${userName}`.toLowerCase();
      return hay.includes(term);
    });
  }

  getInitials(name?: string) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  onStart(user: any) {
    console.log(user);

    this.start.emit(user);
  }

  goToUserProfile(username: string) {
    this.router.navigate(['/profile', username]);
  }
}
