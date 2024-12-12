import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { CommonService } from 'src/shared/services/common.service';
import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../shared/service/data.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';

@Component({
  selector: 'app-actions-filter',
  templateUrl: './actions-filter.component.html',
  styleUrls: ['./actions-filter.component.css']
})
export class ActionsFilterComponent implements OnInit {
  isRouteClicked : any;
  subscription: Subscription = new Subscription();


  constructor(private unitService: UnitService, private snackbarService: SnackbarService, private dataService: DataService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private commonService: CommonService, private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) { }

  ngOnInit(): void {
    this.subscription.add(this.safetyAndSurveillanceDataService.getActionsFilter.subscribe((actionsFilter => {
      this.isRouteClicked = actionsFilter.values;
    })));
  }

}
