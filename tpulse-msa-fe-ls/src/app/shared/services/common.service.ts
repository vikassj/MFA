import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LiveStreamingCommonService {
  environmentName: string = '';
  colorMapper = new Map();
  abbreviationMapper = new Map();
  categories: any[] = [];
  decryptionKey: string = '';

  constructor(private http: HttpClient) {
  }

  fetchLiveStreamingLocationData() {
    let url = sessionStorage.getItem('apiUrl') + 'api/'+ sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/list_locations';
    return this.http.get(url).pipe(map(data => {
     return data;
    }));
  }

  fetchListFeed(id,units, zones, time, source, camera_name, permit_number, type_of_permit, sort, nature_of_work, is_live, start_date, end_date, start_with, offset) {
    if(permit_number?.[0] == null){
      permit_number = []
    }
    let sorting = sort == 'Date (Newest to Oldest)' ? 'dateDesc' : 'dateAsc';
    let stime = time?.length > 0 ? time[0] ? time[0] : '00:00:00' : '00:00:00'
    let etime = time?.length > 0 ? time[1] ? time[1] : '23:59:59' : '23:59:59'
    let obj = {}
    let concatObj = {}
    let isPermitEnabled = false;
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    if(selectedPlantId){
      let plantPermit = JSON.parse(sessionStorage.getItem("permitPlantMap"));
      let selectedPlant = plantPermit.filter(key  => { return key.plant_id == selectedPlantId });
      isPermitEnabled = selectedPlant[0].isPermitEnabled;
    }

    if(is_live){
      if(!isPermitEnabled){
        obj = {units, zones, source: source.length > 0 ? source : null, camera_name, sorting, is_live, start_with, offset}
      }else{
        obj = {units, zones, source: source.length > 0 ? source : null, camera_name, permit_number, type_of_permit, sorting, nature_of_work, is_live, start_with, offset}
      }
    }else{
      if(!isPermitEnabled){
        obj = {units, zones, start_time: stime, end_time: etime, source: source.length > 0 ? source : null, camera_name, sorting, is_live, start_date, end_date, start_with, offset}
      }else{
        obj = {units, zones, start_time: stime, end_time: etime, source: source.length > 0 ? source : null, camera_name, permit_number, type_of_permit, sorting, nature_of_work, is_live, start_date, end_date, start_with, offset}
      }
    }
    if(id){
      obj = {...obj,id:id}
    }
    let url = sessionStorage.getItem('apiUrl') + 'api/'+ sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/list_feed';
    return this.http.post(url,obj).pipe(map(
      data => {
        return data;
      }
    ));
  }

  sendStreamMail(data) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/share'
    return this.http.post(url, data).pipe(map(
      data => {
        return data
      }
    ))
  }


  getUserAccessDetails() {

    let apiUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/central_dashboard/user_access';
    return this.http.get(apiUrl).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getApplicationUserList() {

    let apiUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/user_email';
    return this.http.get(apiUrl).pipe(map(
      data => {
        return data;
      }
    ));
  }


  getUnitData(){
    let apiUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/unit';
    return this.http.get(apiUrl).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getFilterData(selectedUnits, is_live){
    let units = JSON.stringify(selectedUnits)
    let apiUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/filters?units='+ units + '&is_live=' + is_live;
    return this.http.get(apiUrl).pipe(map(
      data => {
        return data;
      }
    ));
  }

updateCamera(camera_id, is_stop){
  let apiUrl = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/live_streaming/camera_post/';
  let obj = {
    "camera_id": camera_id,
    "is_stop": is_stop
  }
  return this.http.put(apiUrl, obj).pipe(map(
    data => {
      return data;
    }
  ));
}

}
