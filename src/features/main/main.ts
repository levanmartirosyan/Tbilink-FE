import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavSwitcher } from '../../shared/nav-switcher/nav-switcher';

@Component({
  selector: 'app-main',
  imports: [RouterModule, NavSwitcher],
  templateUrl: './main.html',
  styleUrl: './main.scss',
})
export class Main {}
