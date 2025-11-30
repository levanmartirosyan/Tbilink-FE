import { Component, Input } from '@angular/core';
import { NgxSonnerToaster } from 'ngx-sonner';
import { ThemeService } from '../../core/services/theme-service';

@Component({
  selector: 'app-toast',
  imports: [NgxSonnerToaster],
  templateUrl: './toast.html',
  styleUrl: './toast.scss',
})
export class Toast {
  constructor(public themeService: ThemeService) {}

  @Input() expand: boolean = false;
  @Input() position: any;
}
