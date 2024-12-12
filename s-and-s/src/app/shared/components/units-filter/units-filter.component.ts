import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-units-filter',
  templateUrl: './units-filter.component.html',
  styleUrls: ['./units-filter.component.css']
})
export class UnitsFilterComponent implements OnInit {
  units: any[];
  displayUnits: number;
  selectedUnits:any[];
  subscription: Subscription = new Subscription();
  dropdown: boolean = false;
  title = 'units-filter';
  msg: string;
  selectedPlantDetails:any;

  constructor(private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private snackbarService: SnackbarService) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
    window.addEventListener("unitFilter", (evt) => {
      this.dropdown = false
    })

    window.addEventListener('close-filter', (evt) => {
      this.dropdown = false
    })
  }

  ngOnInit(): void {
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(selectedUnits => {
      // this.units=selectedUnits;
      let array = selectedUnits
      let payload = [];
      if(typeof(array[0]) == 'object'){
        payload = array[0]
      }else{
        payload = array
      }
      this.units = payload;
      let allUnits = JSON.parse(sessionStorage.getItem("allUnits"));
      this.selectedUnits=[];
      for(let i=0;i<this.units.length;i++){
        let index = allUnits.findIndex(res=>{ return res.id==this.units[i]})
             if(index >=0){
              this.selectedUnits.push(allUnits[index]);
            }
      }
  }))
}

/**
   * remove units from filter.
   */
removeFromFilters(id: any) {
  // sessionStorage.removeItem('selectedActivePage')
  this.selectedUnits.splice(this.units.findIndex(item => item == id), 1);
  let units=[];
  for(let i=0;i<this.units.length;i++){
    let index = this.selectedUnits.findIndex(res=>{ return res.id==this.units[i]})
         if(index >=0){
          units.push(this.units[i]);
        }
  }
  this.units=units;
  if(this.units.length > 0){
    this.safetyAndSurveillanceDataService.passSelectedUnits(this.units)
    var dates = []
    this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(data => {
      dates = data;
    })
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.units, dates['startDate'], dates['endDate']);
    sessionStorage.setItem('manually-selected-units', JSON.stringify(this.units));
    sessionStorage.removeItem('manuallySelectedPermits');
    window.dispatchEvent(new CustomEvent('units-changed'))
  }else{
    this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(data => {
      dates = data;
    })
    this.safetyAndSurveillanceDataService.passSelectedUnits("")
    this.safetyAndSurveillanceDataService.passDatesAndUnits("", "", "");
    window.dispatchEvent(new CustomEvent('units-changed'))
    this.msg = "Select any unit to show the observations.";
    sessionStorage.setItem('removed-from-filter', 'true')
    this.snackbarService.show(this.msg, false, false, false, true);
  }
 }

 /**
   * show and hide the unit filter popup.
   */
 toggleDropdown() {
   this.dropdown = !this.dropdown
 }

}
