///////////////////////////////////////////////////////////////////////////////
// Filename : iogp.service.ts
// Description : Services associated with IOGP for a unit
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
  providedIn: 'root',
})
export class IogpService {
  constructor(private http: HttpClient) {}

  fetchFaultCount(
    units,
    zone,
    job,
    date,
    time,
    mode,
    is_highlight?,
    start_date?,
    end_date?,
    risk?,
    status?,
    permit_number?,
    type_of_permit?,
    nature_of_work?,
    vendor_name?,
    issuer_name?,
    audit_based_observation?
  ) {
    let selectedPlantId = JSON.parse(sessionStorage.getItem('selectedPlant'));
    // To add the isPermitEnabled Access from the permitPlantMap
    let isPermitEnabled = false;
    if (selectedPlantId) {
      let plantPermit = JSON.parse(sessionStorage.getItem('permitPlantMap'));
      let selectedPlant = plantPermit.filter((key) => {
        return key.plant_id == selectedPlantId;
      });
      isPermitEnabled = selectedPlant[0].isPermitEnabled;
    }
    let stime =
      time?.length > 0 ? (time[0] ? time[0] : '00:00:00') : '00:00:00';
    let etime =
      time?.length > 0 ? (time[1] ? time[1] : '23:59:59') : '23:59:59';
    let payload = [];
    if (typeof units[0] == 'object') {
      payload = units[0];
    } else {
      payload = units;
    }
    let unit = payload;
    // , {unit: sessionStorage.getItem('selectedUnit'), zone: zone, category: job, start_date:date, mode: mode}
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/category_multi_select_fault_count/';
    let obj = {};
    if (isPermitEnabled) {
      obj = {
        units,
        zone: zone,
        category: job,
        start_date: start_date,
        end_date,
        start_time: stime,
        end_time: etime,
        risk,
        mode: mode,
        is_highlight,
        status,
        permit_number,
        type_of_permit,
        nature_of_work,
        vendor_name,
        issuer_name,
        audit_based_observation
      };
    } else {
      obj = {
        units,
        zone: zone,
        category: job,
        start_date: start_date,
        end_date,
        start_time: stime,
        end_time: etime,
        risk,
        mode: mode,
        is_highlight,
        status,
        audit_based_observation
      };
    }
    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }

  getRiskRatingDetails(date) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/unit_wise_risk_status_count?unit=' +
      sessionStorage.getItem('selectedUnit') +
      '&date=' +
      date;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  fetchZonewiseFaultCount() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/birds_eye_view?unit=' +
      encodeURIComponent(sessionStorage.getItem('selectedUnit'));
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  fetchHighlightData() {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/highlight/';
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  updateHighlightObservations(observation, isHighlight) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/highlight/';
    let body = { observation: observation, is_highlight: isHighlight };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }

