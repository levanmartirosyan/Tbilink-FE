import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SegmentedSwitcher } from '../../shared/segmented-switcher/segmented-switcher';
import { ApiService } from '../../core/services/api-service';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';
import { Counters } from './admin-component/counters/counters';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    SegmentedSwitcher,
    LucideAngularModule,
    RouterModule,
    Counters,
  ],
  templateUrl: './admin.html',
  styleUrl: './admin.scss',
})
export class Admin implements OnInit {
  public users: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit(): void {}
}
