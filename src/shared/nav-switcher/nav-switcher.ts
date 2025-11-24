import { Component, HostListener, OnInit } from '@angular/core';
import { Nav } from '../nav/nav';
import { NavMobile } from '../nav-mobile/nav-mobile';

@Component({
  selector: 'app-nav-switcher',
  imports: [Nav, NavMobile],
  templateUrl: './nav-switcher.html',
  styleUrl: './nav-switcher.scss',
})
export class NavSwitcher implements OnInit {
  isMobile = false;
  private mobileBreakpoint = 768;

  ngOnInit() {
    this.checkScreen();
  }

  @HostListener('window:resize')
  onResize() {
    this.checkScreen();
  }

  private checkScreen() {
    this.isMobile = window.innerWidth < this.mobileBreakpoint;
  }
}
