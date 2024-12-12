import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { DataService } from '../../shared/services/data.service';

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

  getSSOURL() {
    let url = sessionStorage.getItem('apiUrl') + 'accounts/get_sso_url';
    return this.http.get(url).pipe(map(
      response => {
        return response;
      }
    ));
  }

  logout() {
    window.dispatchEvent(new CustomEvent('invalidate-session'));
    this.dataService.passFeedBackFlag(false);
    sessionStorage.clear();
    window.location.reload()
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

  getUserAccessDetails() {
    let httpOptions  = {
      headers: new HttpHeaders({
        'Authorization' : 'Token ' + sessionStorage.getItem('access-token')
      })
    }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user_access';
    return this.http.get(url, httpOptions).pipe(map(
      (data:any) => {
        sessionStorage.setItem("accessible-plants",JSON.stringify(data?.plant_access));
        return data;
      }
    ));
  }

  fetchPlantDetails() {
    const headerDict = {
      'Authorization' : 'Token ' + sessionStorage.getItem('access-token')
    }

    const requestHeaders = {
      headers: new HttpHeaders(headerDict)
    }
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/plant_data';
    return this.http.get(url, requestHeaders).pipe(map(
      data => {
        return data;
      }
    ));
  }

  checkUserSession() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') +'/central_dashboard/is_session_valid'
    return this.http.get(url).pipe(map(
      (data: any) => {
        return data;
      }
    ))
  }
  invalidateUserSession(email: string) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/invalid_session?email=' + email
    return this.http.get(url).pipe(map(
      (data: any) => {
        return data;
      }
    ))
  }
  userLogout() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/logout/';
    return this.http.post(url, null).pipe(map(
      (data: any) => {
        return data;
      }
    ))
  }
}
