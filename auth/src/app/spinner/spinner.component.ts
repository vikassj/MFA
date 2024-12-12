import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { assetUrl } from 'src/single-spa/asset-url';

import { CommonService } from '../common.service';
import { DataService } from '../data.service';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';

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
  TpulseSpinner: string='';
  subscription: Subscription = new Subscription();

  constructor(private commonService: CommonService, private dataService: DataService, private router: Router) {
    this.router.events.subscribe((ev) => {
      if(ev instanceof NavigationEnd) {
        this.router.events.subscribe((routerData: any) => {
          this.subscription.add(this.dataService.getShowFlag.subscribe(showFlag => {
            if (showFlag.validFlag) {
              let moduleUrl = window.location.pathname.split('/')[1];
              // this.spinnerType = (this.moduleData.filter(module => module.routeUrl.includes(moduleUrl)).length > 0) ? this.moduleData.find(module => module.routeUrl.includes(moduleUrl)).spinnerType : 'default';
              this.showFlag = showFlag.showFlag;
            }
          })); 
      });
      }
    })
   }

  ngOnInit() {
    this.TpulseSpinner = assetUrl("t-pulse.gif")
    this.commonService.readConfigurationsData().subscribe(data => {
      sessionStorage.setItem("application-configuration", JSON.stringify(data))
      // let data = JSON.parse(sessionStorage.getItem("application-configuration"))
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
