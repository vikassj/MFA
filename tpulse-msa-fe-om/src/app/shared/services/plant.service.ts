import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PlantService {

  constructor(private http: HttpClient) {
  }

  getLiveCount() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring/' + 'zone_data?live';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

}
