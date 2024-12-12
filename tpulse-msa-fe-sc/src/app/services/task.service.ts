import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable, Subscriber } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  // api_url = 'https://tpulse-mfa-fe-api.detectpl.com/api/1/schedule_control';
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' +
    sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  commentOnTask(commentOnIssueModel) {
    return this.http.post(this.api_url + '/task_comments', commentOnIssueModel)
  }
  getCommentOnTask(task_id) {
    return this.http.get(this.api_url + '/task_comments/?task_id=' + task_id)
  }
  deleteTaskCommentImage(comment_id, image_id) {
    return this.http.delete(this.api_url + '/issue_comment/' + comment_id + '/file/' + image_id + '/delete/')
  }
  replyToComment(addReplyToCommentModel) {
    return this.http.post(this.api_url + '/task_reply', addReplyToCommentModel)
  }

  getPrimaryTask(unit_id?, equipmentCategory_id?, department_id?, task_id?) {
    let params = new HttpParams();
    let url = this.api_url + '/primary_task/'
    if (unit_id) {
      params = params.set('unit_id', unit_id);
    }
    if (equipmentCategory_id) {
      params = params.set('equipmentCategory_id', equipmentCategory_id);
    }
    if (department_id) {
      params = params.set('department_id', department_id);
    }
    if (task_id) {
      params = params.set('task_id', task_id);
    }
    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getVendorList() {
    let url = this.api_url + '/vendors'
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getTasks(unit, equipmentCategory, allTasks, department, equipmentIds?,taskType?,vendor?) {

    let params = new HttpParams();
    let url = this.api_url + '/get_equipment_category_task_overview/'
    if (unit) {
      params = params.set('unit', unit);
    }
    if (equipmentCategory) {
      params = params.set('equipment_category', equipmentCategory);
    }
    if (allTasks) {
      params = params.set('my_task', allTasks);
    }
    if(taskType){
      params = params.set('task_type', taskType);

    }
    if (department) {
      params = params.set('department', department);
    }
    if(vendor){
      params = params.set('vendor_id',vendor)
    }
    if (equipmentIds?.length) {
      params = params.set('equipment_ids', JSON.stringify(equipmentIds));
    }
    console.log(params)

    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getTaskHeaders(unit, equipmentCategoryName,department?, equipmentIds?,taskType?,vendor?) {
    let params = new HttpParams();

    let url = this.api_url + '/equipment_overview_headers/'
    if (unit) {
      params = params.set('unit', unit);
    }
    if (equipmentCategoryName) {
      params = params.set('equipment_category_name', equipmentCategoryName);
    }
    if(taskType){
      params = params.set('task_type', taskType);
    }
    if (department) {
      params = params.set('department', department);
    }
    if(vendor){
      params = params.set('vendor_id',vendor)
    }
    if (equipmentIds?.length) {
      params = params.set('equipment_ids', JSON.stringify(equipmentIds));
    }

    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data;
      }
    ));
  }
  // getTasks(unit, equipmentCategory, allTasks, department, equipment?,vendor?) {
  //   let params = new HttpParams();
  //   let url = this.api_url + '/get_task_overview/'
  //   if (unit) {
  //     params = params.set('unit', unit);
  //   }
  //   if (equipmentCategory) {
  //     params = params.set('equipment_category', equipmentCategory);
  //   }
  //   if (allTasks) {
  //     params = params.set('my_task', allTasks);
  //   }
  //   if (department) {
  //     params = params.set('department', department);
  //   }
  //   if (equipment) {
  //     params = params.set('equipment', equipment);
  //   }
  //   return this.http.get(url, { params: params }).pipe(map(
  //     data => {
  //       return data;
  //       return { "message": [{ "R8205B": { "tasks": [{ "id": 352, "name": "    Ventilation", "actual_start_date": "2023-04-27", "scheduled_start_date": "2023-04-27", "actual_end_date": "2023-04-28", "scheduled_end_date": "2023-04-28", "actual_start_time": "18:00:00", "scheduled_start_time": "18:00:00", "actual_completion_time": "10:30:00", "expected_completion_time": "09:30:00", "issues_count": 0, "inspection": "", "actual_duration": "16hrs 30mins", "scheduled_duration": "15hrs 30mins", "slack": 7, "task_status": "COMPLETED", "function": "Maintenance of Compressor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [{ "name": "IOTCamera001" }, { "name": "IOTCamera001" }] }, { "id": 353, "name": "    Lift down Bundle from Bundle puller to laydown location - P04", "actual_start_date": "Yet to start", "scheduled_start_date": "2023-04-27", "actual_end_date": "Yet to start", "scheduled_end_date": "2023-04-28", "actual_start_time": "Yet to start", "scheduled_start_time": "20:00:00", "actual_completion_time": "Yet to start", "expected_completion_time": "11:00:00", "issues_count": 4, "inspection": "", "actual_duration": "NA", "scheduled_duration": "15hrs", "slack": 8, "task_status": "PENDING", "function": "Maintenance of Compressor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [{ "name": "IOTCamera001" }, { "name": "IOTCamera001" }] }, { "id": 354, "name": "    Barricade area around tube bundle", "actual_start_date": "2023-04-29", "scheduled_start_date": "2023-04-29", "actual_end_date": "2023-04-29", "scheduled_end_date": "2023-04-29", "actual_start_time": "05:00:00", "scheduled_start_time": "05:00:00", "actual_completion_time": "23:30:00", "expected_completion_time": "23:00:00", "issues_count": 0, "inspection": "", "actual_duration": "18hrs 30mins", "scheduled_duration": "18hrs", "slack": 9, "task_status": "COMPLETED", "function": "Maintenance of Compressor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["sakthivel@detecttechnologies.com", "akshaya@detecttechnologies.com"], "camera_name": [{ "name": "IOTCamera001" }, { "name": "IOTCamera001" }] }, { "id": 355, "name": "Insitu hydrojet tube bundle and channel head", "actual_start_date": "2023-04-30", "scheduled_start_date": "2023-04-30", "actual_end_date": "Inprogress", "scheduled_end_date": "2023-04-30", "actual_start_time": "04:00:00", "scheduled_start_time": "04:00:00", "actual_completion_time": "Inprogress", "expected_completion_time": "04:00:00", "issues_count": 0, "inspection": "", "actual_duration": "NA", "scheduled_duration": "0hr", "slack": 10, "task_status": "DELAYED", "function": "Maintenance of Compressor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 356, "name": "    Blow dry 100 tubes", "actual_start_date": "2023-05-02", "scheduled_start_date": "2023-05-02", "actual_end_date": "2023-05-05", "scheduled_end_date": "2023-05-05", "actual_start_time": "08:00:00", "scheduled_start_time": "04:00:00", "actual_completion_time": "14:30:00", "expected_completion_time": "14:30:00", "issues_count": 0, "inspection": "", "actual_duration": "3days 6hrs", "scheduled_duration": "3days 10hrs", "slack": 11, "task_status": "COMPLETED", "function": "Maintenance of Compressor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 357, "name": "    RT on U bends of bundle", "actual_start_date": "2023-05-03", "scheduled_start_date": "2023-05-03", "actual_end_date": "Inprogress", "scheduled_end_date": "2023-05-03", "actual_start_time": "10:00:00", "scheduled_start_time": "02:00:00", "actual_completion_time": "Inprogress", "expected_completion_time": "20:00:00", "issues_count": 0, "inspection": "", "actual_duration": "NA", "scheduled_duration": "18hrs", "slack": 0, "task_status": "IN PROGRESS", "function": "Maintenance of Compressor", "percentage_completed": 10.0, "gain_delay": "0hr", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["sakthivel@detecttechnologies.com", "swedha@detecttechnologies.com", "akshaya@detecttechnologies.com"], "camera_name": [{ "name": null }] }, { "id": 358, "name": "    Box up M1 HTW required", "actual_start_date": "2023-05-04", "scheduled_start_date": "2023-05-04", "actual_end_date": "Inprogress", "scheduled_end_date": "2023-05-05", "actual_start_time": "04:30:00", "scheduled_start_time": "04:30:00", "actual_completion_time": "Inprogress", "expected_completion_time": "17:00:00", "issues_count": 0, "inspection": "", "actual_duration": "NA", "scheduled_duration": "1day 12hrs", "slack": 13, "task_status": "PENDING", "function": "Maintenance of Compressor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 359, "name": "    Lift tube bundle up to bundle puller P04", "actual_start_date": "Yet to start", "scheduled_start_date": "2023-05-06", "actual_end_date": "Yet to start", "scheduled_end_date": "2023-05-06", "actual_start_time": "Yet to start", "scheduled_start_time": "05:00:00", "actual_completion_time": "Yet to start", "expected_completion_time": "21:30:00", "issues_count": 0, "inspection": "", "actual_duration": "NA", "scheduled_duration": "16hrs 30mins", "slack": 14, "task_status": "PENDING", "function": "Maintenance of Compressor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 360, "name": "Install tube bundle P04", "actual_start_date": "Yet to start", "scheduled_start_date": "2023-05-07", "actual_end_date": "Yet to start", "scheduled_end_date": "2023-05-08", "actual_start_time": "Yet to start", "scheduled_start_time": "18:00:00", "actual_completion_time": "Yet to start", "expected_completion_time": "11:00:00", "issues_count": 0, "inspection": "", "actual_duration": "NA", "scheduled_duration": "17hrs", "slack": 15, "task_status": "DELAYED", "function": "Maintenance of Compressor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Mechanical", "equipment_name": "R8205B", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }] }, "issues": { "open": 4, "closed": 0 } }, { "R8504": { "tasks": [{ "id": 345, "name": "    Unbolt channel head (2.4m dia)", "actual_start_date": "2023-04-26", "scheduled_start_date": "2023-04-26", "actual_end_date": "2023-04-26", "scheduled_end_date": "2023-04-26", "actual_start_time": "09:00:00", "scheduled_start_time": "09:00:00", "actual_completion_time": "13:00:00", "expected_completion_time": "13:00:00", "issues_count": 0, "inspection": "", "actual_duration": "04hrs", "scheduled_duration": "4hrs", "slack": 0, "task_status": "COMPLETED", "function": "Maintenance of Reactor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 346, "name": "    Modify scaffold to lift channel head", "actual_start_date": "2023-04-26", "scheduled_start_date": "2023-04-26", "actual_end_date": "Inprogress", "scheduled_end_date": "2023-04-27", "actual_start_time": "11:00:00", "scheduled_start_time": "11:00:00", "actual_completion_time": "Inprogress", "expected_completion_time": "10:00:00", "issues_count": 1, "inspection": "", "actual_duration": "NA", "scheduled_duration": "23hrs", "slack": 1, "task_status": "PENDING", "function": "Maintenance of Reactor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 347, "name": "    Dismantle 1\"& 3\" & 8\" spools from channel head - P04", "actual_start_date": "2023-04-26", "scheduled_start_date": "2023-04-26", "actual_end_date": "2023-04-27", "scheduled_end_date": "2023-04-27", "actual_start_time": "06:00:00", "scheduled_start_time": "06:00:00", "actual_completion_time": "15:00:00", "expected_completion_time": "11:00:00", "issues_count": 0, "inspection": "", "actual_duration": "1day 9hrs", "scheduled_duration": "1day 5hrs", "slack": 2, "task_status": "COMPLETED", "function": "Maintenance of Reactor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 348, "name": "    Lift out channel head to laydown location - P04", "actual_start_date": "2023-04-26", "scheduled_start_date": "2023-04-26", "actual_end_date": "2023-04-26", "scheduled_end_date": "2023-04-26", "actual_start_time": "07:00:00", "scheduled_start_time": "07:00:00", "actual_completion_time": "20:00:00", "expected_completion_time": "20:00:00", "issues_count": 0, "inspection": "", "actual_duration": "13hrs", "scheduled_duration": "13hrs", "slack": 3, "task_status": "COMPLETED", "function": "Maintenance of Reactor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 349, "name": "    Preparation for bundle pulling", "actual_start_date": "2023-04-26", "scheduled_start_date": "2023-04-26", "actual_end_date": "2023-04-26", "scheduled_end_date": "2023-04-26", "actual_start_time": "10:00:00", "scheduled_start_time": "10:00:00", "actual_completion_time": "18:00:00", "expected_completion_time": "18:00:00", "issues_count": 0, "inspection": "", "actual_duration": "08hrs", "scheduled_duration": "8hrs", "slack": 4, "task_status": "COMPLETED", "function": "Maintenance of Reactor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 350, "name": "    Pull bundle (weight 19.67T) tube sheet dia 2890 mm - P04", "actual_start_date": "2023-04-27", "scheduled_start_date": "2023-04-27", "actual_end_date": "2023-04-28", "scheduled_end_date": "2023-04-28", "actual_start_time": "11:00:00", "scheduled_start_time": "09:00:00", "actual_completion_time": "14:30:00", "expected_completion_time": "04:30:00", "issues_count": 0, "inspection": "", "actual_duration": "1day 3hrs", "scheduled_duration": "19hrs 30mins", "slack": 5, "task_status": "COMPLETED", "function": "Maintenance of Reactor", "percentage_completed": 100.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }, { "id": 351, "name": "    Open M1 (24\") & install ventilation blower and CS light", "actual_start_date": "2023-04-27", "scheduled_start_date": "2023-04-27", "actual_end_date": "Inprogress", "scheduled_end_date": "2023-04-28", "actual_start_time": "21:00:00", "scheduled_start_time": "11:00:00", "actual_completion_time": "Inprogress", "expected_completion_time": "11:30:00", "issues_count": 0, "inspection": "", "actual_duration": "NA", "scheduled_duration": "1day 0hrs", "slack": 6, "task_status": "PENDING", "function": "Maintenance of Compressor", "percentage_completed": 0.0, "gain_delay": "NA", "elapsed_duration": "0hr", "depends_on": "", "comments": [], "equipment_category": "REACTOR", "department": "Engineering", "equipment_name": "R8504", "is_surprise": false, "tagged_users": ["akshaya@detecttechnologies.com"], "camera_name": [] }] }, "issues": { "open": 1, "closed": 0 } }] }
  //     }
  //   ));
  // }

  getEquipmentTaskDetails(unit,equipmentId){

    let params = new HttpParams();
    let url = this.api_url + '/get_equipment_task_overview/'
    if (unit) {
      params = params.set('unit', unit);
    }
    if (equipmentId) {
      params = params.set('equipment_id', equipmentId);
    }
    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getPredecessorSuccessorTasks(task_id) {
    let params = new HttpParams();
    let url = this.api_url + '/task_adjacents/'
    if (task_id) {
      params = params.set('task_id', task_id);
    }
    return this.http.get(url, { params: params }).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getDepartment(unitName, category) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/task_department_list?unit=' + unitName + '&equipment_category=' + category;
    let url = '';
    if (category) {
      url = this.api_url + '/task_department_list?unit=' + unitName + '&equipment_category=' + category;
    }
    else {
      url = this.api_url + '/task_department_list?unit=' + unitName;

    }
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getMediaData(unit, equipmentCategory, equipment, taskName, department, object_type) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/task_details?unit=' + unit + '&equipment_category=' + equipmentCategory + '&equipment=' + equipment + '&task=' + taskName + '&department=' + department;
    let url = this.api_url + '/task_details?unit=' + unit + '&equipment_category=' + equipmentCategory + '&equipment=' + equipment + '&task=' + taskName + '&department=' + department + '&object_type=' + object_type;
    return this.http.get(url).pipe(map(
      data => {
        return data;

      }
    ));
    // const data = { "message": [{ "id": 121, "date": "2023-05-09", "time": "12:12:03", "marked_image": null, "unmarked_image": "https://tpulse-test-revamp-data.detectpl.com/Task Monitoring/Stage_4d.jpg", "marked_video": null, "unmarked_video": null, "total_man_count": 0, "annotations": [] }, { "id": 120, "date": "2023-05-09", "time": "12:11:58", "marked_image": null, "unmarked_image": "https://tpulse-test-revamp-data.detectpl.com/Task Monitoring/Stage_4c.jpg", "marked_video": null, "unmarked_video": null, "total_man_count": 0, "annotations": [] }, { "id": 119, "date": "2023-05-09", "time": "12:11:55", "marked_image": null, "unmarked_image": "https://tpulse-test-revamp-data.detectpl.com/Task Monitoring/Stage_4b.jpg", "marked_video": null, "unmarked_video": null, "total_man_count": 0, "annotations": [] }, { "id": 118, "date": "2023-05-09", "time": "12:11:50", "marked_image": null, "unmarked_image": "https://tpulse-test-revamp-data.detectpl.com/Task Monitoring/Stage_4a.jpg", "marked_video": null, "unmarked_video": null, "total_man_count": 0, "annotations": [] }] }
    // let obs = new Observable((subscriber) => {
    //   subscriber.next(data);
    //   subscriber.complete();
    // });
    // return obs;
  }

  getLatestImagePost(unit, equipmentCategory, department) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/latest_image_get?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department=' + department;
    let url = this.api_url + '/latest_image_get?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
        //return { "equipment": "R8205B", "task_id": 354 };
      }
    ));
  }

  getTimelapseData(unit, equipmentCategory, equipment, taskName, department) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/get_video_data?unit=' + unit + '&equipment_category=' + equipmentCategory + '&equipment=' + equipment + '&task=' + taskName + '&department=' + department;
    let url = this.api_url + '/get_video_data?unit=' + unit + '&equipment_category=' + equipmentCategory + '&equipment=' + equipment + '&task=' + taskName + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getIssuesForTask(unit, equipmentCategory, equipment, taskName, department) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/issues_for_task?unit=' + unit + '&equipment_category=' + equipmentCategory + '&equipment=' + equipment + '&task=' + taskName + '&department=' + department;
    let url = this.api_url + '/issues_for_task?unit=' + unit + '&equipment_category=' + equipmentCategory + '&equipment=' + equipment + '&task=' + taskName + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getIssuesList(unit_id, department, task_id?, issue_type_id?, start_date?, end_date?) {
    console.log(unit_id, department, task_id, issue_type_id, start_date, end_date);
    if (unit_id && department && issue_type_id && start_date && end_date) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&issue_type_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date).pipe(map(
        data => {
          return data;
        }
      ));
    }
    else if (unit_id && department && start_date && end_date) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&start_date=' + start_date + '&end_date=' + end_date).pipe(map(
        data => {
          return data;
        }
      ));
    }
    else if (unit_id && department && issue_type_id) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&issue_type_id=' + issue_type_id).pipe(map(
        data => {
          return data;
        }
      ));
    }
    else if (unit_id && task_id) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&task_id=' + task_id).pipe(map(
        data => {
          return data;
        }
      ));
    }
    else if (unit_id && department) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department).pipe(map(
        data => {
          return data;
        }
      ));
    }
  }

  addAnnotation(imageId, coordinates, color, thickness, shape, comment) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/add_annotation/';
    let url = this.api_url + '/add_annotation/';
    let body = { 'image_id': imageId, 'coordinates': coordinates, 'color': color, 'thickness': thickness, 'shape': shape, 'comment': comment };
    return this.http.post(url, body).pipe(map(
      data => {
        return data;
      }
    ));
  }

  addComment(annotationId, comment) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/add_comment_annotation/';
    let url = this.api_url + '/add_comment_annotation/';
    let body = { 'annotation_id': annotationId, 'comment': comment };
    return this.http.post(url, body).pipe(map(
      data => {
        return data;
      }
    ));
  }

  addReply(commentId, reply) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/issue_reply/';
    let url = this.api_url + '/issue_reply/';
    let body = { 'comment_id': commentId, 'reply': reply };
    return this.http.post(url, body).pipe(map(
      data => {
        return data;
      }
    ));
  }

  deleteAnnotation(annotationId) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/delete_annotation/?id=' + annotationId;
    let url = this.api_url + '/delete_annotation/?id=' + annotationId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  deleteTaskAnnotation(annotationId) {
    // let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/delete_annotation/?id=' + annotationId;
    let url = this.api_url + '/delete_annotation?annotation_id=' + annotationId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getUserList() {
    let url = this.api_url + '/users/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  deleteTaggedUser(userName) {
    let url = this.api_url + '/delete_tag_person_in_task';
    return this.http.post(url, userName).pipe(map(
      data => {
        return data;
      }
    ));
  }
  addTaggedUser(userName) {
    let url = this.api_url + '/task_tag_person';
    return this.http.post(url, userName).pipe(map(
      data => {
        return data;
      }
    ));
  }

  surpriseTask(data) {
    let url = this.api_url + '/surprise_task_post';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getSingleIssue(issueId) {
    let url = this.api_url + '/issue_view?issue_id=' + issueId;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  ////////////// Task progress /////////////
  updateTaskProgress(task_id, data) {
    let url = this.api_url + '/tasks/' + task_id;
    return this.http.put(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }


  getFilteredTasks(unitId, filterType, equipmentCategoryId, departmentId, limit, offset) {
    let params
    const departmentUrl = departmentId && departmentId != "All" && filterType != "&department_tasks" ? `&department_id=${departmentId}` : '';
    const equipmentUrl = equipmentCategoryId ? `&equipment_category_id=${equipmentCategoryId}` : '';
    let url = this.api_url + '/tasks_summary_with_pagination?filter_type=' + filterType + '&unit_id=' + unitId + departmentUrl + equipmentUrl + '&limit=' + limit + '&offset=' + offset

    return this.http.get(url).pipe(map(
      data => {
        return data
      }
    ))

  }
  getSelectedFilteredTasks(id) {
    let url = this.api_url + '/tasks/' + id

    return this.http.get(url).pipe(map(
      data => {
        return data
      }
    ))

  }

  getTaskCount(unitId, filterType, equipmentCategoryId, departmentId) {
    const departmentUrl = (departmentId && departmentId != "All") && filterType != "&department_tasks" ? `&department_id=${departmentId}` : '';
    const equipmentUrl = equipmentCategoryId ? `&equipment_category_id=${equipmentCategoryId}` : '';
    let url = this.api_url + '/get_task_count_by_filters/?unit_id=' + unitId + departmentUrl + equipmentUrl

    return this.http.get(url).pipe(map(
      data => {
        return data
      }
    ))
  }

  captureKnowledge(taskId, captureStatus) {
    let url = this.api_url + '/tasks/' + taskId
    let data = {
      "is_knowledge_captured": captureStatus
    }
    return this.http.put(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getTaskHistory(taskId) {
    let url = this.api_url + '/task_history?task_id=' + taskId
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getPermitStatus() {
    let url = this.api_url + '/task_permits'
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  updatePermitStatus(task_id, data) {
    let url = this.api_url + '/tasks/' + task_id
    return this.http.put(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }
  addToMyShiftTask(data) {
    let url = this.api_url + '/shift_task/';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  removeFromMyShiftTask(data) {
    let url = this.api_url + '/shift_task/';
    return this.http.request('delete', url, { body: data })

  }



  gettaskSOP(taskId?, equipmentId?) {
    let params = new HttpParams();
    if (taskId) {
      params = params.set('task_id', taskId);
    }
    if (equipmentId) {
      params = params.set('equipment_id', equipmentId);
    }

    let url = this.api_url + '/equipment_sops/'
    return this.http.get(url, { params: params }).pipe(map(
      data => {

        //   return [
        //     "https://tpulse-msa-pod4-data.detectpl.com/raw/DHDS/Cooling_Tower_L/Images/2023-07-01/12-00-00/Cooling_Tower_L__2023-01-19__14-51-37__-0600.jpg",
        //     "https://pdfobject.com/pdf/sample.pdf",
        //     "https://www.africau.edu/images/default/sample.pdf"
        // ]
        return data;
      }
    ));
  }

  getDrawing(equipmentID) {
    let url = this.api_url + '/equipment_drawings?equipment_id=' + equipmentID
    return this.http.get(url).pipe(map(
      data => {

        //   return [
        //     "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf",
        //     "https://pdfobject.com/pdf/sample.pdf"
        // ]
        return data;
      }
    ));
  }
  // getReleaseNotes(taskId) {
  //   let url = sessionStorage.getItem('apiUrl') + 'equipment_sops+'+ taskId;
  //   return this.http.get(url).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }
  imageUpload(data) {
    let url = this.api_url + '/upload_image';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  taskImageUpload(unit, files) {
    let formData = new FormData();
    formData.append("unit", unit)
    for (let file of files) {
      formData.append('image', file)
    }
    return this.http.post(this.api_url + '/task_comment_image_upload/', formData).pipe(map(data => { return data; })
    );
  }

  getEquipmentCategories(unit_id) {
    return this.http.get(this.api_url + '/equipment_categories?unit_id=' + unit_id)
  }
  getEquipments(equipment_category_id) {
    return this.http.get(this.api_url + '/equipments?equipment_category_id=' + equipment_category_id)
  }
  getDepartmentsList(user_id,unit_id){
    return this.http.get(this.api_url + '/departments?user_id=' + user_id +'&unit_id='+unit_id)
  }
}
