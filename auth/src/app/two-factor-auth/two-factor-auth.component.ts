import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CognitoService } from '../cognito.service';

import { CommonService } from '../common.service';
import { DataService } from '../data.service';
import { HttpService } from '../http.service';
// import { LoginService } from '../../services/login.service';
import { SnackbarService } from '../snackbar.service';

@Component({
  selector: 'app-two-factor-auth',
  templateUrl: './two-factor-auth.component.html',
  styleUrls: ['./two-factor-auth.component.scss'],
  host: {
    class: 'componentCss m-auto'
  }
})
export class TwoFactorAuthComponent implements OnInit {

  msg: string = '';
  defaultModule: string = '';
  setup: boolean = false;
  userData: any;
  step: number = 3;
  modes: any[] = [
    { label: 'Token (Google Authenticator)', value: 'qr' },
    { label: 'Email OTP', value: 'email' }
  ];
  selectedMode: string = '';
  qrCodeUrl: string = '';
  securityCode: number | null = null;
  timer: number | null = null;
  timerInterval: any;
  attemptsFailed: boolean = false;
  change2faMode: string = "false";

  constructor(private httpService: HttpService, private router: Router, private commonService: CommonService, private dataService: DataService, private snackbarService: SnackbarService, private cognitoService: CognitoService) {
    // this.commonService.readConfigurationsData().subscribe(data => {
    let data = JSON.parse(sessionStorage.getItem("application-configuration"))  
    this.defaultModule = data['defaultModule'];
      // let userData: any = sessionStorage.getItem('userData');
      // this.userData = JSON.parse(userData);
      // this.setup = (this.userData.page != 'auth' || this.userData['2fa_type'] === null) ? true : this.setup;
      // if (this.setup) {
      //   this.selectedMode = (this.userData['2fa_type'] === null) ? '' : this.userData['2fa_type'];
      //   this.step = (this.userData['2fa_type'] === null) ? 1 : 2;
      // }
      // else {
      //   this.step = 3;
      //   this.selectedMode = this.userData['2fa_type'];
      //   this.qrCodeUrl = (this.selectedMode === 'qr') ? this.userData.qr : '';
      // }
      // if (this.selectedMode === 'email' && this.step === 3) {
      //   this.resendEmailSecurityCode();
      // }
      // setTimeout(() => {
      //   this.dataService.passSpinnerFlag(false, true);
      // }, 200);
    // });
  }

  ngOnInit(): void {
    //after sending OTP, start the email otp timer.
      this.change2faMode = sessionStorage.getItem('change-2fa-mode-enabled')
      this.selectedMode = 'email'
      this.msg = 'Security code sent successfully. Check your registered mail.'
      this.snackbarService.show(this.msg, false, false, false, false);
      this.emailOtpTimer();
        
  }

  emailOtpTimer() {
    if (this.selectedMode === 'email') {
      clearInterval(this.timerInterval);
      //get timer details from session storage.
      this.timer = parseInt(sessionStorage.getItem('timer')) * 60;
      this.timerInterval = setInterval(() => {
        if (this.timer != 0) {
          this.timer = this.timer! - 1;
        }
      }, 1000);
    }
  }

  changeTwoFactMode() {
    this.step = 2;
    this.setup = true;
  }

  submitTwoFactMode() {
    this.dataService.passSpinnerFlag(true, true);
    this.securityCode = null;
    // this.loginService.twoFactType(this.userData.email, this.selectedMode).subscribe(
    //   (data: any) => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = '2FA changed successfully.'
    //     this.snackbarService.show(this.msg, false, false, false, false);
    //     if (this.selectedMode === 'qr') {
    //       this.qrCodeUrl = data['qr'];
    //     }
    //     this.userData['2fa_type'] = this.selectedMode;
    //     sessionStorage.setItem('userData', JSON.stringify(this.userData));
    //     this.step = 3;
    //     this.emailOtpTimer();
    //   },
    //   error => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = 'Error occured. Please try again.';
    //     this.logout();
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //   }
    // );
  }

  validateSecurityCode() {
    // if (this.selectedMode === 'email') {
    //   this.validateEmailSecurityCode();
    // }
    // else if (this.selectedMode === 'qr') {
    //   this.validateQrSecurityCode();
    // }
    this.validateEmailSecurityCode();
  }

