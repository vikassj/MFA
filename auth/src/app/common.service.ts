///////////////////////////////////////////////////////////////////////////////
// Filename : common.service.ts
// Description : Functionalities that are used across all the components
// Revision History:
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { map } from 'rxjs/operators';
import { MatomoTracker } from '@ngx-matomo/tracker';

import { assetUrl } from '../single-spa/asset-url';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  environment: boolean = false;
  environmentName: string = '';
  adminUrl: string = '';
  decryptionKey: string = '';
  defaultModule: string = '';

  constructor(
    private http: HttpClient,
    private readonly tracker: MatomoTracker
    ) {
    this.environmentName = environment.environmentName;
  }

  // read json configuration based on environment
  readConfigurationsData() {
    let fileName = (this.environmentName === 'dev') ? 'application-configurations.json' : 'application-configurations-prod.json';
    return this.http.get(assetUrl('/json/' + fileName)).pipe(map(
      data => {
        this.adminUrl = data['adminUrl'];
        this.decryptionKey = data['imageDecryptionKey'];
        this.defaultModule = data['defaultModule'];
        return data;
      }
    ));
  }

  // read json module configuration based on environment
  readModuleConfigurationsData(module: string) {
    let fileName = (this.environment) ? module + '-configurations-prod.json' : module + '-configurations.json';
    return this.http.get(assetUrl('/json/' + fileName)).pipe(map(
      data => {
        return data;
      }
    ));
  }

  showWelcomeMessage() {
    let url = window.location.pathname;
    let welcomeMsgShown = JSON.parse(sessionStorage.getItem('welcomeMsgShown'));
    if ((this.defaultModule.split('/')[1] == url.split('/')[1]) && !welcomeMsgShown) {
      sessionStorage.setItem('welcomeMsgShown', JSON.stringify(true));
      return true
    }
    else {
      return false;
    }
  }

  contactUs(contactData) {
    let url = sessionStorage.getItem('apiUrl') + 'upload/support_request/';
    return this.http.post(url, contactData).pipe(map(
      data => {
        return data;
      }
    ));
  }

  postUserActivityData(userActivityData) {
    let url = sessionStorage.getItem('apiUrl') + 'iogp_categories/user_clicks/';
    return this.http.post(url, userActivityData).pipe(map(
      data => {
        return data;
      }
    ));
  }

  // call API to get plant details
  fetchPlantDetails() {
    const headerDict = {
      'Authorization': 'Token ' + sessionStorage.getItem('access-token')
    }

    const requestHeaders = {
      headers: new HttpHeaders(headerDict)
    }
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/plant_data';
    return this.http.get(url, requestHeaders).pipe(map(
      data => {
        return data;
      }
    ));
  }

  notificationPost(dataObj) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/configurations/';
    return this.http.post(url, dataObj, this.getHeaders()).pipe(map(
      response => {
        return response;
      }
    ));
  }
  notificationget() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/configurations/';
    return this.http.get(url, this.getHeaders()).pipe(map(
      response => {
        return response;
      }
    ));
  }

  getHeaders() {
    return {
      headers: new HttpHeaders({
        'Authorization': 'Token ' + sessionStorage.getItem('access-token')
      })
    }
  }
  getAllApplications(plant_id) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Token ' + sessionStorage.getItem('access-token')
      })
    }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/application/?group_name='+'T-pulse'+'&plant_id='+plant_id;
    return this.http.get(url, httpOptions).pipe(map(
      data => {
        return data;
      }
    ));
  }

  sendMatomoEvent(action, name) {
    this.tracker.trackEvent('S&S', action, name);
  }
}
