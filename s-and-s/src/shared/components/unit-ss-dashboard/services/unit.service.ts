///////////////////////////////////////////////////////////////////////////////
// Filename : unit.service.ts
// Description : Services associated with a unit
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

@Injectable({
  providedIn: 'root'
})
export class UnitService {

  constructor(private http: HttpClient) {
  }

  fetchDates() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/get_dates/?unit=' + sessionStorage.getItem('selectedUnit');
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchBirdsEyeViewData() {
    // return this.http.get('assets/json/birds-eye-view.json').pipe(map(
    return this.http.get('/assets/json/image-map.json').pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchObsDates(zone, job, date, timestamp, mode, riskRating, status) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/risk_status_dates/?unit=' + sessionStorage.getItem('selectedUnit') + '&zone=' + zone + '&job=' + encodeURIComponent(job) + '&start_date=' + date + '&start_time=' + timestamp + '&mode=' + mode;
    url = (riskRating) ? url + '&risk=' + riskRating : url;
    url = (status) ? url + '&status=' + status : url;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getObservations() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/global_search';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchSidebarData(moduleType) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/filters?units=' + moduleType;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchReportsData(month:number,year,isCreatedByMe:string) {
    var url = ''
    if(year && month ){
      url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/report_daywise?&unit=' + sessionStorage.getItem('selectedUnit') +'&year='+year+'&month='+month+'&location=unit'+'&is_created_by_me='+isCreatedByMe;
    }
    else if(year){
      url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/report_daywise?&unit=' + sessionStorage.getItem('selectedUnit') +'&year='+year+'&location=unit'+'&is_created_by_me='+isCreatedByMe;
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  generateReport(body:any){
    let  url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/generate_report';
    return this.http.post(url, body).pipe(map(
      data => {
        return data;
      }
    ));

  }
  getUserReportGenerate(){
    let  url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/get_share_report_user/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));

  }

  /*fetchReportsData(reportStartDate, reportEndDate) {
    let url = sessionStorage.getItem('apiUrl') + 'upload/report?location=UL&unit=' + sessionStorage.getItem('selectedUnit') + '&start_date=' + reportStartDate + '&end_date=' + reportEndDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }*/

  getChartData(startDate, endDate ,units) {
    if(startDate && endDate && units && endDate?.length <11){
      let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/report_data/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']';
      return this.http.get(url).pipe(map(
        data => {
          return data;
        },
      ));
    }
  }

  getFlightChartData(startDate, endDate) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/flights_chart?module=IOGPCategory&unit=' + sessionStorage.getItem('selectedUnit') + '&start_date=' + startDate + '&end_date=' + endDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  deleteReport(reportId) {
    let deleteObj = { 'id': reportId };
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/report_delete';
    return this.http.post(url, deleteObj).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getRiskwisebarChart(startDate,endDate ,units ,status){
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/unit_wise_risk_status_count/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']' + '&status=' + status;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getUserAccessDetails() {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user_access';
    return this.http.get(url).pipe(map(
      (data:any) => {
        sessionStorage.setItem("accessible-plants",JSON.stringify(data.plant_access));
        return data;
      }
    ));
  }

}
