import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ManpowerCountingDataService {

  private currentPlantPage = new BehaviorSubject<any>("");
  getCurrentPlantPage = this.currentPlantPage.asObservable();

  private currentUnitPage = new BehaviorSubject<any>("");
  getCurrentUnitPage = this.currentUnitPage.asObservable();

  private currentGatePage = new BehaviorSubject<any>("");
  getCurrentGatePage = this.currentGatePage.asObservable();

  private selectedUnit = new BehaviorSubject<any>("");
  getSelectedUnit = this.selectedUnit.asObservable();

  private unitShuddownDates = new BehaviorSubject<any>("");
  getUnitShuddowndates = this.unitShuddownDates.asObservable();

  private gateShuddownDates = new BehaviorSubject<any>("");
  getGateShuddowndates = this.gateShuddownDates.asObservable();

  private unitMpcFilters = new BehaviorSubject<any>("");
  getUnitMpcFilters = this.unitMpcFilters.asObservable();

  private gateMpcFilters = new BehaviorSubject<any>("");
  getGateMpcFilters = this.gateMpcFilters.asObservable();

  private helpModule = new BehaviorSubject<any>("");
  getHelpModule = this.helpModule.asObservable();

  constructor() { }

  passCurrentPlantPage(currentPlantPage, validFlag) {
    this.currentPlantPage.next({ 'currentPlantPage': currentPlantPage, 'validFlag': validFlag });
  }

  passCurrentGatePage(currentGatePage, validFlag) {
    this.currentGatePage.next({ 'currentGatePage': currentGatePage, 'validFlag': validFlag });
  }

  passCurrentUnitPage(currentUnitPage, validFlag) {
    this.currentUnitPage.next({ 'currentUnitPage': currentUnitPage, 'validFlag': validFlag });
  }

  passSelectedUnit(unit, validFlag) {
    this.selectedUnit.next({ 'unit': unit, 'validFlag': validFlag });
  }

  passUnitShuddownDates(location, startDate, endDate, validFlag) {
    this.unitShuddownDates.next({ 'location': location, 'startDate': startDate, 'endDate': endDate, 'validFlag': validFlag });
  }

  passGateShuddownDates(location, startDate, endDate, validFlag) {
    this.gateShuddownDates.next({ 'location': location, 'startDate': startDate, 'endDate': endDate, 'validFlag': validFlag });
  }

  passUnitMpcFilters(unit, zone, startDate, endDate, mpcChartData, minThreshold, maxThreshold, inOutCount, validFlag) {
    this.unitMpcFilters.next({ 'unit': unit, 'zone': zone, 'startDate': startDate, 'endDate': endDate, 'mpcChartData': mpcChartData, 'minThreshold': minThreshold, 'maxThreshold': maxThreshold, 'inOutCount': inOutCount, 'validFlag': validFlag });
  }

  passGateMpcFilters(gate, startDate, endDate, mpcChartData, minThreshold, maxThreshold, inOutCount, validFlag) {
    this.gateMpcFilters.next({ 'gate': gate, 'startDate': startDate, 'endDate': endDate, 'mpcChartData': mpcChartData, 'minThreshold': minThreshold, 'maxThreshold': maxThreshold, 'inOutCount': inOutCount, 'validFlag': validFlag });
  }

  passHelpModule(helpModule, validFlag) {
    this.helpModule.next({ 'helpModule': helpModule, 'validFlag': validFlag });
  }

}
