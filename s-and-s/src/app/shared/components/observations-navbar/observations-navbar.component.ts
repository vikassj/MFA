import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgSelectComponent } from '@ng-select/ng-select';

import { PlantService } from '../../service/plant.service';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { DataService } from 'src/shared/services/data.service';
import { CommonService } from 'src/shared/services/common.service';
import * as moment from 'moment';

@Component({
  selector: 'app-observations-navbar',
  templateUrl: './observations-navbar.component.html',
  styleUrls: ['./observations-navbar.component.scss']
})
export class ObservationsNavbarComponent implements OnInit {
  @ViewChild('obsSearch', { static: true }) obsSearch: NgSelectComponent;
  @ViewChild(NgSelectComponent) dropdown!: NgSelectComponent;
  @Output() selectTab = new EventEmitter<string>();
  subscription: Subscription = new Subscription();
  currentTab: string = 'observations'

  units: any[];
  selectedSideBarItem: any;
  selectedUnit: string;
  userGroup: any;
  canDraw: boolean;
  disableBulkUpdate:boolean=false;
  bulk_update:boolean=true;
  msg: string;
  selectedObsStatus = 'openClose';
  obsData = [];
  obsFilters: any;
  searchText: string = '';
  searchParams: any[] = ['faultId', 'riskLevel', 'observation', 'recommendation', 'zone', 'isOpen', 'remarks'];
  openCloseCount = {
    open: 0,
    close: 0,
    snooze: 0,
    archive: 0
  };
  unitList: any;
  observationList: any[] = [];
  obsInterval: any;
  selectedObservation: any;
  isbeingSearched: boolean = false;
  dropdownList = [];
  selectedItems = [];
  allUnits: any;
  disableBEV: boolean = false;
  disableDropdown: boolean = false;
  isPermitEnabled:boolean = false;
  permitList:any[] = [];
  selectedPermitList:any[] = [];
  inProgressPermits:any[] = [];
  allInProgressPermits:any[] = [];
  dashboardNavigated: boolean = false;
  savedPermitSatus:any[] = []
  savedInProgress:any[] = []
  constructor(private plantService: PlantService, private snackbarService: SnackbarService,
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private dataService: DataService,
    public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService, private commonService: CommonService) {

      window.addEventListener("disable-bulk-update", (evt) => {
        this.disableBulkUpdate = true
      })

      window.addEventListener("enable-bulk-update", (evt) => {
      if(this.bulk_update){
        this.disableBulkUpdate = (this.userGroup.indexOf('close') > -1) ? false : true;
      }
      })

      this.commonService.readConfigurationsData().subscribe(data => {
        this.disableBEV = data['disableBEV']
      })

      window.addEventListener("addPermitData", (evt) => {
        let allPermitData = JSON.parse(sessionStorage.getItem('plantPermitData'));
        let newData = [];
        let seenPermitNumbers = new Set();
        
        for (let item of allPermitData) {
          // Check if the permit_number is not seen before
          if (!seenPermitNumbers.has(item.permit_number)) {
            // Add the permit_number to the set
            seenPermitNumbers.add(item.permit_number);
            // Create a new object with permit_number and is_ongoing_permit
            newData.push({
              id: item.permit_number,
              name:item.permit_number,
              is_ongoing_permit: item.is_ongoing_permit
            });
          }
        }
        this.permitList = []
        this.permitList = newData
        this.selectedPermitList = []
        let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        if(searchObservation){
          sessionStorage.setItem('obsNavDate',JSON.stringify(searchObservation?.date))
        }
        let dashboardNavigated = JSON.parse(sessionStorage.getItem('navigatedObservation'))
        if(!searchObservation && !manuallySelectedPermits){
        this.allInProgressPermits = []
        this.allInProgressPermits = this.permitList.filter(key=> key.is_ongoing_permit).map(key=> key.id);
        this.selectedPermitList = []
        this.selectedPermitList = this.allInProgressPermits
        if(this.allInProgressPermits?.length < 1){
          this.selectedPermitList = this.permitList.map(key=> key.id);
        }  
        sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(this.selectedPermitList))
        }
        if(dashboardNavigated && !manuallySelectedPermits){
          this.selectedPermitList = this.permitList.map(key=> key.id);
          sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(this.selectedPermitList))
        }
        else{
          this.allInProgressPermits = this.permitList.filter(key=> key.is_ongoing_permit).map(key=> key.id);
          let manuallySelectedUnits= sessionStorage.getItem('manually-selected-units')
          if(this.allInProgressPermits?.length < 1 || (manuallySelectedPermits && manuallySelectedUnits)){
            this.selectedPermitList = this.permitList.map(key=> key.id);
          }        
        }

        let selectAllPermits = JSON.parse(sessionStorage.getItem('selectAllPermits'))
        if(selectAllPermits){
          this.selectedPermitList = this.permitList.map(key=> key.id);
          sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(this.selectedPermitList))
        }

