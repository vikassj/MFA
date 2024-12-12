///////////////////////////////////////////////////////////////////////////////
// Filename : spinner.component.ts
// Description : Loader for the application
// Revision History:
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { DataService } from '../../services/data.service';
import { SnackbarService } from '../../services/snackbar.service';
import { CommonService } from '../../services/common.service';
import { assetUrl } from 'src/single-spa/asset-url';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.component.html',
  styleUrls: ['./spinner.component.scss']
})
export class SpinnerComponent implements OnInit {

  msg: string = '';
  spinnerType: string = 'default';
  showFlag: boolean = false;
  moduleData: any[] = [];
  subscription: Subscription = new Subscription();
  spinnerUrl: any;

  constructor(private dataService: DataService, private snackbarService: SnackbarService, private commonService: CommonService) { }

  ngOnInit() {
    this.spinnerUrl = assetUrl("t-pulse.gif")
    this.commonService.readConfigurationsData().subscribe(data => {
      this.moduleData = data['modules'];
      this.subscription.add(this.dataService.getShowFlag.subscribe(showFlag => {
        if (showFlag.validFlag) {
          let moduleUrl = window.location.pathname.split('/')[1];
          this.spinnerType = (this.moduleData.filter(module => module.routeUrl.includes(moduleUrl)).length > 0) ? this.moduleData.find(module => module.routeUrl.includes(moduleUrl)).spinnerType : 'default';
          this.showFlag = showFlag.showFlag;
        }
      }));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
