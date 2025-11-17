import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-auth-button',
  imports: [],
  templateUrl: './auth-button.html',
  styleUrl: './auth-button.scss',
})
export class AuthButton {
  @Input() text: string = '';
  @Input() isDisabled?: boolean;
}
