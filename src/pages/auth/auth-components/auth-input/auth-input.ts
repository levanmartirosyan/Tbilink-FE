import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-auth-input',
  templateUrl: './auth-input.html',
  styleUrls: ['./auth-input.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AuthInput),
      multi: true,
    },
  ],
})
export class AuthInput implements ControlValueAccessor {
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() className?: string;
  @Input() autocomplete?: string;

  value = '';
  disabled = false;

  private onChange: (v: any) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: any): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = !!isDisabled;
  }

  handleInput(event: Event) {
    const v = (event.target as HTMLInputElement).value;
    this.value = v;
    this.onChange(v);
  }

  handleBlur() {
    this.onTouched();
  }
}
