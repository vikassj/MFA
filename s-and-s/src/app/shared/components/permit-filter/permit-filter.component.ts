import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

@Component({
  selector: 'app-permit-filter',
  templateUrl: './permit-filter.component.html',
  styleUrls: ['./permit-filter.component.css']
})
export class PermitFilterComponent implements OnInit {

  permits: any[];
  selectedPermits:any[];
  subscription: Subscription = new Subscription();
  dropdown: boolean = false;
  title = 'permit-filter';
  msg: string;
  dashboardNavigated: boolean = false;
  screenSize = window.innerHeight;
  constructor(private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private snackbarService: SnackbarService) {
    // window.addEventListener("unitFilter", (evt) => {
    //   this.dropdown = false
    // })
    window.addEventListener('permits-close-filter', (evt) => {
      this.dropdown = false
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
      this.permits=newData;
      let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'))
      if(selectedUnits?.length < 1){
        this.selectedPermits = []
      }else{
      let allInProgressPermits = this.permits.filter(key=> key.is_ongoing_permit).map(key=> key.id);
      let manuallySelectedPermits = JSON.parse(sessionStorage.getItem('manuallySelectedPermits'))
        if(JSON.parse(sessionStorage.getItem('navigatedObservation'))){
          this.dashboardNavigated = true
        }
        if(manuallySelectedPermits?.length > 0){
          this.selectedPermits = manuallySelectedPermits
         }else{
          if(allInProgressPermits.length>0 && !this.dashboardNavigated){
            this.selectedPermits = allInProgressPermits
          }else{
            this.selectedPermits = this.permits.map(key=>{return key.id})
          }
         }
        }
    })
  }

  ngOnInit(): void {
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedPermits.subscribe(selectedPermits => {
      this.selectedPermits=selectedPermits;
    }))
}


removeFromFilters(id: any) {
  this.selectedPermits.splice(this.selectedPermits.findIndex(item => item == id), 1);
  sessionStorage.setItem('manuallySelectedPermits',JSON.stringify(this.selectedPermits))
  this.safetyAndSurveillanceDataService.passSelectedPermits(this.selectedPermits);
 }

 toggleDropdown() {
   this.dropdown = !this.dropdown
 }

 getPermitHeight() {
  if(this.selectedPermits.length > 31 && this.screenSize <= 642){
    return this.screenSize-260
  }
  else if(this.selectedPermits.length > 40 && this.screenSize <= 730){
    return this.screenSize-220
  }
  else if(this.selectedPermits.length > 50 && this.screenSize > 730){
    return this.screenSize-190
  }
 }

}
