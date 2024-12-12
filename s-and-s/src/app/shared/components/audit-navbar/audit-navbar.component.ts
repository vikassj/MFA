import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import * as moment from 'moment';
import { NgSelectComponent } from '@ng-select/ng-select';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-audit-navbar',
  templateUrl: './audit-navbar.component.html',
  styleUrls: ['./audit-navbar.component.css']
})
export class AuditNavbarComponent implements OnInit {
  @ViewChild('obsSearch') obsSearch: NgSelectComponent;
  @Output() selectedFilters = new EventEmitter<{ units: any[], vendors: any[], activities: any[],range?: string }>();
  currentTab: string;
  observationList:any=[];
  selectedObservation:any;
  isbeingSearched: boolean = false;
  unitList: any[] = [];
  vendorList: any[] = [];
  activityList: any[] = [];
  msg: string;
  units: any;
  vendors: any;
  activities: any[];
  @Input() selectedKey: string;
  intervalDropdownList: any = [
    '1 Week', '2 Weeks', '1 Month'
  ]
  selectedInterval = this.intervalDropdownList[0];
  userGroup: any = [];
  configureAccess: boolean = false;
  surpriseAccess: boolean = false;
  constructor( private router: Router,  private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private snackbarService: SnackbarService, private dataService: DataService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) { }

  ngOnInit(): void {
    this.userGroup = JSON.parse(sessionStorage.getItem('userGroup'));
    this.configureAccess = this.userGroup.some(str =>str.toLowerCase() === 'planner'.toLowerCase())
    this.surpriseAccess = this.userGroup.some(
      (str) => str.toLowerCase() === 'planner'.toLowerCase() || str.toLowerCase() === 'safety_officer'.toLowerCase()
    );
    this.fetchAllDropDownData();
    this.getAllActivities();
  }
  routeAudit(route){
    this.router.navigateByUrl(route)
    sessionStorage.removeItem('activityId')
  }
  OnOpen() {
    if (!this.isbeingSearched) {
      this.obsSearch.close()
    }
  }


  OnSearch(event: any) {
    if(event.term.length > 0) {
      this.isbeingSearched = true;
      this.obsSearch.open()
    } else {
      this.isbeingSearched = false;
      this.obsSearch.close();
    }
  }

  OnBlue() {
    this.isbeingSearched = false;
    this.obsSearch.close()
  }
  navigateFromSearch() {
    sessionStorage.setItem('activityId',this.selectedObservation.id)
    this.router.navigateByUrl('/safety-and-surveillance/start-audit')
  }

  unitSelected(data: any) {
    this.units = data;
    this.emitAllData();
  }

  vendorSelected(data: any) {
    this.vendors = data;
    this.emitAllData();
  }

  activitySelected(data: any) {
    this.activities = data;
    this.emitAllData();
  }

  emitAllData() {
    this.selectedFilters.emit({
      units: this.units,
      vendors: this.vendors,
      activities: this.activities
    });
  }

  intervalSelected(event: any) {
    this.selectedInterval = event;
    let range = this.selectedInterval.toLowerCase().replace(/\s+/g, "_");
    this.selectedFilters.emit({
      units: this.units,
      vendors: this.vendors,
      activities: this.activities,
      range: range
    });
    
  }

  fetchAllDropDownData(){
      this.dataService.passSpinnerFlag(true, true);
      this.safetyAndSurveillanceCommonService.activityFilters().subscribe(
        data => {
          const units = data['units'].map(unit => ({
            id: unit.unit_id,
            name: unit.unit_name
        }));
        
        const vendors = data['vendors'].map(vendor => ({
            id: vendor.vendor_id,
            name: vendor.vendor_name
        }));
        
        const activities = data['activities'].map(activity => ({
            id: activity.id,
            name: activity.name
        }));

          this.unitList = units;
          this.vendorList = vendors;
          this.activityList = activities;
          this.dataService.passSpinnerFlag(false, true)
        },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.units = this.unitList.map(unit => unit.id);
          this.vendors = this.vendorList.map(unit => unit.id);
          this.activities = this.activityList.map(unit => unit.id);
          this.emitAllData();
        }
      )
    }

    getAllActivities(){
      this.dataService.passSpinnerFlag(true, true);
      this.safetyAndSurveillanceCommonService.activitiessubactivities().subscribe(
        data => {
          this.observationList = data['activities']
          this.dataService.passSpinnerFlag(false, true)
        },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    } 
   
}
