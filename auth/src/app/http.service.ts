import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DataService } from './data.service';
import { SnackbarService } from './snackbar.service';
@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient, private dataService: DataService, private snackbarService: SnackbarService) {

  }

  getPlantDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/central_dashboard/plant_access_list/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getCompanyDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/central_dashboard/company';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }


  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getConfigurations() {
    const mct_host = 'tpulse-msa-dev'; // this has to be replace with window.location.host
    var company_id = '';
    var region = '';
    if (sessionStorage.getItem('apiUrl')) {
      company_id = JSON.parse(sessionStorage.getItem('company-id'));
      region = JSON.parse(sessionStorage.getItem('region'));
      let url = sessionStorage.getItem('apiUrl') + 'api/' + company_id + '/central_dashboard/fe_module_configurations';
      this.http.get(url).subscribe((res) => {
        Object.keys(res).forEach(application => {
          var custom_application = application.replace(/_/g, '-');
          sessionStorage.setItem(custom_application + '-configurations', JSON.stringify(res[application][0]));
        });
        sessionStorage.setItem('central-tower-configurations', JSON.stringify(
            {
              "module_configurations": {
                  "application_header": [
                      {
                          "routePath": "/central-tower/dashboard",
                          // "identifier": "overall",
                          // "show_hide": true,
                      }
                  ],
                  "userManualFound": {
                      "userManualFound": "true"
                  }
              }
          }
        ));

        // sessionStorage.setItem('productivity-monitoring-configurations',JSON.stringify(
        //   {
        //     "page_configurations": {
        //         "help_page": {
        //             "page_sidebar": [
        //                 {
        //                     "class": "fa fa-book",
        //                     "show_hide": true,
        //                     "name": "User Manual",
        //                     "camelName": "userManual"
        //                 }
        //             ],
        //             "page_features": {
        //                 "user_manual_found": true
        //             }
        //         }
        //     },
        //     "module_configurations": {
        //         "application_header": [
        //             {
        //                 "show_hide": true,
        //                 "acronym": "OVERVIEW",
        //                 "name": "Overview",
        //                 "class": "fas fa-home",
        //                 "identifier": "dashboard",
        //                 "routePath": "/productivity-monitoring/dashboard"
        //             },
        //             {
        //               "show_hide": true,
        //               "acronym": "MACHINERY",
        //               "name": "Machinery",
        //               "class": "./assets/productivity-monitoring-icons/machinery-icon.svg",
        //               "identifier": "machinery",
        //               "routePath": "/productivity-monitoring/machinery"
        //             },
        //             {
        //               "show_hide": true,
        //               "acronym": "MANPOWER",
        //               "name": "Manpower",
        //               "class": "./assets/productivity-monitoring-icons/manpower-icon.svg",
        //               "identifier": "manpower",
        //               "routePath": "/productivity-monitoring/manpower"
        //             },
        //             {
        //               "show_hide": true,
        //               "acronym": "ISSUES",
        //               "name": "Issues",
        //               "class": "./assets/productivity-monitoring-icons/issues-icon.svg",
        //               "identifier": "issues",
        //               "routePath": "/productivity-monitoring/issues"
        //             },
        //             {
        //               "show_hide": true,
        //               "acronym": "ACTIONS",
        //               "name": "Actions",
        //               "class": "./assets/productivity-monitoring-icons/actions-icon.svg",
        //               "identifier": "actions",
        //               "routePath": "/productivity-monitoring/actions"
        //             },
        //             {
        //               "show_hide": true,
        //               "acronym": "NOTIFICATION",
        //               "name": "Notification",
        //               "class": "./assets/productivity-monitoring-icons/notification-icon.svg",
        //               "identifier": "notification",
        //               "routePath": "/productivity-monitoring/notification"
        //             },
        //             {
        //               "show_hide": true,
        //               "acronym": "Reports",
        //               "name": "Reports",
        //               "class": "fas fa-file-alt",
        //               "identifier": "reports",
        //               "routePath": "/productivity-monitoring/reports"
        //             },
        //             {
        //                 "show_hide": true,
        //                 "acronym": "Help",
        //                 "class": "fas fa-question-circle",
        //                 "routePath": "/productivity-monitoring/help",
        //                 "identifier": "help",
        //                 "name": "Help"
        //             }
        //         ]
        //     }}
        //   ))
      }, (error) => {
        this.dataService.passSpinnerFlag(false, true);
        const msg = 'Error : Company configurations could not be fetched!';
        this.snackbarService.show(msg, true, false, false, false);
      });

    }
  }

  setConfigurations() {
    this.getConfigurations();
    var i = 2;
    const loop = setInterval(() => {
      if (sessionStorage.getItem('apiUrl') || i == 0) {
        if (i == 0) {
          this.dataService.passSpinnerFlag(false, true);
          const msg = 'Error : Unable to fetch Api Url, Please retry!';
          this.snackbarService.show(msg, true, false, false, false);
        }
        clearInterval(loop);
      }
      else {
        this.getConfigurations();
      }
      i--;
    }, 2000);

  }

  getCompanyConfigData() {
    var host = ""
    if (sessionStorage.getItem('company-host') == "localhost" || sessionStorage.getItem("company-host") == "localhost:4200") {
      host = 'tpulse-project-intelligence-test'
    } else {
      host = sessionStorage.getItem('company-host')
    }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + host + '/central_dashboard/company';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getUserAccessDetails() {
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Token ' + sessionStorage.getItem('access-token')
      })
    }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user_access';
    // let url = sessionStorage.getItem('apiUrl') + 'api/' + 'central_dashboard/user_access';
    return this.http.get(url, httpOptions).pipe(map(
      (data:any) => {
        sessionStorage.setItem("logged_in_user", data.user_id)
        sessionStorage.setItem("user_entity", data?.user_entity)
        return data;
      }
    ));
  }

  sendMfaOtp(username: string, authType: string) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Token ' + sessionStorage.getItem('access-token')
      })
    }
    let body = { "username": username, "auth_type": authType }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/verify_mfa';
    return this.http.post(url, body, httpOptions).pipe(map(
      data => {
        return data;
      }
    ));
  }

  validateEmailSecurityCode(username: string, otp: any) {
    let httpOptions = {
      headers: new HttpHeaders({
        'Authorization': 'Token ' + sessionStorage.getItem('access-token')
      })
    }
    let body = { "username": username, "otp": otp }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/validate_otp';
    return this.http.post(url, body, httpOptions).pipe(map(
      data => {
        return data;
      }
    ));
  }

  checkUser(email: string) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user?email=' + email + '&user_pool_id=' + JSON.parse(sessionStorage.getItem('site-config')).cognito_user_pool_id + '&cognito_region=' + JSON.parse(sessionStorage.getItem('site-config')).cognito_region;
    // let url = sessionStorage.getItem('apiUrl') + 'api/central_dashboard/user?email=' + email + '&user_pool_id=' + JSON.parse(sessionStorage.getItem('site-config')).cognito_user_pool_id + '&cognito_region=' + JSON.parse(sessionStorage.getItem('site-config')).cognito_region;
    return this.http.get(url).pipe(map(
      data => {
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
}

