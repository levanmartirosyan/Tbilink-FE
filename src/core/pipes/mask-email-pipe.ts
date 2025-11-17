import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'maskEmail',
})
export class MaskEmailPipe implements PipeTransform {
  transform(email: string | null | undefined): string {
    if (!email) return '';

    const [local, domain] = email.split('@');
    if (!local || !domain) return email;

    if (local.length <= 2) {
      return `${local[0]}***@${domain}`;
    }

    return `${local[0]}${'*'.repeat(local.length - 2)}${
      local[local.length - 1]
    }@${domain}`;
  }
}
