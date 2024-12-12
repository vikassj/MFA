import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LiveStreamingDataService {
  private currentLiveStreamingPage = new BehaviorSubject<any>("");
  getCurrentLiveStreamingPage = this.currentLiveStreamingPage.asObservable();

  private liveStreamingFilters = new BehaviorSubject<any>("");
  getLiveStreamingFilters = this.liveStreamingFilters.asObservable();

  private helpModule = new BehaviorSubject<any>("");
  getHelpModule = this.helpModule.asObservable();

  private showFlag = new BehaviorSubject<any>("");
  getShowFlag = this.showFlag.asObservable();

  private selectedUnit = new BehaviorSubject<any>("");
  getSelectedUnit = this.selectedUnit.asObservable();

  private currentUnitPage = new BehaviorSubject<any>("");
  getCurrentUnitPage = this.currentUnitPage.asObservable();

  private loggedIn = new BehaviorSubject<any>('');
  getLoggedIn = this.loggedIn.asObservable();

  private currentPage = new BehaviorSubject<any>('');
  getCurrentPage = this.currentPage.asObservable();

  private selectedDates = new BehaviorSubject<any>("");
  getSelectedDates = this.selectedDates.asObservable();

  private toggleFilter = new BehaviorSubject<any>("");
  getToggleFilter = this.toggleFilter.asObservable();

  private selectedFilterData = new BehaviorSubject<any>("");
  getSelectedFilterData = this.selectedFilterData.asObservable();

  constructor() { }

  passCurrentLiveStreamingPage(currentLiveStreamingPage, validFlag) {
    this.currentLiveStreamingPage.next({ 'currentLiveStreamingPage': currentLiveStreamingPage, 'validFlag': validFlag });
  }

  passLiveStreamingFilters(location, cameras, validFlag) {
    this.liveStreamingFilters.next({ 'location': location, 'cameras': cameras, 'validFlag': validFlag });
  }

  passSelectedUnit(selectedUnit, validFlag) {
    this.selectedUnit.next({ 'selectedUnit': selectedUnit, 'validFlag': validFlag });
  }

  passCurrentUnitPage(currentUnitPage, validFlag) {
    this.currentUnitPage.next({ 'currentUnitPage': currentUnitPage, 'validFlag': validFlag });
  }

  passHelpModule(helpModule, validFlag) {
    this.helpModule.next({ 'helpModule': helpModule, 'validFlag': validFlag });
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

  passSelectedDates(startDate, endDate) {
    this.selectedDates.next({ 'startDate': startDate, 'endDate': endDate });
  }

  passToggleFilter(flag:boolean){
    this.toggleFilter.next(!flag);
  }

  passFilterData(units, zones, time, source, camera_name, permit_number, type_of_permit, sort, nature_of_work, videoType, startDate, endDate) {
      this.selectedFilterData.next({units, zones, time, source, camera_name, permit_number, type_of_permit, sort, nature_of_work, videoType, startDate, endDate});
    }
}
