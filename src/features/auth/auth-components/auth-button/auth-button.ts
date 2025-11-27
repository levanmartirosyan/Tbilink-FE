import { Component, Input } from '@angular/core';
import { CommonService } from '../../../../core/services/common-service';
import { BarLoader } from '../../../../shared/loadings/bar-loader/bar-loader';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-button',
  imports: [BarLoader, CommonModule],
  templateUrl: './auth-button.html',
  styleUrl: './auth-button.scss',
})
export class AuthButton {
  constructor(public commonService: CommonService) {}

  @Input() text: string = '';
  @Input() isDisabled?: boolean;
}
