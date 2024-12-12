import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { assetUrl } from 'src/single-spa/asset-url';
import { LiveStreamingDataService } from '../../services/data.service';

import { CommonService } from '../../../services/common.service';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  msg: string = '';
  spinnerType: string = 'tpulse';
  showFlag: boolean = false;
  moduleData: any[] = [];
  TpulseSpinner: string='';
  subscription: Subscription = new Subscription();

  constructor(private commonService: CommonService, private dataService: LiveStreamingDataService) { }

  ngOnInit() {
    this.TpulseSpinner = assetUrl("t-pulse.gif")
    this.commonService.readConfigurationsData().subscribe(data => {
      this.moduleData = data['modules'];
      this.subscription.add(this.dataService.getShowFlag.subscribe(showFlag => {
        if (showFlag.validFlag) {
          let moduleUrl = window.location.pathname.split('/')[1];
          // this.spinnerType = (this.moduleData.filter(module => module.routeUrl.includes(moduleUrl)).length > 0) ? this.moduleData.find(module => module.routeUrl.includes(moduleUrl)).spinnerType : 'default';
          this.showFlag = showFlag.showFlag;
        }
      }));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
