import {
  AfterContentInit,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { CommonService } from '../../core/services/common-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-segmented-switcher',
  imports: [],
  templateUrl: './segmented-switcher.html',
  styleUrl: './segmented-switcher.scss',
})
export class SegmentedSwitcher implements OnInit, OnChanges {
  constructor(private router: Router) {}

  @Input() options: string[] = [];
  @Input() route: string = '';
  @Input() selectedOption: string = this.options[0];

  public ngOnInit(): void {
    this.sync();
  }

  public ngOnChanges(): void {
    if (!this.selectedOption && this.options.length) {
      this.selectedOption = this.options[0];
    }

    console.log(this.router.url);
  }

  public selectOption(option: string): void {
    this.selectedOption = option.toLowerCase();
    this.router.navigate([`/${this.route}/${this.selectedOption}`]);
    console.log(option);
  }

  private sync(): void {
    const url = this.router.url;
    const child = url.replace(`/${this.route}/`, '');

    const formattedOptions = this.options.map((option) => option.toLowerCase());

    if (formattedOptions.includes(child)) this.selectedOption = child;
    else this.selectedOption = formattedOptions[0];
  }
}
