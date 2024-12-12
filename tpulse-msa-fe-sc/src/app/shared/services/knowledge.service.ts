import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  constructor(private http: HttpClient) { }
  // base_url: string = 'https://tpulse-mfa-fe-api.detectpl.com'
  base_url = sessionStorage.getItem('apiUrl') + 'api/' + sessionStorage.getItem('company-id') + '/' + sessionStorage.getItem('selectedPlant') + '/schedule_control';
  getlearnings(task_id){
    return this.http.get(this.base_url +'/task_learnings?task_id'+task_id)
  }
  postlearnings(data){
    return this.http.post(this.base_url +'/task_learnings',data)
  }
}
