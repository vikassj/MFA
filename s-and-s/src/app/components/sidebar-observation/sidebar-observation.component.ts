import { Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as $ from 'jquery';
import { IMyOptions, IMyDateModel } from 'mydatepicker';

import { CommonService } from 'src/shared/services/common.service';
import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../shared/service/data.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';

@Component({
  selector: 'app-sidebar-observation',
  templateUrl: './sidebar-observation.component.html',
  styleUrls: ['./sidebar-observation.component.scss']
})
export class SidebarObservationComponent implements OnInit {

  @Input() selectedSideBarItem: any
  @Input() riskRatingLevels: any
  @Output() listOfZones = new EventEmitter();
  currentUnitPage: string = 'Observations';
  isRouteClicked: boolean = false;
  msg: string = '';
  selectedUnit: string = '';
  menuItems: any[] = [];
  displayTypes: any[] = ['Images', 'Videos'];
  selectedDisplayType: string = 'Images';
  unitStartDate: any;
  unitEndDate: any;
  subscription: Subscription = new Subscription();
  audit_based_observation:boolean= true;
  obsData: any;
  obsZones: any[] = [];
  selectedObsZone: any[] = [];
  obsCategories: any[] = [];
  selectedObsCategory: any[] = [];
  obsDates: any[] = [];
  selectedObsDate: any[] = [];
  obsTimes: any[] = [];
  selectedObsTime: any[] = [];
  obsModes: any[] = [
    // { value: 'all', label: 'All' },
    { value: 'drone', label: 'Drone' },
    { value: 'camera', label: 'Camera' },
  ];
  selectedObsMode: any[] = this.obsModes;
  riskRatings: any[] = [];
  selectedRiskRating: any[] = [];
  faultsChoice: any[] = [];
  selectedStatus: any[] = [];
  selectedSortBy: string = 'dateDesc';

  reportsStartDatePickerOptions: IMyOptions = {
    dateFormat: 'yyyy-mm-dd',
    height: '28px',
    showClearDateBtn: false,
    showSelectorArrow: false,
    editableDateField: false,
  };
  reportsEndDatePickerOptions: IMyOptions = {
    dateFormat: 'yyyy-mm-dd',
    height: '28px',
    showClearDateBtn: false,
    showSelectorArrow: false,
    editableDateField: false,
  };
  reportStartDate: any;
  reportEndDate: any;

  helpItems: any[] = [];
  helpModule: string = '';

  obsSidebarConf: any;
  reportsSidebarConf: any;
  isPermitEnabled:boolean = false;

  availableDates: any;
  initialFilter: boolean = true;
  resetFilter: boolean = false;
  unitChange: boolean = false;
  applyBtnDisabled: boolean = false;
  iogpCategories: any;
  selectedTimeRange: any =[];
  iogpDashboardDetails: any = {
    "sidebar": [],
    "showRiskRatingDetails": true,
    "showDetailedLegend": true,
    "showSessionFlights": true,
    "chartRefreshInterval": 30000
  };
  obsDetails: any = {
    "sidebar": {
      "zoneName": true,
      "category": true,
      "date": true,
      "time": true,
      "mode": true,
      "riskRating": true,
      "status": true,
      "sortBy": true,
      "displayType": true
    },
  };
  reportsDetails: any = {
    "sidebar": {
      "startDate": true,
      "endDate": true
    }
  };
  sortByList: any[] = [
    {
      "key": "dateDesc",
      "value": "Date (Newest to Oldest)"
    },
    {
      "key": "dateAsc",
      "value": "Date (Oldest to Newest)"
    },
    {
      "key": "ratingDesc",
      "value": "Rating (Highest to Lowest)"
    },
    {
      "key": "ratingAsc",
      "value": "Rating (Lowest to Highest)"
    }
  ];

  permitList:any[] = [];
  selectedPermit:any[] = [];
  permitTypeList:any[] = [];
  selectedPermitType:any[] = [];
  natureWorkList:any[] = [];
  selectedNature:any[] = [];
  vendorList:any[] = [];
  selectedVendors:any[] = [];
  issuerList:any[] = [];
  selectedIssuers:any[] = [];
  filterPermitData:any[] = [];
  riskRatingValues: any = JSON.parse(sessionStorage.getItem('safety-and-surveillance-configurations'))['module_configurations']['risk_rating_levels']
  selectedPlantDetails:any;
  dashboardNavigated: boolean = false;
  custom_start_date: any;
  custom_end_date: any;
  constructor(private unitService: UnitService, private snackbarService: SnackbarService, private dataService: DataService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private commonService: CommonService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.iogpCategories = data['module_configurations']['iogp_categories'].filter(cat => cat.show_hide);
    })


    window.addEventListener('global-search-used', (evt) => {
      this.selectedObsZone = [];
      this.selectedObsCategory = [];
      this.selectedObsDate = [];
      this.selectedObsTime = [];
      this.selectedObsMode = [];
      this.selectedDisplayType = "Images"
    })

    window.addEventListener('units-changed', (evt) => {
      this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe((units) => {
        sessionStorage.setItem('selectedUnits', JSON.stringify(units))
      })
      this.fetchSidebarData();
    })
  }

  /**
   * get the risk rating name based on rating number.
   */
  getRiskRatingName(item: number): string {
    switch (item) {
      case 1:
        return this.riskRatingValues.filter(rating => rating.rating == 1)[0].ratingName;
      case 2:
        return this.riskRatingValues.filter(rating => rating.rating == 2)[0].ratingName;
      case 3:
        return this.riskRatingValues.filter(rating => rating.rating == 3)[0].ratingName;
      case 4:
        return this.riskRatingValues.filter(rating => rating.rating == 4)[0].ratingName;
      case 5:
        return this.riskRatingValues.filter(rating => rating.rating == 5)[0].ratingName;
      default:
        return '';
    }

  }

  ngOnInit() {
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    // To add the isPermitEnabled Access from the permitPlantMap
    if(selectedPlantId){
      let plantPermit = JSON.parse(sessionStorage.getItem("permitPlantMap"));
      let selectedPlant = plantPermit.filter(key  => { return key.plant_id == selectedPlantId });
      this.isPermitEnabled = selectedPlant[0].isPermitEnabled;
     
    }
     // changing the modes value based on isPermitEnabled
    if(this.isPermitEnabled){
       this.obsModes= [
        { value: 'is_mobile', label: 'IS Mobile' },
        { value: 'ptz', label: 'PTZ' },
        { value: 'cctv', label: 'CCTV' }
        ];
        this.selectedObsMode = this.obsModes;
    }else{
      this.obsModes= [
        { value: 'drone', label: 'Drone' },
        { value: 'camera', label: 'Camera' },
        ];
        this.selectedObsMode = this.obsModes;
    }
    this.selectedObsMode = []
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.menuItems = this.iogpDashboardDetails.sidebar;
      this.obsSidebarConf = this.obsDetails.sidebar;
      this.reportsSidebarConf = this.reportsDetails.sidebar;
      this.helpItems = data['page_configurations']['help_page']['page_sidebar'].filter(item => item.show_hide);
      this.riskRatings = data['module_configurations']['risk_rating_levels'].map(item => item.rating);
      let selectedUnitDetails: any = JSON.parse(sessionStorage.getItem('selectedUnitDetails'));
      this.unitStartDate = new Date(selectedUnitDetails?.startDate + 'T00:00:00');
      this.unitStartDate.setDate(this.unitStartDate.getDate() - 1);
      this.unitStartDate = this.commonService.formatDate(this.unitStartDate).split('-');
      this.unitEndDate = new Date(selectedUnitDetails?.endDate + 'T00:00:00');
      this.unitEndDate.setDate(this.unitEndDate.getDate() + 1);
      this.unitEndDate = this.commonService.formatDate(this.unitEndDate).split('-');
      this.subscription.add(this.safetyAndSurveillanceDataService.getObsData.subscribe(obsData => {
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        if(searchObservation){
          this.selectedObsZone = [searchObservation?.zone];
          this.selectedObsDate = searchObservation.date
        }else{
          if (obsData.validFlag) {
            this.selectedObsZone = obsData.zone;
            this.selectedObsCategory = this.obsCategories //['All Categories'];
            this.availableDates = obsData.date; // 'All Dates',
            this.selectedObsDate = obsData.date;
            this.selectedObsTime = this.obsTimes //['All Timestamps'];
            this.selectedRiskRating = obsData.riskRating;
            this.applyFilters(false);
          }
        }
      }));

      this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnit.subscribe(selectedUnit => {
        if (selectedUnit.validFlag) {
          this.unitChange = true;
          this.loadModuleData(true);
        }
      }));
      this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(selectedUnits => {
        this.unitChange = true;
        sessionStorage.setItem('selectedUnits', JSON.stringify(selectedUnits))
        this.loadModuleData(true);
    }))
      this.subscription.add(this.safetyAndSurveillanceDataService.getCurrentUnitPage.subscribe(currentUnitPage => {
        if (currentUnitPage.validFlag) {
          this.currentUnitPage = currentUnitPage.currentUnitPage;
        }
      }));

      // this.subscription.add(this.safetyAndSurveillanceDataService.getObservationsFilters.subscribe(obsFilters => {
      //   if (obsFilters.unit && obsFilters.zone && obsFilters.category && obsFilters.date && obsFilters.time && obsFilters.displayType && !obsFilters.validFlag) {
      //     this.selectedObsZone = obsFilters.zone;
      //     this.obsCategories = [];
      //     this.obsDates = [];
      //     this.obsTimes = [];
      //     this.selectedObsCategory = [];
      //     this.selectedObsDate = [];
      //     this.selectedObsTime = [];
      //     this.selectedSortBy = 'dateDesc';
      //     this.onObsFilterChange(1, true);
      //   }
      // }));
    });

    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
          let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
          let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
          if(searchObservation){
            this.custom_start_date=searchObservation['date'];
            this.custom_end_date=data['data']['endDate'];
            this.applyFilters(false)
          }
          else if(obsNavDate){
            this.custom_start_date=obsNavDate;
            this.custom_end_date=data['data']['endDate'];
            this.applyFilters(false)
          }
          else{
          let selectedDateRange = JSON.parse(sessionStorage.getItem('selectedDateRange'))
          if(selectedDateRange){
            this.custom_start_date=selectedDateRange['startDate'];
            this.custom_end_date=selectedDateRange['endDate'];
            this.applyFilters(false)
          }else{
            this.custom_start_date=data['data']['startDate'];
            this.custom_end_date=data['data']['endDate'];
          }
        }
    }))

    this.subscription.add(this.safetyAndSurveillanceDataService.getToggleSidebar.subscribe((res: boolean) => {
      this.isRouteClicked = res;
    }));
    // this.loadModuleData(true);
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPermits.subscribe(selectedPermits =>{
      this.selectedPermit = selectedPermits;
      let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(manuallySelectedPermits?.length > 0){
          this.selectedPermit = manuallySelectedPermits
         }
        if(this.selectedPermit){
          this.addPermitData(this.selectedPermit, false, true)
          let selectedObsMode = this.selectedObsMode.map(mode => { return mode.value })
          this.safetyAndSurveillanceDataService.passObservationsFilters(this.selectedUnit, this.selectedObsZone, this.selectedObsCategory, this.selectedObsDate, this.availableDates, this.selectedObsTime, selectedObsMode, this.selectedRiskRating, this.selectedStatus, this.selectedSortBy, this.selectedDisplayType, this.selectedPermit, this.selectedPermitType, this.selectedNature, this.selectedVendors, this.selectedIssuers, this.audit_based_observation, true);
          this.safetyAndSurveillanceDataService.passToggleSidebar(true)
        }
    }))
  }

  // ngOnChanges(changes: SimpleChanges): void {
  //   let isUnitChanged = changes['selectedSideBarItem'] &&
  //     changes['selectedSideBarItem'].currentValue != changes['selectedSideBarItem'].previousValue;
  //   if (isUnitChanged) {
  //     this.resetAllFilter();
  //   }
  // }

  getPermitFilters(zones, boolean){
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
    if(searchObservation){
     zones = [searchObservation?.zone]
    }
    this.safetyAndSurveillanceCommonService.fetchAllPermitDetails(this.custom_start_date,this.custom_end_date,zones,false).subscribe(
      (filters:any) => {  
        // storing the permit numbers 
        let permit_list =[]
        for (const key in filters) {
          let permit_number = filters[key].permit_number
          if(!permit_list.includes(permit_number)){
            permit_list.push(filters[key].permit_number) 
          }     
        }
        this.filterPermitData = filters;
        this.permitList = permit_list;
        sessionStorage.setItem('plantPermitData', JSON.stringify(filters))
        window.dispatchEvent(new CustomEvent('addPermitData'))
        if(!boolean){
          let newData = [];
          let seenPermitNumbers = new Set();
          
          for (let item of this.filterPermitData) {
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
          let allInProgressPermits = []
          let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
          if(!searchObservation){
            allInProgressPermits = newData.filter(key=> key.is_ongoing_permit).map(key=> key.id);
          }
          
          if(JSON.parse(sessionStorage.getItem('navigatedObservation'))){
            this.dashboardNavigated = true
          }
          if(!searchObservation){
            if(allInProgressPermits.length>0 && !this.dashboardNavigated){
              this.selectedPermit = allInProgressPermits
            }
          }
          else{
            this.selectedPermit = newData.map(key=>{return key.id})
          }
          permit_list = this.selectedPermit
        }
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        if(!searchObservation){
        let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(manuallySelectedPermits?.length > 0){
          this.selectedPermit = manuallySelectedPermits
         }
        }
        this.addPermitData(this.selectedPermit,false, false);
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        let selectedObsMode = this.selectedObsMode.map(mode => { return mode.value })
        this.safetyAndSurveillanceDataService.passObservationsFilters(this.selectedUnit, this.selectedObsZone, this.selectedObsCategory, this.selectedObsDate, this.availableDates, this.selectedObsTime, selectedObsMode, this.selectedRiskRating, this.selectedStatus, this.selectedSortBy, this.selectedDisplayType, this.selectedPermit, this.selectedPermitType, this.selectedNature, this.selectedVendors, this.selectedIssuers,this.audit_based_observation, true);
        if (boolean) {
          this.safetyAndSurveillanceDataService.passToggleSidebar(this.isRouteClicked);
          this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
        } else {
          // this.resetAllFilter();
          this.safetyAndSurveillanceDataService.passToggleSidebar(true)
        }
       }
    );
  }

  addPermitData(permit_list, is_critical , reset){
    // function to add the remaining permit filters based on the permit_id selected
    if(permit_list.length == 0){
      permit_list = this.permitList
    }
    this.permitTypeList=[];
    this.natureWorkList=[];
    this.vendorList=[];
    this.issuerList=[]; 
    if(reset){
      this.selectedPermitType = [];
      this.selectedNature = [];
      this.selectedVendors = [];
      this.selectedIssuers = [];
    }
    permit_list.forEach(value=>{
      for (const key in this.filterPermitData) {
        // to check if the permit_id is selected 
        if(value==this.filterPermitData[key].permit_number){
          // to check if element has already the value present and also null check for all the filters
          let strTypeOfPermit = this.filterPermitData[key].type_of_permit
          if(!this.permitTypeList.includes(strTypeOfPermit) && strTypeOfPermit != 'NA' && strTypeOfPermit != null){
            this.permitTypeList.push(this.filterPermitData[key].type_of_permit);
          }
          let strNatureOfWork = this.filterPermitData[key].nature_of_work
          if(!this.natureWorkList.includes(strNatureOfWork) && strNatureOfWork != 'NA' && strNatureOfWork != null){
            this.natureWorkList.push(this.filterPermitData[key].nature_of_work);
          }
          let strVendorName = this.filterPermitData[key].vendor_name
          if(!this.vendorList.includes(strVendorName) && strVendorName != 'NA' && strVendorName != null){
            this.vendorList.push(this.filterPermitData[key].vendor_name);
          }
          let strIssuerName = this.filterPermitData[key].issuer_name
          if(!this.issuerList.includes(strIssuerName) && strIssuerName != 'NA' && strIssuerName != null){
            this.issuerList.push(this.filterPermitData[key].issuer_name);
          }
          
        }
      }
    })
    if(is_critical) {
      this.selectedPermit = this.permitList
      this.selectedPermitType = this.permitTypeList
      this.selectedNature = this.natureWorkList
      this.selectedVendors = this.vendorList
      this.selectedIssuers = this.issuerList
    }
  }

  applyCriticalFilters(zones, boolean){
    // function to get on going critical permit filters and apply them 
    let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
    if(searchObservation){
     zones = [searchObservation?.zone]
    }
    this.safetyAndSurveillanceCommonService.fetchAllPermitDetails(this.custom_start_date,this.custom_end_date,zones,true).subscribe(
      (filters:any) => {  
        // storing the permit numbers 
        let permit_list =[]
        for (const key in filters) {
          let permit_number = filters[key].permit_number
          if(!permit_list.includes(permit_number)){
            permit_list.push(filters[key].permit_number) 
          }     
        }
        this.filterPermitData = filters;
        this.permitList = permit_list;

        // adding functioanlity to select all the filters   
        this.addPermitData(permit_list, true, false);
        
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        let selectedObsMode = this.selectedObsMode.map(mode => { return mode.value })
        this.safetyAndSurveillanceDataService.passObservationsFilters(this.selectedUnit, this.selectedObsZone, this.selectedObsCategory, this.selectedObsDate, this.availableDates, this.selectedObsTime, selectedObsMode, this.selectedRiskRating, this.selectedStatus, this.selectedSortBy, this.selectedDisplayType, this.selectedPermit, this.selectedPermitType, this.selectedNature, this.selectedVendors, this.selectedIssuers,this.audit_based_observation, true);
        if (boolean) {
          this.safetyAndSurveillanceDataService.passToggleSidebar(this.isRouteClicked);
          this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
        } else {
          // this.resetAllFilter();
          this.safetyAndSurveillanceDataService.passToggleSidebar(true)
        }

        sessionStorage.removeItem('permit_number')
        sessionStorage.removeItem('type_of_permit')
        sessionStorage.removeItem('nature_of_work')
        sessionStorage.removeItem('vendor_name')
        sessionStorage.removeItem('issuer_name')
       }
    );
  }

  resetAllFilter() {
    window.dispatchEvent(new CustomEvent('exit-global-search'))
    this.safetyAndSurveillanceDataService.passToggleSidebar(true)
    setTimeout(() => {
      this.selectedObsZone = [];
      this.selectedObsCategory = [];
      this.selectedObsDate = [];
      this.selectedObsTime = [];
      this.selectedObsMode = [];
      this.selectedRiskRating = [];
      this.selectedDisplayType = "Images"
    }, 1000)
  }

  /**
   * get the filter options.
   */
  loadModuleData(reloadDatesFlag) {
    if (reloadDatesFlag) {
      this.selectedUnit = sessionStorage.getItem('selectedUnit');
      let selectedUnitDetails: any = JSON.parse(sessionStorage.getItem('selectedUnitDetails'));
      this.unitStartDate = new Date(selectedUnitDetails?.startDate + 'T00:00:00');
      this.unitStartDate.setDate(this.unitStartDate.getDate() - 1);
      this.unitStartDate = this.commonService.formatDate(this.unitStartDate).split('-');
      this.unitEndDate = new Date(selectedUnitDetails?.endDate + 'T00:00:00');
      this.unitEndDate.setDate(this.unitEndDate.getDate() + 1);
      this.unitEndDate = this.commonService.formatDate(this.unitEndDate).split('-');
    }
    this.selectedDisplayType = 'Images';
    this.fetchSidebarData();
  }

  /**
   * show and hide the sidebar.
   */
  toggleSidebar(mode: any) {
    if (mode === 'minimize') {
      $('.expand-submenu').fadeOut('slide', function () {
        $('.mini-submenu').fadeIn();
      });
    } else {
      $('.expand-submenu').css('display', 'flow-root');
      $('.mini-submenu').hide();
    }
  }

  /**
   * get the status list and display on status dropdown
   */
  fetchFaultsChoice(availableDates) {
    this.safetyAndSurveillanceCommonService.fetchFaultsChoice().subscribe(
      (faultsChoice) => {
        let faults: any = faultsChoice;
        this.faultsChoice = faults
        .map((fault) => fault.choice_name)
        this.availableDates = availableDates;
        if (this.initialFilter || this.resetFilter || this.unitChange) {
          this.applyFilters(false);
          this.initialFilter = false;
          this.resetFilter = false;
          this.unitChange = false;
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => { }
    );
  }

  onMenuClick(menu) {
    this.currentUnitPage = menu;
  }

  onRouteClicked() {
    this.safetyAndSurveillanceDataService.passToggleSidebar(this.isRouteClicked);
    this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
    this.subscription.add(this.safetyAndSurveillanceDataService.getToggleSidebar.subscribe(res => {
      this.isRouteClicked = res;
    }));
    this.selectedObsZone = [];
    this.selectedObsCategory = [];
    this.selectedObsDate = [];
    this.selectedObsTime = [];
    this.selectedObsMode = [];
  }

  /**
   * apply button functionality for all selected filter data.
   */
  applyFilters(boolean) {
    if(boolean){
      // sessionStorage.removeItem('selectedActivePage')
      sessionStorage.setItem('manuallyApplyFilters',JSON.stringify(true))
    }
    window.dispatchEvent(new CustomEvent('exit-global-search'))

    this.dataService.passSpinnerFlag(true, true);
   
    this.applyBtnDisabled = false;
    if (this.selectedObsDate?.length > 0) {
      this.selectedObsDate?.sort((a, b) => {
        return new Date(b).getTime() - new Date(a).getTime();
      });
    }
    let selectedObsMode = this.selectedObsMode.map(mode => { return mode.value })
    this.selectedObsDate = sessionStorage.getItem('selectedRiskRatingDate') ? [sessionStorage.getItem('selectedRiskRatingDate')] : this.selectedObsDate;
    if (this.selectedObsDate.length > 0) {
      this.availableDates = this.selectedObsDate
    } else {
      this.availableDates = this.obsDates
    }
    let date = sessionStorage.getItem('searchObservation') ? JSON.parse(sessionStorage.getItem('searchObservation')) : {};
    if (date['date']) {
      this.selectedObsDate = [date['date']]
      this.availableDates = this.selectedObsDate
    }

    this.availableDates.sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime();
    });
    let selectedObsCategory = JSON.parse(sessionStorage.getItem('selectedCategory'))
    if (selectedObsCategory?.length > 0) {
      this.selectedObsCategory = selectedObsCategory
    }
    sessionStorage.setItem('filterData', JSON.stringify({
      'units': this.selectedUnit,
      'zones': this.selectedObsZone,
      'category': this.selectedObsCategory,
      'dates': this.selectedObsDate,
      'availableDates': this.availableDates,
      'time': this.selectedObsTime,
      'mode': this.selectedObsMode,
      'rating': this.selectedRiskRating,
      'status': this.selectedStatus,
      'sort': this.selectedSortBy,
      'type': this.selectedDisplayType,
      'audit_based_observation': this.audit_based_observation,
      'boolean': true,
      
    }))

    // if permit is enabled ,we call getPermitFilters with zone ID's
    if(this.isPermitEnabled){
      let zoneId = [];
      let data = JSON.parse(sessionStorage.getItem('obsData'))
      for (const [key, value] of Object.entries(data)) {
          let index = this.selectedObsZone?.find(data => data == key);
          if (index) {
            if (key != 'All Zones' && value['id']) {
              zoneId.push(value['id'])
            }
          }
       }
      let selectedPermitNew = JSON.parse(sessionStorage.getItem('permit_number'));
      if (selectedPermitNew?.length > 0) {
        this.applyCriticalFilters(zoneId, boolean);
      }else{
        this.getPermitFilters(zoneId, boolean)
      } 
    }else{
      let selectedObsMode = this.selectedObsMode.map(mode => { return mode.value })
      this.safetyAndSurveillanceDataService.passObservationsFilters(this.selectedUnit, this.selectedObsZone, this.selectedObsCategory, this.selectedObsDate, this.availableDates, this.selectedObsTime, selectedObsMode, this.selectedRiskRating, this.selectedStatus, this.selectedSortBy, this.selectedDisplayType, this.selectedPermit, this.selectedPermitType, this.selectedNature, this.selectedVendors, this.selectedIssuers,this.audit_based_observation, true);
      if (boolean) {
        this.safetyAndSurveillanceDataService.passToggleSidebar(this.isRouteClicked);
        this.safetyAndSurveillanceDataService.passObservationPopupFlag(false, false, false, false);
      } else {
        // this.resetAllFilter();
        this.safetyAndSurveillanceDataService.passToggleSidebar(true)
      }
    }


  }

  /**
   * get the data and populate the dropdowns.
   */
  fetchSidebarData() {
    if(JSON.parse(sessionStorage.getItem('selectedUnits')) != ""){
      let array = JSON.parse(sessionStorage.getItem('selectedUnits'))
      let payload = [];
      if(typeof(array[0]) == 'object'){
        payload = array[0]
      }else{
        payload = array
      }
      this.unitService.fetchSidebarData(JSON.stringify(payload)).subscribe(
        (data) => {
          if (this.currentUnitPage === 'Observations') {
            this.obsZones = [];
            this.obsCategories = [];
            this.obsDates = [];
            this.obsTimes = [];
            this.obsData = data;
            sessionStorage.setItem("obsData", JSON.stringify(this.obsData))
            this.onObsFilterChange(0, true);
          }
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => { }
      );
    } else {
      this.obsData = []
      this.onObsFilterChange(0, true);
      sessionStorage.setItem("obsData", JSON.stringify(this.obsData))
    }
  }

   /**
   * clear all selected data in filter dropdowns.
   */
  onObsFilterReset() {
    // sessionStorage.removeItem('selectedActivePage')
    sessionStorage.removeItem('filterData')
    // this.selectedObsMode = this.obsModes;
    this.selectedObsZone = [];
    this.selectedObsCategory = [];
    this.selectedObsDate = [];
    // this.selectedDisplayType = "Images"
    this.resetFilter = true;
    this.selectedRiskRating = []
    this.selectedStatus = []
    this.selectedPermit = [];
    this.selectedPermitType = [];
    this.selectedNature = [];
    this.selectedVendors = [];
    this.selectedIssuers = [];
    this.onObsFilterChange(0, true);
    setTimeout(() => {

      this.onObsFilterChange(0, true);
    }, 500)
  }

  fetchObsDates(boolean) {
    if(boolean){
      this.applyBtnDisabled = false
    }else{
      this.applyBtnDisabled = true
    }
    this.fetchFaultsChoice(this.selectedObsDate); //'All Dates',
  }

  onObsFilterChange(level: number, retainFlag: boolean) {

    // this.selectedRiskRating = (retainFlag) ? this.selectedRiskRating : [];
    // this.selectedStatus = [];
    let obsFilters = JSON.parse(sessionStorage.getItem('filterData'));
    this.selectedSortBy = 'dateDesc';
    switch (level) {
      case 0:
        try {
          this.obsZones = Object.keys(this.obsData);
          this.obsZones.forEach((zone, i) => {
            let removeAllZone = RegExp('\\b' + 'all' + '\\b').test(zone.toLowerCase())
            if (removeAllZone) {
              this.obsZones.splice(i, 1);
            }
          })
          this.obsZones.sort((a, b) => a.localeCompare(b));
          this.listOfZones.emit(this.obsZones)
          sessionStorage.setItem('bevLocations', JSON.stringify(this.obsZones));
          sessionStorage.setItem('selectedZone', JSON.stringify(this.obsZones));
          let selectedZone = JSON.parse(sessionStorage.getItem('selectedZone'))
          if (retainFlag) {
            if (selectedZone?.length > 0) {
              this.selectedObsZone = selectedZone
            } else {
              let selectedObsZone = [];
              this.selectedObsZone.forEach(ele=>{
                let index = this.obsZones.findIndex(ele1 =>{return ele1 == ele});
                if(index >= 0){
                  selectedObsZone.push(ele)
                }
              })
              this.selectedObsZone = selectedObsZone;
            }
          }
          // if(retainFlag && obsFilters?.zones?.length > 0){
          //   this.selectedObsZone = obsFilters?.zones;
          //   let temArray = [];
          //   this.selectedObsZone.forEach((ele, i) =>{
          //     let index = this.obsZones.findIndex(zone =>{ return zone == ele})
          //     if(index >= 0){
          //       temArray.push(ele);
          //     }
          //   })
          //   this.selectedObsZone = [...temArray]
          // }


        }
        catch (e) {
          this.msg = 'Filter data not available.';
          this.snackbarService.show(this.msg, false, false, false, true);
          this.dataService.passSpinnerFlag(false, true);
        }
      case 1:
        try {
          let obsCategoriesData = [];
          this.obsZones.forEach((data, i) => {
            let obsCategories = Object.keys(this.obsData[data])
            obsCategories.forEach(item => {
              let index = obsCategoriesData.findIndex((name) => name == item);
              if (index < 0) {
                obsCategoriesData.push(item)
              }
            })
          })
          obsCategoriesData.forEach((category, i) => {
            let removeAllCategorie = RegExp('\\b' + 'all' + '\\b').test(category.toLowerCase())
            if (removeAllCategorie) {
              obsCategoriesData.splice(i, 1);
            }
          })
          obsCategoriesData.forEach((category, i) => {
            let removeId = RegExp('\\b' + 'id' + '\\b').test(category.toLowerCase())
            if (removeId) {
              obsCategoriesData.splice(i, 1);
            }
          })
          obsCategoriesData.forEach((category, i) => {
            let removeId = RegExp('\\b' + 'unit_name' + '\\b').test(category.toLowerCase())
            if (removeId) {
              obsCategoriesData.splice(i, 1);
            }
          })
          this.obsCategories = obsCategoriesData;
          let selectedCategory = JSON.parse(sessionStorage.getItem('selectedCategory'))

          if (retainFlag) {
            if (selectedCategory?.length > 0) {
              this.selectedObsCategory = selectedCategory
            } else {
              let selectedObsCategory = [];
              this.selectedObsCategory.forEach(ele=>{
                let index = this.obsCategories.findIndex(ele1 =>{return ele1 == ele});
                if(index >= 0){
                  selectedObsCategory.push(ele)
                }
              })
              this.selectedObsCategory = selectedObsCategory;
            }
          }
          let newObsCategoriesData = [];
          obsCategoriesData.forEach(category => {
            let data = { 'name': category, 'index': this.iogpCategories.findIndex(data => { return data.acronym === category }) }
            newObsCategoriesData.push(data);
          })
          newObsCategoriesData.sort((v1, v2) => { return v1.index - v2.index })
          let mapObsCategoriesData = newObsCategoriesData.map(obj => { return obj.name })
          obsCategoriesData = mapObsCategoriesData
          this.obsCategories = obsCategoriesData;
          if (retainFlag) {
            if (selectedCategory) {
              this.selectedObsCategory = [selectedCategory]
            } else {
              let selectedObsCategory = [];
              this.selectedObsCategory.forEach(ele=>{
                let index = this.obsCategories.findIndex(ele1 =>{return ele1 == ele});
                if(index >= 0){
                  selectedObsCategory.push(ele)
                }
              })
              this.selectedObsCategory = selectedObsCategory;
            }
          }
          if(retainFlag && obsFilters?.category?.length > 0){
            this.selectedObsCategory = obsFilters?.category;
            let temArray = [];
            this.selectedObsCategory.forEach((ele, i) =>{
              let index = this.obsCategories.findIndex(category =>{ return category == ele})
              if(index >= 0){
                temArray.push(ele);
              }
            })
            this.selectedObsCategory = [...temArray]
          }
        }
        catch (e) {
          this.msg = 'Zone Name not available.';
          this.snackbarService.show(this.msg, false, false, false, true);
          this.dataService.passSpinnerFlag(false, true);
        }
      case 2:
        try {
          let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'));
          let obsDateData = [];
          this.obsZones.forEach((zone) => {
            this.obsCategories.forEach(category => {
              if (this.obsData[zone] && this.obsData[zone][category]) {
                let obsDate = Object.keys(this.obsData[zone][category]['date'])
                obsDate.forEach(item => {
                  let index = obsDateData.findIndex((name) => name == item);
                  if (index < 0) {
                    obsDateData.push(item)
                  }
                })
              }
            })
          })
          obsDateData.forEach((date, i) => {
            let removeAllDate = RegExp('\\b' + 'all' + '\\b').test(date.toLowerCase())
            if (removeAllDate) {
              obsDateData.splice(i, 1);
            }
          })
          obsDateData.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
          this.obsDates = obsDateData;
          let searchObservationDate = JSON.parse(sessionStorage.getItem('searchObservation'));
          let selectedDate = sessionStorage.getItem('selectedRiskRatingDate')
          if (searchObservationDate) {
            this.selectedObsDate = [searchObservationDate.date]
          } else {
            if (retainFlag) {
              if (selectedDate) {
                this.selectedObsDate = [selectedDate];
              } else {
                let selectedObsDate = [];
                this.selectedObsDate.forEach(ele=>{
                  let index = this.obsDates.findIndex(ele1 =>{return ele1 == ele});
                  if(index >= 0){
                    selectedObsDate.push(ele)
                  }
                })
                this.selectedObsDate = selectedObsDate;
              }
            }

            if (!this.selectedObsCategory.length) {
              this.selectedObsDate = [];
            }
          }

        }
        catch (e) {
          // this.msg = 'Category not available for the selected Zone Name.';
          // this.snackbarService.show(this.msg, false, false, false, true);
          this.dataService.passSpinnerFlag(false, true);
        }
      case 3:
        try {
          let obsTimeData = [];
          this.obsZones.forEach((zone) => {
            this.obsCategories.forEach(category => {
              this.obsDates.forEach(date => {
                if (this.obsData[zone] && this.obsData[zone][category] && this.obsData[zone][category]['date'] && this.obsData[zone][category]['date'][date]) {
                  this.obsData[zone][category]['date'][date].forEach(item => {
                    let index = obsTimeData.findIndex((name) => name == item);
                    if (index < 0) {
                      obsTimeData.push(item)
                    }
                  })
                }
              })
            })
          })
          obsTimeData.forEach((time, i) => {
            let removeAllTime = RegExp('\\b' + 'all' + '\\b').test(time.toLowerCase())
            if (removeAllTime) {
              obsTimeData.splice(i, 1);
            }
          })
          obsTimeData.sort((a, b) => { return new Date("2023-01-01 " + b).getTime() - new Date("2023-01-01 " + a).getTime() });
          this.obsTimes = obsTimeData;
          if (retainFlag) {
            let selectedObsTime = [];
                this.selectedObsTime.forEach(ele=>{
                  let index = this.obsTimes.findIndex(ele1 =>{return ele1 == ele});
                  if(index >= 0){
                    selectedObsTime.push(ele)
                  }
                })
                this.selectedObsTime = selectedObsTime;
          }
          if (!this.selectedObsDate.length) {
            this.selectedObsTime = [];
          }
          let obsDateData = [];
          if(this.obsZones.length > 0) {
            this.obsZones.forEach((zone) => {
              this.obsCategories.forEach(category => {
                if (this.obsData[zone] && this.obsData[zone][category]) {
                  let obsDate = Object.keys(this.obsData[zone][category]['date'])
                  obsDate.forEach(item => {
                    let index = obsDateData.findIndex((name) => name == item);
                    if (index < 0) {
                      obsDateData.push(item)
                    }
                  })
                }
              })
            })
            if (!obsDateData.length) {
              this.msg = 'Data not available for the selected Category.';
              this.snackbarService.show(this.msg, false, false, false, true);
              this.dataService.passSpinnerFlag(false, true);
            }
          }

          let rating = JSON.parse(sessionStorage.getItem('riskRating'))
          let status = JSON.parse(sessionStorage.getItem('selectedStatus'));

          if (retainFlag) {
            this.selectedObsTime = [];
            this.selectedObsMode = [];
            this.selectedStatus = [];
            this.selectedRiskRating = [];
            if (status?.length > 0) {
              this.selectedStatus = status;
            } else {
            }
            if (rating?.length > 0) {
              this.selectedRiskRating = rating;
            } else {
            }
          }

          if(retainFlag && obsFilters?.time?.length > 0){
            this.selectedObsTime = obsFilters?.time;
          }
          if(retainFlag && obsFilters?.mode?.length > 0){
            this.selectedObsMode = obsFilters?.mode;
            let temArray = [];
            this.selectedObsMode.forEach((ele, i) =>{
              let index = this.obsModes.findIndex(mode =>{ return mode.value == ele.value})
              if(index >= 0){
                temArray.push(ele);
              }
            })
            this.selectedObsMode = [...temArray]
          }
          if(retainFlag && obsFilters?.status?.length > 0){
            this.selectedStatus = obsFilters?.status;
            let temArray = [];
            this.selectedStatus.forEach((ele, i) =>{
              let index = this.faultsChoice.findIndex(status =>{ return status == ele})
              if(index >= 0){
                temArray.push(ele);
              }
            })
            this.selectedStatus = [...temArray]
          }
          if(retainFlag && obsFilters?.rating?.length > 0){
            this.selectedRiskRating = obsFilters?.rating;
            let temArray = [];
            this.selectedRiskRating.forEach((ele, i) =>{
              let index = this.riskRatings.findIndex(rating =>{ return rating == ele})
              if(index >= 0){
                temArray.push(ele);
              }
            })
            this.selectedRiskRating = [...temArray]
          }
          if(retainFlag && obsFilters?.sort?.length > 0){
            this.selectedSortBy = obsFilters?.sort;
          }

        }
        catch (e) {
          this.msg = 'Date not available for the selected Category.';
          this.snackbarService.show(this.msg, false, false, false, true);
          this.dataService.passSpinnerFlag(false, true);
        }
      default:
        this.fetchObsDates(true);
    }
  }

   /**
   * select the start and end dates.
   */
  onReportDatesChange(dateType, $event: IMyDateModel) {
    if (dateType === 'startDate') {
      this.reportStartDate = $event.formatted;
      let endDate: any = new Date(this.reportStartDate + 'T00:00:00');
      endDate.setDate(endDate.getDate() - 1);
      endDate = this.commonService.formatDate(endDate).split('-');
      this.reportsEndDatePickerOptions.disableUntil = {
        year: Number(endDate[0]),
        month: Number(endDate[1]),
        day: Number(endDate[2]),
      };
      this.reportsEndDatePickerOptions = {
        ...this.reportsEndDatePickerOptions,
      };
    } else {
      this.reportEndDate = $event.formatted;
      let startDate: any = new Date(this.reportEndDate + 'T00:00:00');
      startDate.setDate(startDate.getDate() + 1);
      startDate = this.commonService.formatDate(startDate).split('-');
      this.reportsStartDatePickerOptions.disableSince = {
        year: Number(startDate[0]),
        month: Number(startDate[1]),
        day: Number(startDate[2]),
      };
      this.reportsStartDatePickerOptions = {
        ...this.reportsStartDatePickerOptions,
      };
    }
    this.safetyAndSurveillanceDataService.passShuddownDates(
      this.selectedUnit,
      this.reportStartDate,
      this.reportEndDate,
      true
    );
  }

  onHelpMenuClick(helpModule) {
    this.helpModule = helpModule;
    this.safetyAndSurveillanceDataService.passHelpModule(this.helpModule, true);
    document.getElementById('slide-submenu').click();
  }

   /**
   * select all zones.
   */
  selectedAllZones() {
    this.selectedObsZone = this.obsZones;
  }
  /**
   * unselect all zones.
   */
  unSelectAllZones() {
    this.selectedObsZone = [];
  }
  /**
   * select all categories.
   */
  selectedAllCategories() {
    this.selectedObsCategory = this.obsCategories;
  }
  /**
   * unselect all categories.
   */
  unSelectAllCategories() {
    this.selectedObsCategory = [];
  }
  /**
   * select all dates.
   */
  selectedAllDates() {
    this.selectedObsDate = this.obsDates;
  }
   /**
   * unselect all dates.
   */
  unSelectAllDates() {
    this.selectedObsDate = [];
  }
   /**
   * select all times.
   */
  selectedAllTimes() {
    this.selectedObsTime = this.obsTimes;
  }
  /**
   * unselect all times.
   */
  unSelectAllTimes() {
    this.selectedObsTime = [];
  }
  /**
   * select all modes.
   */
  selectedAllModes() {
    this.selectedObsMode = this.obsModes;
  }
  /**
   * unselect all modes.
   */
  unSelectAllModes() {
    this.selectedObsMode = [];
  }

  ngOnDestroy() {
    this.safetyAndSurveillanceDataService.passCurrentUnitPage('', false);
    this.safetyAndSurveillanceDataService.passObservationsFilters(
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      false,
      false
    );
    this.safetyAndSurveillanceDataService.passObsData('', '', '', '', false);
    this.subscription.unsubscribe();
  }
  datePicker(data) {
    this.applyBtnDisabled = true
    let from = new Date(this.selectedTimeRange[0]).getHours() + ':' + new Date(this.selectedTimeRange[0]).getMinutes() + ':' +new Date(this.selectedTimeRange[0]).getSeconds();
    let to = new Date(this.selectedTimeRange[1]).getHours() + ':' + new Date(this.selectedTimeRange[1]).getMinutes() + ':' +new Date(this.selectedTimeRange[1]).getSeconds();
    this.selectedObsTime = [from, to]
  }
  returnBackGroundColor(rating){
    let index = this.riskRatingLevels.findIndex(ele =>{ return ele.rating == rating});
    return this.riskRatingLevels[index].colorCode;
  }
  /**
   * select start time.
   */
  selectStartTime(){
    this.selectEndTime()
  }
  /**
   * select end time.
   */
  selectEndTime(){
    let date = new Date('10/10/2023 '+ this.selectedObsTime[0])
    let date2 = new Date('10/10/2023 '+ this.selectedObsTime[1])
    if(this.selectedObsTime[0]?.length > 0){
    if(this.selectedObsTime[1]?.length > 0){
      if(date.getTime() > date2.getTime()){
        this.selectedObsTime[1] = this.selectedObsTime[0]
        this.msg = 'Please select End time greater than Start time';
        this.snackbarService.show(this.msg, false, false, false, true);
      }
      this.applyBtnDisabled = true;
    }
    }else{
      this.msg = 'Please select Start time';
      this.snackbarService.show(this.msg, false, false, false, true);
    }
  }
}



@Pipe({
  name: 'hideInfo',
  pure: true,
})
export class HideInfoPipe implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    let val: string = value + '';

    if (val && val.length >= 5) {
      val = val.slice(0, 5) + "...";
    }
    return val;
  }
}