  //resend OTP functionality and error handling.
  resendEmailSecurityCode() {
    this.dataService.passSpinnerFlag(true, true);
    this.attemptsFailed = false;
    this.securityCode = null;
    this.httpService.sendMfaOtp(sessionStorage.getItem('email'), JSON.parse(sessionStorage.getItem('2fa_type'))).subscribe((data: any) => {
      this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Security code sent successfully. Check your registered mail.'
        this.snackbarService.show(this.msg, false, false, false, false);
        this.emailOtpTimer();
    },
    (err) => {
      this.dataService.passSpinnerFlag(false, true);
      var msg = "Maximum limit for sending OTP has been reached. Please try again after an hour";
      this.snackbarService.show(msg, true, false, false, false);
      window.addEventListener("click", (evt) => {
          window.location.reload();
      });
    })
    // this.loginService.twoFactType(this.userData.email, 'email').subscribe(
    //   data => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = 'Security code sent successfully. Check your registered mail.'
    //     this.snackbarService.show(this.msg, false, false, false, false);
    //     this.emailOtpTimer();
    //   },
    //   error => {
        // this.dataService.passSpinnerFlag(false, true);
        // this.msg = (error.error['detail']) ? error.error['detail'] : 'Error occured. Please try again.';
        // this.logout();
        // this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //   }
    // );
  }

  validateEmailSecurityCode() {
    this.dataService.passSpinnerFlag(true, true);
    this.httpService.validateEmailSecurityCode(sessionStorage.getItem("email"), this.securityCode).subscribe((data: any) => {
      // console.log(data)
      this.dataService.passSpinnerFlag(false, true)
      window.dispatchEvent(new CustomEvent("otp_validated"))
    },
    (err) => {
      this.dataService.passSpinnerFlag(false, true)
      var msg = 'Invalid security code. Try again.'
      this.securityCode = null;
      this.snackbarService.show(msg, true, false, false, false);

    })
    // this.loginService.validateEmailSecurityCode(this.userData.email, this.securityCode).subscribe(
    //   (data: any) => {
    //     if (data['validation']) {
    //       sessionStorage.setItem('loggedIn', 'true');
    //       this.attemptsFailed = false;
    //       this.dataService.passLoggedIn(true, true);
    //       this.msg = 'Security code verified successfully.'
    //       this.snackbarService.show(this.msg, false, false, false, false);
    //       this.navigateToLandingPage(data);
    //     }
    //   },
    //   error => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = (error.status === 0) ? 'Error occured. Please try again.' : (error.error.otp_entry_exceed) ? 'You have reached maximum attempts. Click Resent OTP to get a new OTP.' : 'Invalid security code. Try again.';
    //     this.attemptsFailed = this.msg.includes('maximum') ? true : false;
    //     this.timer = (this.attemptsFailed) ? 0 : this.timer;
    //     if (this.attemptsFailed) {
    //       clearInterval(this.timerInterval);
    //     }
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //   }
    // );
  }

  validateQrSecurityCode() {
    this.dataService.passSpinnerFlag(true, true);
    // this.loginService.validateQrSecurityCode(this.userData.email, this.securityCode).subscribe(
    //   (data: any) => {
    //     if (data['validation']) {
    //       sessionStorage.setItem('loggedIn', 'true');
    //       this.attemptsFailed = false;
    //       this.dataService.passLoggedIn(true, true);
    //       this.msg = 'Security code verified successfully.'
    //       this.snackbarService.show(this.msg, false, false, false, false);
    //       this.navigateToLandingPage(data);
    //     }
    //   },
    //   error => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     this.msg = (error.status === 0) ? 'Error occured. Please try again.' : (error.error.otp_entry_exceed) ? 'You have reached maximum attempts. Click Resent OTP to get a new OTP.' : 'Invalid security code. Try again.';
    //     this.attemptsFailed = this.msg.includes('maximum') ? true : false;
    //     this.timer = (this.attemptsFailed) ? 0 : this.timer;
    //     if (this.attemptsFailed) {
    //       clearInterval(this.timerInterval);
    //     }
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //   }
    // );
  }

  navigateToLandingPage(data: any) {
    let user = data;
    if (user && user['token']) {
      let url: any = sessionStorage.getItem('redUrl');
      let redirectUrl = decodeURIComponent(url);
      let portal = sessionStorage.getItem('userLoggedIn');
      if(portal == 'auth'){
        if (redirectUrl.split('?')[1]) {
          this.router.navigateByUrl((redirectUrl) ? redirectUrl : this.defaultModule);
        }
        else {
          this.router.navigateByUrl(this.defaultModule);
        }
      }else{
        this.router.navigateByUrl('/vendor-management/vendor/inventory-form');
      }

    }
  }

  logout() {
    // this.loginService.logout().subscribe(
    //   (data: any) => {
    //     if (data['response_code'] === 1) {
    //       this.loginService.clearData();
    //       this.router.navigateByUrl('auth/logout');
    //     }
    //   },
    //   error => {
    //     this.msg = 'Error occured. Please try again.';
    //     this.snackbarService.show(this.msg, true, false, false, false);
    //   },
    //   () => {
    //   }
    // )
    window.dispatchEvent(new CustomEvent('Log-out'))
  }

  onKeydown($event: any) {
    if ($event.key === 'Enter' && this.securityCode != null) {
      this.validateSecurityCode();
    }
  }

  backClicked() {
    window.dispatchEvent(new CustomEvent("mfa-back-click"))
  }

}
