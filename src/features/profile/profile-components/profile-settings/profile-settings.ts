import { Component } from '@angular/core';
import { SegmentedSwitcher } from '../../../../shared/segmented-switcher/segmented-switcher';
import { LucideAngularModule } from 'lucide-angular';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-profile-settings',
  imports: [SegmentedSwitcher, LucideAngularModule, RouterModule],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.scss',
})
export class ProfileSettings {}
