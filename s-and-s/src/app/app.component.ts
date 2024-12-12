import { ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import * as singleSpa from 'single-spa';
import { MatomoTracker } from '@ngx-matomo/tracker';
import * as moment from 'moment';
import "moment-timezone";
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import { DateFormatPipe } from 'src/shared/pipes/date-format.pipe';

import { SafetyAndSurveillanceDataService } from './shared/service/data.service';
import { PlantService } from './shared/service/plant.service';
import { CommonService } from 'src/shared/services/common.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [DateFormatPipe,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' }, // Set locale to US English
    {
      provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
      useValue: { useUtc: true }, // Use UTC to handle timezones
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'LL',
        },
        display: {
          dateInput: 'DD/MMM/YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    },
    {
      provide: MAT_DATE_LOCALE,
      useValue: 'en-US',
    },]
})
export class AppComponent {



  showSideBar: boolean = true;
  msg: string = '';
  defaultModule: string = '';
  userActivityData: any;
  setInterval: any;
  dataRefreshInterval: number = 0;
  appTimeout: number = null;
  appTimeoutCutOff: number = null;
  timedOut = false;
  // countdown: number = null;
  // lastPing: Date = null;
  subscription: Subscription = new Subscription();
  moduleName: string;
  levelName: string;
  pageName: string;
  plantId: string;
  showWelcomeMessage: boolean = false;
  showContactUs: boolean = false

  idleState = "NOT_STARTED";
  countdown?: number = null;
  lastPing?: Date = null;
  showPdfView: boolean;
  timeZone: any;

