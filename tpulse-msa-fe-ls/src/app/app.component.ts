import { Component, OnDestroy } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { CommonService } from './services/common.service';
import { MatomoTracker } from '@ngx-matomo/tracker';
import * as moment from 'moment';
import "moment-timezone";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnDestroy {
  title = 'live-streaming';

  apiUrl: string;
  showContactUs: boolean = false;
  constructor(
    private router: Router,
    private commonService: CommonService,
    private readonly tracker: MatomoTracker
  ) {
    let timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    moment.tz.setDefault(timeZone);
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        let pathname = window.location.pathname;
        this.showContactUs = pathname.includes('help') ? true : false;
      }
    })
  }
  ngOnDestroy() {
    sessionStorage.removeItem('restoreSelectedVideos')
    sessionStorage.removeItem('restorePageNumber')
  }

  ngOnInit() {
    sessionStorage.removeItem('startAndEndDate')
    let userId = sessionStorage.getItem('user-email');
    if (userId) {
      this.tracker.setUserId(userId);
    }
    // this.apiUrl='http://13.232.181.220:8004/';
    //     this.apiUrl=sessionStorage.getItem(this.apiUrl);
    // sessionStorage.setItem('apiUrl',this.apiUrl);
    this.commonService.readModuleConfigurationsData('live-streaming').subscribe(data => {
    });

    // let url = window.location.pathname;
    // this.showContactUs = (url.includes('help') ? true : false);
  }

}
