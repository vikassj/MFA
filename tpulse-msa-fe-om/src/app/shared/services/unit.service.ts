import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  constructor(private http: HttpClient) {
  }

  fetchReportsData(location, reportStartDate, reportEndDate) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/report?module=mpc&location=UL&unit=' + sessionStorage.getItem('mpcSelectedUnit') + '&zone=' + location + '&start_date=' + reportStartDate + '&end_date=' + reportEndDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  DayMonthYearWiseData(year, locationFilter, zone, module, month) {
    let url = ''
    if (year && locationFilter && zone && module) {
      url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/report_daywise?year=' + year + '&unit=' + sessionStorage.getItem('mpcSelectedUnit') + '&location=' + locationFilter + '&zone=' + zone + '&module=' + module;
    }
    if (year && locationFilter && zone && module && month) {
      url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/report_daywise?year=' + year + '&unit=' + sessionStorage.getItem('mpcSelectedUnit') + '&location=' + locationFilter + '&zone=' + zone + '&module=' + module + '&month=' + month;
    }
    return this.http.get(url).pipe(map(
      (data:any) => {
        data.forEach((val,ind) => {
          let date = val.date.split('-')
          date.reverse()
          let text =date.join('-');
          data[ind].date = text.toString()
        })
        return data;
      }
    ));
  }

  getChartData(startDate, endDate) {
    let url = sessionStorage.getItem('apiUrl') + 'upload/report_data?unit=' + sessionStorage.getItem('mpcSelectedUnit') + '&start_date=' + startDate + '&end_date=' + endDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMpcChartData(startDate, endDate) {
    let url = sessionStorage.getItem('apiUrl') + 'upload/cv_report_data?unit=' + sessionStorage.getItem('mpcSelectedUnit') + '&start_date=' + startDate + '&end_date=' + endDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getZoneManpowerCountingChartData(zone, startDate, endDate, startTime, endTime) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring/people_count_for_zone?unit=' + sessionStorage.getItem('mpcSelectedUnit') + '&zone=' + zone + '&start_date=' + startDate
      + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMpcBarGraphData(unit, zone, startDate, endDate,) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/people_count_daywise?unit=' + unit + '&zone=' + zone + '&start_date=' + startDate + '&end_date=' + endDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMpcZones() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/location_names?location=UL&unit=' + sessionStorage.getItem('mpcSelectedUnit');
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getLiveCount() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/occupancy_monitoring' + '/zone_data?live&location=UL&unit=' + sessionStorage.getItem('mpcSelectedUnit');
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

