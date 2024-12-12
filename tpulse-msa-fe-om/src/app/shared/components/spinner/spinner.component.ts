import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { assetUrl } from 'src/single-spa/asset-url';

import { DataService } from '../../../services/data.service'
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
  TpulseSpinner: string = '';
  subscription: Subscription = new Subscription();

  constructor(private commonService: CommonService, private dataService: DataService) { }

  ngOnInit() {
    this.TpulseSpinner = assetUrl("t-pulse.gif")
    this.commonService.readConfigurationsData().subscribe(data => {
      this.moduleData = data['modules'];
      this.subscription.add(this.dataService.getShowFlag.subscribe(showFlag => {
        if (showFlag.validFlag) {
          this.showFlag = showFlag.showFlag;
        }
      }));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
