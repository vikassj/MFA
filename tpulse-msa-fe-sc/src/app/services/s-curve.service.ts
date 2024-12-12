import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ActivityMonitorSCurvePendingService {
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getEquipmentCategoryEquipments(unit: string): Observable<any> {
    let url = this.api_url + '/equipmentCategory_equipments?unit=' + unit;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getFunctionWiseIssuesCount(unit: string, equipment_category: string, equipment: string, department: string): Observable<any> {
    let url = this.api_url + '/function_wise_issues_count?unit=' + unit + '&equipment_category=' + equipment_category + '&equipment=' + equipment + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getFunctionOverviewByEquipmentCategory(unit: string, equipment_category: string, department: string): Observable<any> {
    let url = this.api_url + '/function_overview/?unit=' + unit + '&equipment_category=' + equipment_category + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getPlanData(unit: string, equipment_category: string, equipment: string, department: string): Observable<any> {
    let url = this.api_url + '/plan?unit=' + unit + '&equipment_category=' + equipment_category + '&equipment=' + equipment + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
}


@Injectable({
  providedIn: 'root'
})
export class ActivityMonitorSCurveStatsService {
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getAvailableDepartments(unitName: string): Observable<any> {
    let url = this.api_url + '/s-curve_department_list?unit=' + unitName + '&equipment_category=none';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getOverviewData(unitName: string, department: string, vendor): Observable<any> {
    let url = this.api_url + '/overview_data/?unit=' + unitName + '&department=' + department + '&vendor=' + vendor;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getChartData(unitName: string, department: string, graphType: string,vendor): Observable<any> {
    let url = this.api_url + '/getchartdata?unit=' + unitName + '&department=' + department + '&graph_type=' + graphType + '&vendor_id=' + vendor;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getChartFilter(): Observable<any> {
    let url = this.api_url + '/chart_filter';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

}


@Injectable({
  providedIn: 'root'
})
export class ActivityMonitorSCurveService {
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getUnitnames(): Observable<any> {
    let url = this.api_url + '/units_list/';
    return this.http.get(url).pipe(
      data => {
        return data;
      }
    );
  }

  getAvailableDepartments(unitName: string, category?): Observable<any> {
    let url = ''
    if (category) {
      url = this.api_url + '/s-curve_department_list?unit=' + unitName + '&equipment_category=' + category;
    }
    else {
      url = this.api_url + '/s-curve_department_list?unit=' + unitName + '&equipment_category=none';
    }

    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }


  fetchEquipmentHierarchy(unit) {
    //let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/equipmentCategory_equipments?unit=' + unit;
    let url = this.api_url + '/equipmentCategory_equipments?unit=' + unit
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }




}
