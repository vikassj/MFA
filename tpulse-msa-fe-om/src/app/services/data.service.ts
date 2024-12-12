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

}
