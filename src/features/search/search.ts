import { Component } from '@angular/core';
import { NavSwitcher } from '../../shared/nav-switcher/nav-switcher';

@Component({
  selector: 'app-search',
  imports: [NavSwitcher],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {}
