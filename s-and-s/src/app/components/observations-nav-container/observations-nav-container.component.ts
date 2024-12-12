import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';

@Component({
  selector: 'app-observations-nav-container',
  templateUrl: './observations-nav-container.component.html',
  styleUrls: ['./observations-nav-container.component.css']
})
export class ObservationsNavContainerComponent implements OnInit {

  selectedTab: string = 'observations'
  subscription: Subscription = new Subscription();
  mapView: boolean;

  constructor(private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) {
    this.subscription.add(this.safetyAndSurveillanceDataService.getObservationPopupFlag.subscribe(obsFilters => {
      if(obsFilters.birds_eye_view){
        this.mapView = false;
      }else{
        this.mapView = true;
      }
    }))
  }

  ngOnInit(): void {
  }

  selectTab(event) {
    this.selectedTab = event;
  }

}
