import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../../../core/services/common-service';
import { LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { SpinnerLoader } from '../../../../shared/loadings/spinner-loader/spinner-loader';

@Component({
  selector: 'app-about',
  imports: [LucideAngularModule, CommonModule, SpinnerLoader],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  userData: any;

  constructor(private commonService: CommonService) {}

  ngOnInit() {
    this.commonService.getProfileUserData().subscribe({
      next: (data) => {
        this.userData = data;
        console.log('About component userData:', this.userData);
      },
    });
  }
}
