import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  constructor(private http: HttpClient) {

  }

  getPlantDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/plant_access_list/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getCompanyDetails() {
    let company_host = ''
    if (sessionStorage.getItem('company-host') == "localhost:4200") {
      company_host = 'tpulse-project-intelligence-test'
    } else {
      company_host = sessionStorage.getItem('company-host')
    }
    let url = sessionStorage.getItem('apiUrl') + 'api/' + company_host + '/central_dashboard/company';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getUserAccessDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user_access';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getVendorAccessDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/vendor_access';
    console.log("called from CD");

    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
}

