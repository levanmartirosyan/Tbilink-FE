import { Component, Input } from '@angular/core';
import { CommonService } from '../../core/services/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-segmented-switcher',
  imports: [],
  templateUrl: './segmented-switcher.html',
  styleUrl: './segmented-switcher.scss',
})
export class SegmentedSwitcher {
  constructor(private commonService: CommonService, private router: Router) {}

  @Input() options: string[] = [];

  selectedOption: string = 'profile';

  selectOption(option: string): void {
    this.selectedOption = option.toLowerCase();
    this.router.navigate([`/settings/${this.selectedOption}`]);
    console.log(option);
  }
}