  fetchObsData(
    zone,
    category,
    start_date,
    end_date,
    time,
    mode,
    start,
    offset,
    units,
    is_highlight,
    risk,
    status,
    sort,
    display_type,
    permit_number,
    type_of_permit,
    nature_of_work,
    vendor_name,
    issuer_name,
    audit_based_observation
  ) {
    let selectedPlantId = JSON.parse(sessionStorage.getItem('selectedPlant'));
    // To add the isPermitEnabled Access from the permitPlantMap
    let isPermitEnabled = false;
    if (selectedPlantId) {
      let plantPermit = JSON.parse(sessionStorage.getItem('permitPlantMap'));
      let selectedPlant = plantPermit.filter((key) => {
        return key.plant_id == selectedPlantId;
      });
      isPermitEnabled = selectedPlant[0].isPermitEnabled;
    }
    let stime =
      time?.length > 0 ? (time[0] ? time[0] : '00:00:00') : '00:00:00';
    let etime =
      time?.length > 0 ? (time[1] ? time[1] : '23:59:59') : '23:59:59';
    let payload = [];
    if (typeof units[0] == 'object') {
      payload = units[0];
    } else {
      payload = units;
    }
    let unit = payload;
    // , {unit: sessionStorage.getItem('selectedUnit'), zone: zoneName, job: category, start_date:startDate, start_time: startTime, mode: mode}
    let url =
    sessionStorage.getItem('apiUrl') +
    'api/' +
    sessionStorage.getItem('company-id') +
    '/' +
    sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/observations_multi_select/';

    let globalSearchNotification = JSON.parse(
      sessionStorage.getItem('global-search-notification')
    );
    let searchObservation = JSON.parse(
      sessionStorage.getItem('searchObservation')
    );
    if (searchObservation?.zone) {
      zone = [];
      zone.push(searchObservation?.zone);
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      end_date = yyyy + '-' + mm + '-' + dd;
    } else if (globalSearchNotification) {
      zone = [];
      zone.push(globalSearchNotification?.zone);
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      end_date = yyyy + '-' + mm + '-' + dd;
    }

    let obj = {};
    if (isPermitEnabled) {
      obj = {
        units,
        zone,
        category,
        start_date,
        end_date,
        start_time: stime,
        end_time: etime,
        mode,
        start,
        offset,
        is_highlight,
        risk,
        status,
        sort,
        permit_number,
        type_of_permit,
        nature_of_work,
        vendor_name,
        issuer_name,
        audit_based_observation
      };
    } else {
      obj = {
        units,
        zone,
        category,
        start_date,
        end_date,
        start_time: stime,
        end_time: etime,
        mode,
        start,
        offset,
        is_highlight,
        risk,
        status,
        sort,
        audit_based_observation
      };
    }

    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  fetchObsDatabyFaultId(faultId,unit,zone) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/observations_multi_select/';

    let obj = {
      fault_ids: faultId,
      offset: 10,
      sort: 'dateDesc',
      start: 1,
      units: [unit],
      zone: [zone],
      audit_based_observation: true
    };

    return this.http.post(url, obj).pipe(
      map((data) => {
        return data;
      })
    );
  }
  fetchobservationsPageNum(
    zone,
    category,
    start_date,
    end_date,
    time,
    mode,
    start,
    offset,
    units,
    is_highlight,
    risk,
    status,
    sort,
    display_type,
    fault_id,
    permit_number,
    type_of_permit,
    nature_of_work,
    vendor_name,
    issuer_name
  ) {
    let stime =
      time?.length > 0 ? (time[0] ? time[0] : '00:00:00') : '00:00:00';
    let etime =
      time?.length > 0 ? (time[1] ? time[1] : '23:59:59') : '23:59:59';
    let globalSearchNotification = JSON.parse(
      sessionStorage.getItem('global-search-notification')
    );
    let searchObservation = JSON.parse(
      sessionStorage.getItem('searchObservation')
    );
    if (searchObservation?.zone) {
      zone = [];
      zone.push(searchObservation?.zone);
    } else if (globalSearchNotification) {
      zone = [];
      zone.push(globalSearchNotification?.zone);
    }

    let payload = [];
    if (typeof units[0] == 'object') {
      payload = units[0];
    } else {
      payload = units;
    }
    let unit = payload;
    // , {unit: sessionStorage.getItem('selectedUnit'), zone: zoneName, job: category, start_date:startDate, start_time: startTime, mode: mode}
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/observations_page_num/';
    let obj = {
      units,
      zone,
      category,
      start_date,
      end_date,
      start_time: stime,
      end_time: etime,
      mode,
      offset,
      is_highlight,
      risk,
      status,
      sort,
      fault_id,
      permit_number,
      type_of_permit,
      nature_of_work,
      vendor_name,
      issuer_name,
    };
    return this.http.post(url, obj).pipe(
      map((data) => {
        sessionStorage.setItem('selectedActivePage', JSON.stringify(data));
        return data;
      })
    );
  }

  fetchObsVideos(zone) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/videos?unit=' +
      sessionStorage.getItem('selectedUnit') +
      '&zone=' +
      zone;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  addAnnotation(imageId, coordinates, color, thickness, shape, comment) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/add_annotation/';
    let body = {
      image_id: imageId,
      coordinates: coordinates,
      color: color,
      thickness: thickness,
      drawing_type: shape,
      comment: comment,
    };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }

  deleteAnnotation(annotationId) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/delete_annotation/?id=' +
      annotationId;
    return this.http.get(url).pipe(
      map((data) => {
        return data;
      })
    );
  }

  addComment(annotationId, comment) {
    let url =
      sessionStorage.getItem('apiUrl') +
      'api/' +
      sessionStorage.getItem('company-id') +
      '/' +
      sessionStorage.getItem('selectedPlant') +
      '/safety_and_surveillance/add_comment/';
    let body = { annotation_id: annotationId, comment: comment };
    return this.http.post(url, body).pipe(
      map((data) => {
        return data;
      })
    );
  }
}
