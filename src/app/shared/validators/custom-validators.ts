import { AbstractControl } from '@angular/forms';

export class CustomValidators {

  static MatchPassword(control: AbstractControl) {
    const password = control.get('newPassword').value;
    const confirmPassword = control.get('confirmPassword').value;
    if (password !== confirmPassword) {
      control.get('confirmPassword').setErrors({ confirmPassword: true });
    } else {
      control.get('confirmPassword').setErrors(null);
    }
  }
}
