import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ManpowerCountingCommonService {

  getGateMpcFilters: any;

  constructor(private http: HttpClient) {
  }

  getAvailableUnits(): any {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/units_list';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMpcLocations(): any {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/location_names';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

}

