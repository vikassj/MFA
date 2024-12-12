import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InspectionService {
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getEquipmentCategoryList(unitId: any, category_id: any, equipment_id: any,filter_type:any,equipment_category:any,equipment:any) {
    var category_id_list = []
    var equipment_id_list = []
    category_id_list.push(category_id)
    equipment_id_list.push(equipment_id)
    if(unitId !='' && filter_type != '' && equipment_category?.length > 0 && equipment.length > 0){
      let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId + '&filter_type=' +filter_type+'&equipment_category=['+equipment_category+']'+'&equipment=['+equipment+']';
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    }
    if (unitId !='' && category_id != '' && equipment_id != '') {
      let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId + '&equipment_category=[' + category_id + ']&equipment=[' + equipment_id + ']';
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    } 
    else if(unitId !='' && filter_type != '' && equipment_category?.length > 0){
      let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId + '&filter_type=' +filter_type+'&equipment_category=['+equipment_category+']';
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    }
    else if(unitId !='' && filter_type != ''){
      let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId + '&filter_type=' +filter_type;
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    }
    else {
      let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId;
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    }
  }

  getObservationsList(unitId: any, category_id: any, equipment_id: any, startDate, endDate) {
    // if(category_id != '' && equipment_id != '') {
    let start_date = startDate ? startDate : '';
    let end_date = endDate ? endDate : '';
    let url = this.api_url + '/inspection/observation?unit=' + unitId + '&equipment_category=[' + category_id + ']&equipment=[' + equipment_id + ']&start_date=' + start_date + '&end_date=' + end_date;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
    // } else {
    //   let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId;
    //   return this.http.get(url).pipe(map(
    //     data => {
    //       return data;
    //     }
    //   ));
    // }
  }

  getRecommendationsList(unitId: any, category_id: any, equipment_id: any, status: any, startDate, endDate) {
    let start_date = startDate ? startDate : '';
    let end_date = endDate ? endDate : '';
    // if(category_id != '' && equipment_id != '') {
    if (status.length > 0) {
      let url = this.api_url + '/inspection/recommendation?unit=' + unitId + '&equipment_category=[' + category_id + ']&equipment=[' + equipment_id + ']&status=' + JSON.stringify(status) + '&start_date=' + start_date + '&end_date=' + end_date;
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    } else {
      let url = this.api_url + '/inspection/recommendation?unit=' + unitId + '&equipment_category=[' + category_id + ']&equipment=[' + equipment_id + ']&status=[]&start_date=' + start_date + '&end_date=' + end_date;
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    }

    // } else {
    //   let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId;
    //   return this.http.get(url).pipe(map(
    //     data => {
    //       return data;
    //     }
    //   ));
    // }
  }

  personsTaggedRecommendations(recommendation_id, tagged_users, unit_id, equipment_id) {
    let obj = {
      "recommendation_id": recommendation_id,
      "tagged_users": tagged_users,
      "unit_id": unit_id,
      "equipment_id": equipment_id
    }
    let url = this.api_url + '/inspection/add_tagged_user/';
    return this.http.post(url, obj).pipe(map(
      data => {
        return data;
      }
    ));
  }

  updateStatusRecommendations(recommendation_id, status) {
    let obj = {
      recommendation_id,
      status,
    }
    let url = this.api_url + '/inspection/update_recommendation/';
    return this.http.post(url, obj).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getRecommendationsComments(recommendation_id) {
    let url = this.api_url + '/inspection/recommendation_comments';
    return this.http.get(url, recommendation_id).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getCategoryAndEquipment(unitId) {
    let url = this.api_url + '/inspection/category_and_equipment?unit=' + unitId;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  updateRemarkObservation(observation_id, remarks) {
    let obj = {
      observation_id,
      remarks
    }
    let url = this.api_url + '/inspection/remarks_update/';
    return this.http.post(url, obj).pipe(map(
      data => {
        return data;
      }
    ));
  }
  createObServation(data) {
    let url = this.api_url + '/inspection/observation/';
    // let url = this.api_url + '/inspection/observation_updated/';
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }
  createRecomondation(data) {
    let url = this.api_url + '/inspection/recommendation/';
    // let url = this.api_url + '/inspection/recommendation_updated/';
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  addFile(data) {
    let url = this.api_url + '/inspection/add_file/';
    // let url = this.api_url + '/inspection/observation_updated/';
    return this.http.post(url, data).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getComponentList(unitId, equipment_category) {
    let url = this.api_url + '/inspection/component_list?unit=' + unitId + '&equipment_category=' + equipment_category;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getObservationDetails(recommendation_id) {
    let url = this.api_url + '/inspection/recommendation?recommendation_id=' + recommendation_id;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  recommendationWiseComments(recommendation_id) {
    console.log(recommendation_id)
    let params = new HttpParams();
    params = params.set('recommendation_id', recommendation_id);
    return this.http.get(this.api_url + '/inspection/recommendation_comments', { params: params })
  }
  commentOnRecommendation(commentOnIssueModel) {
    return this.http.post(this.api_url + '/inspection/update_recommendation/', commentOnIssueModel)
  }
  deleteRecommendationComment(comment_id) {
    let params = new HttpParams();
    params = params.set('comment_id', comment_id);
    return this.http.delete(this.api_url + '/inspection/delete_comment', { params: params }).pipe(map(data => { return data; })
    );
  }
  getRecommendationHostory(recommendation_id) {
    let params = new HttpParams();
    params = params.set('recommendation_id', recommendation_id);
    return this.http.get(this.api_url + '/inspection/history', { params: params }).pipe(map(data => { return data; }))
  }
  deleteRecommendationCommentImage(comment_file_id) {
    let params = new HttpParams();
    params = params.set('comment_file_id', comment_file_id);
    return this.http.delete(this.api_url + '/inspection/delete_comment', { params: params }).pipe(map(data => { return data; })
    );
  }

  recommendationImageUpload(unit, files) {
    let formData = new FormData();
    formData.append("unit", unit)
    for (let file of files) {
      formData.append('image', file)
    }
    return this.http.post(this.api_url + '/comment_image_upload/', formData).pipe(map(data => { return data; })
    );
  }
  deleteAttachment(data) {
    let params = new HttpParams();
    if (data?.name == 'observation') {
      params = params.set('observationimage_id', data?.id);
    }
    else if (data?.name == 'recommendation') {
      params = params.set('recommendationimage_id', data?.id);
    }
    return this.http.delete(this.api_url + '/inspection/delete_image', { body: params }).pipe(map(data => { return data; })
    );
  }
  generateReport(data) {
    return this.http.post(this.api_url + '/inspection/generate_report/', data).pipe(map(data => { return data; })
    );
  }
}


