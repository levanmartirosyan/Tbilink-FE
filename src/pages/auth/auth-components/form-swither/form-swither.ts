import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-form-swither',
  imports: [RouterModule],
  templateUrl: './form-swither.html',
  styleUrl: './form-swither.scss',
})
export class FormSwither {
  @Input() getFormName: string | undefined;
}
