import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GateService {

  constructor(private http: HttpClient) {
  }

  getGateManpowerCountingChartData(gate, startDate, endDate, startTime, endTime) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring/people_count_for_zone?zone=' + gate + '&start_date=' + startDate
      + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMpcGates() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/location_names';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getLiveCount() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/zone_data?live&location=GL';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchReportsData(location, reportStartDate, reportEndDate) {
    let url = sessionStorage.getItem('apiUrl') + 'upload/report?module=mpc&location=GL&zone=' + location + '&start_date=' + reportStartDate + '&end_date=' + reportEndDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  deleteReport(reportId) {
    let deleteObj = { 'id': reportId };
    let url = sessionStorage.getItem('apiUrl') + 'upload/report_delete';
    return this.http.post(url, deleteObj).pipe(map(
      data => {
        return data;
      }
    ));
  }

}
