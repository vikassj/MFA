import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { MatomoTracker } from '@ngx-matomo/tracker';

import { CommonService } from './services/common.service'
import * as moment from 'moment';
import "moment-timezone";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  title = 'occupancy-monitoring';
  showContactUs: boolean = false;
  timeZone: any;

  constructor(
    private router: Router,
    private commonService: CommonService,
    private readonly tracker: MatomoTracker
  ) {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    moment.tz.setDefault(this.timeZone);
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        let pathname = window.location.pathname;
        this.showContactUs = pathname.includes('help') ? true : false;
      }
    })
  }

  ngOnInit() {
    let userId = sessionStorage.getItem('user-email');
    if (userId) {
      this.tracker.setUserId(userId);
    }
    this.commonService.readModuleConfigurationsData('manpower-counting').subscribe(data => {
    });
  }

}
