import {
  AfterViewInit,
  Component,
  ElementRef,
  QueryList,
  ViewChildren,
} from '@angular/core';
import { ThemeSwitcher } from '../theme-switcher/theme-switcher';
import { LucideAngularModule } from 'lucide-angular';
import { NavigationEnd, Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-nav',
  imports: [ThemeSwitcher, LucideAngularModule, RouterModule],
  templateUrl: './nav.html',
  styleUrl: './nav.scss',
})
export class Nav implements AfterViewInit {
  @ViewChildren('navItem') navItems!: QueryList<ElementRef>;
  indicator!: HTMLElement;

  constructor(private router: Router, private el: ElementRef) {}

  ngAfterViewInit() {
    this.indicator = this.el.nativeElement.querySelector('.active-indicator');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.moveIndicator();
      }
    });

    // initial position
    this.moveIndicator();
  }

  moveIndicator() {
    const currentRoute = this.router.url;
    const items = this.el.nativeElement.querySelectorAll('.item');

    items.forEach((item: HTMLElement) => {
      if (item.getAttribute('ng-reflect-router-link') === currentRoute) {
        this.indicator.style.left = item.offsetLeft + 'px';
        this.indicator.style.width = item.offsetWidth + 'px';
      }
    });
  }
}
