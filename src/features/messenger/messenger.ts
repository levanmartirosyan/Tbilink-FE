import { Component } from '@angular/core';
import { NavSwitcher } from '../../shared/nav-switcher/nav-switcher';

@Component({
  selector: 'app-messenger',
  imports: [NavSwitcher],
  templateUrl: './messenger.html',
  styleUrl: './messenger.scss',
})
export class Messenger {}
