import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { CommonService } from '../../../../core/services/common-service';
import { RouterModule } from '@angular/router';
import { MaskEmailPipe } from '../../../../core/pipes/mask-email-pipe';

@Component({
  selector: 'app-auth-greeting',
  imports: [CommonModule, RouterModule, MaskEmailPipe],
  templateUrl: './auth-greeting.html',
  styleUrl: './auth-greeting.scss',
})
export class AuthGreeting implements OnInit {
  constructor(public commonService: CommonService) {}

  ngOnInit(): void {
    this.saveUserEmail();
  }

  @Input() getFormName: string | undefined;

  public userEmail?: string;

  saveUserEmail() {
    const formData = sessionStorage.getItem('form-action');

    if (formData) {
      this.commonService.setRecEmail(JSON.parse(formData));
    }
  }
}
