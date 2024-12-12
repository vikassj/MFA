///////////////////////////////////////////////////////////////////////////////
// Filename : data.service.ts
// Description : Used for data transfer across components
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
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CovidSolutionsDataService {

  private selectedLocation = new BehaviorSubject<any>("");
  getSelectedLocation = this.selectedLocation.asObservable();

  private currentPlantPage = new BehaviorSubject<any>("");
  getCurrentPlantPage = this.currentPlantPage.asObservable();

  private currentLocationPage = new BehaviorSubject<any>("");
  getCurrentLocationPage = this.currentLocationPage.asObservable();

  private zsFilters = new BehaviorSubject<any>("");
  getZsFilters = this.zsFilters.asObservable();

  private lfFilters = new BehaviorSubject<any>("");
  getLfFilters = this.lfFilters.asObservable();

  private shuddownDates = new BehaviorSubject<any>("");
  getShuddowndates = this.shuddownDates.asObservable();

  private helpModule = new BehaviorSubject<any>("");
  getHelpModule = this.helpModule.asObservable();

  private imagePostTrigger = new BehaviorSubject<any>("");
  getImagePostTrigger = this.imagePostTrigger.asObservable();

  constructor() { }

  passSelectedLocation(selectedLocation, validFlag) {
    this.selectedLocation.next({ 'selectedLocation': selectedLocation, 'validFlag': validFlag });
  }

  passCurrentPlantPage(currentPlantPage, validFlag) {
    this.currentPlantPage.next({ 'currentPlantPage': currentPlantPage, 'validFlag': validFlag });
  }

  passCurrentLocationPage(currentLocationPage, validFlag) {
    this.currentLocationPage.next({ 'currentLocationPage': currentLocationPage, 'validFlag': validFlag });
  }

  passZsFilters(location, camera, startDate, endDate, startTime, endTime, category, subCategory, sortBy, validFlag) {
    this.zsFilters.next({ 'location': location, 'camera': camera, 'startDate': startDate, 'endDate': endDate, 'startTime': startTime, 'endTime': endTime, 'category': category, 'subCategory': subCategory, 'sortBy': sortBy, 'validFlag': validFlag });
  }

  passLfFilters(location, camera, validFlag) {
    this.lfFilters.next({ 'location': location, 'camera': camera, 'validFlag': validFlag });
  }

  passShuddownDates(unit, startDate, endDate, reportType, validFlag) {
    this.shuddownDates.next({ 'unit': unit, 'startDate': startDate, 'endDate': endDate, 'reportType': reportType, 'validFlag': validFlag });
  }

  passHelpModule(helpModule, validFlag) {
    this.helpModule.next({ 'helpModule': helpModule, 'validFlag': validFlag });
  }

  passImagePostTrigger(trigger, validFlag) {
    this.imagePostTrigger.next({ 'trigger': trigger, 'validFlag': validFlag });
  }

}
