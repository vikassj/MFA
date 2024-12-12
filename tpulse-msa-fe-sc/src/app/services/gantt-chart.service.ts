import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map } from 'rxjs/operators';
import { Observable, Subscriber } from 'rxjs';

@Injectable()
export class GanttChartService {
  // api_url = 'https://tpulse-mfa-fe-api.detectpl.com/api/1/schedule_control'
  api_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  constructor(private http: HttpClient) { }

  getGanttChartData(unit, equipmentCategory, department, vendor,critical,overShoot) {
    //const selectedPlant =  sessionStorage.getItem('selectedPlant');
    const selectedPlant = 1;
    //let url = sessionStorage.getItem('apiUrl') + 'api/' + selectedPlant + '/schedule_control/gantt_chart_view/?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department=' + department;
    if(unit && equipmentCategory && department && vendor && overShoot == true){
    var url = this.api_url + '/gantt_chart_view/?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department=' + department + '&vendor_id=' + vendor + '&overshoot='+overShoot;
    }
    else{
    var url = this.api_url + '/gantt_chart_view/?unit=' + unit + '&equipment_category=' + equipmentCategory + '&department=' + department + '&vendor_id=' + vendor + '&critical='+critical;
    }
    return this.http.get(url).pipe(map(
      data => {
        return data
      }
    ));

    const data = {
      "message": [
        {
          "id": 9,
          "text": "Task-108",
          "planned_duration": "4hrs",
          "parent": [
            "8"
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "8"
          ],
          "target": 9,
          "planned_date_to_start": "2023-07-11",
          "planned_time_to_start": "17:00:00",
          "planned_date_to_complete": "2023-07-11",
          "planned_time_to_complete": "21:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": true,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": false,
          "issue_count": 1
        },
        {
          "id": 8,
          "text": "Task-H",
          "planned_duration": "4hrs",
          "parent": [
            0
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "6",
            "7"
          ],
          "target": 8,
          "planned_date_to_start": "2023-07-11",
          "planned_time_to_start": "13:00:00",
          "planned_date_to_complete": "2023-07-11",
          "planned_time_to_complete": "17:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": true,
          "issue_count": 7
        },
        {
          "id": 7,
          "text": "Task-G",
          "planned_duration": "6hrs",
          "parent": [
            0
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "4",
            "5"
          ],
          "target": 7,
          "planned_date_to_start": "2023-07-11",
          "planned_time_to_start": "07:00:00",
          "planned_date_to_complete": "2023-07-11",
          "planned_time_to_complete": "13:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": true,
          "issue_count": 0
        },
        {
          "id": 6,
          "text": "Task-F",
          "planned_duration": "5hrs",
          "parent": [
            "3"
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "3"
          ],
          "target": 6,
          "planned_date_to_start": "2023-07-10",
          "planned_time_to_start": "18:00:00",
          "planned_date_to_complete": "2023-07-10",
          "planned_time_to_complete": "23:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": false,
          "issue_count": 2
        },
        {
          "id": 5,
          "text": "Task-E",
          "planned_duration": "3hrs",
          "parent": [
            "3"
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "3"
          ],
          "target": 5,
          "planned_date_to_start": "2023-07-10",
          "planned_time_to_start": "18:00:00",
          "planned_date_to_complete": "2023-07-10",
          "planned_time_to_complete": "21:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": false,
          "issue_count": 1
        },
        {
          "id": 4,
          "text": "Task-D",
          "planned_duration": "10hrs",
          "parent": [
            "2"
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "2"
          ],
          "target": 4,
          "planned_date_to_start": "2023-07-10",
          "planned_time_to_start": "21:00:00",
          "planned_date_to_complete": "2023-07-11",
          "planned_time_to_complete": "07:00:00",
          "actual_start_date": "2023-07-08",
          "actual_start_time": "21:00:00",
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": true,
          "issue_count": 2
        },
        {
          "id": 3,
          "text": "Task-C",
          "planned_duration": "4hrs",
          "parent": [
            "1"
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            "1"
          ],
          "target": 3,
          "planned_date_to_start": "2023-07-10",
          "planned_time_to_start": "14:00:00",
          "planned_date_to_complete": "2023-07-10",
          "planned_time_to_complete": "18:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "NOT STARTED",
          "elapsed_duration": 0.0,
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": 0.0,
          "critical": false,
          "issue_count": 0
        },
        {
          "id": 2,
          "text": "Task-B",
          "planned_duration": "5 days",
          "parent": [
            "1"
          ],
          "progress": 0.0,
          "slack": 1,
          "open": true,
          "source": [
            "1"
          ],
          "target": 2,
          "planned_date_to_start": "2023-07-05",
          "planned_time_to_start": "00:00:00",
          "planned_date_to_complete": "2023-07-10",
          "planned_time_to_complete": "00:00:00",
          "actual_start_date": "2023-07-04",
          "actual_start_time": "00:00:00",
          "actual_date_of_completion": "2023-07-08",
          "actual_time_of_completion": "00:00:00",
          "status": "COMPLETED",
          "elapsed_duration": "4 days",
          "surprise": false,
          "milestone": false,
          "type": "regular",
          "delay": "1 day",
          "critical": true,
          "issue_count": 0
        },
        {
          "id": 1,
          "text": "Task-A",
          "planned_duration": "5hrs",
          "parent": [
            0
          ],
          "progress": 0.0,
          "slack": 0.0,
          "open": true,
          "source": [
            0
          ],
          "target": 1,
          "planned_date_to_start": "2023-07-10",
          "planned_time_to_start": "09:00:00",
          "planned_date_to_complete": "2023-07-10",
          "planned_time_to_complete": "14:00:00",
          "actual_start_date": null,
          "actual_start_time": null,
          "actual_date_of_completion": null,
          "actual_time_of_completion": null,
          "status": "IN-PROGRESS",
          "elapsed_duration": "5hrs",
          "surprise": false,
          "milestone": false,
          "type": "project",
          "delay": 0.0,
          "critical": true,
          "issue_count": 3
        }
      ]
    }
    let obs = new Observable((subscriber) => {
      subscriber.next(data);
      subscriber.complete();
    });
    return obs;
  }
  getTasks(data) {
    return data;
  };
  getLinks(data) {
    return data;
  }
}


