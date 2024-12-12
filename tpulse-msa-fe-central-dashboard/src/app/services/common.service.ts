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
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { assetUrl } from '../../single-spa/asset-url';

// import { IModule } from '../shared/interfaces/module.interface';

import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  environment: boolean = false;
  environmentName: string = '';
  adminUrl: string = '';
  decryptionKey: string = '';
  defaultModule: string = '';

  constructor(private http: HttpClient) {
    this.environmentName = environment.environmentName;
  }

  readConfigurationsData() {
    let fileName = (this.environmentName === 'dev') ? 'application-configurations.json' : 'application-configurations-prod.json';
    return this.http.get(assetUrl('/json/' + fileName)).pipe(map(
      data => {
        sessionStorage.setItem('modules', JSON.stringify(data['modules']));
        this.adminUrl = data['adminUrl'];
        this.decryptionKey = data['imageDecryptionKey'];
        this.defaultModule = data['defaultModule'];
        return data;
      }
    ));
  }

  // readModuleConfigurationsData(module: string) {
  //   let fileName = (this.environment) ? module + '-configurations-prod.json' : module + '-configurations.json';
  //   return this.http.get(assetUrl('/json/' + fileName)).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }

  readModuleConfigurationsData(module: string) {
    var configuration = '';
    if (window.location.href.split("/").indexOf('client') > -1) {
      configuration = JSON.parse(sessionStorage.getItem(module + '-client-configurations'));
    } else if (window.location.href.split("/").indexOf('vendor') > -1) {
      configuration = JSON.parse(sessionStorage.getItem(module + '-vendor-configurations'));
    } else {
      configuration = JSON.parse(sessionStorage.getItem(module + '-configurations'));
    }
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
  }

  showWelcomeMessage() {
    let url = window.location.pathname;
    let welcomeMsgShown = JSON.parse(sessionStorage.getItem('welcomeMsgShown'));
    if ((this.defaultModule.split('/')[1] == url.split('/')[1]) && !welcomeMsgShown) {
      console.log((this.defaultModule.split('/')[1] == url.split('/')[1]) && !welcomeMsgShown)
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

  fetchPlantDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/plant_data';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  // setUserActivityData() {
  //   let userActivityData: IModule = {
  //     safetyAndSurveillance: {
  //       plant: {
  //         home: {
  //         },
  //         help: {
  //         },
  //         changePassword: {
  //         }
  //       },
  //       unit: {
  //         dashboard: {
  //         },
  //         observations: {
  //           imageModal: []
  //         },
  //         reports: {
  //         },
  //         help: {
  //         },
  //         changePassword: {
  //         }
  //       }
  //     },
  //     confinedSpaceMonitoring: {},
  //     activityMonitoring: {},
  //     manpowerCounting: {},
  //     socialDistancing: {},
  //     frontInspection: {},
  //     interlockMonitoring: {}
  //   }
  //   sessionStorage.setItem('userActivity', JSON.stringify(userActivityData));
  // }

}
