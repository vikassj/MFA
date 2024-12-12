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

  private unit = new BehaviorSubject<any>("");
  getUnit = this.unit.asObservable();

  private equipmentCategory = new BehaviorSubject<any>("");
  getEquipmentCategory = this.equipmentCategory.asObservable();

  private department = new BehaviorSubject<any>("");
  getDepartment = this.department.asObservable();

  private equipment = new BehaviorSubject<any>("");
  getEquipment = this.equipment.asObservable();

  private task = new BehaviorSubject<any>("");
  getTask = this.task.asObservable();

  private unitTabs = new BehaviorSubject<any>("");
  getUnitTabs = this.unitTabs.asObservable();

  private planTabs = new BehaviorSubject<any>("");
  getPlanTabs = this.planTabs.asObservable();

  private createTask = new BehaviorSubject<any>("");
  getCreateTask = this.createTask.asObservable();

  constructor() {
  }

  passCreateTask(values, validFlag){
    this.createTask.next({'values' : values,'validFlag':validFlag})
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

  passUnit(d) {
    this.unit.next({ 'unit': d });
  }

  passEquipmentCategory(d) {
    this.equipmentCategory.next({ 'equipmentCategory': d });
  }

  passDepartment(d) {
    this.department.next({ 'department': d });
  }

  passEquipment(d) {
    this.equipment.next({ 'equipment': d });
  }

  passTaskId(d) {
    this.task.next({ 'task_id': d });
  }

  passUnitTabs(d) {
    this.unitTabs.next(d);
  }

  passPlanTabs(d) {
    this.planTabs.next(d);
  }
}