  constructor(
    private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private router: Router,
    private plantService: PlantService,
    private commonService: CommonService,
    private readonly tracker: MatomoTracker
  ) {
    // sessionStorage.removeItem('startAndEndDate')
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    moment.tz.setDefault(this.timeZone);
    this.commonService.readJsonData('safety-and-surveillance-configurations.json').subscribe((data: any) => {
      sessionStorage.setItem('s-and-s-json', JSON.stringify(data))
    })
    $(document).mouseup(function (e: any) {
      var container = $('.dropdown-style');
      if (!container.is(e.target) && container.has(e.target).length === 0) {
        container.hide();
      }
    });
    if (!sessionStorage.getItem('selectedUnit')) {
      if(!JSON.parse(sessionStorage.getItem('global-search-notification'))){
        this.router.navigateByUrl('/safety-and-surveillance/dashboard');
      }
    }
    this.router.events.subscribe((ev) => {
      window.addEventListener('hide-banner', (ev) => {
        this.showWelcomeMessage = false
      })
    })
    this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationStart) {
        if(window.location.pathname != sessionStorage.getItem('oldPathName')){
          sessionStorage.setItem('oldPathName', window.location.pathname);
          // sessionStorage.removeItem('selectedActivePage')
          sessionStorage.removeItem('filterData')
        }
        let pathname = window.location.pathname;
        this.showContactUs = pathname.includes('help') ? true : false;
        this.showPdfView = pathname.includes('reports') || pathname.includes('audit') ? true : false;
      }
    })


    // this.router.events.subscribe((ev) => {
    //   if(ev instanceof NavigationStart) {
    //     this.dataService.passSpinnerFlag(true, true)
    //   }
    // })

    if(sessionStorage.getItem('global-search-notification')) {
      this.safetyAndSurveillanceDataService.passGlobalSearch(JSON.parse(sessionStorage.getItem('global-search-notification')))
    }
  }

  ngOnInit(): void {
    sessionStorage.removeItem('availableUnits')
    // sessionStorage.removeItem('startAndEndDate')
    // sessionStorage.removeItem('selectedUnits')
    if(JSON.parse(sessionStorage.getItem('selectedDateRange'))){
       sessionStorage.removeItem('startAndEndDate')
       let selectedDateRange = JSON.parse(sessionStorage.getItem('selectedDateRange'))
       sessionStorage.setItem('startAndEndDate',JSON.stringify([selectedDateRange?.startDate,selectedDateRange?.endDate]))
    }
    let startAndEndDate = JSON.parse(sessionStorage.getItem('startAndEndDate'));
    let selectedUnits = JSON.parse(sessionStorage.getItem('selectedUnits'));
    if(selectedUnits?.length > 0){
      this.safetyAndSurveillanceDataService.passSelectedUnits(selectedUnits);
      if (startAndEndDate?.length == 2) {
        let startDate = moment(startAndEndDate[0]).format('YYYY-MM-DD')
        let endDate = moment(startAndEndDate[1]).format('YYYY-MM-DD')
        this.safetyAndSurveillanceDataService.passSelectedDates(startDate, endDate)
        this.safetyAndSurveillanceDataService.passDatesAndUnits(selectedUnits, startDate, endDate);
      }
    }

    let userId = sessionStorage.getItem('user-email');
    if (userId) {
      this.tracker.setUserId(userId);
    }
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      sessionStorage.setItem("analyticsFound", data['module_configurations']['application_features']['analytics_found'])
    });
    this.subscription.add(
      this.safetyAndSurveillanceDataService.getCurrentUnitPage.subscribe(
        (currentUnitPage) => {
          if (currentUnitPage.validFlag) {
            this.showSideBar =
              currentUnitPage.currentUnitPage === 'Change Password' ||
                currentUnitPage.currentUnitPage === 'Dashboard'
                ? false
                : true;
          }
        }
      )
    );

    let data = JSON.parse(sessionStorage.getItem("application-configuration"))
    sessionStorage.setItem('url', data['url']);
    sessionStorage.setItem('apiUrl', data['apiUrl']);
    sessionStorage.setItem('wsUrl', data['websocketUrl']);
    this.defaultModule = data['defaultModule'];
    this.showWelcomeMessage = this.commonService.showWelcomeMessage();
    this.appTimeout = data['appTimeout'];
    this.appTimeoutCutOff = data['appTimeoutCutOff'];
    this.dataRefreshInterval = data['userActivityPushInterval'];
    this.subscription.add(this.router.events.subscribe(modalData => {
      $('.modal-backdrop').remove();
    }));
    this.commonService.setUserActivityData();
    setInterval(() => {
      if (sessionStorage.getItem('access-token') && JSON.parse(sessionStorage.getItem('userLoggedIn') as any)) {
        this.userActivityData = JSON.parse(sessionStorage.getItem('userActivity') as any);
        this.postUserActivityData();
        this.newUserActivityData();
      }
    }, this.dataRefreshInterval);
  }

  /**
   * get the plant details.
   */
  fetchPlantDetails() {
    this.plantService.fetchPlantDetails().subscribe(
      (plantData: any) => {
        let plantDetials: any = plantData;
        plantDetials.start_date = plantData.start_date;
        plantDetials.end_date = plantData.end_date;
        sessionStorage.setItem('plantDetails', JSON.stringify(plantData));
      });
  }

  // startAppTimeout() {

  //   this.idle.setIdle(5); // how long can they be inactive before considered idle, in seconds
  //   this.idle.setTimeout(this.appTimeout); // how long can they be idle before considered timed out, in seconds
  //   this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // provide sources that will "interrupt" aka provide events indicating the user is active

  //   // do something when the user becomes idle
  //   this.idle.onIdleStart.subscribe(() => {
  //     this.msg = 'You will be logged out automatically after ' + (this.appTimeout / 60) + ' minutes of inactivity.';
  //     this.snackbarService.show(this.msg, false, false, false, false);
  //   });
  //   // do something when the user is no longer idle
  //   this.idle.onIdleEnd.subscribe(() => {
  //     // cd.detectChanges(); // how do i avoid this kludge?
  //     this.countdown = null;
  //     $('#overlay').css('display', 'none');
  //     this.idle.watch();
  //   });

  //   // do something when the user has timed out
  //   this.idle.onTimeout.subscribe(() => {
  //     this.timedOut = true;
  //     // this.logout();
  //     window.dispatchEvent(new CustomEvent('Log-out'))
  //     this.msg = 'You have been logged out as you have been inactive for ' + (this.appTimeout / 60) + ' minutes.';
  //     this.snackbarService.show(this.msg, false, false, false, false);
  //   });
  //   // do something as the timeout countdown does its thing
  //   this.idle.onTimeoutWarning.subscribe(seconds => {
  //     this.countdown = seconds;
  //     if (this.countdown <= this.appTimeoutCutOff) {
  //       $('#overlay').css('display', 'block');
  //     }
  //     else {
  //       $('#overlay').css('display', 'none');
  //     }
  //   });

  //   // set keepalive parameters, omit if not using keepalive
  //   this.keepAlive.interval(15); // will ping at this interval while not idle, in seconds
  //   this.keepAlive.onPing.subscribe(() => this.lastPing = new Date()); // do something when it pings
  // }

  // reset() {
  //   this.idle.watch();
  //   this.timedOut = false;
  // }

  logout() {
    window.dispatchEvent(new CustomEvent('Log-out'))
  }

  /**
   * update the user activity.
   */
  postUserActivityData() {
    let data: any = {};
    data = {
      module: 'safetyAndSurveillance',
      level: 'unit',
      page: 'observations',
      feature: 'imageModal',
      data: this.userActivityData.safetyAndSurveillance.unit.observations
        .imageModal,
    };
    this.commonService.postUserActivityData(data).subscribe(
      (status) => {
        this.commonService.setUserActivityData();
      },
      (error) => { },
      () => { }
    );
  }

  newUserActivityData() {
    let url = window.location.href;
    this.moduleName = url.split('/')[3].split('-').join('_');
    this.levelName = url.split('/')[4]
    let data: any = {};
    data = { 'application': this.moduleName, 'level': this.levelName, 'plant_id': sessionStorage.getItem('selectedPlant') };
    this.commonService.newUserActivity(data).subscribe(data => {
    })
  }
    // code piece to call before refresh of page 
  @HostListener('window:beforeunload', ['$event'])   beforeUnloadHandler(event: Event) {     
    // sessionStorage.removeItem('obsNavDate')
  }   
  ngOnDestroy() {
    sessionStorage.removeItem('availableUnits')
    sessionStorage.removeItem('selectedUnits')
    sessionStorage.removeItem('manually-selected-units')
    sessionStorage.removeItem('selectedDateRange')
    sessionStorage.removeItem('obsNavDate')
    sessionStorage.removeItem('manuallySelectedPermits')
    sessionStorage.removeItem('selectedObservation');
    sessionStorage.removeItem('selectedActionNavigation');
    sessionStorage.removeItem('selectedIncidentNavigation');
    sessionStorage.removeItem('searchObservation');
    this.safetyAndSurveillanceDataService.passCurrentUnitPage('', false);
    this.subscription.unsubscribe();
  }
}
