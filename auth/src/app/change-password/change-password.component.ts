import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators, AbstractControl, FormControl } from "@angular/forms";
import { CognitoService } from "../cognito.service";
import { DataService } from "../data.service";
import { ConfirmedValidator, PasswordStrengthValidator } from "../forgot-password/passwordStrengthValidator";
import { SnackbarService } from "../snackbar.service";

@Component({
  selector: "auth-change-password",
  templateUrl: "./change-password.component.html",
  styleUrls: ["./change-password.component.scss"],
})
export class ChangePasswordComponent implements OnInit {
  currentPassword: string = "";
  newPassword: string = "";
  confirmNewPassword: string = "";
  showPassword: boolean = false;

  public passwordForm: FormGroup;

  constructor(
    private cognitoService: CognitoService,
    private snackbarService: SnackbarService,
    private dataService: DataService,
    private fb: FormBuilder
  ) {
    this.passwordForm = fb.group({
      currPass: [null, Validators.compose([
        Validators.required
      ])],
      newPass: [null, Validators.compose([
        Validators.minLength(8), PasswordStrengthValidator
      ])],
      checkNewPassword: [null, Validators.compose([
        Validators.required
      ])]
    },
      {
        validator: ConfirmedValidator('newPass', 'checkNewPassword')
      });

    // this.passwordForm.get('newPass').

    window.addEventListener("password-reset-done", (evt) => {
      var msg =
        "Password Updated successfully. Login again with new credentials.";
      this.snackbarService.show(msg, false, false, false, false);
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("password-reset-successful"));
        this.dataService.passSpinnerFlag(false, true);
      }, 1000);
    });
  }

  get f() {
    return this.passwordForm.controls;
  }

  ngOnInit(): void {
  }

  showHidePassword() {
    ["currentPassword", "newPassword", "confirmNewPassword"].forEach((item) => {
      let inputElement: any = document.getElementById(item);
      inputElement["type"] =
        inputElement["type"] === "password" ? "text" : "password";
    });
  }

  onKeydown($event: any) {
    if ($event.key === "Enter") {
      this.resetPassword();
    }
  }

  resetPassword() {
    this.dataService.passSpinnerFlag(true, true);
    if (this.newPassword == '' && this.confirmNewPassword == '' && this.currentPassword == '') {
      this.dataService.passSpinnerFlag(false, true)
      var msg = "All the fields are required."
      this.snackbarService.show(msg, true, false, false, false)
    } else {

      if (this.newPassword == this.confirmNewPassword) {

        //checking length of the password to be more than 8 characters.
        if (this.newPassword.length < 8 && this.confirmNewPassword.length < 8) {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "The password is too short. It must contain at least 8 characters."
          this.snackbarService.show(msg, true, false, false, false)
        }
        //checking if the password contains only numbers.
        else if (this.newPassword.match(/^[0-9]+$/)) {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "This password is entirely numeric."
          this.snackbarService.show(msg, true, false, false, false)
        }
        //checking if the password contains only letters
        else if (this.newPassword.match(/^[a-zA-Z]+$/)) {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "Password must contain : 1 lowercase & 1 uppercase, 1 number(0-9), \n1 Special Character(!@#$%^&*), Atleast 8 Characters"
          this.snackbarService.show(msg, true, false, false, false)
        }
        //if all the policies match, then reset password. 
        else {
          this.cognitoService.resetPassword(this.currentPassword, this.newPassword);
        }
      } else {
        this.dataService.passSpinnerFlag(false, true)
        var msg = "The two password fields didn't match"
        this.snackbarService.show(msg, true, false, false, false)
      }
    }
  }

}
