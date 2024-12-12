import { Component, OnChanges, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { CognitoService } from "../cognito.service";
import { DataService } from "../data.service";
import { SnackbarService } from "../snackbar.service";
import { PasswordStrengthValidator } from "./passwordStrengthValidator";
import { CommonService } from "../common.service";
import { HttpService } from "../http.service";

@Component({
  selector: "auth-forgot-password",
  templateUrl: "./forgot-password.component.html",
  styleUrls: ["./forgot-password.component.scss"],
})
export class ForgotPasswordComponent implements OnInit, OnChanges {

  emailId: string = "";
  submitClicked: boolean = false;
  newPassword: string = "";
  code: string = "";
  showPassword: boolean = false;
  msg: string = ""
  public passwordForm: FormGroup;
  valid: boolean = false;

  constructor(
    private cognitoService: CognitoService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private router: Router,
    private fb: FormBuilder,
    private commonService: CommonService,
    private httpService: HttpService
  ) {
    this.passwordForm = fb.group({
      password: [null, Validators.compose([
        Validators.required, Validators.minLength(8), PasswordStrengthValidator])]
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    window.addEventListener('password-validated', (ev) => {
      this.valid = true;
    })
    window.addEventListener('password-invalid', (ev) => {
      this.valid = false;
    })
  }

  validateEmail() {
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (regexp.test(this.emailId) == false) {
      this.msg = 'Please enter a valid Email ID.';
      return false;
    }
    else {
      this.msg = '';
      return true;
    }
  }

  forgotPassword() {
    this.dataService.passSpinnerFlag(true, true);
    if(this.validateEmail()) {
      this.httpService.checkUser(this.emailId).subscribe((data) => {
        if(data) {
          this.cognitoService.forgotPassword(this.emailId).then(
            (data: any) => {
              window.dispatchEvent(new CustomEvent("forgotPasswordSubmit"));
              this.submitClicked = true;
              this.dataService.passSpinnerFlag(false, true);
            },
            (err) => {
              this.snackbarService.show(err, true, false, false, false);
              this.dataService.passSpinnerFlag(false, true);
            }
          );
        } else {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "User is not registered with T-Pulse, Please contact Administrator."
          this.snackbarService.show(msg, true, false, false, false)
        }
      })
    } else {
      this.dataService.passSpinnerFlag(false, true);
      this.snackbarService.show(this.msg, true, false, false, false)
    }
  }

  submitNewPassword() {
    this.dataService.passSpinnerFlag(true, true);
    this.code = this.code.toString();
    this.cognitoService
      .forgotPasswordSubmit(this.emailId, this.code, this.newPassword)
      .then(
        (data: any) => {
          // window.location.reload();
        },
        (err) => {
          this.dataService.passSpinnerFlag(false, true);
          this.snackbarService.show(err, true, false, false, false);
        }
      );
  }

  backClicked() {
    this.commonService.sendMatomoEvent('Incomplete/ back reset password', 'Forgot password');
    window.dispatchEvent(new CustomEvent("backClicked"));
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }
}
