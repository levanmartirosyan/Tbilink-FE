import { Component, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { NavSwitcher } from '../../shared/nav-switcher/nav-switcher';
import { Toast } from '../../shared/toast/toast';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  imports: [RouterModule, NavSwitcher, Toast],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main implements OnInit, OnDestroy {
  public showFooter: boolean = true;
  private sub: Subscription | null = null;

  currentRoute: string = '';

  constructor(private router: Router) {
    const url = this.router.url || '';
    this.showFooter = !url.includes('/messenger');
  }

  ngOnInit(): void {
    this.currentRoute = window.location.pathname;
    console.log(this.currentRoute);

    const url = this.router.url || '';
    this.showFooter = !url.includes('/messenger');

    this.sub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        const u = ev.urlAfterRedirects || ev.url || '';
        this.showFooter = !u.includes('/messenger');
        this.currentRoute = u;
        console.log(this.currentRoute);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.sub) this.sub.unsubscribe();
  }
}
