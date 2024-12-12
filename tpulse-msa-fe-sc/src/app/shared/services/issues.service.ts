
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
// import { CreateIssueModel } from "../shared/models/create-issue-model";


@Injectable({
  providedIn: 'root'
})
export class IssuesService {
  uploadIssueImage(selectedUnitId: any) {
    throw new Error('Method not implemented.');
  }
  // base_url: string = 'https://tpulse-mfa-fe-api.detectpl.com'
  base_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }
  getLoggedUser() {
    return this.http.get(this.base_url + '/logged_in_user')
  }
  getUserList() {
    return this.http.get(this.base_url + '/users')
  }
  getEquipmentCategories(unit_id) {
    return this.http.get(this.base_url + '/equipment_categories?unit_id=' + unit_id)
  }
  getEquipments(equipment_category_id) {
    return this.http.get(this.base_url + '/equipments?equipment_category_id=' + equipment_category_id)
  }
  getTasks(equipment_id) {
    return this.http.get(this.base_url + '/tasks?equipment_id=' + equipment_id)
  }
  getIssueType() {
    return this.http.get(this.base_url + '/issue_types')
  }
  getIssueStatus() {
    return this.http.get(this.base_url + '/issue_status/')
  }
  getIssueId() {
    return this.http.get(this.base_url + '/get_issue_idfor_creation')
  }
  getDepartmentsList() {
    return this.http.get(this.base_url + '/available_departments')
  }

  getFilteredIssuesList(unitId: any, department, isEscalated: any, isCritical: any, status: any,  offset: any, limit: any) {
    let navigatingToIssue = JSON.parse(sessionStorage.getItem('navigatingToIssue'))
    let issue_id = Array.isArray(navigatingToIssue) ? navigatingToIssue?.[0]?.issue_number ? navigatingToIssue?.[0]?.issue_number : ''  : navigatingToIssue?.issue_number ? navigatingToIssue?.issue_number : '';
    return this.http.get(this.base_url + '/get_issues?unit_id=' + unitId + '&department=' + department+'&status_id=' + status + '&is_escalated=' + isEscalated + '&is_critical=' + isCritical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
  }
  getIssuesList(unit_id, department, issue_type_id, start_date, end_date, equipment_category_id, equipment_id, escalated, critical, limit, offset, navigate) {
    
    let navigatingToIssue = navigate
    let issue_id = Array.isArray(navigatingToIssue) ? navigatingToIssue?.[0]?.issue_number ? navigatingToIssue?.[0]?.issue_number : ''  : navigatingToIssue?.issue_number ? navigatingToIssue?.issue_number : '';
    if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && equipment_category_id &&equipment_id && escalated && critical){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date +  '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&is_escalated=' + escalated + '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && start_date && end_date && equipment_category_id &&equipment_id && escalated && critical){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&start_date=' + start_date + '&end_date=' + end_date + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&is_escalated=' + escalated + '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
   else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date &&equipment_category_id && equipment_id && escalated){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date +  '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id+ '&is_escalated=' + escalated + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date &&equipment_category_id && equipment_id && critical){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id+ '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && critical && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_critical=' + critical + '&start_date=' + start_date + '&end_date=' + end_date +  '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && escalated && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_escalated=' + escalated + '&start_date=' + start_date + '&end_date=' + end_date +  '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&start_date=' + start_date + '&end_date=' + end_date +  '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && escalated) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&is_escalated=' + escalated  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && critical) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&is_critical=' + critical  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && critical && escalated) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&is_critical=' + critical+ '&is_escalated=' + escalated  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
   else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && critical && escalated && start_date && end_date ) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_critical=' + critical + '&is_escalated=' + escalated + '&start_date=' + start_date + '&end_date=' + end_date  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && critical && start_date && end_date ) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&critical=' + critical + '&start_date=' + start_date + '&end_date=' + end_date + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && escalated && start_date && end_date ) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_escalated=' + escalated + '&start_date=' + start_date + '&end_date=' + end_date + '&limit=' + limit + '&offset=' + offset )
    }

    else if (unit_id && department && start_date && end_date) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&start_date=' + start_date + '&end_date=' + end_date  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    
    else if (unit_id && department && issue_type_id?.length > 0 && critical) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&is_critical=' + critical +'&limit=' + limit + '&offset=' + offset+ '&issue_id=' + issue_id )
    }
    else if (unit_id && department && issue_type_id?.length > 0) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&limit=' + limit + '&offset=' + offset+ '&issue_id=' + issue_id )
    }
    else if (unit_id && department && critical && escalated) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department +'&is_critical=' + critical + '&is_escalated=' + escalated + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if (unit_id && department && escalated) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_escalated=' + escalated + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if (unit_id && department && critical) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if (unit_id && department) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department  + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
  }
  getIssueComments(issue_id) {
    return this.http.get(this.base_url + '/issue_comments_new?issue_id=' + issue_id).pipe(map(data => { return data; }))
  }
  getIssueHostory(issue_id) {
    return this.http.get(this.base_url + '/issue_logs?issue_id=' + issue_id).pipe(map(data => { return data; }))
  }
  createIssue(issue) {
    return this.http.post(this.base_url + '/issues', issue)
  }
  commentOnIssue(commentOnIssueModel) {
    return this.http.post(this.base_url + '/issue_comments', commentOnIssueModel)
  }
  issueImageUpload(unit, files) {
    let formData = new FormData();
    formData.append("unit", unit)
    for (let file of files) {
      formData.append('image', file)
    }
    return this.http.post(this.base_url + '/comment_image_upload/', formData).pipe(map(data => { return data; })
    );
  }
  deleteIssueComment(commentId) {
    return this.http.delete(this.base_url + '/issue_comment/' + commentId + '/delete/').pipe(map(data => { return data; })
    );
  }
  deleteIssueCommentImage(commentId, imageId) {
    return this.http.delete(this.base_url + '/issue_comment/'+ commentId + '/file/'+ imageId +'/delete/').pipe(map(data => { return data; })
    );
  }
  replyToComment(addReplyToCommentModel) {
    return this.http.post(this.base_url + '/issue_reply', addReplyToCommentModel)
  }
  personsTaggedInIssues(TagPersonsIssueModel) {
    return this.http.post(this.base_url + '/issue_tag_person', TagPersonsIssueModel)
  }
  DeletePersonsTaggedInIssues(DeleteTagPersonsIssueModel) {
    return this.http.post(this.base_url + '/delete_tag_person_in_issue', DeleteTagPersonsIssueModel)
  }
  issueEscalated(issue_id, is_escalated) {
    return this.http.put(this.base_url + '/issues/' + issue_id, is_escalated)
  }
  getMyIssues(unit_id, department, issue_type_id, start_date, end_date, boolean_value, equipment_category_id, equipment_id, escalated, critical, limit, offset, navigate) {
    let navigatingToIssue = navigate
    let issue_id = Array.isArray(navigatingToIssue) ? navigatingToIssue?.[0]?.issue_number ? navigatingToIssue?.[0]?.issue_number : ''  : navigatingToIssue?.issue_number ? navigatingToIssue?.issue_number : '';
    if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && equipment_category_id &&equipment_id && escalated && critical){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&is_escalated=' + escalated + '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && start_date && end_date && equipment_category_id &&equipment_id && escalated && critical){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&is_escalated=' + escalated + '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
   else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date &&equipment_category_id && equipment_id && escalated){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id+ '&is_escalated=' + escalated + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date &&equipment_category_id && equipment_id && critical){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id+ '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && critical && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_critical=' + critical + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && escalated && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_escalated=' + escalated + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && start_date && end_date &&equipment_category_id && equipment_id){
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&equipment_category_id=' + equipment_category_id + '&equipment_id=' + equipment_id + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && escalated) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&is_escalated=' + escalated + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && critical) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date && escalated && critical) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&is_escalated=' + escalated+ '&is_critical=' + critical + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
   else if(unit_id && department && issue_type_id?.length > 0 && start_date && end_date) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && critical && escalated && start_date && end_date ) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_critical=' + critical + '&is_escalated=' + escalated + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && critical && start_date && end_date ) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_critical=' + critical + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if(unit_id && department && escalated && start_date && end_date ) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_escalated=' + escalated + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    else if (unit_id && department && start_date && end_date) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&start_date=' + start_date + '&end_date=' + end_date + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
  
    else if (unit_id && department && issue_type_id?.length > 0) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&status_id=' + issue_type_id + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
    // else if (unit_id && department && escalated) {
    //   return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&is_escalated=' + escalated + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    // }
    else if (unit_id && department) {
      return this.http.get(this.base_url + '/get_issues?unit_id=' + unit_id + '&department_id=' + department + '&my_issue=' + boolean_value + '&limit=' + limit + '&offset=' + offset + '&issue_id=' + issue_id)
    }
  }
  changeIssueStatus(issue_id, issue_status) {
    return this.http.put(this.base_url + '/issues/' + issue_id, issue_status)
  }
  loggedIssues(issue_id) {
    return this.http.get(this.base_url + '/issue_logs?issue_id=' + issue_id)
  }
  issueWiseComments(issue_id, log_id) {
    return this.http.get(this.base_url + '/issue_comments?issue_id=' + issue_id + '&issue_log_id=' + log_id)
  }
  updateRiskRating(new_risk_rating) {
    return this.http.post(this.base_url + '/issue_risk_rating', new_risk_rating)
  }
  getIssuesDependsOnTaskId(task_id) {
    return this.http.get(this.base_url + '/issues?task_id=' + task_id)
  }
  getTaskRecomendationObject(task_id) {
    return this.http.get(this.base_url + '/task_recommendations?task_id=' + task_id)
  }
  createIssueImageUpload(unit, files) {

    let formData = new FormData();

    formData.append("unit", unit)

    for (let file of files) {

      formData.append('image', file)

    }

    return this.http.post(this.base_url + '/issue_image_upload/', formData).pipe(map(data => { return data; })

    );

  }
  // getIssuesPageDepartments(unit, equipmentCategory) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/issue_department_list?unit=' + unit + '&equipment_category=' + equipmentCategory;
  //   return this.http.get(url).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }
  getChatUserList() {
    let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/chat_user_list/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  // getFunctionsList(unit, equipmentCategory) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/function_list/?unit=' + unit + '&equipment_category=' + equipmentCategory;
  //   return this.http.get(url).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }
  // getIssueList(unit, equipmentCategory, funtionality) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/issue_list?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department_id=' + funtionality;
  //   return this.http.get(url).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }
  // getTaskOverview(unit, heatSelect, department) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/get_task_overview/?unit=' + unit + '&equipment_category=' + heatSelect + '&department_id=' + department;
  //   return this.http.get(url).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }

  // uploadIssueImage(unit){
  //   let url = this.api_url + '/issue_image_upload/';
  //   let body = unit
  //   return this.http.post(url,body ).pipe(
  //     map((data) => {
  //       return data;
  //     })
  //   );
  // }

  // createIssue(CreateIssueModel) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/create_issue';
  //   return this.http.post(url, CreateIssueModel).pipe(
  //     map((data) => {
  //       return data;
  //     })
  //   );
  // }

  // updateStatusIssue(udateIssueStatusModel) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/update_issue_status';
  //   return this.http.post(url, udateIssueStatusModel).pipe(
  //     map((data) => {
  //       return data;
  //     })
  //   );
  // }









  // getEquipmentlistDependsOnUEF(unit, equipment_category, unction) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/equipment_for_issue/?unit=' + unit + '&equipment_category=' + equipment_category + '&department_id=' + unction;
  //   return this.http.get(url).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }
  // getStatusForOnlinePersons(userClickOverview) {
  //   let url = sessionStorage.getItem('apiUrl') + 'activity_monitoring/user_click_view/';
  //   return this.http.post(url, userClickOverview).pipe(map(
  //     data => {
  //       return data;
  //     }
  //   ));
  // }
}