        let selectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(JSON.parse(sessionStorage.getItem('navigatedObservation'))){
          this.dashboardNavigated = true
        }
        let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
        if(searchObservation || obsNavDate && dashboardNavigated){
          this.selectedPermitList = []
          this.selectedPermitList = this.permitList.map(key=> key.id);
          sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(this.selectedPermitList))
        }
        else if(this.currentTab == 'observations' && selectedPermits?.length > 0){
          this.selectedPermitList = selectedPermits
        }else if(this.currentTab == 'sif' && selectedPermits?.length > 0){
          let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'))
          if(selectedUnits?.length < 1){
            this.selectedPermitList = []
            this.permitList = []
          }else{
          let selectedPermit:any[] = []
          this.selectedPermitList = []
          allPermitData.map((permit,index) => {
            if(manuallySelectedPermits?.includes(permit?.permit_number)){
              selectedPermit.push(permit?.permit_number)
            } 
          })
          this.selectedPermitList = selectedPermit
        }
        }
        // else {
        // if(!searchObservation){
        //   if(this.allInProgressPermits.length>0 && !this.dashboardNavigated){
        //     this.inProgressSelectAll();
        //   }
        // }else{
        //   this.permitSelectAll();
        // }
        // }
      })

      this.getAvailableUnits();
      this.subscription.add(this.safetyAndSurveillanceDataService.getObservationsFilters.subscribe(obsFilters => {
        this.obsFilters = obsFilters
      }))
      this.subscription.add(this.safetyAndSurveillanceDataService.getObservationsSearchText.subscribe(obj => {
        this.obsData = obj.obsData;
        this.searchText = obj.searchText;
      }))
      this.subscription.add(this.safetyAndSurveillanceDataService.getOpenCloseCount.subscribe(openCloseCount => {
        this.openCloseCount = openCloseCount;
      }))
      this.subscription.add(this.safetyAndSurveillanceDataService.getAllUnits.subscribe(allUnits => {
        this.allUnits = allUnits;
        if(this.allUnits.length > 0){
          this.selectedItems=this.allUnits.map(key=>{return key.id})
        }
      }))
      this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPage.subscribe(selectedPage => {
        if(selectedPage == 'unsif'){
          this.selectTab.emit('observations')
          this.currentTab = 'observations';
        }else{
          this.selectTab.emit('sif')
          this.currentTab = 'sif';
        }
    }))
      this.getObservations();
     }

  ngOnInit(): void {
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    // To add the isPermitEnabled Access from the permitPlantMap
    if(selectedPlantId){
      let plantPermit = JSON.parse(sessionStorage.getItem("permitPlantMap"));
      let selectedPlant = plantPermit.filter(key  => { return key.plant_id == selectedPlantId });
      this.isPermitEnabled = selectedPlant[0].isPermitEnabled;
     
    }
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.bulk_update=data['module_configurations']['application_features']['bulk_update'];
      if(!this.bulk_update){
        this.disableBulkUpdate = true
      }
    });
    
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPermits.subscribe(selectedPermits => {
      this.selectedPermitList = []
      for (let i = 0; i < selectedPermits.length; i++) {
        this.selectedPermitList.push(selectedPermits[i]);
      }
    }))
  }

  navigateToTab(tab) {
    let availableUnits = JSON.parse(sessionStorage.getItem('availableUnits'))
    sessionStorage.removeItem('global-search-notification')
    sessionStorage.removeItem('searchObservation');
    sessionStorage.setItem('actionsUnits',JSON.stringify(availableUnits))
    sessionStorage.removeItem('availableUnits')
    this.selectTab.emit(tab)
    this.currentTab = tab;

  }

  /**
   * get all units and populate in unit dropdown.
   */
  getAvailableUnits() {
    if(sessionStorage.getItem('availableUnits')) {
      var availableUnits: any = JSON.parse(sessionStorage.getItem('availableUnits'))
      this.setAvailableUnits(availableUnits)
    } else {
      this.plantService.getAvailableUnits().subscribe(
        availableUnits => {
          this.setAvailableUnits(availableUnits)

        },
        error => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }
  }


  /**
   * using this functionality diaplay the bulk update,  export file, birds eye vie and filter.
   */
  getSelectedFlag( bulk_update,  export_file, birds_eye_view, filter ){
    setTimeout(()=>{
      if(birds_eye_view){
        let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'))
        if(selectedUnits.length == 1){
          this.safetyAndSurveillanceDataService.passObservationPopupFlag(bulk_update,  export_file, birds_eye_view, filter);
        }else{
          this.msg = "Please select only one unit to see Bird's eye view";
          this.snackbarService.show(this.msg, false, false, false, true);
        }
      }else{
        this.safetyAndSurveillanceDataService.passObservationPopupFlag(bulk_update,  export_file, birds_eye_view, filter);
      }
    }, 500)
  }

   /**
   * get all observations id and populate in global select dropdown.
   */
  getObservations() {
    this.plantService.getObservations().subscribe(
      observations => {
        let data: any = observations;
        this.observationList = data;
        this.observationList.sort((v1, v2)=>{ return v1.id -v2.id});
        this.obsInterval = setInterval(() => {
          let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
          if (unitDetails) {
            let selectedObservation = JSON.parse(sessionStorage.getItem('selectedObservation'));
            if (selectedObservation) {
              window.dispatchEvent(new CustomEvent('hide-banner'))
              this.selectedObservation = this.observationList.find(obs => obs.id === Number(selectedObservation.id));
              this.navigateFromSearch();
              sessionStorage.removeItem('selectedObservation');
              clearInterval(this.obsInterval);
            }
            else {
              clearInterval(this.obsInterval);
            }
          }
        }, 1300);
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
  navigateFromSearch() {
    let unit = this.unitList.filter(ele =>{return ele.unitName == this.selectedObservation.unit});
    let obj = {...this.selectedObservation, unit_id: unit[0].id, start_date: unit[0].startDate, end_date: new Date()}
    this.currentTab = 'observations';
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnit', this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    sessionStorage.setItem('searchObservation', JSON.stringify(this.selectedObservation));
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    this.safetyAndSurveillanceDataService.passGlobalSearch(obj);
    this.selectedObservation = [];
    let today = new Date();
    let dd:any = today.getDate();
    let mm:any = today.getMonth()+1;//January is 0!`

    let yyyy = today.getFullYear();
    if(dd<10){dd='0'+dd}
    if(mm<10){mm='0'+mm}
    let timeZone =  JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let toDay = moment()?.tz(timeZone)?.format("YYYY-MM-DD")
    // let toDay = yyyy+'-'+mm+'-'+dd;
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
    let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
    if(searchObservation || obsNavDate){
      if(searchObservation){
        sessionStorage.setItem('startAndEndDate', JSON.stringify([searchObservation['date'], toDay]))
        this.safetyAndSurveillanceDataService.passSelectedDates(searchObservation['date'], toDay)
        this.safetyAndSurveillanceDataService.passSelectedUnits([unit[0].id]);
        this.safetyAndSurveillanceDataService.passDatesAndUnits([unit[0].id], searchObservation['date'], toDay)
      }else{
        sessionStorage.setItem('startAndEndDate', JSON.stringify([obsNavDate, toDay]))
        this.safetyAndSurveillanceDataService.passSelectedDates(obsNavDate, toDay)
        this.safetyAndSurveillanceDataService.passSelectedUnits([unit[0].id]);
        this.safetyAndSurveillanceDataService.passDatesAndUnits([unit[0].id],obsNavDate, toDay)
      }
    }
    else{
    sessionStorage.setItem('startAndEndDate', JSON.stringify([unit[0].startDate, toDay]))
    this.safetyAndSurveillanceDataService.passSelectedDates(unit[0].startDate, toDay)
    this.safetyAndSurveillanceDataService.passSelectedUnits([unit[0].id]);
    this.safetyAndSurveillanceDataService.passDatesAndUnits([unit[0].id], unit[0].startDate, toDay)
    }
    
    // sessionStorage.setItem('selectedUnits', JSON.stringify([unit[0].id]));
    sessionStorage.setItem('manually-selected-units',JSON.stringify([unit[0].id]))
    window.dispatchEvent(new CustomEvent('global-search-used'))
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

  selectList($event){
  }
  toggleCheckAll(values: any) {
    if(values.currentTarget.checked){
      this.selectAll();
    } else {
      this.unselectAll();
    }
  }
  selectAll() {
    this.selectedItems = this.allUnits.map(key=>{return key.id})
  }

  unselectAll() {
    this.selectedItems = [];
  }

  applyBtn(select: NgSelectComponent){
    select.close();
    this.getObservations();
  }

  selectPermit($event){
    let selectedPermits = [];
    for (let id of this.selectedPermitList) {
      let matchedObject = this.permitList.find(obj => obj.id === id);
      if (matchedObject) {
        selectedPermits.push(matchedObject);
      }
    }
    
    this.inProgressPermits = selectedPermits.filter(key=> key.is_ongoing_permit).map(key=> key.id);
  }
  
  permitToggleCheckAll(values: any) {
    if(values.currentTarget.checked){
      this.permitSelectAll();
    } else {
      this.permmitUnselectAll();
    }
  }

  permitSelectAll() {
    this.selectedPermitList = this.permitList.map(key=>{return key.id})
    this.inProgressPermits = this.allInProgressPermits
  }

  permmitUnselectAll() {
    this.selectedPermitList = [];
    this.inProgressPermits = [];
  }

  permitApplyBtn(select: NgSelectComponent){
    this.savedPermitSatus = this.selectedPermitList
    this.savedInProgress = this.inProgressPermits
    sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(this.selectedPermitList))
    select.close();
    this.applyPermit();    
  }

  toggleInProgress(values: any) {
    if(values.currentTarget.checked){
      this.inProgressSelectAll();
    } else {
      this.inProgressUnselectAll();
    }
  }

  inProgressSelectAll() {
    this.inProgressPermits = this.allInProgressPermits;
    let newValues = new Set(this.selectedPermitList);
    // Iterate over array b and add its elements to the Set
    for (let value of this.allInProgressPermits) {
        newValues.add(value);
    }
    // Convert the Set back to an array
    let result = Array.from(newValues);
    
    if(result){
      this.selectedPermitList = result;
    }
  }

  inProgressUnselectAll() {
    this.selectedPermitList = this.selectedPermitList.filter(element => !this.allInProgressPermits.includes(element));
    this.inProgressPermits = [];
  }

  onSearch(item) {
  }

  testSearch(term: string, item) {
    let a = item.name
    term = term.toLocaleLowerCase();
    a = a.toLowerCase();

    return a.includes(term);
  }

  applyPermit(){
    this.safetyAndSurveillanceDataService.passSelectedPermits(this.selectedPermitList);
  }

  onOpenStatus(dropdownName){
    setTimeout(() => {
      if (this.dropdown?.dropdownPanel)
        this.dropdown.dropdownPanel.scrollElementRef.nativeElement.scrollTop = 0;
    }, 0);
    if(dropdownName == 'permit'){
     this.savedPermitSatus = this.selectedPermitList
     this.savedInProgress = this.inProgressPermits
    }
  }

  onCloseStatus(dropdownName){
    if(dropdownName == 'permit'){
      this.selectedPermitList = this.savedPermitSatus
      this.inProgressPermits = this.savedInProgress
     }
  }

  closeUnitFilter(){
    window.dispatchEvent(new CustomEvent('unitFilter'))
  }
  closeFilterSection(){
    this.safetyAndSurveillanceDataService.passToggleSidebar(true)
  }

  checkProgress(){
    this.inProgressPermits = this.permitList.filter(key=> key.is_ongoing_permit && this.selectedPermitList.includes(key.id)).map(key=> key.id);
    return this.inProgressPermits?.length == this.allInProgressPermits?.length && this.allInProgressPermits?.length > 0
  }
  
  setAvailableUnits(availableUnits) {
    if (availableUnits['IOGP_Category']) {
      let units: any = availableUnits;
      let unitList: any = [];
      this.units = [];
      Object.keys(units.IOGP_Category).forEach((unit) => {
        if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
          let unitDetails = {};
          unitDetails['obsData'] = {};
          unitDetails['unitName'] = unit;
          unitDetails['id'] = units.IOGP_Category[unit].id;
          unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
          unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
          unitDetails['totalObsFlights'] = units.IOGP_Category[unit].flights_count;
          unitDetails['userGroup'] = units.IOGP_Category[unit].access_permissions[0];
          unitDetails['obsData']['openCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].open }).reduce((a, b) => a + b, 0);
          unitDetails['obsData']['closeCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].close }).reduce((a, b) => a + b, 0);
          unitDetails['order'] = units.IOGP_Category[unit].order;
          unitList.push(unitDetails);
        }
      });
      unitList.sort((a, b) => (a.order < b.order) ? -1 : 1);
      this.unitList = unitList
      this.units = unitList.map(unit => unit.unitName);
      sessionStorage.setItem('unitDetails', JSON.stringify(unitList));
      sessionStorage.setItem('unitCount', unitList.length.toString());
      if (!this.selectedSideBarItem || this.selectedSideBarItem == 'null') {
        let selectedUnitDetails: any = unitList[0];
        sessionStorage.setItem('selectedUnit', selectedUnitDetails.unitName);
        sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
      }
      if (sessionStorage.getItem('selectedUnitDetails') != null) {
        this.selectedUnit = sessionStorage.getItem('selectedUnit');
        this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
          if(data['value'] == 'units' && data['data'] != "") {
            this.selectedItems=data['data'] ? data['data'] : [];
          }
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))
          this.userGroup = [];
          let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'))
          selectedUnits.forEach(ele =>{
            let index = this.unitList.findIndex(data =>{return data.id == ele});
            if(index >= 0){
              this.userGroup = [...this.userGroup, ...this.unitList[index].userGroup]
            }
          })
        if(this.bulk_update){
          this.disableBulkUpdate = (this.userGroup.indexOf('close') > -1) ? false : true;
        }
        this.canDraw = (this.userGroup.indexOf('draw') > -1) ? true : false;
      }))
      }
    }

  }
}
