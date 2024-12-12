import { Component, OnInit } from '@angular/core';

import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  selectedTab: string = 'home'

  constructor(private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) { }

  ngOnInit(): void {
    // this.safetyAndSurveillanceDataService.passSelectedPage('unsif');
  }

  selectTab(event) {
    this.selectedTab = event;
  }

}
