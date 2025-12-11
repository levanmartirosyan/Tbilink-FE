import {
  AfterContentInit,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { CommonService } from '../../core/services/common-service';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

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
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.sync();
      });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    if (!this.selectedOption && this.options.length) {
      this.selectedOption = this.options[0];
    }
    if (changes['route']) {
      this.sync();
    }
    console.log(this.router.url);
  }

  public selectOption(option: string): void {
    this.selectedOption = option.toLowerCase();
    if (Array.isArray(this.route)) {
      this.router.navigate([...this.route, this.selectedOption]);
    } else {
      this.router.navigate([this.route, this.selectedOption]);
    }
    console.log(option);
  }

  private sync(): void {
    const url = this.router.url;
    const parts = url.split('/');
    const child = parts[parts.length - 1];

    const formattedOptions = this.options.map((option) => option.toLowerCase());

    if (formattedOptions.includes(child)) this.selectedOption = child;
    else this.selectedOption = formattedOptions[0];
  }
}
