import { Component, HostListener, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';
import { Subscription } from 'rxjs';
declare var $: any;

import { CommonService } from './common/common.service';

import jwt_decode from 'jwt-decode';
import { DataService } from './shared/services/data.service';
import { LocationStrategy } from '@angular/common';
import { SnackbarService } from './shared/services/snackbar.service';
import { LoginService } from './shared/services/login.service';


@Component({
  selector: 'container-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e) {
    this.idle.watch();
  }


  msg: string = '';
  defaultModule: string = '';
  setInterval: any;
  dataRefreshInterval: number = 0;
  appTimeout: number = null;
  appTimeoutCutOff: number = null;
  timedOut: boolean = false;
  idleState: string = "NOT_STARTED";
  countdown?: number = null;
  lastPing?: Date = null;
  showWelcomeMessage: boolean = false;
  showContactUs: boolean = false;
  subscription: Subscription = new Subscription();
  userLoggedIn: boolean = false;
  currentModule: string = '';
  moduleDetails: any;
  menuItems: any = [];
  currentPath: string = '';
  browserRefresh: boolean = false;
  showContactUsError: boolean = false;
  showSnackbar: boolean = false;
  menuItemsPresent: boolean = false;
  showHeader: boolean = false;
  showFeedback: boolean = false;

  loggedIn: boolean = false;

  constructor(
    private router: Router,
    private idle: Idle,
    private keepAlive: Keepalive,
    private commonService: CommonService,
    private dataService: DataService,
    private location: LocationStrategy,
    private snackbarService: SnackbarService,
    private loginService: LoginService
  ) {
    this.dataService.passFeedBackFlag(false);
    window.addEventListener('load-dashboard', (ev) => {
      this.readModuleConfigurations();
    })
    window.addEventListener("submit_feedback", (evt) => {
      this.showSnackbar = true;
      setTimeout(() => {
        this.showSnackbar = false;
      }, 4000)
    })

    window.addEventListener('on-video-play', (ev) => {
      this.idle.stop();
    })
    setInterval(() => {
      if (sessionStorage.getItem('access-token')) {
        this.loginService.checkUserSession().subscribe((data: any) => {
          if (!data) {
            window.dispatchEvent(new CustomEvent("invalidate-session"))
          }
        },
          (err) => {
            if (err.status == 403) {
              window.dispatchEvent(new CustomEvent('Log-out'))
            }
          },
          () => {
          })
      }
    }, 30000)

    this.router.events.subscribe((ev) => {
      this.checkUserLoggedIn();
      if (ev instanceof NavigationStart || ev instanceof NavigationEnd) {
        let data = JSON.parse(sessionStorage.getItem("application-configuration"))
        let pathname = window.location.pathname;
        this.showContactUs = pathname.includes('help') ? true : false;
        this.defaultModule = data?.['defaultModule'];
        this.dataRefreshInterval = data?.['userActivityPushInterval'];
        this.subscription.add($('.modal-backdrop').remove());
        sessionStorage.removeItem('redirectUrl');
        let url = window.location.pathname;
        this.showContactUs = url.includes('help') ? true : false;
        this.readModuleConfigurations();
        if (sessionStorage.getItem('access-token')) {
          this.loggedIn = true;
          this.startAppTimeout();
        } else {
          this.loggedIn = false;
        }
      }
    });

    window.addEventListener('invalidate-session', (evt) => {
      this.loginService.userLogout().subscribe((data) => {
      },
        (err) => {

        },
        () => {
          window.dispatchEvent(new CustomEvent('Log-out'))
        })
    })
  }

  ngOnInit() {
    this.readModuleConfigurations();
    let data = JSON.parse(sessionStorage.getItem("application-configuration"))
    let pathname = window.location.pathname;
    this.showContactUs = pathname.includes('help') ? true : false;
    this.router.events.subscribe((data) => {
      if (data['navigationTrigger']) {
        this.showContactUs = data['url'].includes('help') ? true : false;
      }
    });
    sessionStorage.setItem('url', data?.['url']);
    sessionStorage.setItem('apiUrl', data?.['apiUrl']);
    sessionStorage.setItem('wsUrl', data?.['websocketUrl']);
    this.defaultModule = data?.['defaultModule'];
    this.appTimeout = data?.['appTimeout'];
    this.appTimeoutCutOff = data?.['appTimeoutCutOff'];
    if (this.appTimeout != null) {
    }
    this.dataRefreshInterval = data?.['userActivityPushInterval'];
    this.subscription.add($('.modal-backdrop').remove());
    sessionStorage.removeItem('redirectUrl');
    let url = window.location.pathname;
    this.showContactUs = url.includes('help') ? true : false;
    this.readModuleConfigurations();

    if (window.location.href.split('#') != null) {
      this.checkUserLoggedIn();
    } else {
      this.checkUserLoggedIn();
    }
  }

  ngAfterViewInit() {
    this.readModuleConfigurations();
    let data = JSON.parse(sessionStorage.getItem("application-configuration"))
    let pathname = window.location.pathname;
    this.showContactUs = pathname.includes('help') ? true : false;
    this.router.events.subscribe((data) => {
      if (data['navigationTrigger']) {
        this.showContactUs = data['url'].includes('help') ? true : false;
      }
    });
    this.defaultModule = data?.['defaultModule'];
    if (this.appTimeout != null) {
    }
    this.dataRefreshInterval = data?.['userActivityPushInterval'];
    this.subscription.add($('.modal-backdrop').remove());
    sessionStorage.removeItem('redirectUrl');
    let url = window.location.pathname;
    this.showContactUs = url.includes('help') ? true : false;
    this.readModuleConfigurations();

    if (window.location.href.split('#') != null) {
      this.checkUserLoggedIn();
    } else {
      this.checkUserLoggedIn();
    }
  }

  readModuleConfigurations() {
    let url = window.location.href;
    if (this.currentModule != url.split('/')[3]) {
      this.currentModule = url.split('/')[3];
      if (this.currentModule.includes('safety-and-surveillance')) {
        this.currentModule = this.currentModule.split('#')[0];
      } else {
        this.currentModule = this.currentModule;
      }
      this.commonService.readConfigurationsData().subscribe((data) => {
        sessionStorage.setItem("application-configuration", JSON.stringify(data))
        this.moduleDetails = data['modules'].find(
          (module: any) => module.identifier === this.currentModule
        );
      });
      this.commonService
        .readModuleConfigurationsData(this.currentModule)
        .subscribe((moduleData: any) => {
          this.menuItems = moduleData['module_configurations']['application_header'];
          this.menuItems = this.menuItems.filter(menu => menu.show_hide);
          sessionStorage.setItem('menuItems', JSON.stringify(this.menuItems));
        });
    }
  }

  reset() {
    this.idle.watch();
    this.timedOut = false;
  }

  logout() {
    window.dispatchEvent(new CustomEvent("invalidate-session"))
    this.dataService.passFeedBackFlag(false);
  }

  getAccessTokenFromAzureLogin() {
    //getting ACCESS_TOKEN and ID_TOKEN from url if the user is logged in from azure ad.
    var access_token = window.location.hash
      .substring(1)
      .split('&')[0]
      .split('=')[1];
    var id_token = window.location.hash
      .substring(1)
      .split('&')[1]
      .split('=')[1];
    sessionStorage.setItem('access-token-from-azure', access_token);
    sessionStorage.setItem('id-token-from-azure', id_token);

    //setting user email if the user is logged in from azure ad.
    var decodedToken: any = jwt_decode(
      sessionStorage.getItem('id-token-from-azure')
    );
    sessionStorage.setItem('user-email', decodedToken.identities[0].userId);
    sessionStorage.setItem('userLoggedIn', JSON.stringify(true));

    return true;
  }

  checkUserLoggedIn() {
    if (sessionStorage.getItem('access-token')) {
      this.userLoggedIn = true;
      if (window.location.href.split("/").includes("cognito-auth") || window.location.href.split("/").includes("vendor-auth")) {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }
      if (window.location.href.split("/").includes("cognito-auth") || window.location.href.split("/").includes("vendor-auth") || window.location.href.split("/").includes("central-dashboard") || window.location.href.split("/").includes("admin-app")) {
        this.showFeedback = false;
      } else {
        this.showFeedback = true;
      }
    } else {
      if (window.location.href.split("/").includes("cognito-auth") || window.location.href.split("/").includes("vendor-auth")) {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }
      if (window.location.href.split("/").includes("cognito-auth") || window.location.href.split("/").includes("vendor-auth") || window.location.href.split("/").includes("central-dashboard") || window.location.href.split("/").includes("admin-app")) {
        this.showFeedback = false;
      } else {
        this.showFeedback = true;
      }
      this.userLoggedIn = false;
    }
  }

  startAppTimeout() {

    // this.appTimeout = JSON.parse(sessionStorage.getItem('site-config')).dashboard_timeout_interval
    // this.appTimeoutCutOff = JSON.parse(sessionStorage.getItem('site-config')).dashboard_logout_showtime_interval

    this.appTimeout = JSON.parse(sessionStorage.getItem('site-config')).dashboard_timeout_interval;
    this.appTimeoutCutOff = JSON.parse(sessionStorage.getItem('site-config')).dashboard_logout_showtime_interval;
    // ng-idle code /////
    this.idle.setIdle(this.appTimeout); // how long can they be inactive before considered idle, in seconds
    this.idle.setTimeout(this.appTimeoutCutOff); // how long can they be idle before considered timed out, in seconds

    // this.idle.setIdle(this.appTimeout); // how long can they be inactive before considered idle, in seconds
    // this.idle.setTimeout(this.appTimeoutCutOff); // how long can they be idle before considered timed out, in seconds
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES); // provide sources that will "interrupt" aka provide events indicating the user is active

    // do something when the user becomes idle
    this.idle.onIdleStart.subscribe(() => {
      this.showSnackbar = true
      setTimeout(() => {
        this.msg = 'Logging out after ' + (this.appTimeout / 60) + ' minutes of inactivity.';
        this.snackbarService.show(this.msg, false, false, false, false);
      }, 100);
    });


    // do something when the user is no longer idle
    this.idle.onIdleEnd.subscribe(() => {
      // cd.detectChanges(); // how do i avoid this kludge?
      this.showSnackbar = false;
      this.countdown = null;
      $('#overlay').css('display', 'none');
      this.idle.watch();
    });


    // do something when the user has timed out
    this.idle.onTimeout.subscribe(() => {
      this.showSnackbar = true;
      this.timedOut = true;
      if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
        window.dispatchEvent(new CustomEvent('vendor-log-out'))
      } else {
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('invalidate-session'));
        }, 200);
      }
      this.msg = 'You have been logged out because of inactivity.';
      if (document.getElementsByClassName("modal-backdrop").length > 0) {
        document.getElementsByClassName("modal-backdrop")[0].classList.remove("modal-backdrop")
      }
      this.snackbarService.show(this.msg, false, false, false, false);
    });


    // do something as the timeout countdown does its thing
    this.idle.onTimeoutWarning.subscribe(seconds => {
      this.countdown = seconds;
      if (this.countdown <= this.appTimeoutCutOff) {
        $('#overlay').css('display', 'block');
      }
      else {
        $('#overlay').css('display', 'none');
      }
    });

    // set keepalive parameters, omit if not using keepalive
    this.keepAlive.interval(15); // will ping at this interval while not idle, in seconds
    this.keepAlive.onPing.subscribe(() => this.lastPing = new Date()); // do something when it pings


    // Start watching for the user to become idle.
    this.idle.watch();
  }
}
