import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
declare var $: any;

import { IModule } from '../interfaces/module.interface';

import { environment } from '../../environments/environment';
import { Observable, Subscriber } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class CommonService {

  environment: boolean = false;
  adminUrl: string = '';
  decryptionKey: string = '';
  defaultModule: string = '';
  url: string = '';

  constructor(private http: HttpClient) {
    this.environment = environment.production;
  }

  readConfigurationsData() {
    let fileName = (this.environment) ? 'application-configurations-prod.json' : 'application-configurations.json';
    return this.http.get('assets/json/' + fileName).pipe(map(
      (data: any) => {
        sessionStorage.setItem('modules', JSON.stringify(data['modules']));
        this.decryptionKey = data['imageDecryptionKey'];
        this.defaultModule = data['defaultModule'];
        this.url = data['url'];
        return data;
      }
    ));
  }

  readModuleConfigurationsData(module: string) {
    if (sessionStorage.getItem('userLoggedIn') == 'true') {
      const configuration = JSON.parse(sessionStorage.getItem(module + '-configurations'));
      if (configuration) {
        let obs = new Observable((subscriber) => {
          subscriber.next(configuration);
          subscriber.complete();
        });
        return obs;
      }
      else {
        let fileName = (this.environment) ? module + '-configurations-prod.json' : module + '-configurations.json';
        return this.http.get('assets/json/' + fileName).pipe(map(
          data => {
            return data;
          }
        ));
      }
    } else {
      window.dispatchEvent(new CustomEvent('userNotAuthenticated'))
      sessionStorage.clear();
      return null;
    }
  }

  readJsonData(fileName) {
    return this.http.get(fileName).pipe(map(
      data => {
        return data;
      }
    ));
  }

  uploadFile(file, path) {
    let url = sessionStorage.getItem('apiUrl') + 'config_module/upload_file/'
    let body = new FormData();
    body.append('path', path);
    body.append('file', file);
    return this.http.post(url, body).pipe(map(
      data => {
        return data;
      }
    ));
  }

  updateJSONData(data) {
    let url = sessionStorage.getItem('apiUrl') + 'config_module/update_file'
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getChatData(getUrl, start, end) {
    let url = sessionStorage.getItem('apiUrl') + getUrl;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  postNewMessage(postUrl, newMessageData) {
    let url = sessionStorage.getItem('apiUrl') + postUrl;
    const formData: FormData = new FormData();
    Object.keys(newMessageData).forEach(key => {
      formData.append(key, newMessageData[key]);
    });
    return this.http.post(url, formData).pipe(map(
      data => {
        return data;
      }
    ));
  }

  contactUs(contactData: any) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/support_request';
    return this.http.post(url, contactData).pipe(map(
      data => {
        return data;
      }
    ));
  }


  formatDate(date: any) {
    let d = date,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();
    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;
    return [year, month, day].join('-');
  }

  formatTime() {
    let today: any;
    today = new Date();
    let hours = today.getHours();
    let minutes = today.getMinutes();
    let seconds = today.getSeconds();
    if (hours < 10) {
      hours = '0' + hours;
    }
    return hours + ':' + minutes + ':' + seconds;
  }

  newformatTime(value: any) {
    value = new Date();
    let hours = value.getHours();
    let minutes = value.getMinutes();
    let seconds = value.getSeconds();
    if (hours < 10) {
      hours = '0' + hours;
    }
    return hours + ':' + minutes + ':' + seconds;
  }

  dateFormat(date: any) {
    return moment(date).format('DD-MMM-YY');
  }

  twoDigitFormatter(value: any) {
    return ('0' + value).slice(-2);
  }

  filterAndSumUniqueObjects(data: any[], key: string) {
    let finalData: any[] = [];
    let holder: any = {};
    data.forEach(item => {
      if (holder.hasOwnProperty(item[key])) {
        holder[item[key]] = holder[item[key]] + item.count;
      } else {
        holder[item[key]] = item.count;
      }
    });
    finalData = data.filter((value, index, self) => {
      return self.findIndex(v => v[key] === value[key]) === index;
    });
    finalData.forEach(item => {
      item.count = holder[item[key]]
    });
    return finalData;
  }

  showWelcomeMessage() {
    let url = window.location.pathname;
    let welcomeMsgShown: any = sessionStorage.getItem('welcomeMsgShown');
    welcomeMsgShown = JSON.parse(welcomeMsgShown);
    if (this.defaultModule.split('/')[1] == url.split('/')[1] && !welcomeMsgShown) {
      sessionStorage.setItem('welcomeMsgShown', JSON.stringify(true));
      return true
    }
    else {
      return false;
    }
  }

  returnFirstName() {
    return sessionStorage.getItem('firstName');
  }

  isFirstLogin() {
    let firstLogin: any = sessionStorage.getItem('firstLogin');
    return JSON.parse(firstLogin);
  }

  resizeDatatable() {
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 200);
  }

  formatTimeElement(date: any) {
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map(item => this.twoDigitFormatter(item)).join(':');
  }

  formatJavascriptDate(date: any) {
    return new Date(date.join('-'));
  }

  alphaNumericWithoutSpaceValidator(value: any) {
    let regex = /^\S+(?: \S+)*$/;
    return regex.test(value);
  }

  fetchImageData(imageUrl: string) {
    return this.http.get(imageUrl, { observe: 'response', responseType: 'blob' })
      .pipe(map((res: any) => {
        return new Blob([res.body], { type: res.headers.get('Content-Type') });
      }));
  }

  fetchEncryptedImageData(imageId: string, imageUrl: string) {
    return this.http.get(imageUrl, { observe: 'response', responseType: 'blob' })
      .pipe(map((res: any) => {
        let actualBlob = new Blob([res.body], { type: res.headers.get('Content-Type') });
        let a = this.decryptionKey;
        let reader = new FileReader();
        reader.readAsDataURL(actualBlob);
        reader.onloadend = function () {
          let base64data: any = reader.result;
          base64data = atob(base64data.split(',')[1]);
          let rawData = atob(base64data);
          let iv: any = rawData.substring(0, 16);
          let crypttext: any = rawData.substring(16);
          crypttext = CryptoJS.enc.Latin1.parse(crypttext);
          iv = CryptoJS.enc.Latin1.parse(iv);
          let b = CryptoJS.enc.Utf8.parse(a);
          let ciphertext: any = { ciphertext: crypttext };
          let plaintextArray: any = CryptoJS.AES.decrypt(
            ciphertext,
            b,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
          );
          let finalImg = CryptoJS.enc.Latin1.stringify(plaintextArray);
          finalImg = finalImg.slice(2, finalImg.length - 1);
          document.getElementById(imageId).setAttribute('src', 'data:image/jpeg;base64,' + finalImg);
        }
        return null;
      }));
  }

  returnShortModuleName(module: any) {
    let modules: any = sessionStorage.getItem('modules');
    return JSON.parse(modules).find((mod: any) => mod.routeUrl.includes(module)).shortName;
  }

  returnModuleName(module: any) {
    let modules: any = sessionStorage.getItem('modules');
    return JSON.parse(modules).find((mod: any) => mod.routeUrl.includes(module)).moduleName;
  }

  postUserActivityData(userActivityData: any) {
    let url = sessionStorage.getItem('apiUrl') + 'iogp_categories/user_clicks/';
    return this.http.post(url, userActivityData).pipe(map(
      data => {
        return data;
      }
    ));
  }

  newUserActivity(data) {
    let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/user_click_view/';
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  setUserActivityData() {
    let userActivityData: IModule = {
      safetyAndSurveillance: {
        plant: {
          home: {
          },
          help: {
          },
          changePassword: {
          }
        },
        unit: {
          dashboard: {
          },
          observations: {
            imageModal: []
          },
          reports: {
          },
          help: {
          },
          changePassword: {
          }
        }
      },
      confinedSpaceMonitoring: {},
      activityMonitoring: {},
      manpowerCounting: {},
      socialDistancing: {},
      frontInspection: {},
      interlockMonitoring: {}
    }
    sessionStorage.setItem('userActivity', JSON.stringify(userActivityData));
  }

  getReleaseNotes() {
    let url = sessionStorage.getItem('apiUrl') + 'upload/release_notes/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }


  alphaNumericSpaceValidator(value) {
    let regex = /^[ A-Za-z0-9-]*$/;
    return regex.test(value);
  }

  navigateToAdmin() {
    let url = this.adminUrl + '?userData=' + unescape(encodeURIComponent(window.btoa(sessionStorage.getItem('userData')))) + '&autoLogin=' + unescape(encodeURIComponent(window.btoa(sessionStorage.getItem('token'))));
    window.open(url);
  }

  navigateToModule(module) {
    let url = this.url + 'sc/' + module + '/?userData=' + unescape(encodeURIComponent(window.btoa(sessionStorage.getItem('userData')))) + '&autoLogin=' + unescape(encodeURIComponent(window.btoa(sessionStorage.getItem('token'))))
    window.open(url);
  }

  getUserManual() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user_manual?app_name='+'occupancy_monitoring'+'&plant_id='+sessionStorage.getItem('selectedPlant');
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

}
