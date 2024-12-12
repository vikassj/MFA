///////////////////////////////////////////////////////////////////////////////
// Filename : common.service.ts
// Description : Functionalities that are used across all the components
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
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import * as CryptoJS from 'crypto-js';
import { CommonService } from 'src/shared/services/common.service';
declare var $: any;
import { MatomoTracker } from '@ngx-matomo/tracker';
import { Subscription } from 'rxjs';
import { SafetyAndSurveillanceDataService } from './data.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SafetyAndSurveillanceCommonService {
  colorMapper = new Map();
  abbreviationMapper = new Map();
  iogpCategories: any[] = [];
  colorMap: any[] = [
    ['Closed', '#28a745'],
    ['PPE', '#fc5600'],
    ['HC', '#007183'],
    ['W@H', '#c24885'],
    ['HK', '#1c92ff'],
    ['CSC', '#ff0000'],
    ['FO', '#dca716'],
    ['L&H', '#5f5f5f'],
    ['VS', '#22aeff'],
    ['Open', '#dc3545'],
    ['Flights', '#0069d9'],
  ];
  abbreviationMap: any[] = [
    ['PPE', 'Personal Protective Equipment1'],
    ['HC', 'Job Safety'],
    ['W@H', 'Work at Height'],
    ['HK', 'Housekeeping'],
    ['CSC', 'Confined Space Entry'],
    ['FO', 'Dropped Objects'],
    ['L&H', 'Lifting and Hoisting'],
    ['VS', 'Construction Traffic Interference'],
  ];

  base_url: string;
  insightsUrl: string
  subscription: Subscription = new Subscription();
  sifPage: boolean = false;
  constructor(private router: Router,private http: HttpClient, private commonService: CommonService, private readonly tracker: MatomoTracker,private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,) {
    this.fetchModuleConfigurationsData();
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPage.subscribe(selectedPage => {
      if(selectedPage == 'unsif'){
        this.sifPage = false;
      }else{
        this.sifPage = true;
      }
  }))
  }

  fetchModuleConfigurationsData() {
    this.colorMap = [];
    this.abbreviationMap = [];
    let risk_rating_levels = JSON.parse(
      sessionStorage.getItem('safety-and-surveillance-configurations')
    ).module_configurations.iogp_categories;
    risk_rating_levels.forEach((ele) => {
      this.colorMap.push([ele.acronym, ele.color]);
      this.abbreviationMap.push([ele.acronym, ele.name]);
    });
    this.commonService
      .readModuleConfigurationsData('safety-and-surveillance')
      .subscribe((data) => {
        this.colorMap.forEach((item) => {
          this.colorMapper.set(item[0], item[1]);
        });
        this.abbreviationMap.forEach((item) => {
          this.abbreviationMapper.set(item[0], item[1]);
        });
        this.iogpCategories = data['module_configurations'][
          'iogp_categories'
        ].filter((cat) => cat.show_hide);
        this.insightsUrl = 'https://smart-query-system.detectpl.com';
      });
  }

  getObservationDetails(observationId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/singe_image_data/?id=' +
      observationId;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  fetchObsCsv(units, zoneName, category, startDate, end_date, time, mode,  riskRating, status, is_highlight,  permit_number, type_of_permit, nature_of_work, vendor_name, issuer_name,) {
    let stime = time?.length > 0 ? time[0] ? time[0] : '00:00:00' : '00:00:00'
    let etime = time?.length > 0 ? time[1] ? time[1] : '23:59:59' : '23:59:59'
    let payload = [];
    if (typeof units[0] == 'object') {
      payload = units[0];
    } else {
      payload = units;
    }
    let unit = payload;
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/images_csv/';
    // url = (riskRating) ? url + '&risk_rating=' + riskRating : url;
    // url = (status) ? url + '&status=' + status : url;
    // let riskRatings = riskRating.split(',')
    let riskRatings = (riskRating.length == 1 && riskRating[0] == '') ? [] : riskRating;
    let Status = status.split(',')
    Status = (Status.length == 1 && Status[0] == '') ? [] : Status;
    return this.http.post(url, { units, zone: zoneName, job: category, start_date: startDate, end_date: end_date, start_time: stime, end_time: etime, risk_rating: riskRatings, status: Status, is_highlight ,permit_number, type_of_permit, nature_of_work, vendor_name, issuer_name}, { observe: 'response', responseType: 'blob' }).pipe(map(
      data => {
        return data;
      }
    ));
  }

  fetchFaultsChoice() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fault_status_choice/';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  fetchVendorList() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/vendor_list/';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  editObservations(data) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/edit_observations/update/';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  fetchAllPermitDetails(startDate,endDate,zones,critical_job) {
    const currentUrl = this.router.url;
    const manuallySelectedUnits = JSON.parse(sessionStorage.getItem('manually-selected-units'))
    const selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'))
    if(!currentUrl.includes('observation')){
      this.sifPage = false;
    }

    let globalSearchNotification = JSON.parse(sessionStorage.getItem('global-search-notification'))
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
    if(searchObservation?.zone){
      zones = []
      zones.push(searchObservation?.zone)
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      endDate = yyyy+'-'+mm+'-'+dd;
    }else if(globalSearchNotification){
      zones = []
      zones.push(globalSearchNotification?.zone)
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      endDate = yyyy+'-'+mm+'-'+dd;
    }

    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/permit_details';
    var data = {
      zone_id: zones,
      is_critical: critical_job,
      is_highlight: this.sifPage
    }
    if(startDate && endDate){
      let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
      let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
      if(searchObservation || obsNavDate){
        if(searchObservation){
          data['start_date'] = searchObservation?.startDate
          data['end_date'] = endDate
        }else{
          data['start_date'] = obsNavDate
          data['end_date'] = endDate
        }
      }else{
        data['start_date'] = startDate
        data['end_date'] = endDate
      }
    }
    if(zones?.length < 1){
    if(!manuallySelectedUnits){
      data['unit_id'] = selectedUnits
    }
    else{
      data['unit_id'] = manuallySelectedUnits
    }
    }
    return this.http.post(url, data).pipe(map(
      (data:any) => {
        if(JSON.parse(sessionStorage.getItem('manuallyApplyFilters'))){
          let permitList = data.map((permit) => permit?.permit_number)
          sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(permitList))
          sessionStorage.setItem('manuallyApplyFilters',JSON.stringify(false))
        }
        return data;
      }
    ));
  }
  updateFaults(data) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/faults/';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postEvidence(data) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/supporting_documents/';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getEvidence(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/supporting_documents/?fault_id=' +
      id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  deleteEvidenceImage(support_document_id) {
    let body = new HttpParams();
    body = body.set('support_document_id', support_document_id);
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/supporting_documents/';
    return this.http.delete(url, { body: body }).pipe(
      map((data) => {
        return data;
      })
    );
  }

  updateMultipleFaults(data) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/multiple_faults/';
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  validateHighlightEmailID(emailID, unit) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/validate_email/';
    let data = { email: emailID, unit: unit };
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  validateEmailID(emailID, unitSelected) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/validate_email/';
    let data = { email: emailID, unit: unitSelected };
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  sendObservation(image, imageId, faultId, emailIDList) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/email_observation_iogp/';
    let data = {
      image: image,
      id: imageId,
      fault_id: faultId,
      email: emailIDList,
      category: 'IOGPcategory',
    };
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  deleteFaults(faultId, moduleType) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/delete_fault/';
    let data = { id: faultId };
    return this.http.post(url, data).pipe(
      map((data) => {
        return data;
      })
    );
  }

  updateRiskRating(rating, faultId, moduleType) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/observation_rating/';
    let body = { id: faultId, rating: rating };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }

  sendRiskRatingMail(faultId, imageId, rating, image) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/risk_email/';
    let body = {
      category: 'IOGPcategory',
      fault_id: faultId,
      id: imageId,
      risk_level: rating,
      image: image,
    };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getUnitZoneDropdown() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/unitzone_dropdown';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getCountOfObservationsByUnitAndRiskRating(
    filtersData,
    startDate,
    endDate,
    startTime
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/riskrating_zonewise/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        start_time: startTime,
        filters: filtersData,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getObservationsList(observation_text, category_id, zone_id, unit, startDate) {
    let obj = {
      observation_text: observation_text,
      category_id: category_id,
      zone_id: zone_id,
      unit: unit,
      start_date: startDate,
    };
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/similar_observations/';
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getRecentObservations(filtersData, startDate, endDate, count) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/recent_observations/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        filters: filtersData,
        count: count,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getCountOfObservationByMonthDayAndStatus(
    filtersData,
    startDate,
    endDate,
    startTime
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/observations_count_byday/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        start_time: startTime,
        filters: filtersData,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getCountOfObservationByRiskRating(
    filtersData,
    startDate,
    endDate,
    startTime
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/count_observation_riskrating/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        start_time: startTime,
        filters: filtersData,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getCountObservationByTimeAndRiskRating(filtersData, startDate, endDate) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/count_observation_time_riskrating/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        filters: filtersData,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  postManualObservation(obj) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/create_image';
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }

  manualObservationImageUpload(unit, files) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/manual_observation_image_upload/';
    let formData = new FormData();
    formData.append('unit', unit);
    for (let file of files) {
      formData.append('image', file);
    }
    return this.http.post(url, formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  getPlantAnalytics4cards(filtersData, startDate, endDate, coountOfDays) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/plantanalytics4cards/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        count: coountOfDays,
        filters: filtersData,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }

  getStatus() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/status';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getActions(
    type,
    id,
    status_id,
    startdate,
    enddate,
    limit,
    offset,
    assignee_ids
  ) {
    let statusid = status_id.length
      ? startdate.length
        ? 'status_id=' + status_id + '&'
        : 'status_id=' + status_id
      : '';
    let start_date = startdate.length
      ? enddate.length
        ? 'start_date=' + startdate + '&'
        : 'start_date=' + startdate
      : '';
    let end_date = enddate.length ? 'end_date=' + enddate + '&' : '';
    let assigneeids = assignee_ids.length
      ? '&assignee_ids=' + assignee_ids
      : '';
    let url = '';
    if (id) {
      url =
        sessionStorage.getItem('apiUrl') +
        'api/' +
        sessionStorage.getItem('company-id') +
        '/' +
        sessionStorage.getItem('selectedPlant') +
        '/safety_and_surveillance/actions/?object_type=' +
        type +
        '&object_type_id=' +
        id;
    }
    // else if(startdate && enddate && status_id?.length > 0){
    //   return this.http.get(this.base_url + '/actions/?start_date=' + startdate + '&end_date=' + enddate + '&status_id=' + status_id + '&limit=' + limit + '&offset=' + offset)
    //  }

    //  else if(startdate && enddate){
    //   return this.http.get(this.base_url + '/actions/?start_date=' + startdate + '&end_date=' + enddate + '&limit=' + limit + '&offset=' + offset)
    //  }
    //  else if(startdate && enddate && assignee_ids){
    //   return this.http.get(this.base_url + '/actions/?start_date=' + startdate + '&end_date=' + enddate + '&limit=' + limit + '&offset=' + offset+ '&assignee_ids=' + assignee_ids)
    //  }
    else if (limit == '' && offset == '') {
      url =
        sessionStorage.getItem('apiUrl') +
        'api/' +
        sessionStorage.getItem('company-id') +
        '/' +
        sessionStorage.getItem('selectedPlant') +
        '/safety_and_surveillance/actions/';
    } else {
      url =
        sessionStorage.getItem('apiUrl') +
        'api/' +
        sessionStorage.getItem('company-id') +
        '/' +
        sessionStorage.getItem('selectedPlant') +
        '/safety_and_surveillance/actions/?' +
        statusid +
        start_date +
        end_date +
        '&limit=' +
        limit +
        '&offset=' +
        offset +
        assigneeids;
    }
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getAudits(id) {
    let url = sessionStorage.getItem('apiUrl') +
        'api/' +
        sessionStorage.getItem('company-id') +
        '/' +
        sessionStorage.getItem('selectedPlant') +
        '/safety_and_surveillance/audits/?obs_id=' +id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getActionsPageNum(type, id, status_id, startdate, enddate, limit, action_id) {
    let start_date = startdate.length ? startdate : '';
    let end_date = enddate.length ? enddate : '';
    let statusid = status_id.length ? status_id : [];
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/page_num?status_id=' +
      statusid +
      '&start_date=' +
      start_date +
      '&end_date=' +
      end_date +
      '&limit=' +
      limit +
      '&action_id=' +
      action_id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getAssigneeList(unit) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/action/assignee_list/?unit=' +encodeURIComponent(unit);
    return this.http.get(url).pipe(map(
      data => {
        return data;
      })
    );
  }
  getAllUsersList(unit, access, is_active, is_deleted) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/user_access_list/?unit=' +
      unit +
      '&access_type=' +
      access +
      '&is_active=' +
      is_active +
      '&is_deleted=' +
      is_deleted;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  creatingAction(
    object_type,
    object_type_id,
    summary,
    description,
    assignee_id,
    due_date,
    status,
    assignor_id,
    file_list?,
    unit?
  ) {
    let url = '';
    let body;
    if (object_type) {
      url =
        sessionStorage.getItem('apiUrl') +
        'api/' +
        sessionStorage.getItem('company-id') +
        '/' +
        sessionStorage.getItem('selectedPlant') +
        '/safety_and_surveillance/actions/';
      body = {
        object_type_id,
        object_type,
        summary,
        description,
        assignee_id,
        due_date,
        status,
        assignor_id,
        file_list,
        unit,
      };
    } else {
      url =
        sessionStorage.getItem('apiUrl') +
        'api/' +
        sessionStorage.getItem('company-id') +
        '/' +
        sessionStorage.getItem('selectedPlant') +
        '/safety_and_surveillance/actions/';
      body = {
        summary,
        description,
        assignee_id,
        due_date,
        status,
        assignor_id,
        file_list,
        unit,
      };
    }
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getCategoryWiseObsDetails(
    filtersData,
    startDate,
    endDate,
    coountOfDays,
    is_critical
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/category_wise_obs_details/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        count: coountOfDays,
        filters: filtersData,
        is_critical,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
  getUnitWiseObsDetails(
    filtersData,
    startDate,
    endDate,
    coountOfDays,
    is_critical
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/unit_wise_obs_details/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        count: coountOfDays,
        filters: filtersData,
        is_critical: is_critical,
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
  getCriticalObsGraph(filtersData, startDate, endDate, coountOfDays, category) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/critical_obs_graph/';
    return this.http
      .post(url, {
        end_date: endDate,
        start_date: startDate,
        count: coountOfDays,
        filters: filtersData,
        category: category ? [category] : [],
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
  getObservationTrendGraph(
    filtersData,
    startDate,
    endDate,
    coountOfDays,
    category
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/observation_trend/';
    return this.http
      .post(url, {
        start_date: startDate,
        end_date: endDate,
        count: coountOfDays,
        filters: filtersData,
        category: category ? [category] : [],
      })
      .pipe(
        map((data) => {
          return data;
        })
      );
  }
  fetchObservationData(unit) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/filters?unit=' +
      unit;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  fetchUnitData(unit) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/get_units_and_zones/?unit_name=' +
      unit;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  creatingActionComment(id, comment, file_list, currentId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/comments/';
    let body = {
      object_type: currentId,
      object_type_id: id,
      comment,
      file_list,
    };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }

  actionUpdate(
    action_id,
    object_type_id,
    summary,
    description,
    assignee_id,
    due_date,
    status,
    assignor,
    unit
  ) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/update/';
    let body = {
      action_id,
      object_type_id,
      summary,
      description,
      assignee_id,
      due_date,
      status,
      assignor,
      unit,
    };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getActionComment(id, currentId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/comments/?object_type=' +
      currentId +
      '&object_type_id=' +
      id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  deleteActionComment(comment_id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/comment/' +
      comment_id +
      '/delete/';
    return this.http.delete(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  deleteActionCommentImage(comment_id, images_id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/comment/' +
      comment_id +
      '/file/' +
      images_id +
      '/delete/';
    return this.http.delete(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  deleteAction(action_id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/' +
      action_id +
      '/delete/';
    return this.http.delete(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getActionHistory(action_id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/logs/?action_id=' +
      action_id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  actionImageUpload(unit, files) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/comment_image_upload/';
    let formData = new FormData();
    formData.append('unit', unit);
    for (let file of files) {
      formData.append('image', file);
    }
    return this.http.post(url, formData).pipe(
      map((data) => {
        return data;
      })
    );
  }
  uploadImage(file){
    let url =
    sessionStorage.getItem('apiUrl') +
    'api/' +
    sessionStorage.getItem('company-id') +
    '/' +
    sessionStorage.getItem('selectedPlant') +
    '/safety_and_surveillance/upload_image/';
  let formData = new FormData();
    formData.append('image', file);
 
  return this.http.post(url, formData).pipe(
    map((data) => {
      return data;
    })
  );
  }

  getNotifications(startIndex, endIndex,object_type) {
    let url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/safety_and_surveillance/notification/?start=' + startIndex + '&end=' + endIndex + '&object_type=' + object_type;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      })
    );
  }
  deleteNotifications(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/delete_notification/';
    let body = id;
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }
  readNotifications(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/read_notification/';
    let body = id;
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }
  unreadNotifications() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/unread_notifications_count/';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  muteNotifications(status) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/mute_notifications/';
    let body = status;
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }
  mute_Notification() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/mute_notifications/';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getavailableObservations() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/global_search';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getSearchObservations() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/global_search_observation/';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getColorValue(category: string) {
    return this.colorMapper.get(category);
  }

  getAbbreviationValue(category) {
    return this.abbreviationMapper.get(category);
  }

  getCategoryDetails(category) {
    let categoryDetails = this.iogpCategories.find(
      (item) => item.acronym === category
    );
    return categoryDetails ? categoryDetails : category;
  }

  sendMatomoEvent(action, name) {
    this.tracker.trackEvent('S&S', action, name);
  }

  getIncident(incidentId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident/';
    if (incidentId) {
      url = url + '?id=' + incidentId;
    }
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getIncidentMetadata(type) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_metadata/';
    if (type) {
      url = url + '?id=' + type;
    }
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postNewIncident(obj) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident/';
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateNewIncident(obj) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident/?id=' +
      obj.id;
    return this.http.put(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getIncidentEvidenceForms() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_evidence_forms';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getIncidentEvidenceFormFields(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_evidence_fields/?form_id=' +
      id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getEvidenceFileForm(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_evidence_data/?incident_id=' +
      id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  uploadPdfFile(unit, files) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/evidence_file';
    let formData = new FormData();
    formData.append('unit', unit);
    for (let file of files) {
      formData.append('file', file);
    }
    return this.http.post(url, formData).pipe(
      map((response) => {
        return response;
      })
    );
  }

  postEvidenceForm(obj) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_evidence_data/?form_data_id=' +
      obj.form_id;
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateEvidenceForm(obj, formId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_evidence_data/?form_data_id=' +
      formId;
    return this.http.put(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  deleteEvidenceForm(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/incident_evidence_data/?form_data_id=' +
      id;
    return this.http.delete(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getFishboneParameter(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_parameter?id=' +
      id;

    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postFishboneParameter(obj) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_parameter';

    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getFishboneCauseAnalysis(id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_cause_analysis/?incident_id=' +
      id;

    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateFishboneCause(id, text, flag) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_cause_analysis/?cause_id=' +
      id;
    let obj = {
      cause: text,
      mark_as_rca: flag,
    };
    return this.http.put(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateFishboneSubCause(id, text, flag) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_sub_cause_analysis/?sub_cause_id=' +
      id;
    let obj = {
      sub_cause: text,
      mark_as_rca: flag,
    };
    return this.http.put(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  deleteFishboneCauseSubcause(id, type) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/delete_fishbone_cause_sub_cause/';
    let obj = {
      id: id,
      type: type,
    };
    return this.http.request('delete', url, { body: obj }).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postFishboneCause(incident_id, parameter_id, cause) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_cause_analysis';
    let obj = {
      incident_id,
      parameter_id,
      cause,
    };
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postFishboneSubCause(cause_id, sub_cause) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/fishbone_sub_cause_analysis';
    let obj = {
      cause_id,
      sub_cause,
    };
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  getQuestionAnalysis(incident_id) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/question_analysis/?incident_id=' +
      incident_id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postQuestionAnalysis(incident_id, question) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/question_analysis';
    let obj = {
      incident_id,
      question: question,
    };
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  postNewAns(question_id, answer) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/answer_analysis';
    let obj = {
      question_id,
      answer,
    };
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateAns(ansId, answer, mark_as_rca) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/answer_analysis?answer_id=' +
      ansId;
    let obj = {
      answer,
      mark_as_rca,
    };
    return this.http.put(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  updateQuestion(questionId, question) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/question_analysis?question_id=' +
      questionId;
    let obj = {
      question,
    };
    return this.http.put(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getInsights(incidentData: any, incidentForm: any) {
    // let insightsUrl = `${this.insightsUrl}/insights/`;
    // const authHeader = 'Token ' + token;
    let dashboardUrl =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/';
    let centralDashboardUrl =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/central_dashboard/';
    let selectedSectors = [];
    let selectedIncidentFactors = [];
    let selectedDamages = [];
    for (let item of incidentForm) {
      if (item.type === 'sector') {
        if (item.checked) {
          selectedSectors.push(item.name);
        }
      } else if (item.type === 'incident_factor') {
        if (item.checked) {
          selectedIncidentFactors.push(item.name);
        }
      } else if (item.type === 'damage') {
        if (item.checked) {
          selectedDamages.push(item.name);
        }
      }
    }
    let obj = {
      plant: incidentData.plant,
      unit: incidentData.unit_name,
      zone: incidentData.zone_name,
      zone_id: incidentData.zone,
      categories: incidentData.iogpcategories,
      date: incidentData.incident_date,
      time: incidentData.incident_time,
      description: incidentData.description,
      'ttl-serious-injuries':
        incidentData.serious_injury.contractor +
        incidentData.serious_injury.employee +
        incidentData.serious_injury.others,
      'ttl-fatalities':
        incidentData.fatality.contractor +
        incidentData.fatality.employee +
        incidentData.fatality.others,
      'incident-type': selectedIncidentFactors,
      sector: selectedSectors,
      damages: selectedDamages,
      get_token: centralDashboardUrl + 'get_auth_token/',
      get_obs: dashboardUrl + 'observations_select/',
    };
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/get_insights/';
    return this.http.post(url, { body: obj });
  }

  getObsInsights(insightBody) {
    let dashboardUrl =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/';
    let centralDashboardUrl =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/central_dashboard/';
    insightBody.get_token = centralDashboardUrl + 'get_auth_token/';
    insightBody.get_obs = dashboardUrl + 'observations_select/';
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/get_insights/';
    return this.http.post(url, { body: insightBody });
  }

  triggerAIRCACreation(incidentDetails) {
    let api_url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/';
    incidentDetails['api_url'] = api_url;
    incidentDetails['dashboard_url'] = sessionStorage.getItem('company-host');
    let url =
      'https://ikbwlfivn1.execute-api.us-east-1.amazonaws.com/rca-dev-active/rca_recommendation/';
    let api_key = 'XahrLW6E176QvJ72SRu4b5rumKiAWSHL8xaxGLVq';
    let headers = new HttpHeaders().set('x-api-key', api_key);
    return this.http.post(url, incidentDetails, { headers: headers });
  }

  triggerAIActionCreation(incidentDetails) {
    let api_url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/';
    incidentDetails['api_url'] = api_url;
    incidentDetails['dashboard_url'] = sessionStorage.getItem('company-host');
    let url =
      'https://0ftgnx2svk.execute-api.us-east-1.amazonaws.com/dev/capa_recommendation';
    let api_key = 'lUKLSzRWii3fSKyIHxHeq6Kbj4bDEG9W47IhvVAQ';
    let headers = new HttpHeaders().set('x-api-key', api_key);
    return this.http.post(url, incidentDetails, { headers: headers });
  }

  postPinnedInsights(object_type, object_type_id, response: any) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/pinned_insights';
    let obj = {
      object_type: object_type,
      object_type_id: object_type_id,
      response: response,
    };
    return this.http.post(url, obj);
  }

  getPinnedInsights(object_type, object_type_id: any) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/pinned_insights/?object_type=' +
      object_type +
      '&object_type_id=' +
      object_type_id;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  deletePinnedInsights(insight_id: any) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/pinned_insights/?insight_id=' +
      insight_id;
    return this.http.delete(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  createActionImageUpload(unit, files) {
    let formData = new FormData();
    if (unit) {
      formData.append('unit', unit);
    }
    for (let file of files) {
      formData.append('image', file);
    }
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/image_upload/';
    return this.http.post(url, formData).pipe(
      map((data) => {
        return data;
      })
    );
  }
  deleteActionImage(actionId, imageId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/' +
      actionId +
      '/file/' +
      imageId +
      '/delete/';
    return this.http.delete(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  addActionDocumentFiles(action_id, file_list) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/action/documents/';
    return this.http.post(url, { action_id, file_list }).pipe(
      map((data) => {
        return data;
      })
    );
  }

  fetchPermitFilters(zones ,type) {
    let obj ={}
    if(type== 'units'){
      obj = {unit_id: zones}
    }else{
      obj = {zone_id: zones}
    }
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/permit_info/';
    
    return this.http.post(url, obj).pipe(map(
      data => {
        return data;
      }
    ));
  }

  activityFilters() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/activity_filters/' ;
   
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }
  
  activitySummary(filters) {
    let obj ={}
    obj = {
      units : filters.units,
      vendors : filters.vendors,
      activities : filters.activities
    }
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/activity_summary/';
    
    return this.http.post(url, obj).pipe(map(
      data => {
        return data;
      }
    ));
  }

  activities(filters,key,start,offset) {
    let obj ={}
    obj = {
      units : filters.units,
      vendors : filters.vendors,
      activities : filters.activities,
      key : key,
      start: start,
      offset: offset
    }

    if(filters.range){
      obj['range'] = filters.range
    }

    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/activities/';
    
    return this.http.post(url, obj).pipe(map(
      data => {
        return data;
      }
    ));
  }
  activitiessubactivities(params?) {
    let param =''
    if(params){
      param= params;
    }
    // obj = {
    //   units : filters.units,
    //   vendors : filters.vendors,
    //   activities : filters.activities,
    //   key : key
    // }
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/activity-subactivities?'+params;
    
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  addAuditChecklist(data) {
   
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/audit_checklist_configuration';
    
    return this.http.post(url,data).pipe(map(
      data => {
        return data;
      }
    ));
  }
  saveAuditChecklist(data) {
   
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/config_checklist_item';
    
    return this.http.post(url,data).pipe(map(
      data => {
        return data;
      }
    ));
  }
  deleteAuditChecklist(id) {
   
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/config_checklist_item?checklist_item_id='+id;
    
    return this.http.delete(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getChecklistBySubId(params) {
   
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/audit_checklist_configuration?'+params;
    
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  getAuditChecklistBySubId(id) {
   
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/audit_checklist?sub_activity_id='+id;
    
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
  submitStartAudit(data) {
   
    let url = sessionStorage.getItem('apiUrl')  + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant')  +   '/safety_and_surveillance/audit_checklist';
    
    return this.http.post(url,data).pipe(map(
      data => {
        return data;
      }
    ));
  }
  
  
  

}
