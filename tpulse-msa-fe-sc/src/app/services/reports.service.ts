import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getUnitsList() {
    let url = this.api_url + '/units_list';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getReports(unitId, report_type, startDate, endDate) {
    let url = this.api_url + '/report_view?unit_id='+ unitId +'&report_type=' + report_type + '&start_date=' + startDate + '&end_date=' + endDate;
    // if (rangeType === 'Monthly') {
    //   let url = this.api_url + '/report_view?unit_name=' + unitName + '&unit_id=' + unitId + '&range_type=' + rangeType + '&month=' + month + '&year=' + year;
      return this.http.get(url).pipe(map(
        data => {
          return data;
        }
      ));
    // }
    // else if (rangeType === 'Yearly') {
    //   let url = this.api_url + '/report_view?unit_name=' + unitName + '&unit_id=' + unitId + '&range_type=' + rangeType + '&year=' + year;
    //   return this.http.get(url).pipe(map(
    //     data => {
    //       return data;
    //     }
    //   ));
    // }
  }

}
