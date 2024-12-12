import { Component, Input, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { Subject, Subscription } from 'rxjs';

import { CommonService } from '../../services/common.service';
import { DataService } from '../../services/data.service';
import { assetUrl } from 'src/single-spa/asset-url';
import { LoginService } from '../../services/login.service';
import { SnackbarService } from '../../services/snackbar.service';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  @Input() moduleDetails: any = '';
  @Input() menuItems: any = [];
  private apiCallSubject = new Subject<any>();
  msg: string = '';
  show2FA: boolean = false;
  headerLogo: string = '';
  clientName: string = '';
  headerName: string = '';
  headerUrl: string = '';
  moduleUrl: string = '';
  currentPage: any;
  currentPageWithNoMenuItems: any;
  userName: string = '';
  userName1: string[] = [];
  shortName: string = '';
  userGroup: any = [];
  subscription: Subscription = new Subscription();
  navigatedToCentralDashboard: string = 'false';
  navigatedToApplication: string = 'false';
  showCD: any;
  ShowNotifications: boolean = true;
  analyticsFound: boolean;
  notificationFound: boolean;
  showChangePassword: boolean = true;
  ShowNavigateToHome: boolean = false;
  plantDetails: any;
  showNoPlants: boolean;
  adminAccess: boolean = false;
  isItManagerAccess: boolean = false;
  actionFound: boolean;
  selectedUrl: string;
  currentPlant: any;
  selectedPlantData: any;
  windowPath: any
  vendorLoginUrl:string = '';
  validateVendor: boolean = false;
  moduleName: any;
  saNotificationCount: number = 0;
  navigatedFromAdmin:boolean = false
  constructor(
    public router: Router,
    public commonService: CommonService,
    private dataService: DataService,
    private loginService: LoginService,
    private snackbarService: SnackbarService
  ) {
    this.apiCallSubject.pipe(
      debounceTime(500),
    ).subscribe(response => {
      this.commonService.unreadNotifications().subscribe((data:any) => {
        if(window.location.pathname.includes('productivity-monitoring')){
          this.saNotificationCount = data?.unread_notification_count
        }else{
          this.saNotificationCount = data['unread_notifications_count']
        }
      })
    });
    window.addEventListener('notifications_count_updated', (evt) => {
      this.saNotificationCount = Number(sessionStorage.getItem('notifications_count'))
    })
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd || ev instanceof NavigationStart) {
        setTimeout(() => {
          if (sessionStorage.getItem('accessible-modules')) {
            const accessibleModules = JSON.parse(sessionStorage.getItem('accessible-modules'));
            if (accessibleModules.length > 0) {
              const currentModule = accessibleModules.filter(module => window.location.href.includes(module['routeUrl'].split('/')[1]));
              if (currentModule?.[0]?.['is_permitted'] == false) {
                window.dispatchEvent(
                  new CustomEvent("license-expired", {
                    detail: { navigateToApp: false },
                  })
                );
              }
            }
          }
        }, 1000);
        this.selectedUrl = window.location.pathname
        if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('admin-access') == 'true') {
          this.adminAccess = true;
        } else {
          this.adminAccess = false;
        }
        if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('itManager_access') == 'true') {
          this.isItManagerAccess = true;
        } else {
          this.isItManagerAccess = false;
        }
        if (!(window.location.href.split("/").includes("cognito-auth"))) {
          if (JSON.parse(sessionStorage.getItem('accessible-plants')).length > 1 && !(window.location.href.split("/").includes('central-dashboard')) && !window.location.href.split("/").includes('admin-app')) {
            sessionStorage.setItem('show-central-dashboard', JSON.stringify(true))
          } else {
            sessionStorage.setItem('show-central-dashboard', JSON.stringify(false))
          }
          this.showCD = sessionStorage.getItem('show-central-dashboard');
        }


        if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('admin-access') == 'true') {
          this.adminAccess = true;
        } else {
          this.adminAccess = false;
        }
        if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('itManager_access') == 'true') {
          this.isItManagerAccess = true;
        } else {
          this.isItManagerAccess = false;
        }
        if (window.location.href.split("/").includes('admin-app')) {
          this.showCD = "false"
          sessionStorage.setItem('navigated-to-application', JSON.stringify(false));
          this.ShowNavigateToHome = true;
          this.showChangePassword = false;
          this.ShowNotifications = false;
          if (sessionStorage.getItem('itManager_access') == 'true') {
            this.isItManagerAccess = true;
          } else {
            this.isItManagerAccess = false;
          }
          if (sessionStorage.getItem('admin-access') == 'true') {
            this.adminAccess = true;
          } else {
            this.adminAccess = false;
          }

        } else {
          this.showCD = sessionStorage.getItem('show-central-dashboard')
          this.ShowNavigateToHome = false;
          this.showChangePassword = true;
        }
        if (window.location.href.split("/").includes('central-dashboard')) {
          this.ShowNotifications = false;
        } else {
          this.ShowNotifications = true;
        }
        this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
          this.analyticsFound = data['module_configurations']['application_features']['analytics_found'];
          this.actionFound = data['module_configurations']['application_features']['action_found'];
        });

        let data = JSON.parse(sessionStorage.getItem("application-configuration"))
        this.notificationFound = data['notificationFound']
        setTimeout(() => {
          this.passCurrentPage();
        }, 200);
        if(!window.location.pathname.split("/").includes("live-streaming")){
          // removing LS sessionStorage data
          sessionStorage.removeItem('LSFilter');
          sessionStorage.removeItem('startAndEndDate');
          sessionStorage.removeItem('selectedLSPageNumber');
          sessionStorage.removeItem('selectedVideos');
          sessionStorage.removeItem('selectedLSType');
          sessionStorage.removeItem('selectedLSUnitItems');
          sessionStorage.removeItem('selectedVideoData');
        }
        this.readModuleConfigurations()
      }
      /**
     * gets the unread notifications count.
     */
      this.apiCallSubject.next();
    })

    window.addEventListener('navigated-from-admin', (event:any) => {
      this.navigatedToApplication = sessionStorage.getItem('navigated-to-application')
      this.navigatedFromAdmin = true
      this.navigatePlantDetails(event.detail);
      window.location.reload()
      // this.fetchPlantDetails(event.detail);
    })

  }

  ngOnInit() {
    this.vendorLoginUrl = sessionStorage.getItem('url') + 'vendor-auth/signin'
    this.windowPath = window?.location?.pathname
    this.selectedPlantData = JSON.parse(sessionStorage.getItem('plantDetails'))
    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.analyticsFound = data['module_configurations']['application_features']['analytics_found'];
      this.actionFound = data['module_configurations']['application_features']['action_found'];
    });
    this.commonService.readModuleConfigurationsData('application').subscribe(data => {
      this.notificationFound = data['notificationFound']
    });

    let data = JSON.parse(sessionStorage.getItem("application-configuration"))
    this.notificationFound = data['notificationFound']

    this.checkNavigation();
    if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
      this.ShowNotifications = false;
    }
    if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('admin-access') == 'true') {
      this.adminAccess = true;
    } else {
      this.adminAccess = false;
    }
    if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('itManager_access') == 'true') {
      this.isItManagerAccess = true;
    } else {
      this.isItManagerAccess = false;
    }
    if (JSON.parse(sessionStorage.getItem('accessible-plants')).length > 1 && !(window.location.href.split("/").includes('central-dashboard')) && !window.location.href.split("/").includes('admin-app')) {
      sessionStorage.setItem('show-central-dashboard', JSON.stringify(true))
    } else {
      sessionStorage.setItem('show-central-dashboard', JSON.stringify(false))
    }
    this.showCD = sessionStorage.getItem('show-central-dashboard');
    this.headerLogo = JSON.parse(
      sessionStorage.getItem('site-config')
    ).central_dashboard_logo;
    this.readModuleConfigurations()
  }

  navigateToHome() {

    if (window.location.pathname.split("/").includes("vendor-management")) {
      if ((window.location.pathname.split('/')[2]).includes("client")) {
        var currentModule = window.location.pathname.split('/')[2];
        this.router.navigateByUrl('/' + 'vendor-management/' + currentModule + '/dashboard');
      } else {
        var currentModule = window.location.pathname.split('/')[2];
        this.router.navigateByUrl('/' + 'vendor-management/' + currentModule + '/inventory-form');
      }
    }
    else {
    let permitAccess:boolean
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    accessiblePlants.forEach((plant,ind)=>{
     if(plant.access_type.includes('permit_log_page_view_access')){
      permitAccess = true;
     }
    })
      var currentModule = window.location.pathname.split('/')[1];
      if (currentModule == 'admin-app') {
        if (this.adminAccess)
          this.router.navigateByUrl('/' + currentModule + '/uam');
        else if (this.isItManagerAccess) {
          this.router.navigateByUrl('/' + currentModule + '/uam?camera=true');
        }else if (permitAccess) {
          this.router.navigateByUrl('/' + currentModule + 'uam?permit=true');
        }
      } else {
        this.router.navigateByUrl('/' + currentModule + '/dashboard');
      }
    }
  }

  ngOnChanges() {
    if (this.menuItems.length > 0 && this.moduleDetails) {
      this.passCurrentPage();
    }
  }

  getHeaderLogo() {
    var plants: any[] = JSON.parse(sessionStorage.getItem("accessible-plants"));
    var plant = plants.filter(obj => obj.id == sessionStorage.getItem('selectedPlant'))
    this.headerLogo = assetUrl(plant[0].url_path + ".png")
  }

  ngAfterViewInit() {
    this.passCurrentPage();
  }

  onMenuClick(page: string, menu: string) {
    if (this.menuItems.length > 0) {

      if (screen.width < 992) {
        let element: any = document.getElementById('navbar-toggler');
        element.click();
      }

      if (page === '2fa') {
        let userData = JSON.parse(sessionStorage.getItem('userData') as string);
        userData.page = 'settings';
        sessionStorage.setItem('userData', JSON.stringify(userData));
        this.router.navigateByUrl('/auth/two-fact-auth');
      }
      this.currentPage = this.menuItems.find(
        (d: any) => menu.toLowerCase() === d.identifier
      ).name;
    } else {
      if (screen.width < 992) {
        let element: any = document.getElementById('navbar-toggler');
        element.click();
      }
      if (page === '2fa') {
        let userData = JSON.parse(sessionStorage.getItem('userData') as string);
        userData.page = 'settings';
        sessionStorage.setItem('userData', JSON.stringify(userData));
        this.router.navigateByUrl('/auth/two-fact-auth');
      }
      this.currentPage = this.menuItems.find(
        (d: any) => menu.toLowerCase() === d.identifier
      ).name;
    }
    this.passCurrentPage()
  }

  passCurrentPage() {
    setTimeout(()=>{
    if (this.menuItems.length > 0) {
      let url = window.location.href;
      if (url.split('/')[3] === 'vendor-management') {
        this.currentPage = this.menuItems.find((menu: any) =>
          url.split('/')[5].includes(menu.identifier)
        );
      } else {
        this.currentPage = this.menuItems.find((menu: any) =>
          url.split('/')[4]?.includes(menu.identifier)
        );

      }
      this.currentPage = this.currentPage ? this.currentPage.name : '';
      this.dataService.passSpinnerFlag(false, true)
    }},300)
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  navigateToCentralDashboard() {
    if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('admin-access') == 'true') {
      this.adminAccess = true;
    } else {
      this.adminAccess = false;
    }
    if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('itManager_access') == 'true') {
      this.isItManagerAccess = true;
    } else {
      this.isItManagerAccess = false;
    }
    this.clientName = sessionStorage.getItem("company-name");
    this.headerName = 'Central Dashboard';
    this.ShowNotifications = false;
    this.headerLogo = assetUrl("detectLogo.png");
    sessionStorage.setItem('show-central-dashboard', JSON.stringify(false));
    sessionStorage.setItem("navigated-to-application", JSON.stringify(false))
    window.dispatchEvent(new CustomEvent('central-dashboard'))
    this.menuItems = [];
    this.checkNavigation();
    sessionStorage.setItem('menuItems', '');
  }

  checkNavigation() {
    this.navigatedToApplication = sessionStorage.getItem(
      'navigated-to-application'
    );
  }

  getCompanyName(): any {
    this.commonService.getCompanyDetails().subscribe((data: any) => {
      this.clientName = data.name;
      sessionStorage.setItem('company-name', data.name);
      return data.name;
    });
  }

  logout() {
    if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
      window.dispatchEvent(new CustomEvent('vendor-log-out'))
    } else {
      window.dispatchEvent(new CustomEvent('invalidate-session'));
      this.dataService.passFeedBackFlag(false);
    }
  }

  selectItem(routePath: string) {
    this.selectedUrl = routePath;
    let pathname = window.location.pathname.split('/');
    let moduleName = '';
    if (pathname[1] == 'safety-and-surveillance') {
      moduleName = 'HSSE';
    } else if (pathname[1] == 'manpower-counting') {
      moduleName = 'OM';
    } else if (pathname[1] == 'live-streaming') {
      moduleName = 'LS';
    } else if (pathname[1] == 'employee-wellness') {
      moduleName = 'EM';
    } else if (pathname[1] == 'vendor-management') {
      moduleName = 'VM';
    } else if (pathname[1] == 'admin-app') {
      moduleName = 'Admin';
      if (this.isItManagerAccess && !this.adminAccess) {

        if (!routePath?.includes('help') && routePath?.includes('uam')) {
          routePath = routePath + '?camera=true'
          this.selectedUrl = routePath;
        }
      }
    }

    let exit_url = '';
    if (pathname.length > 3) {
      exit_url = moduleName + '/' + (pathname[2] == 'highlights' ? 'sif' : pathname[2]) + '/' + pathname[3]
    } else {
      exit_url = moduleName + '/' + (pathname[2] == 'highlights' ? 'sif' : pathname[2])
    }
    let url = exit_url.split('/')
    let modifiedUrl = '';
    url.forEach((ele, i) => {
      if (url.length == (i + 1)) {
        modifiedUrl = modifiedUrl + '' + (ele == 'dashboard' ? 'home' : ele)
      } else {
        modifiedUrl = modifiedUrl + '' + ele + '/'
      }
    })
    exit_url = modifiedUrl
    if (window.location.pathname != routePath) {
      if (sessionStorage.getItem('feedbackTriggers') == 'true') {
        this.dataService.passTriggerEvent('exit_intent_url', exit_url);
        this.dataService.passNavigateEvent(false);
      } else {
        this.dataService.passNavigateEvent(true);
      }

    }
    // this.subscription.add(this.dataService.getNavigateEvent.subscribe(data => {
    //   if (data.type || routePath.split("/").includes("admin-app")) {
    // setTimeout(()=>{
    this.router.navigateByUrl(this.selectedUrl).then((data: any) => {
      this.dataService.passSpinnerFlag(true, true)
      // if (routePath.split('/').indexOf('help') > -1) {
      // }
      this.passCurrentPage();
    });
    // }, 100)
    //   }
    // }))
  }

  getCurrentPage() {
    var currentPage = window.location.pathname.substring(
      window.location.pathname.lastIndexOf('/') + 1
    );

    currentPage = currentPage.charAt(0).toUpperCase() + currentPage.slice(1);
    this.currentPageWithNoMenuItems = currentPage;
    this.onMenuClick('', currentPage);
  }

  resetPassword() {
    window.dispatchEvent(
      new CustomEvent('change-password', { detail: 'changePassword' })
    );
    sessionStorage.removeItem('menuItems');
  }

  get notificationCount() {
    return sessionStorage.getItem('unreadNotificationCount')

  }
  readModuleConfigurations() {
    if (!(window.location.href.split("/").includes("cognito-auth"))) {
      this.checkNavigation();
      this.showCD = sessionStorage.getItem('show-central-dashboard');
      if (sessionStorage.getItem("application-configuration")) {
        let data = JSON.parse(sessionStorage.getItem("application-configuration"))
        if ((!(window.location.href.split("/").includes("central-dashboard"))) && (!(window.location.href.split("/").includes("admin-app")))) {
          setTimeout(() => {
            this.clientName = sessionStorage.getItem('plantName');
          }, 100);

          this.userGroup = sessionStorage.getItem('access-type');
          this.userName = sessionStorage.getItem('user-email');
          this.userName1 = this.userName.split('.');
          this.shortName = this.userName
            .split('@')[0]
            .slice(0, 1)
            .toUpperCase();
          this.headerLogo = JSON.parse(
            sessionStorage.getItem('site-config')
          ).central_dashboard_logo;
          let path = window.location.pathname;
          let vendorDetails = JSON.parse(sessionStorage.getItem('vendor-management-client-configurations'))?.['module_configurations']?.['application_features']?.['enable_vendor_redirection']
          if(path.includes('/vendor-management/client/') && vendorDetails){
            this.validateVendor = true
          }
          else{
            this.validateVendor = false
          }
          sessionStorage.setItem('routePath', window.location.pathname)
          sessionStorage.setItem('currentPath', window.location.pathname)
          if(!window.location.pathname.includes('safety-and-surveillance')){
            sessionStorage.removeItem('startAndEndDate')
            sessionStorage.removeItem('selectedUnits')
            sessionStorage.removeItem('fliterData')
          }
          this.moduleUrl = window.location.pathname.split('/')[1];
          this.headerName = data['modules'].find((module) =>
            module.routeUrl.includes(this.moduleUrl)
          ).moduleName;
          let module = data['modules'].find((module) =>
            module.routeUrl.includes(this.moduleUrl)
          )
          this.moduleName = window.location.pathname

          this.headerUrl = data['modules'].find((module) =>
            module.routeUrl.includes(this.moduleUrl)
          ).routeUrl;
          this.router.events.subscribe((routerData: any) => {
            this.passCurrentPage();
            this.moduleUrl = window.location.pathname.split('/')[1];
            this.headerName = data['modules'].find((module) =>
              module.routeUrl.includes(this.moduleUrl)
            ).moduleName;
            this.headerUrl = data['modules'].find((module) =>
              module.routeUrl.includes(this.moduleUrl)
            ).routeUrl;
            this.subscription.add(
              this.dataService.getCurrentPage.subscribe((currentPage) => {
                if (currentPage.validFlag) {
                  this.currentPage = currentPage.currentPage;
                }
              })
            );
          });
        } else {
          if (!(sessionStorage.getItem('company-name')) || sessionStorage.getItem('company-name') == null) {
            this.getCompanyName();
          } else {
            this.clientName = sessionStorage.getItem('company-name')
          }
          this.headerName = 'Central Dashboard';
          this.navigatedToApplication = 'false'
          this.showCD = "false"
        }
      } else {
        this.commonService.readConfigurationsData().subscribe((data) => {
          if (!(window.location.href.split("/").includes("central-dashboard"))) {
            setTimeout(() => {
              this.clientName = sessionStorage.getItem('plantName');
            }, 100);
            this.headerName = data['modules'].find((module) =>
              module.routeUrl.includes(this.moduleUrl)
            ).moduleName;
            this.userGroup = sessionStorage.getItem('access-type');
            this.userName = sessionStorage.getItem('user-email');
            this.userName1 = this.userName.split('.');
            this.shortName = this.userName
              .split('@')[0]
              .slice(0, 1)
              .toUpperCase();
            this.headerLogo = JSON.parse(
              sessionStorage.getItem('site-config')
            ).central_dashboard_logo;
            this.moduleUrl = window.location.pathname.split('/')[1];

            this.headerUrl = data['modules'].find((module) =>
              module.routeUrl.includes(this.moduleUrl)
            ).routeUrl;
            this.router.events.subscribe((routerData: any) => {
              this.passCurrentPage();
              this.moduleUrl = window.location.pathname.split('/')[1];
              this.headerName = data['modules'].find((module) =>
                module.routeUrl.includes(this.moduleUrl)
              ).moduleName;
              this.headerUrl = data['modules'].find((module) =>
                module.routeUrl.includes(this.moduleUrl)
              ).routeUrl;
              this.subscription.add(
                this.dataService.getCurrentPage.subscribe((currentPage) => {
                  if (currentPage.validFlag) {
                    this.currentPage = currentPage.currentPage;
                  }
                })
              );
            });
          } else {
            if (!(sessionStorage.getItem('company-name')) || sessionStorage.getItem('company-name') == null) {
              this.getCompanyName();
            } else {
              this.clientName = sessionStorage.getItem('company-name')
            }
            this.headerName = 'Central Dashboard';
            this.navigatedToApplication = 'false'
            this.showCD = "false"
          }
        });
      }
      this.checkNavigation();
      this.headerLogo = JSON.parse(
        sessionStorage.getItem('site-config')
      ).central_dashboard_logo;
      this.userName = sessionStorage.getItem('user-email');
      this.userName1 = this.userName.split('.');
      this.shortName = this.userName.split('@')[0].slice(0, 1).toUpperCase();
      sessionStorage.setItem('userName', this.userName.split('@')[0]);
      if (window.location.href.split("/").includes("admin-app")) {
        if (!(sessionStorage.getItem('company-name')) || sessionStorage.getItem('company-name') == null) {
          this.getCompanyName();
        } else {
          this.clientName = sessionStorage.getItem('company-name')
        }
        this.headerName = 'Admin';
        this.showChangePassword = false;
        this.navigatedToApplication = 'false'
        this.ShowNotifications = false;
        this.ShowNavigateToHome = true;
        this.showCD = "false"
      }
    }
  }

  fetchPlantDetails(plant_id?) {
    // Get selected plant details
    let plantId = null;
    let selectedPlantDetails = {}
    this.loginService.fetchPlantDetails().subscribe(
      (plantData: any) => {
        let plantDetials: any = plantData;
        plantDetials.start_date = plantData.start_date;
        plantDetials.end_date = plantData.end_date;
        sessionStorage.setItem("plantDetails", JSON.stringify(plantData));
        // if(JSON.parse(sessionStorage.getItem('global-search-notification'))){
        //   plantId = plant_id
        // }else{
        let data = JSON.parse(sessionStorage.getItem('accessible-plants'))
        data?.forEach(ele =>{
          if(ele?.application?.length > 0 && !plantId){
            plantId = ele.id
            selectedPlantDetails = ele
          }
        })
        // }
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
      },
      () => {
        this.commonService.getAllApplications(plantId).subscribe({
          next: (plant: any) => {
            let allModules = plant
            let mod = allModules.map(i => i.modules)
            let mod1 = mod[0].sort((a, b) => (a.order < b.order) ? -1 : 1);
            let mod2 = mod[1].sort((a, b) => (a.order < b.order) ? -1 : 1);
            let mod3 = mod[2].sort((a, b) => (a.order < b.order) ? -1 : 1);
            let mod4 = mod[3].sort((a, b) => (a.order < b.order) ? -1 : 1);
            allModules.forEach((val1, ind1) => {
              val1.modules.forEach((val2, ind2) => {
                allModules[ind1].modules[ind2].disabled = true;
              })
            })
            let plantDetails = selectedPlantDetails['application']
            plantDetails?.forEach((val, ind) => {
              allModules?.forEach((val1, ind1) => {
                val1?.modules?.forEach((val2, ind2) => {
                  if (val?.key == val2?.key) {
                    allModules[ind1].modules[ind2].disabled = false
                  }
                })
              })
            })
            sessionStorage.setItem('selectedPlantAccessModules', JSON.stringify(allModules))
          },
          error: () => {
            this.dataService.passSpinnerFlag(false, true);
            this.msg = 'Error occured. Please try again.';
            this.snackbarService.show(this.msg, true, false, false, false);
          },
          complete: () => {
            window.dispatchEvent(
              new CustomEvent("successful-sign-in", {
                detail: { navigateToApp: true },
              })
            );
            this.dataService.passSpinnerFlag(false, true);
          }
        })
        this.dataService.passSpinnerFlag(false, true);
      }
    );
  }

  navigatePlantDetails(plantId){
    let selectedPlantDetails = {}
        let data = JSON.parse(sessionStorage.getItem('accessible-plants'))
        data?.forEach(ele =>{
          if(ele?.application?.length > 0 && !plantId){
            plantId = ele.id
            selectedPlantDetails = ele
          }
      })
    this.commonService.getAllApplications(plantId).subscribe({
      next: (plant: any) => {
        let allModules = plant
        let mod = allModules.map(i => i.modules)
        let mod1 = mod[0].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod2 = mod[1].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod3 = mod[2].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod4 = mod[3].sort((a, b) => (a.order < b.order) ? -1 : 1);
        allModules.forEach((val1, ind1) => {
          val1.modules.forEach((val2, ind2) => {
            allModules[ind1].modules[ind2].disabled = true;
          })
        })
        let plantDetails = selectedPlantDetails['application']
        plantDetails?.forEach((val, ind) => {
          allModules?.forEach((val1, ind1) => {
            val1?.modules?.forEach((val2, ind2) => {
              if (val?.key == val2?.key) {
                allModules[ind1].modules[ind2].disabled = false
              }
            })
          })
        })
        sessionStorage.setItem('selectedPlantAccessModules', JSON.stringify(allModules))
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }

  navigateToApp() {
    this.loginService.getUserAccessDetails().subscribe(
      (data: any) => {
        sessionStorage.setItem("userGroup", JSON.stringify(data.access_type));
        if (data.plant_access.length > 0) {
          sessionStorage.setItem("role-name", data.role_name);
          sessionStorage.setItem("access-level", data.access_level);
          this.plantDetails = data.plant_access;
          sessionStorage.setItem(
            "accessible-plants",
            JSON.stringify(data.plant_access)
          );
          if (data.plant_access.length >= 1) {
            let plantIndex = -1;
            data.plant_access.forEach((obj, i) => {
              if (obj.application.length > 0 && plantIndex == -1) {
                plantIndex = i
              }
            })
            plantIndex = plantIndex;
            if(plantIndex > -1){
              if(JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))){
                let selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
                sessionStorage.setItem('selectedPlant',selectedStreamNavigation?.plant_id)
               }else{
                
                let plants = JSON.parse(sessionStorage.getItem('accessible-plants'))
                let selectedPlant = plants.map((plant)=>{
                  if(plant?.is_control_tower_dashboard_enabled && plant?.is_control_tower_dashboard_view_enabled){
                    return plant
                  }
                })
                selectedPlant = selectedPlant.filter(function( element ) {
                  return element !== undefined;
                 });
                if(selectedPlant.length > 0){
                  sessionStorage.setItem("selectedPlant", selectedPlant[0]?.id);
                  sessionStorage.setItem('controlTowerModuleName',selectedPlant[0]?.control_tower_dashboard_name)
                  this.headerName = sessionStorage.getItem('controlTowerModuleName')
                  sessionStorage.setItem("isControlTowerAccess",JSON.stringify(true))
                  sessionStorage.setItem('projectName',selectedPlant?.[0].group_name)
                }else{
                  sessionStorage.setItem("selectedPlant", data.plant_access[plantIndex].id);
                  sessionStorage.setItem("isControlTowerAccess",JSON.stringify(false))
                }
              }
              // this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );
              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = []
                modules.forEach(module => {
                  plantModules.forEach(ApiModule => {
                    if (module?.identifier?.split("-")?.join('_')?.toLowerCase() == ApiModule?.key?.toLowerCase()) {
                      module['is_permitted'] = ApiModule['is_permitted'];
                      module['id'] = ApiModule['id'];
                      myArrayFiltered.push(module);
                    }
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                this.fetchPlantDetails();
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(false)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }else{
              this.dataService.passSpinnerFlag(false, true)
              var msg = 'No application access for this user.'
              this.snackbarService.show(msg, false, false, false, true);
            }
          } else {
            if (sessionStorage.getItem('selectedObservation')) {
              var selectedObservation = JSON.parse(sessionStorage.getItem('selectedObservation'))
              sessionStorage.setItem("selectedPlant", selectedObservation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );

              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = modules.filter((module) => {
                  return plantModules.some((application) => {
                    return (
                      application.key.toLowerCase() ===
                      module.identifier.split("-").join("_").toLowerCase()
                    );
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else if (sessionStorage.getItem('selectedActionNavigation')) {
              var selectedActionNavigation = JSON.parse(sessionStorage.getItem('selectedActionNavigation'))
              sessionStorage.setItem("selectedPlant", selectedActionNavigation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );
              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = []
                modules.forEach(module => {
                  plantModules.forEach(ApiModule => {
                    if (module.moduleName.toLowerCase() == ApiModule.name.toLowerCase()) {
                      module['is_permitted'] = ApiModule['is_permitted'];
                      module['id'] = ApiModule['id'];
                      myArrayFiltered.push(module);
                    }
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else if (sessionStorage.getItem('selectedIncidentNavigation')) {
              var selectedIncidentNavigation = JSON.parse(sessionStorage.getItem('selectedIncidentNavigation'))
              sessionStorage.setItem("selectedPlant", selectedIncidentNavigation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );
              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = []
                modules.forEach(module => {
                  plantModules.forEach(ApiModule => {
                    if (module.moduleName.toLowerCase() == ApiModule.name.toLowerCase()) {
                      module['is_permitted'] = ApiModule['is_permitted'];
                      module['id'] = ApiModule['id'];
                      myArrayFiltered.push(module);
                    }
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else if (sessionStorage.getItem('selectedScaLsaObservation')) {
              var selectedScaLsaObservation = JSON.parse(sessionStorage.getItem('selectedScaLsaObservation'))
              sessionStorage.setItem("selectedPlant", selectedScaLsaObservation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );

              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = modules.filter((module) => {
                  return plantModules.some((application) => {
                    return (
                      application.key.toLowerCase() ===
                      module.identifier.split("-").join("_").toLowerCase()
                    );
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else if (sessionStorage.getItem('selectedScaLsaActionNavigation')) {
              var selectedScaLsaActionNavigation = JSON.parse(sessionStorage.getItem('selectedScaLsaActionNavigation'))
              sessionStorage.setItem("selectedPlant", selectedScaLsaActionNavigation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );
              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = []
                modules.forEach(module => {
                  plantModules.forEach(ApiModule => {
                    if (module.moduleName.toLowerCase() == ApiModule.name.toLowerCase()) {
                      module['is_permitted'] = ApiModule['is_permitted'];
                      module['id'] = ApiModule['id'];
                      myArrayFiltered.push(module);
                    }
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else if (sessionStorage.getItem('selectedScaLsaIncidentNavigation')) {
              var selectedScaLsaIncidentNavigation = JSON.parse(sessionStorage.getItem('selectedScaLsaIncidentNavigation'))
              sessionStorage.setItem("selectedPlant", selectedScaLsaIncidentNavigation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );
              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = []
                modules.forEach(module => {
                  plantModules.forEach(ApiModule => {
                    if (module.moduleName.toLowerCase() == ApiModule.name.toLowerCase()) {
                      module['is_permitted'] = ApiModule['is_permitted'];
                      module['id'] = ApiModule['id'];
                      myArrayFiltered.push(module);
                    }
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else if (sessionStorage.getItem('selectedStreamNavigation')) {
              var selectedStreamNavigation = JSON.parse(sessionStorage.getItem('selectedStreamNavigation'))
              sessionStorage.setItem("selectedPlant", selectedStreamNavigation.plant_id);
              this.fetchPlantDetails();
              var apiUrl = sessionStorage.getItem("apiUrl") || "";
              var selectedPlantApiUrl = apiUrl?.concat(
                sessionStorage.getItem("selectedPlant") + "/" || ""
              );
              sessionStorage.setItem(
                "selectedPlantApiUrl",
                selectedPlantApiUrl || ""
              );
              var selectedPlantDetails = this.plantDetails.filter(
                (plant: any) =>
                  plant.id == sessionStorage.getItem("selectedPlant")
              );
              if (selectedPlantDetails[0].application.length > 0) {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem("plantName", selectedPlantDetails[0].name);
                var modules = JSON.parse(sessionStorage.getItem("modules"));
                var plantModules = JSON.parse(
                  sessionStorage.getItem("plantModules")
                );
                const myArrayFiltered = []
                modules.forEach(module => {
                  plantModules.forEach(ApiModule => {
                    if (module.moduleName.toLowerCase() == ApiModule.name.toLowerCase()) {
                      module['is_permitted'] = ApiModule['is_permitted'];
                      module['id'] = ApiModule['id'];
                      myArrayFiltered.push(module);
                    }
                  });
                });
                sessionStorage.setItem(
                  "accessible-modules",
                  JSON.stringify(myArrayFiltered)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: true },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                sessionStorage.setItem(
                  "navigated-to-application",
                  JSON.stringify(true)
                );
              } else {
                sessionStorage.setItem(
                  "plantModules",
                  JSON.stringify(selectedPlantDetails[0].application)
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
                window.dispatchEvent(
                  new CustomEvent("successful-sign-in", {
                    detail: { navigateToApp: false },
                  })
                );
                sessionStorage.setItem(
                  "show-central-dashboard",
                  JSON.stringify(true)
                );
              }
            }
            else {
              sessionStorage.setItem(
                "show-central-dashboard",
                JSON.stringify(true)
              );
              window.dispatchEvent(
                new CustomEvent("successful-sign-in", {
                  detail: { navigateToApp: false },
                })
              );
            }
          }
        } else {
          this.dataService.passSpinnerFlag(false, true)
          var msg = 'No plants found for this user.'
          this.snackbarService.show(msg, false, false, false, true);
          // this.showNoPlants = true;
          // sessionStorage.setItem(
          //   "show-central-dashboard",
          //   JSON.stringify(true)
          // );
          // window.dispatchEvent(
          //   new CustomEvent("successful-sign-in", {
          //     detail: { navigateToApp: false },
          //   })
          // );
        }
        sessionStorage.setItem("userLoggedIn", JSON.stringify(true));
        this.dataService.passSpinnerFlag(false, true);
      },
      (err) => {
        if (err.statusText == "Unknown Error") {
          sessionStorage.setItem("userLoggedIn", JSON.stringify(false));
          var msg = "Error occured. Please try again.";
          this.snackbarService.show(msg, true, false, false, false);
          sessionStorage.clear();
          window.addEventListener("click", (evt: any) => {
            window.location.reload();
          });
          this.dataService.passSpinnerFlag(false, true);
        } else {
          sessionStorage.setItem("userLoggedIn", JSON.stringify(false));
          var msg =
            "User is not registered with T-Pulse, Please contact Administrator";
          this.snackbarService.show(msg, true, false, false, false);
          sessionStorage.clear();
          window.addEventListener("click", (evt: any) => {
            window.location.reload();
          });
          this.dataService.passSpinnerFlag(false, true);
        }
      },
      () => {
        if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('admin-access') == 'true') {
          this.adminAccess = true;
        } else {
          this.adminAccess = false;
        }
        if (!window.location.href.split("/").includes('admin-app') && sessionStorage.getItem('itManager_access') == 'true') {
          this.isItManagerAccess = true;
        } else {
          this.isItManagerAccess = false;
        }
      }
    );
  }

  validation() {
    if (this.headerName.toLowerCase() == 'safety assistant' || this.headerName.toLowerCase() == 'safety and surveillance') {
      return true
    } else {
      return false
    }
  }
  navigateToAdminPortal() {
    window.dispatchEvent(new CustomEvent('admin-login'))
  }

  navigateToNotification() {
    window.dispatchEvent(new CustomEvent('notification-settings'));
  }




  onDataChange(data) {
    if(data){
    let plants = JSON.parse(sessionStorage.getItem('accessible-plants'));
    let seletedPlant = Number(sessionStorage.getItem('selectedPlant'));
    plants.forEach((val, ind) => {
      if (val.id == seletedPlant) {
        sessionStorage.setItem('plantDetails', JSON.stringify(val))
      }
    })
    this.selectedPlantData = JSON.parse(sessionStorage.getItem('plantDetails'))
    // this.selectedPlantData?.application?.forEach((val, ind) => {
    //   if (val.key == data) {
    //     this.currentPlant = data
    //   }
    // })
    let allModules = JSON.parse(sessionStorage.getItem('selectedPlantAccessModules'))
    allModules?.forEach(ele =>{
          ele?.modules?.forEach(ele1 =>{
            if(ele1.key == data){
              this.currentPlant = ele1.name
            }
          })
        })
    }
    if(JSON.parse(sessionStorage.getItem('isControlTowerAccess')) && window.location.href.split("/").includes('central-tower')){
      this.currentPlant = sessionStorage.getItem('controlTowerModuleName')
    }
  }

  saNotificationCountFormat(){
    if(this.saNotificationCount > 999){
      return '999+';
    }else{
      return this.saNotificationCount;
    }
  }
      
  checkModulesAccess() {
    var applicationValues = JSON.parse(sessionStorage.getItem('permitPlantMap'))
    var hasModules = applicationValues.map(plant => plant.modulesAccess).some(value => value)
    if(hasModules) {
      return true;
    } else {
      return false;
    }
  }
}
