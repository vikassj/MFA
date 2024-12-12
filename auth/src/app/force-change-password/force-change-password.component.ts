import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { IUser, CognitoService } from "../cognito.service";
import { DataService } from "../data.service";
import { SnackbarService } from "../snackbar.service";

@Component({
  selector: "auth-force-change-password",
  templateUrl: "./force-change-password.component.html",
  styleUrls: ["./force-change-password.component.scss"],
})
export class ForceChangePasswordComponent {
  loading: boolean;
  isConfirm: boolean;
  user: IUser;
  emailId: string;
  newPassword:string='';
  confirmNewPassword:string='';
  showConfirmPassword: boolean = false;
  showPassword: boolean = false;
  resetPasswordScreen: boolean = false;
  errormsg:string = ''
  confrimPasswordErrorMsg:string = ''
  checkPassword:boolean = false;
  checkConfrimPassword:boolean = false;
  constructor(
    private router: Router,
    private cognitoService: CognitoService,
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {
    this.loading = false;
    this.isConfirm = false;
    this.user = {} as IUser;
  }

  ngOnInit() {}
  newPasswordValidators(){
    this.checkPassword = false
     if(/^\s+$/.test(this.newPassword)){
      this.errormsg = "White spaces are not allowed."
    }
    else if(this.newPassword === ''){
      this.errormsg = 'new password is required'
    }
    else if(this.newPassword.length < 8 && this.confirmNewPassword.length < 8) {
      this.errormsg = "The password is too short. It must contain at least 8 characters."
    }
    else if(/[0-9]+/g.test(this.newPassword) === false) {
      this.errormsg = "At least 1 numerical value is required."
    }
    else if(/[a-z]+/g.test(this.newPassword) === false) {
      this.errormsg = "At least 1 lowercase letter is required."    }
    else if(/[A-Z]+/g.test(this.newPassword) === false){
      this.errormsg = "At least 1 uppercase letter is required."    
    }
    else if(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(this.newPassword) === false){
      this.errormsg = "At least 1 special character is required."    
    }
    else{
      this.errormsg = ""
      this.checkPassword = true;
    }
  }
  confrimPasswordValidators(){
    this.checkConfrimPassword = false;
    if(this.newPassword !== this.confirmNewPassword) {
      this.confrimPasswordErrorMsg =  "The two password fields do not match"
    }
    else{
      this.confrimPasswordErrorMsg = ""
     this.checkConfrimPassword = true;
    }
  }
  submitForceChangePassword() {
    this.dataService.passSpinnerFlag(true, true);
    if(this.newPassword == '' && this.confirmNewPassword == '') {
      this.dataService.passSpinnerFlag(false, true)
      var msg = "All the fields are required."
      this.snackbarService.show(msg, true, false, false, false)
    } else {
      if(this.newPassword == this.confirmNewPassword) {
        //checking length of the password to be more than 8 characters.
        if(this.newPassword.length < 8 && this.confirmNewPassword.length < 8) {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "The password is too short. It must contain at least 8 characters."
          this.snackbarService.show(msg, true, false, false, false)
        }
        //checking if the password contains only numbers.
         else if(this.newPassword.match(/^[0-9]+$/)) {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "This password is entirely numeric."
          this.snackbarService.show(msg, true, false, false, false)
        }
        //checking if the password contains only letters
        else if(this.newPassword.match(/^[a-zA-Z]+$/)) {
          this.dataService.passSpinnerFlag(false, true)
          var msg = "Password must contain : 1 lowercase & 1 uppercase, 1 number(0-9), \n1 Special Character(!@#$%^&*), Atleast 8 Characters"
          this.snackbarService.show(msg, true, false, false, false)
        }
        //if all the policies match, then force change password. 
        else {
          this.cognitoService
          .forceChangePassword(this.newPassword)
          .then((data: any) => {
            var msg =
              "Password Updated successfully. Login again with new credentials.";
            this.snackbarService.show(msg, false, false, false, false);
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("password-updated-successfully")
              );
              this.dataService.passSpinnerFlag(false, true);
            }, 500);
          })
          .catch((err) => {
            this.dataService.passSpinnerFlag(false, true);
            this.snackbarService.show(err, true, false, false, false);
          });
        }
      } else {
           this.dataService.passSpinnerFlag(false, true)
           var msg = "The two password fields didn't match"
           this.snackbarService.show(msg, true, false, false, false)
      }
    }
    
    
    if(this.newPassword != "" && this.confirmNewPassword != null) {
      if (this.newPassword == this.confirmNewPassword) {
        
      } else {
        this.dataService.passSpinnerFlag(false, true);
        var msg = "Passwords should match.";
        this.snackbarService.show(msg, true, false, false, false);
      }
    } else {
      this.dataService.passSpinnerFlag(false, true);
      var msg = "Fields cannot be empty.";
      this.snackbarService.show(msg, true, false, false, false);
    }
    
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  showHideConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
