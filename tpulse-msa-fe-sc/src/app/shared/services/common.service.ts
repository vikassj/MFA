import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  // base_url:string='https://tpulse-mfa-fe-api.detectpl.com'
  base_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http:HttpClient) { }
  getUnitsList(){
   return  this.http.get(this.base_url+'/units_list')
  }

  alphaNumericWithoutSpaceValidator(value: any) {
    let regex = /^\S+(?: \S+)*$/;
    return regex.test(value);
  }
}
