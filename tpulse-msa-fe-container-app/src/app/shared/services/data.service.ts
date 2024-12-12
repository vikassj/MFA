import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private loggedIn = new BehaviorSubject<any>('');
  getLoggedIn = this.loggedIn.asObservable();

  private currentPage = new BehaviorSubject<any>('');
  getCurrentPage = this.currentPage.asObservable();

  private showFlag = new BehaviorSubject<any>("");
  getShowFlag = this.showFlag.asObservable();

  private feedBackFlag = new BehaviorSubject<any>("");
  getFeedBackFlag = this.feedBackFlag.asObservable();

  private triggerEvent = new BehaviorSubject<any>("");
  getTriggerEvent = this.triggerEvent.asObservable();

  private navigateEvent = new BehaviorSubject<any>("");
  getNavigateEvent = this.navigateEvent.asObservable();

  constructor() {
  }

  passLoggedIn(loggedIn: boolean | string, validFlag: boolean) {
    this.loggedIn.next({ 'loggedIn': loggedIn, 'validFlag': validFlag });
  }

  passCurrentPage(currentPage: any, validFlag: boolean) {
    this.currentPage.next({ 'currentPage': currentPage, 'validFlag': validFlag });
  }

  passSpinnerFlag(showFlag: any, validFlag: boolean) {
    this.showFlag.next({ 'showFlag': showFlag, 'validFlag': validFlag });
  }

  passFeedBackFlag(feedBackFlag: any) {
    this.feedBackFlag.next({ 'feedBackFlag': feedBackFlag});
  }

  passTriggerEvent(type: any, value) {
    this.triggerEvent.next({ 'type': type, function: value});
  }
  passNavigateEvent(type: any) {
    this.navigateEvent.next({ 'type': type});
  }

}
