import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

import { PlantService } from 'src/app/shared/service/plant.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';

@Component({
  selector: 'app-units-dropdown',
  templateUrl: './units-dropdown.component.html',
  styleUrls: ['./units-dropdown.component.css']
})
export class UnitsDropdownComponent implements OnInit {

  dropdownList = [];
  selectedItems = [];
  dropdownSettings = {};
  subscription: Subscription = new Subscription();
  unitList =[];
  units = [];
  msg: string;
  disableDropdown: boolean = false;
  dates: any;
  selectedPlantDetails:any;
  savedUnits: any[] = [];

  constructor(private router: Router, private plantService: PlantService ,private dataService: DataService ,private snackbarService: SnackbarService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    ){
      let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
      this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
      window.addEventListener('disable-units', (evt) => {
        this.disableDropdown = true
      })

      window.addEventListener('enable-units', (evt) => {
        this.disableDropdown = false;
      })

      window.addEventListener('disable-inputs', (evt) => {
        this.disableDropdown = true
      })

      window.addEventListener('enable-inputs', (evt) => {
        this.disableDropdown = false
      })

      this.router.events.subscribe((ev) => {
          this.subscription.unsubscribe();
      })



      window.addEventListener('global-search-used', (evt) => {
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        let manuallySelectedUnits = JSON.parse(sessionStorage.getItem('manually-selected-units'))
        if(searchObservation){
          this.selectedItems = manuallySelectedUnits
        }else{
          if(manuallySelectedUnits){
            this.selectedItems = manuallySelectedUnits
          }
          else{
            this.selectedItems = JSON.parse(sessionStorage.getItem('selectedUnits'))
          }
        }
      })

      if(this.selectedItems.length == 0) {
        if(sessionStorage.getItem('navigatedUnit') && !window.location.pathname.split('/').includes('observations')) {
          this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPage.subscribe(selectedPage => {
            this.unitList = [];
            if(selectedPage != "") {
              this.getUnitsData(selectedPage);
            }
        }))
        } else {
          if(JSON.parse(sessionStorage.getItem('navigated-from-dashboard')) == true) {
            // sessionStorage.removeItem('navigated-from-dashboard')
            this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
              if(data['value'] == 'units') {
                this.selectedItems=data['data'] ? data['data'] : [];
              } else if(data['value'] == 'all') {
                this.selectedItems = data['data']['units']
              }
              let array = this.selectedItems
              let payload = [];
              if(typeof(array[0]) == 'object'){
                payload = array[0]
              }else{
                payload = array
              }
              this.selectedItems = payload;
              sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))
          }))
          this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(data => {
            // this.selectedItems = data
            let array = data
              let payload = [];
              if(typeof(array[0]) == 'object'){
                payload = array[0]
              }else{
                payload = array
              }
              this.selectedItems = payload;
            sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))
          }))
          } else {
            if(sessionStorage.getItem('manually-selected-units')) {
              let array = JSON.parse(sessionStorage.getItem('manually-selected-units'))
              let payload = [];
              if(typeof(array[0]) == 'object'){
                payload = array[0]
              }else{
                payload = array
              }
              this.selectedItems = payload;
            } else {
              this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
                if(data['value'] == 'units') {
                  this.selectedItems=data['data'] ? data['data'] : [];
                } else if(data['value'] == 'all') {
                  this.selectedItems = data['data']['units']
                }
                let array = this.selectedItems
                let payload = [];
                if(typeof(array[0]) == 'object'){
                  payload = array[0]
                }else{
                  payload = array
                }
                this.selectedItems = payload;
                sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))
            }))
            this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(data => {
              // this.selectedItems = data
              let array = data
              let payload = [];
              if(typeof(array[0]) == 'object'){
                payload = array[0]
              }else{
                payload = array
              }
              this.selectedItems = payload;
              sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))
            }))
            }
          }
          this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPage.subscribe(selectedPage => {
            this.unitList = [];
            if(selectedPage != "") {
              this.getUnitsData(selectedPage);
            }
        }))
        }
      }

    }

  ngOnInit() {
    this.dropdownSettings = {
      singleSelection: false,
      idField: 'id',
      textField: 'name',
      selectAllText: 'All',
      unSelectAllText: 'All',
      itemsShowLimit: 1,
    };
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(data => {
      this.selectedItems = data
      sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))
    }))
  }

   /**
   * get all units and populate in unit dropdown.
   */
  getUnitsData(selectedPage){
    if(sessionStorage.getItem('availableUnits')) {
      var availableUnits: any = JSON.parse(sessionStorage.getItem('availableUnits'))
      this.setAvailableUnits(availableUnits,selectedPage)
    } else {
      this.plantService.getUnitsData(selectedPage).subscribe(
        (availableUnits: any) => {
         this.setAvailableUnits(availableUnits,selectedPage)
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }

  }


   /**
   * select all units from unit dropdown.
   */
  selectAll() {
    this.selectedItems = this.unitList.map(key=>{return key.id})
  }

   /**
   * unselect all units.
   */
  unselectAll() {
    this.selectedItems = [];
  }

  toggleCheckAll(values: any) {
    if(values.currentTarget.checked){
      this.selectAll();
    } else {
      this.unselectAll();
    }
  }

  onOpenDropDown(){
    this.savedUnits = this.selectedItems
  }

  onCloseDropDown(){
    this.selectedItems = this.savedUnits
  }

  selectList($event){
  }

  /**
   * apply button functionality for unit dropdown.
   * @param select ng-select component
   */
  applyBtn(select: NgSelectComponent){
    this.savedUnits = this.selectedItems
    select.close();
    if(this.selectedItems.length > 0){
      // sessionStorage.removeItem('selectedActivePage')
      sessionStorage.removeItem('filterData')
      this.safetyAndSurveillanceDataService.passSelectedUnits(this.selectedItems);
      this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(dates => {
        this.dates = dates;
      })
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedItems, this.dates['startDate'], this.dates['endDate']);
      window.dispatchEvent(new CustomEvent('units-changed'))
      sessionStorage.setItem('selectAllPermits',JSON.stringify(true))
      sessionStorage.setItem('manually-selected-units', JSON.stringify(this.selectedItems))
      sessionStorage.removeItem('manuallySelectedPermits')
      sessionStorage.removeItem('searchObservation')
      sessionStorage.removeItem('obsNavDate')
      sessionStorage.removeItem('selectedActivePage')
    }else{
      this.msg = "Select any unit to show the observations.";
      this.snackbarService.show(this.msg, false, false, false, true);
    }
  }


  setAvailableUnits(availableUnits: any,selectedPage) {
    if (Object.keys(availableUnits).length > 0 || availableUnits.length > 0) {
      if (availableUnits['IOGP_Category']) {
        this.units = [];
        this.unitList = [];
        let units: any = availableUnits;
        this.units = Object.keys(units.IOGP_Category);
        sessionStorage.setItem('availableUnits', JSON.stringify(availableUnits))
        this.units.forEach((unit) => {
          if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
            let unitDetails = {};
            unitDetails['obsData'] = {};
            unitDetails['name'] = unit;
            unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
            unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
            unitDetails['id'] = units.IOGP_Category[unit].id;
            unitDetails['order'] = units.IOGP_Category[unit].order;
            this.unitList.push(unitDetails);
            if(selectedPage !== 'sif' && !sessionStorage.getItem('manually-selected-units')){
              this.selectedItems = this.unitList.map((e)=>{return e.id})
            }
            else if(sessionStorage.getItem('manually-selected-units')){
              this.selectedItems = JSON.parse(sessionStorage.getItem('manually-selected-units'))
            }
          }
        });
        this.unitList.sort((a, b)=>{return b.order - a.order});
        sessionStorage.setItem('allUnits',JSON.stringify(this.unitList))
        this.safetyAndSurveillanceDataService.passAllUnits(this.unitList);
        if(this.selectedItems.length<1){
          this.selectedItems=this.unitList.map(key=>{return key.id})
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

        }else{
          let selectedItems = [];
            this.selectedItems.forEach(ele =>{
              let index = this.unitList.findIndex(key =>{return key.id == ele});
              if(index >= 0){
                selectedItems.push(ele)
              }
            })
            this.selectedItems = selectedItems;
          sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

        }

      }else if(availableUnits.length > 0){
        this.units = [];
          this.unitList = [];
          let units: any = availableUnits;
          this.units = availableUnits;
          this.units.forEach((unit) => {
              let unitDetails = {};
              unitDetails['obsData'] = {};
              unitDetails['name'] = unit.name;
              unitDetails['startDate'] = unit.start_date;
              unitDetails['endDate'] = unit.end_date;
              unitDetails['id'] = unit.id;
              unitDetails['order'] = unit.order;
              this.unitList.push(unitDetails);
          });
          this.unitList.sort((a, b)=>{return b.order - a.order});
          sessionStorage.setItem('allUnits',JSON.stringify(this.unitList))
          this.safetyAndSurveillanceDataService.passAllUnits(this.unitList);
          if(this.selectedItems.length<1){
            this.selectedItems=this.unitList.map(key=>{return key.id})
            sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

          }else{
            let selectedItems = [];
            this.selectedItems.forEach(ele =>{
              let index = this.unitList.findIndex(key =>{return key.id == ele});
              if(index >= 0){
                selectedItems.push(ele)
              }
            })
            this.selectedItems = selectedItems;
            sessionStorage.setItem('selectedUnits', JSON.stringify(this.selectedItems))

          }
        }
        this.unitList.reverse()
        sessionStorage.setItem('allUnits',JSON.stringify(this.unitList))
    } else {
      this.selectedItems = [];
      this.dataService.passSpinnerFlag(false, true);
    }
    let array = JSON.parse(sessionStorage.getItem('selectedUnits'))
        let payload = [];
        if(typeof(array[0]) == 'object'){
          payload = array[0]
        }else{
          payload = array
        }
    if(payload?.length > 0) {
      var dates = []
      this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(data => {
        dates = data
      })
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedItems, dates['startDate'], dates['endDate']);
      this.safetyAndSurveillanceDataService.passSelectedUnits(this.selectedItems);
    }

  }


}
