///////////////////////////////////////////////////////////////////////////////
// Filename : plant.service.ts
// Description : Services available for the plant module
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
export class PlantService {

  constructor(private http: HttpClient) {
  }

  fetchPlantDetails() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/plant_data';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchUserActivityData(startDate, endDate ,units) {
    if(startDate && endDate && units){
     let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/insights/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']';
     return this.http.get(url).pipe(map(
      data => {
        return data;
      }
     ));
    }
  }

  fetchDates() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/get_dates/'
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchBirdsEyeViewData() {
    return this.http.get('/assets/json/image-map.json').pipe(map(
      data => {
        return data;
      }
    ));
  }

  getAvailableUnits() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/unit_data/'
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getUnitsData(selectedPage) {
    let url = '';
    if(selectedPage == 'sif'){
      url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/highlight_units/'
    }else{
      url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/unit_data/'
    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getFrequentObservationCategory(startDate, endDate, riskRating ,units) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/most_freq_obs/?start_date=' + startDate + '&end_date=' + endDate + '&rating=' + riskRating + '&units=[' + units +']';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getDailyCount(startDate, endDate) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/unit_day_fault_count/?start_date=' + startDate + '&end_date=' + endDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getOverallCount() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/unit_day_fault_count/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchCategoryFaultCount(startDate, endDate ,units) {
    if(startDate && endDate && units && endDate?.length <11){
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/category_fault_count/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
    } 
  }

  getCumulativeCount(startDate, endDate) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/unit_fault_counts/?start_date=' + startDate + '&end_date=' + endDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getChartData(startDate, endDate ,units) {
   if(startDate && endDate && units && endDate?.length < 11){
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/report_data/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
   }
  }

  getObservations() {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/global_search';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getRiskRatio(startDate,endDate ,units ,status){
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/GetRiskrating_unitwise/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']' + '&status=' + status;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchReportsData(month:number, year:number,isCreatedByMe:string) {
let url;
    if(year && month ){
      url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/plant_report?location=plant' +'&year='+year+'&month='+month+'&is_created_by_me='+isCreatedByMe;
    }
    else if(year){
      url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/plant_report?location=plant' +'&year='+year+'&is_created_by_me='+isCreatedByMe;
    }

    // let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/plant_report?location=plant&start_date=' + reportStartDate + '&end_date=' + reportEndDate;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getComplianceChartData(startDate,endDate ,units) {
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/safety_trend_graph/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']';
    // let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/year&month_data/?start_date=' + startDate + '&end_date=' + endDate + '&units=[' + units +']';
    // if(year && month){
    //   url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/year&month_data?year='+ year +'&month=' + month;
    // }
    // else{
    //   url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' +  sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/year&month_data?year='+ year
    // }
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

}
