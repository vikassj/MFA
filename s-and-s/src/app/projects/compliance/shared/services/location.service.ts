///////////////////////////////////////////////////////////////////////////////
// Filename : location.service.ts
// Description : Services associated with a location
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
export class LocationService {

  constructor(private http: HttpClient) {
  }

  getComplianceData(camera, startDate, endDate) {
    let url = '';
    if (camera) {
      url = sessionStorage.getItem('apiUrl') + 'covid/compliance_table/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&camera=' + camera + '&start_date=' + startDate + '&end_date=' + endDate;
    }
    else {
      url = sessionStorage.getItem('apiUrl') + 'covid/compliance_table/?unit=' + sessionStorage.getItem('csSelectedLocation');
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getInsightsData(cumulativeCompliance, startDate, endDate) {
    let url = '';
    if (cumulativeCompliance) {
      url = sessionStorage.getItem('apiUrl') + 'covid/insights/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&start_date=' + startDate + '&end_date=' + endDate;
    }
    else {
      url = sessionStorage.getItem('apiUrl') + 'covid/insights/?unit=' + sessionStorage.getItem('csSelectedLocation');
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchZoneWiseSummaryFilters() {
    let url = sessionStorage.getItem('apiUrl') + 'covid/filters/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchLiveFeedData() {
    let url = sessionStorage.getItem('apiUrl') + 'covid/camera_filter/?unit=' + sessionStorage.getItem('csSelectedLocation');
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getViolationsData(location, camera, startDate, endDate, startTime, endTime, category, subCategory) {
    let url = '';
    if (subCategory != '') {
      url = sessionStorage.getItem('apiUrl') + 'covid/images/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&location=' + location + '&camera=' + camera + '&start_date=' + startDate + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime + '&category=' + category + '&sub_category=' + subCategory;
    }
    else {
      url = sessionStorage.getItem('apiUrl') + 'covid/images/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&location=' + location + '&camera=' + camera + '&start_date=' + startDate + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime + '&category=' + category;
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchCsv(location, camera, startDate, endDate, startTime, endTime, category, subCategory) {
    let url = '';
    if (subCategory) {
      url = sessionStorage.getItem('apiUrl') + 'covid/export_csv/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&location=' + location + '&camera=' + camera + '&start_date=' + startDate + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime + '&category=' + category + '&sub_category=' + subCategory;
    }
    else {
      url = sessionStorage.getItem('apiUrl') + 'covid/export_csv/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&location=' + location + '&camera=' + camera + '&start_date=' + startDate + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime + '&category=' + category;
    }
    return this.http.get(url, { observe: 'response', responseType: 'blob' }).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getViolationsChartData(location, camera, startDate, endDate, startTime, endTime, category) {
    let url = '';
    if (camera && startTime && endTime) {
      url = sessionStorage.getItem('apiUrl') + 'covid/date_wise_violations/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&location=' + location + '&camera=' + camera + '&start_date=' + startDate + '&end_date=' + endDate + '&start_time=' + startTime + '&end_time=' + endTime + '&category=' + category;
    }
    else {
      url = sessionStorage.getItem('apiUrl') + 'covid/date_wise_violations/?unit=' + sessionStorage.getItem('csSelectedLocation') + '&location=' + location + '&start_date=' + startDate + '&end_date=' + endDate + '&category=' + category;
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getComplianceChartData(year,month) {
    let url = '';
    if(year && month){
      url = sessionStorage.getItem('apiUrl') + 'iogp_categories/year&month_data?year='+ year +'&month=' + month;
    }
    else{
      url = sessionStorage.getItem('apiUrl') + 'iogp_categories/year&month_data?year='+ year
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  submitRemarks(id, remarks) {
    let url = sessionStorage.getItem('apiUrl') + 'covid/close_multiple_violations/';
    let data = { 'id': id, 'remarks': remarks };
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchReportsData(reportStartDate, reportEndDate) {
    let url = sessionStorage.getItem('apiUrl') + 'covid/report?location=UL&unit=' + sessionStorage.getItem('csSelectedLocation') + '&start_date=' + reportStartDate + '&end_date=' + reportEndDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  generateReport(reportStartDate, reportEndDate) {
    let url = sessionStorage.getItem('apiUrl') + 'covid/generate_report_data?unit=' + sessionStorage.getItem('csSelectedLocation') + '&start_date=' + reportStartDate + '&end_date=' + reportEndDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  uploadReport(file) {
    let url = sessionStorage.getItem('apiUrl') + 'covid/generated_report/';
    let body = new FormData();
    body.append('unit', sessionStorage.getItem('csSelectedLocation'));
    body.append('file', file);
    return this.http.post(url, body).pipe(map(
      data => {
        return data;
      }
    ));
  }

  deleteReport(reportId) {
    let deleteObj = { 'id': reportId };
    let url = sessionStorage.getItem('apiUrl') + 'covid/report_delete';
    return this.http.post(url, deleteObj).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getObsViolationData() {
    let url = sessionStorage.getItem('apiUrl') + 'covid/search_violation/?unit=' + sessionStorage.getItem('csSelectedLocation');
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getZoneWiseViolations(violationId) {
    let url = sessionStorage.getItem('apiUrl') + 'covid/get_search_violation/?id=' + violationId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getAvgViolations(unit, year, month){
    let url = sessionStorage.getItem('apiUrl') + 'covid/unit_monthwise_violations?month='+month+'&unit_name='+unit+'&year='+year;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getTotalUnitViolations(monthAndYearWise, year, month){
    let url;
    if(monthAndYearWise == 'Month wise'){
      url = sessionStorage.getItem('apiUrl') + 'covid/Totalunitviolations?year='+year+'&month='+month;
    }else{
      url = sessionStorage.getItem('apiUrl') + 'covid/Totalunitviolations?year='+year;
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMonthAndYearWiseViolations(monthAndYearWise, unit, location, year, month){
    let url;
    if(monthAndYearWise == 'Month wise'){
      url = sessionStorage.getItem('apiUrl') + 'covid/MonthandyearWiseViolations?year='+year+'&unit='+unit+'&location='+location+'&month='+month;
    }else{
      url = sessionStorage.getItem('apiUrl') + 'covid/MonthandyearWiseViolations?year='+year+'&unit='+unit+'&location='+location;
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
}
