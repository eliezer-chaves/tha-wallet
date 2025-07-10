import { AbstractControl, ValidationErrors } from '@angular/forms';

export class CustomValidators {
  static viaCepError(control: AbstractControl): ValidationErrors | null {
    return control.hasError('viaCepError') ? { viaCepError: true } : null;
  }
}