import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

import { IUser, CognitoService } from '../cognito.service';

@Component({
  selector: 'app-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss'],
})
export class SignInComponent {
  isAuthenticated: boolean;
  currentPath: string = "";
  signUpScreen: boolean = false;
  forgotPasswordScreen: boolean = false
  loginScreen: boolean = true;
  mfaScreen: boolean = false;

  forceChangePasswordScreen: boolean = false;
  resetPasswordScreen: boolean = false;

  constructor(private router: Router, private cognitoService: CognitoService) {
    this.isAuthenticated = false;

    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.url;
        // this.cognitoService.isAuthenticated().then((success: boolean) => {
        //   this.isAuthenticated = success;
        // });
      }
    });

    window.addEventListener("mfaEnabled", (evt) => {
      this.loginScreen = false;
      this.mfaScreen = true;
    })

    window.addEventListener("forgotPassword", (evt) => {
      this.forgotPasswordScreen = true;
      this.loginScreen = false;
      this.forceChangePasswordScreen = false;
    })

    window.addEventListener("forceChangePassword", (evt) => {
      this.forceChangePasswordScreen = true;
      this.loginScreen = false;
      this.forgotPasswordScreen = false;
    });
    window.addEventListener("backClicked", (evt) => {
      this.forgotPasswordScreen = false;
      this.loginScreen = true;
    });
    window.addEventListener("password-updated-successfully", (evt) => {
      this.forceChangePasswordScreen = false;
      this.loginScreen = true;
    });
    window.addEventListener("password-reset-successful", (evt) => {
      sessionStorage.setItem('reset-password', JSON.stringify(false))
      this.resetPasswordScreen = false;
      this.loginScreen = true;
    });
    window.addEventListener("mfa-back-click", (evt) => {
      this.mfaScreen = false;
      this.loginScreen = true;
    });
  }

  public ngOnInit(): void {
    // this.cognitoService.isAuthenticated().then((success: boolean) => {
    //   this.isAuthenticated = success;
    // });

    if(sessionStorage.getItem('reset-password') == 'true') {
      this.forceChangePasswordScreen = false;
      this.loginScreen = false;
      this.forgotPasswordScreen = false;
      this.resetPasswordScreen = true;
    }

    // if (!this.isAuthenticated) {
    //   this.router.navigate(["cognito-auth/signIn"]);
    // }
  }

  // public signOut(): void {
  //   this.cognitoService.signOut().then(() => {
  //     this.router.navigate(["/signIn"]);
  //   });
  // }

}