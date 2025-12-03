import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavSwitcher } from '../../shared/nav-switcher/nav-switcher';
import { Toast } from '../../shared/toast/toast';

@Component({
  selector: 'app-main',
  imports: [RouterModule, NavSwitcher, Toast],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}
