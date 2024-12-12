import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms"

export const PasswordStrengthValidator = function (control: AbstractControl): ValidationErrors | null {

  let value: string = control.value || '';
  let msg = "";
  if (!value) {
    return { passwordStrength: `* This field is required` };
  }

  let upperCaseCharacters = /[A-Z]+/g
  if (upperCaseCharacters.test(value) === false) {
    window.dispatchEvent(new CustomEvent('password-invalid'))
    return { passwordStrength: `* Upper case letter required` };
  }

  let lowerCaseCharacters = /[a-z]+/g
  if (lowerCaseCharacters.test(value) === false) {
    window.dispatchEvent(new CustomEvent('password-invalid'))
    return { passwordStrength: `* Lower case letter required` };
  }


  let numberCharacters = /[0-9]+/g
  if (numberCharacters.test(value) === false) {
    window.dispatchEvent(new CustomEvent('password-invalid'))
    return { passwordStrength: `* Number required` };
  }

  let specialCharacters = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/
  if (specialCharacters.test(value) === false) {
    window.dispatchEvent(new CustomEvent('password-invalid'))
    return { passwordStrength: `* Special char required` };
  }

  if(upperCaseCharacters.test(value) === true && lowerCaseCharacters.test(value) === true && numberCharacters.test(value) === true && specialCharacters.test(value) === true) {
    sessionStorage.setItem('validPassword', JSON.stringify(true))
    window.dispatchEvent(new CustomEvent('password-validated'))
  }
   return { 
    passwordStrength: null  
  }

}

export function ConfirmedValidator(controlName: string, matchingControlName: string){
  return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];
      if (matchingControl.errors && !matchingControl.errors.confirmedValidator) {
          return;
      }
      if (control.value !== matchingControl.value) {
          matchingControl.setErrors({ confirmedValidator: true });
      } else {
          matchingControl.setErrors({ confirmedValidator: false });
      }
  }
}