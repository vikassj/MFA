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
export class SafetyAndSurveillanceDataService {

  private selectedUnit = new BehaviorSubject<any>("");
  getSelectedUnit = this.selectedUnit.asObservable();

  private selectedUnits = new BehaviorSubject<any>("");
  getSelectedUnits = this.selectedUnits.asObservable();

  private allUnits = new BehaviorSubject<any>("");
  getAllUnits = this.allUnits.asObservable();

  private globalSearch = new BehaviorSubject<any>("");
  getGlobalSearch = this.globalSearch.asObservable();

  private selectedDates = new BehaviorSubject<any>("");
  getSelectedDates = this.selectedDates.asObservable();

  private currentPlantPage = new BehaviorSubject<any>("");
  getCurrentPlantPage = this.currentPlantPage.asObservable();

  private currentUnitPage = new BehaviorSubject<any>("");
  getCurrentUnitPage = this.currentUnitPage.asObservable();

  private plantShuddownDates = new BehaviorSubject<any>("");
  getPlantShuddowndates = this.plantShuddownDates.asObservable();

  private shuddownDates = new BehaviorSubject<any>("");
  getShuddowndates = this.shuddownDates.asObservable();

  private helpModule = new BehaviorSubject<any>("");
  getHelpModule = this.helpModule.asObservable();

  private obsData = new BehaviorSubject<any>("");
  getObsData = this.obsData.asObservable();

  private observationsFilters = new BehaviorSubject<any>("");
  getObservationsFilters = this.observationsFilters.asObservable();

  private tabFaultCount = new BehaviorSubject<any>("");
  getTabFaultCount = this.tabFaultCount.asObservable();

  private selectedDate = new BehaviorSubject<any>("");
  getSelectedDate = this.selectedDate.asObservable();

  private bevData = new BehaviorSubject<any>("");
  getBevData = this.bevData.asObservable();

  private toggleSidebar = new BehaviorSubject<any>("");
  getToggleSidebar = this.toggleSidebar.asObservable();

  private observationPopupFlag = new BehaviorSubject<any>("");
  getObservationPopupFlag = this.observationPopupFlag.asObservable();

  private observationsSearchText = new BehaviorSubject<any>("");
  getObservationsSearchText = this.observationsSearchText.asObservable();

  private openCloseCount = new BehaviorSubject<any>("");
  getOpenCloseCount = this.openCloseCount.asObservable();

  private selectedPage = new BehaviorSubject<any>("");
  getSelectedPage = this.selectedPage.asObservable();

  private selectedUnitsAndDates = new BehaviorSubject<any>("")
  getSelectedUnitsAndDates = this.selectedUnitsAndDates.asObservable();

  private actionsFilter = new BehaviorSubject<any>("");
  getActionsFilter = this.actionsFilter.asObservable();

  private pageData = new BehaviorSubject<any>("");
  getpageData = this.pageData.asObservable();
  
  private selectedPermits = new BehaviorSubject<any>("")
  getSelectedPermits = this.selectedPermits.asObservable();

  constructor() { }

  passToggleSidebar(flag:boolean){
    this.toggleSidebar.next(!flag);
  }

  passActionsFilter(values, validFlag){
    this.actionsFilter.next({'values' : values, 'valifFlag' : validFlag})
  }

  passSelectedUnit(selectedUnit, validFlag) {
    this.selectedUnit.next({ 'selectedUnit': selectedUnit, 'validFlag': validFlag });
  }

  passSelectedUnits(selectedUnits) {
    this.selectedUnits.next(selectedUnits);
  }

  passAllUnits(allUnits) {
    this.allUnits.next(allUnits);
  }

  passGlobalSearch(globalSearch) {
    this.globalSearch.next(globalSearch);
  }

  passSelectedDates(startDate, endDate) {
    this.selectedDates.next({ 'startDate': startDate, 'endDate': endDate });
  }

  passCurrentPlantPage(currentPlantPage, validFlag) {
    this.currentPlantPage.next({ 'currentPlantPage': currentPlantPage, 'validFlag': validFlag });
  }

  passCurrentUnitPage(currentUnitPage, validFlag) {
    this.currentUnitPage.next({ 'currentUnitPage': currentUnitPage, 'validFlag': validFlag });
  }

  passPlantShuddownDates(startDate, endDate, validFlag) {
    this.plantShuddownDates.next({ 'startDate': startDate, 'endDate': endDate, 'validFlag': validFlag });
  }

  passShuddownDates(unit, startDate, endDate, validFlag) {
    this.shuddownDates.next({ 'unit': unit, 'startDate': startDate, 'endDate': endDate, 'validFlag': validFlag });
  }

  passHelpModule(helpModule, validFlag) {
    this.helpModule.next({ 'helpModule': helpModule, 'validFlag': validFlag });
  }

  passObsData(zone, category, date, riskRating, validFlag) {
    this.obsData.next({ 'zone': zone, 'category': category, 'date': date, 'riskRating': riskRating, 'validFlag': validFlag });
  }

  passObservationsFilters(unit, zone, category, date, availableDates, time, mode, riskRating, status, sortBy, displayType, permit, permitType, nature, vendors, issuers,auditObs, validFlag) {
    this.observationsFilters.next({'unit': unit, 'zone': zone, 'category': category, 'date': date, 'availableDates': availableDates, 'time': time, 'mode': mode, 'riskRating': riskRating, 'status': status, 'sortBy': sortBy, 'displayType': displayType, 'permit': permit, 'permitType': permitType, 'nature': nature, 'vendors': vendors, 'issuers': issuers, 'auditObs': auditObs, 'validFlag': validFlag });
  }

  passTabFaultCount(faultData, loadFlag, validFlag) {
    this.tabFaultCount.next({ 'faultData': faultData, 'loadFlag': loadFlag, 'validFlag': validFlag });
  }

  passSelectedDate(date, validFlag) {
    this.selectedDate.next({ 'date': date, 'validFlag': validFlag });
  }

  passBevData(trigger, validFlag) {
    this.bevData.next({ 'trigger': trigger, 'validFlag': validFlag });
  }

  passObservationPopupFlag(bulk_update: boolean, export_file: boolean, birds_eye_view: boolean, filter: boolean) {
    this.observationPopupFlag.next({ bulk_update,  export_file, birds_eye_view, filter });
  }

  passObservationsSearchText(obsData: any, searchText: string) {
    this.observationsSearchText.next({ obsData, searchText });
  }

  passOpenCloseCount(openCloseCount) {
    this.openCloseCount.next(openCloseCount);
  }
  passSelectedPage(selectedPage) {
    this.selectedPage.next(selectedPage);
  }

  passDatesAndUnits(units, startDate, endDate) {
    if(units != "" && startDate == "" && endDate == "") {
      this.selectedUnitsAndDates.next({'data': units, 'value': 'units'})
    } else if(units == "" && startDate != "" && endDate != "") {
      this.selectedUnitsAndDates.next({'data' : { 'startDate': startDate, 'endDate': endDate }, 'value': 'dates'})
    } else if(units != "" && startDate != "" && endDate != "") {
      this.selectedUnitsAndDates.next({'data' : {'startDate': startDate, 'endDate': endDate, 'units' : units}, 'value': 'all'})
    } else if(units == "" && startDate == "" && endDate == "") {
      this.selectedUnitsAndDates.next({'data' : {'startDate': startDate, 'endDate': endDate, 'units' : units}, 'value': 'empty'})
    }
  }

  passPageData(units, startDate, endDate) {
    this.pageData.next({units, startDate, endDate})
  }
  
  passSelectedPermits(permits){
    this.selectedPermits.next(permits);
  }
  
}
