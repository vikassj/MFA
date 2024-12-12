import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ActivityMonitorService {

  constructor(private http: HttpClient) { }
  // api_url = 'https://tpulse-mfa-fe-api.detectpl.com/api/1/schedule_control';
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  getDashboard(): Observable<any> {
    //let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/units_list/';
    let url = this.api_url + '/units_list/';
    return this.http.get(url)
      .pipe(
        catchError(this.errorHandler)
      );
  }

  getDepartment(unit: string): any {
    //let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/s-curve_department_list?unit=' + unit;
    let url = this.api_url + '/s-curve_department_list?unit=' + unit;
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

  overviewDetials(unit: string, department: string): any {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/overview_details?unit=' + unit + '&department=' + department;
    let url = this.api_url + '/overview_details?unit=' + unit + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  soonToBeDelayed(unit_id, department_ids, equipment_category_ids, vendor_ids) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/soon_to_be_delayed/?unit=' + unit + '&department=' + department;
    let url = this.api_url + '/soon_to_be_delayed/?unit_id=' + unit_id + '&department_ids=' + department_ids + '&equipment_category_ids=' + equipment_category_ids + '&vendor_ids=' + vendor_ids;
    return this.http.get(url).pipe(map(
      data => {
        // return []
        return data;
      }
    ));
    const data = { "message": [{ "equipment": "R8205B", "department": "Mechanical", "task": "Install tube bundle P04", "delay_in_hrs": "0hr", "actual_start_date": "Yet to start", "scheduled_start_date": "2023-05-07", "actual_end_date": "Yet to start", "scheduled_end_date": "2023-05-08", "equipment_category": "REACTOR" }] };
    let obs = new Observable((subscriber) => {
      subscriber.next(data);
      subscriber.complete();
    });
    return obs;
  }

  esclatedDelayed(unit_id, department_ids, equipment_category_ids, vendor_ids) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/escalated_delay/?unit=' + unit + '&department=' + department;
    let url = this.api_url + '/escalated_delay/?unit_id=' + unit_id + '&department_ids=' + department_ids + '&equipment_category_ids=' + equipment_category_ids + '&vendor_ids=' + vendor_ids;;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
    const data = { "message": [{ "equipment": "R8205B", "department": "Mechanical", "task": "Insitu hydrojet tube bundle and channel head", "delay_in_hrs": "0hr", "actual_start_date": "2023-04-30", "scheduled_start_date": "2023-04-30", "actual_end_date": "Inprogress", "scheduled_end_date": "2023-04-30", "equipment_category": "REACTOR" }] }
    let obs = new Observable((subscriber) => {
      subscriber.next(data);
      subscriber.complete();
    });
    return obs;
  }

  categoryWiseIssue(unit: string) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/escalated_delay/?unit=' + unit + '&department=' + department;
    let url = this.api_url + '/category_wise_issues?unit_id=' + unit;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  errorHandler(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      errorMessage = error.error.message;
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    return throwError(errorMessage);
  }

  ////////////// Potato apis ////////////////
  getUnitnames(): Observable<any> {
    let url = this.api_url + '/units_list/';
    return this.http.get(url).pipe(
      data => {
        return data;
      }
    );
  }

  getEquipmentCategories(unit_id) {
    return this.http.get(this.api_url + '/equipment_categories?unit_id=' + unit_id)
  }
  getDashboardOverview(unit?, equipmentCategory?, department?, vendor?) {
    let params = new HttpParams();
    let url = this.api_url + '/dashboard_overview/'
    if (unit) {
      params = params.set('unit', unit);
    }
    if (equipmentCategory) {
      params = params.set('equipment_category', equipmentCategory);
    }

    if (department) {
      params = params.set('department', department);
    }

    if(vendor) {
      params = params.set('vendor', vendor)
    }

    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data
      }
    ));
  }

  getEquipments(equipment_category_id, unit_id?) {
    // return this.http.get(this.api_url + '/equipments?equipment_category_id=' + equipment_category_id)
    let params = new HttpParams();
    if (equipment_category_id) {
      params = params.set('equipment_category_id',  equipment_category_id);
    }
    else{
      params = params.set('unit_id',  unit_id);
    }
    let url = this.api_url + '/equipments/'
    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data;
      }

    ));
  }

  getDepartmentsList() {
    return this.http.get(this.api_url + '/available_departments')
  }
  /////////////Bulk equipment///////////
  getBulkEquipmentSubCategories(unit_id: string): Observable<any> {
    let url = this.api_url + '/subequipment_categories?unit_id=' + unit_id;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getBulkEquipmentSubCategoryContent(category_id: string): Observable<any> {
    let url = this.api_url + '/equipments?subequipment_category_id=' + category_id;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getBulkChecklist(equipment_id: string): Observable<any> {
    let url = this.api_url + '/checklists?subequipment_category_id=' + equipment_id;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  updateBulkChecklist(checklist_id: string, data): Observable<any> {
    let url = this.api_url + '/checklists/' + checklist_id;
    return this.http.put(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  uploadNewBulkChecklist(data): Observable<any> {
    let url = this.api_url + '/upload_checklist/';
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  ///////////// Dashboard apis/////////////////
  
  getGlobalSearchData(unitId: number | null) {
    let url = this.api_url + '/global_search_tasks?filter_type=all_tasks&unit_id=' + unitId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }


  getMilestoneTableData(unitId: string) {
    let url = this.api_url + '/milestone_table?unit=' + unitId

    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ))
  }

  getMajorUpdatesData(unitId: string, limit: any, offset: any) {
    let url = this.api_url + '/major_update?unit=' + unitId + "&limit=" + limit + "&offset=" + offset;

    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ))
  }

  getTaskIssueOverViewData(unitId: string) {
    let url = this.api_url + '/task_issue_overview?unit=' + unitId

    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ))
  }

  getUserDepartment() {
    let url = this.api_url + '/get_user_department/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getEquipmentChecklistGroupings(equipmentId: number | null) {
    let url = this.api_url + '/get_checklist_groups?equipment_id=' + equipmentId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getEquipmentChecklistData(checklistId: number | null) {
    let url = this.api_url + '/get_checklistdata?checklist_id=' + checklistId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  saveEquipmentChecklistData(checklistValue: any) {
    let url = this.api_url + '/update_checklist_value';
    let data = { checklist_value: checklistValue };
    return this.http.put(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  submitEquipmentChecklistData(checklistId: number | null, isCompleted: boolean) {
    let url = this.api_url + '/update_checklist';
    let data = { checklist_id: checklistId, is_completed: isCompleted };
    return this.http.put(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getDelayedTasks(unit_id,department_ids,equipment_category_ids,vendor_ids){
    return this.http.get(this.api_url + '/delayed_tasks/?unit_id='+unit_id+'&department_ids='+department_ids+'&equipment_category_ids='+equipment_category_ids+'&vendor_ids='+vendor_ids)
  }
  getOverShootingProjectTimeLine(unit_id){
    return this.http.get(this.api_url + '/equipment_overshoot?unit_id='+unit_id)
  }
}
