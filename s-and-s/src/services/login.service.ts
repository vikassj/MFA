import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { CommonService } from '../../src/shared/services/common.service';
import { DataService } from '../../src/shared/services/data.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient, private dataService: DataService) {
  }

  login(username: string, password: string) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/get_auth_token/';
    return this.http.post(url, { 'username': username, 'password': password }).pipe(map(
      (response: any) => {
        const user = response['data'];
        if (user) {
          sessionStorage.setItem('userName', user['username']);
          sessionStorage.setItem('firstName', user['first_name']);
          sessionStorage.setItem('lastName', user['last_name']);
          sessionStorage.setItem('firstLogin', user['firstLogin']);
          sessionStorage.setItem('plantDetails', JSON.stringify(user['plant_data'][0]));
          sessionStorage.setItem('userGroup', JSON.stringify(user['groups']));
        }
        return response;
      }
    ));
  }

  twoFactType(username: string, mode: string) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/select_auth/';
    return this.http.post(url, { 'username': username, 'authtype': mode }).pipe(map(
      response => {
        return response;
      }
    ));
  }

  validateEmailSecurityCode(username: string, securityCode: number | null) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/validate_otp/';
    return this.http.post(url, { 'username': username, 'otp': securityCode }).pipe(map(
      response => {
        return response;
      }
    ));
  }

  validateQrSecurityCode(username: string, securityCode: number | null = null) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/validate_qr_otp/';
    return this.http.post(url, { 'username': username, 'otp': securityCode }).pipe(map(
      response => {
        return response;
      }
    ));
  }

  logout() {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/signout/';
    return this.http.get(url).pipe(map(
      response => {
        return response;
      }
    ));
  }

  changePassword(emailId: string, currentPassword: string, newPassword: string, confirmNewPassword: string) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/chpass/';
    return this.http.post(url, { 'username': emailId, 'old_password': currentPassword, 'new_password1': newPassword, 'new_password2': confirmNewPassword }).pipe(map(
      response => {
        return response;
      }
    ));
  }

  forgotPassword(emailId: string) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/resetpass/';
    return this.http.post(url, { 'email': emailId }).pipe(map(
      response => {
        return response;
      }
    ));
  }

  clearData() {
    let url: any = sessionStorage.getItem('url');
    let apiUrl: any = sessionStorage.getItem('apiUrl');
    let wsUrl: any = sessionStorage.getItem('websocketUrl');
    sessionStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('url', url);
    sessionStorage.setItem('apiUrl', apiUrl);
    sessionStorage.setItem('wsUrl', wsUrl);
    this.dataService.passLoggedIn(false, true);
  }

  isLoggedIn() {
    let isLoggedIn: any = sessionStorage.getItem('loggedIn');
    if (sessionStorage.getItem('token') && JSON.parse(isLoggedIn)) {
      // sessionStorage.setItem('redirectUrl', '');
      return true;
    }
    else {
      sessionStorage.setItem('redirectUrl', window.location.href);
      return false;
    }
  }

  updateTermsConditions(termsValue: boolean) {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/update_tc_details/';
    return this.http.post(url, { 'tc_accepted': termsValue }).pipe(map(
      response => {
        return response;
      }
    ));
  }

}
