
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { CreateIssueModel } from "../shared/models/create-issue-model";


@Injectable({
  providedIn: 'root'
})
export class IssuesService {
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }
  getEquipmentCategoryEquipments(unit) {
    let url = this.api_url + '/equipmentCategory_equipments?unit=' + unit;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getIssuesPageDepartments(unit, equipmentCategory) {
    let url = this.api_url + '/issue_department_list?unit=' + unit + '&equipment_category=' + equipmentCategory;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getLoggedUser() {
    let url = this.api_url + '/logged_in_user/';
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
    const data = [{ "id": 824, "email": "sakthivel@detecttechnologies.com", "first_name": "Sakthivel", "last_name": "M" }, { "id": 752, "email": "akshaya@detecttechnologies.com", "first_name": "Akshaya", "last_name": "Kumar V" }, { "id": 811, "email": "khyati@detecttechnologies.com", "first_name": "Khyati", "last_name": "Dhawan" }];
    let obs = new Observable((subscriber) => {
      subscriber.next(data);
      subscriber.complete();
    });
    return obs;
  }

  getChatUserList() {
    let url = this.api_url + '/chat_user_list/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getIssueId() {
    let url = this.api_url + '/get_issue_idfor_creation/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getFunctionsList(unit, equipmentCategory) {
    let url = this.api_url + '/function_list/?unit=' + unit + '&equipment_category=' + equipmentCategory;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getIssueList(unit, equipmentCategory, funtionality) {
    let url = this.api_url + '/issue_list?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department=' + funtionality;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getIssuesList(unit_id, department, task_id?, issue_type_id?, start_date?, end_date?) {
    if (unit_id && department && issue_type_id && start_date && end_date) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&issue_type_id=' + issue_type_id + '&start_date=' + start_date + '&end_date=' + end_date)
    }
    else if (unit_id && department && start_date && end_date) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&start_date=' + start_date + '&end_date=' + end_date)
    }
    else if (unit_id && department && issue_type_id) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&issue_type_id=' + issue_type_id)
    }
    else if (unit_id && department && task_id) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department + '&task_id=' + task_id)
    }
    else if (unit_id && department) {
      return this.http.get(this.api_url + '/issues?unit_id=' + unit_id + '&department=' + department)
    }
  }


  getTaskOverview(unit, heatSelect, department) {
    let url = this.api_url + '/get_task_overview/?unit=' + unit + '&equipment_category=' + heatSelect + '&department=' + department;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  issueType() {
    let url = this.api_url + '/issue_type';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  createIssue(CreateIssueModel) {
    let url = this.api_url + '/create_issue';
    return this.http.post(url, CreateIssueModel).pipe(
      map((data) => {
        return data;
      })
    );
  }
  uploadIssueImage(unit){
    let url = this.api_url + '/issue_image_upload/';
    let body = unit
    return this.http.post(url,body ).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateStatusIssue(udateIssueStatusModel) {
    let url = this.api_url + '/update_issue_status';
    return this.http.post(url, udateIssueStatusModel).pipe(
      map((data) => {
        return data;
      })
    );
  }

  commentOnIssue(commentOnIssueModel) {
    let url = this.api_url + '/add_issue_comment/';
    return this.http.post(url, commentOnIssueModel).pipe(
      map((data) => {
        return data;
      })
    );
  }


  replyToComment(addReplyToCommentModel) {
    let url = this.api_url + '/reply_comment/';
    return this.http.post(url, addReplyToCommentModel).pipe(
      map((data) => {
        return data;
      })
    );
  }

  personsTaggedInIssues(TagPersonsIssueModel) {
    let url = this.api_url + '/issue_tag_person/';
    return this.http.post(url, TagPersonsIssueModel).pipe(
      map((data) => {
        return data;
      })
    );
  }
  DeletePersonsTaggedInIssues(DeleteTagPersonsIssueModel) {
    let url = this.api_url + '/delete_tag_person_in_issue/';
    return this.http.post(url, DeleteTagPersonsIssueModel).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getEquipmentlistDependsOnUEF(unit, equipment_category, unction) {
    let url = this.api_url + '/equipment_for_issue/?unit=' + unit + '&equipment_category=' + equipment_category + '&department=' + unction;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getStatusForOnlinePersons(userClickOverview) {
    let url = this.api_url + '/user_click_view/';
    return this.http.post(url, userClickOverview).pipe(map(
      data => {
        return data;
      }
    ));
  }
}
