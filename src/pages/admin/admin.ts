import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf } from '@angular/common';
import { SegmentedSwitcher } from '../../shared/segmented-switcher/segmented-switcher';
import { ApiService } from '../../core/services/api-service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, SegmentedSwitcher, LucideAngularModule, NgIf],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  public users: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getAllUsersAdmin().subscribe({
      next: (res: any) => {
        const normalize = (payload: any): any[] => {
          if (!payload && payload !== 0) return [];
          if (Array.isArray(payload)) return payload;
          if (payload?.data) return normalize(payload.data);
          if (payload?.items) return normalize(payload.items);
          if (typeof payload === 'object') {
            const vals = Object.values(payload || {});
            if (vals.length && vals.every((v) => typeof v === 'object'))
              return vals;
          }
          return [];
        };

        this.users = normalize(res);
        if (!Array.isArray(this.users)) this.users = [];
      },
      error: (err: any) => {
        console.error('Failed to load admin users', err);
        this.users = [];
      },
    });
  }
}
