import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class OverviewService {
  // base_url: string = 'https://tpulse-mfa-fe-api.detectpl.com'
  base_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getUnitsList() {
    return this.http.get(this.base_url + '/overview')
  }
  getOverAllUnitData(unit_id) {
    return this.http.get(this.base_url + '/units_overview?unit_id=' + unit_id)
  }
  getLastAndNextMilestone(unit_id) {
    return this.http.get(this.base_url + '/milestones?unit_id=' + unit_id)
  }
  getActiveEquipmentCount(unit_id) {
    if (unit_id) {
      return this.http.get(this.base_url + '/active_equipment_count?unit_id=' + unit_id)
    }
    else {
      return this.http.get(this.base_url + '/active_equipment_count')
    }

  }
  getDailyExceptionReport(unitName) {
    let url = this.base_url + '/latest_daily_report?unit_name=' + unitName;
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }
}
