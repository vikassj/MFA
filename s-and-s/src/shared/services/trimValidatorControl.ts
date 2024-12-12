import { FormGroup, FormArray, AbstractControl } from '@angular/forms';

export function trimFormValues(control: AbstractControl): void {
  if (control instanceof FormGroup) {
    Object.values(control.controls).forEach(trimFormValues);
  } else if (control instanceof FormArray) {
    control.controls.forEach(trimFormValues);
  } else if (control.value && typeof control.value === 'string') {
    control.setValue(control.value.trim(), { emitEvent: false }); // prevent triggering value changes if not needed
  }
}