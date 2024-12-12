import { Component, OnInit, HostListener, OnChanges, SimpleChanges, Output, EventEmitter, OnDestroy, ViewChildren, ElementRef, QueryList, Input, Renderer2 } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import * as $ from 'jquery';
import { assetUrl } from '../../../../single-spa/asset-url';
import * as singleSpa from 'single-spa';

import { CommonService } from '../../../common/common.service';
import { DataService } from '../../services/data.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
  selector: 'app-module-switcher',
  templateUrl: './module-switcher.component.html',
  styleUrls: ['./module-switcher.component.scss'],
})
export class ModuleSwitcherComponent implements OnInit, OnChanges, OnDestroy {

  @ViewChildren('itemDiv', { read: ElementRef }) itemDivs: QueryList<ElementRef>
  @Input() moduleName: any;
  @Input() navigatedFromAdmin : boolean;
  headerLogo: string = '';
  modules: any = [];
  selectedModule: string = '';
  filteredPlantModules: any = [];
  seletedPlant: any;
  userName: string = '';
  shortName: string = '';
  name: string = ''
  plants: any[] = []
  plantDetails: any;
  count: boolean = false;
  firstRoute: any;
  moduleRoute: any;
  currentRoute: any;
  currentModule: any;
  @Output() currentPlantName = new EventEmitter();
  allModules: any[] = []
  msg: string;
  moduleUnavailable: string = 'This module is not included in your current subscription package. To explore this feature and learn about subscription options, please contact your TPulse administrator or Detect Support (support@detecttechnologies.com).';
  moduleAccessLimited: string = 'You currently do not have permission to access this module. Please reach out to your TPulse administrator for access inquiries or additional information.'
  @HostListener('document:click', ['$event']) handleMouseEvent(event: any) {
    if (event.target.id != 'moduleSwitcher' && event.target.id != 'moduleSwitcherIcon') {
      // this.closeMenu();
    }
  }
  isControlTowerDashboardEnabled:boolean = false;
  isControlTowerDashboardViewEnabled:boolean = false;
  constructor(private commonService: CommonService, private router: Router, private dataService: DataService, private snackbarService: SnackbarService,private renderer: Renderer2, private elementRef: ElementRef) {
    this.router.events.subscribe((ev) => {

    });
  }
  ngOnChanges(changes: SimpleChanges): void {
    let allModules = JSON.parse(sessionStorage.getItem('selectedPlantAccessModules'))
    allModules?.forEach(ele => {
      ele?.modules?.forEach(ele1 => {
        if (ele1?.route_url?.split('/')[1] == this.moduleName?.split('/')[1]) {
          this.currentModule = ele1?.key
          sessionStorage.setItem('currentModule', this.currentModule)
          if(JSON.parse(sessionStorage.getItem('global-search-notification'))){
            let globalSearchObject = JSON.parse(sessionStorage.getItem('global-search-notification'))
            if(globalSearchObject.type == 'start_stream'){
              this.currentModule = 'live_streaming'
              sessionStorage.setItem('currentModule', this.currentModule)
              this.currentPlantName.emit(this.currentModule);
            }else{
              this.currentPlantName.emit(this.currentModule);
            }
          }else{
            this.currentPlantName.emit(this.currentModule);
          }
        }
      })
    })

    if(this.navigatedFromAdmin){
      let data = JSON.parse(sessionStorage.getItem("application-configuration"))
      this.headerLogo = assetUrl("Detect_Black.svg");
      this.modules = data['modules'];
      let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
      let selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
      // var plantModules = JSON.parse(sessionStorage.getItem('plantModules'));
      const myArrayFiltered = this.modules.filter((module) => {
          return selectedPlantDetails?.[0]?.application.some((application) => {
          return application.name.toLowerCase() === module.moduleName.toLowerCase();
       });        
      });
      // selectedPlantDetails?.[0]?.application.map((val,ind)=> selectedPlantDetails?.[0]?.application[ind]['moduleName'] == val.name)
      this.modules = myArrayFiltered
      // this.modules = selectedPlantDetails?.[0]?.application
      this.fetchSelectedModule();
      this.router.events.subscribe((routerData: any) => {
        this.fetchSelectedModule();
      });
    }
  }

  ngOnInit() {
    // sessionStorage.getItem('oldPlantId')
    this.currentRoute = sessionStorage.getItem('currentPath')
    this.currentModule = sessionStorage.getItem('currentModule')
    this.userName = sessionStorage.getItem('user-email');
    this.shortName = this.userName
      .split('@')[0]
      .slice(0, 1)
      .toUpperCase();
    this.name = sessionStorage.getItem('userName')
    this.plants = JSON.parse(sessionStorage.getItem('accessible-plants'));
    setTimeout(() => {
      this.plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      if (this.plantDetails?.id != sessionStorage.getItem('oldPlantId')) {
        // sessionStorage.setItem('oldPlantId', this.plantDetails?.id)
        sessionStorage.removeItem('routePath')
        sessionStorage.removeItem('currentModule')
        sessionStorage.removeItem('currentPath')
      }
      this.seletedPlant = sessionStorage.getItem('selectedPlant') ? Number(sessionStorage.getItem('selectedPlant')) : this.plantDetails?.id
      if(JSON.parse(sessionStorage.getItem('navigated-to-application'))){
        window.dispatchEvent(new CustomEvent('applicationWebSocket'));
      }
      this.getAllApplications(false)
    }, 1000)
    let data = JSON.parse(sessionStorage.getItem("application-configuration"))
    this.headerLogo = assetUrl("Detect_Black.svg");
    this.modules = data['modules'];
    var plantModules = JSON.parse(sessionStorage.getItem('plantModules'));
    const myArrayFiltered = this.modules.filter((module) => {
      return plantModules.some((application) => {
        return application.name.toLowerCase() === module.moduleName.toLowerCase();
      });
    });
    this.modules = myArrayFiltered
    this.fetchSelectedModule();
    this.router.events.subscribe((routerData: any) => {
      this.fetchSelectedModule();
    });
    // });
    if (this.plants.length >= 1) {
      this.count = false
    }
    else {
      this.count = true
    }
  }

  getAllApplications(booleanValue: boolean) {
    let selectedPalnt = this.plants.filter((plant) => {return this.seletedPlant == plant?.id})
    sessionStorage.setItem("plantName",selectedPalnt?.[0]?.name);
    sessionStorage.setItem('projectName',selectedPalnt?.[0]?.group_name)
    this.commonService.getAllApplications(this.seletedPlant).subscribe({
      next: (data: any) => {
        this.allModules = data
        let mod = this.allModules.map(i => i.modules)
        let mod1 = mod[0].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod2 = mod[1].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod3 = mod[2].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod4 = mod[3].sort((a, b) => (a.order < b.order) ? -1 : 1);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.getPlant(booleanValue)
        // if (sessionStorage.getItem('plantDetails')) {
        //   if (!sessionStorage.getItem('routePath') || booleanValue == true) {
        //     this.getPlant()
        //   }
        //   else {
        //     this.defalutLoad()
        //   }
        // }
        // else {
        //   sessionStorage.setItem('plantDetails', JSON.stringify(this.plants?.[0]))
        //   this.plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
        //   this.seletedPlant = sessionStorage.getItem('selectedPlant') ? Number(sessionStorage.getItem('selectedPlant')) : this.plantDetails?.id
        //   if (!sessionStorage.getItem('routePath')) {
        //     this.getPlant()
        //   }
        //   else {
        //     this.defalutLoad()
        //   }
        // }
      }
    })

    // singleSpa.navigateToUrl(sessionStorage.getItem('currentPath'));
  }
  fetchSelectedModule() {
    let url = window.location.pathname;
    let selectedModule: any = this.modules.filter(module => module.routeUrl.split('/')[1] === url.split('/')[1]);
    selectedModule = (selectedModule.length > 0) ? selectedModule[0].moduleName : '';
    this.selectedModule = (url.split('/').length > 0) ? selectedModule : '';
  }

  navigateToSelectedModule(moduleRoute: string, booleanValue: boolean, moduleKey: string) {
    sessionStorage.removeItem('availableUnits')
    sessionStorage.removeItem('selectedUnits')
    sessionStorage.setItem('selectedPlant', this.seletedPlant);
    sessionStorage.setItem('oldPlantId', this.seletedPlant);
    sessionStorage.removeItem('startAndEndDate')
    sessionStorage.removeItem('selectedActivePage')
    sessionStorage.removeItem('manually-selected-units')
    sessionStorage.removeItem('selectedDateRange')
    sessionStorage.removeItem('obsNavDate')
    sessionStorage.removeItem('manuallySelectedPermits')
    sessionStorage.removeItem('selectedObservation');
    sessionStorage.removeItem('selectedActionNavigation');
    sessionStorage.removeItem('selectedIncidentNavigation');
    sessionStorage.removeItem('searchObservation');  
    if( moduleRoute.includes('https://') && booleanValue === false) {
      window.open(moduleRoute,'_blank');
      return
    }
    if (booleanValue === false) {
      this.closeMenu(booleanValue);
      setTimeout(() => {
        let currPage = window.location.pathname;
        if (currPage.includes('vendor-management')) {
          let isVendor = JSON.parse(sessionStorage.getItem('vendor-login'));
          if (isVendor) {
            sessionStorage.setItem('routePath', '/vendor-management/vendor/inventory-form');
          }
          else {
            sessionStorage.setItem('routePath', '/vendor-management/client/dashboard');
          }
        }
        else {
          sessionStorage.setItem('routePath', moduleRoute)
        }
        sessionStorage.setItem('currentModule', moduleKey)
        sessionStorage.setItem('currentPath', window?.location?.pathname)
        this.currentRoute = moduleRoute
        this.currentModule = moduleKey
        this.currentPlantName.emit(this.currentModule);
        singleSpa.navigateToUrl(moduleRoute);
        window.location.reload();
      }, 1000)

      // window.location.reload();
    }
  }
  hasHttps(route_url: string): boolean {
    return route_url?.includes('https');
  }

  openMenu() {
    setTimeout(()=>{
      $('#mySidenav').css('width', '600px');
    }, 100)

  }

  

  closeMenu(booleanValue?) {

    if(sessionStorage.getItem('selectedPlant') != sessionStorage.getItem('oldPlantId')){
      sessionStorage.removeItem('startAndEndDate')
      sessionStorage.removeItem('selectedUnits')
      sessionStorage.removeItem('selectedActivePage')
    }

    $('#mySidenav').css('width', 0);

    if(booleanValue === false){
      $('#mySidenav').css('width', 0);
    }else if(booleanValue === true){

    // This function will run when the module switcher is closed without selecting any module after changing the plant from the dropdown.
    if(this.currentModule === null){

// Storing values in session storage allows us to remain on the same page or module even after refreshing, following the selection of a specific module from the module switcher.
    sessionStorage.setItem('oldPlantId', this.seletedPlant)
    sessionStorage.setItem('selectedPlant', this.seletedPlant)

    sessionStorage.removeItem('startAndEndDate')
    sessionStorage.removeItem('selectedUnits')
    sessionStorage.removeItem('selectedActivePage')

    let boolean = false;
    this.allModules?.forEach((val1, ind1) => {
      val1?.modules?.forEach((val2, ind2) => {
        if (val2?.disabled == false && boolean == false) {
          this.moduleRoute = val2
          boolean = true;
          let currPage = window.location.pathname;
          if (currPage.includes('vendor-management')) {
            let isVendor = JSON.parse(sessionStorage.getItem('vendor-login'));
            if (isVendor) {
              sessionStorage.setItem('routePath', '/vendor-management/vendor/inventory-form');
            }
            else {
              sessionStorage.setItem('routePath', '/vendor-management/client/dashboard');
            }
          }
          else {
            sessionStorage.setItem('routePath', this.moduleRoute?.route_url)
          }
          sessionStorage.setItem('currentModule', this.moduleRoute?.key)
          sessionStorage.setItem('currentPath', window?.location?.pathname)
          this.currentRoute = this.moduleRoute?.route_url
          this.currentModule = this.moduleRoute?.key
        }
      })
    })
    
    this.currentPlantName.emit(this.currentModule);
    if(JSON.parse(sessionStorage.getItem('navigated-to-application'))){
      window.dispatchEvent(new CustomEvent('applicationWebSocket'));
    }
    singleSpa.navigateToUrl(sessionStorage.getItem('routePath')); //navigates to the given path
    window.location.reload();
    }
  }

  }

  selectModule() {

  }
  getPlant(booleanValue) {
    if(booleanValue === true){
      this.currentModule= null;
    }
    let plants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    let selectedPlant = plants.map((plant)=>{
      if(plant?.id === this.seletedPlant){
       return plant
      }
    })
    selectedPlant = selectedPlant.filter(function( element ) {
      return element !== undefined;
    });
    if(selectedPlant?.[0].is_control_tower_dashboard_enabled && selectedPlant?.[0]?.is_control_tower_dashboard_view_enabled){
      sessionStorage.setItem('isControlTowerAccess',JSON.stringify(true))
      sessionStorage.setItem('projectName',selectedPlant?.[0].group_name)
    }else{
      sessionStorage.setItem('isControlTowerAccess',JSON.stringify(false))
    }
    if(selectedPlant?.[0]?.is_control_tower_dashboard_enabled){
      this.isControlTowerDashboardEnabled = true
    }else{
      this.isControlTowerDashboardEnabled = false
    }
    if(selectedPlant?.[0]?.is_control_tower_dashboard_view_enabled){
      this.isControlTowerDashboardViewEnabled = true
    }else{
      this.isControlTowerDashboardViewEnabled = false
    }
    this.allModules.forEach((val1, ind1) => {
      val1.modules.forEach((val2, ind2) => {
        this.allModules[ind1].modules[ind2].disabled = true;
      })
    })
    this.plants.forEach((val, ind) => {
      if (val.id == this.seletedPlant) {
        sessionStorage.setItem('plantDetails', JSON.stringify(val))
        this.plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      }
    })
    this.plantDetails?.application?.forEach((val, ind) => {
      this.allModules?.forEach((val1, ind1) => {
        val1?.modules?.forEach((val2, ind2) => {
          if (val?.key == val2?.key) {
            this.allModules[ind1].modules[ind2].disabled = false
          }
        })
      })
    })
    if(!booleanValue){
    let selectedModule = JSON.parse(sessionStorage.getItem('selectedModuleNavigation'))
    if (selectedModule?.module) {
      sessionStorage.setItem('oldPlantId', this.seletedPlant)
      this.allModules?.forEach(ele => {
        ele?.modules?.forEach(ele1 => {
          if (ele1?.route_url?.includes(selectedModule?.module)) {
            let url = sessionStorage.getItem('url') + ele1?.route_url
            let currPage = window.location.pathname;
            if (currPage.includes('vendor-management')) {
              let isVendor = JSON.parse(sessionStorage.getItem('vendor-login'));
              if (isVendor) {
                sessionStorage.setItem('routePath', '/vendor-management/vendor/inventory-form');
              }
              else {
                sessionStorage.setItem('routePath', '/vendor-management/client/dashboard');
              }
            }
            else {
              sessionStorage.setItem('routePath', ele1?.route_url)
            }
            sessionStorage.setItem('currentModule', ele1?.key)
            if (currPage.includes('vendor-management')) {
              let isVendor = JSON.parse(sessionStorage.getItem('vendor-login'));
              if (isVendor) {
                sessionStorage.setItem('currentPath', '/vendor-management/vendor/inventory-form');
              }
              else {
                sessionStorage.setItem('currentPath', '/vendor-management/client/dashboard');
              }
            }
            else {
              sessionStorage.setItem('currentPath', ele1?.route_url)
            }
            sessionStorage.removeItem('selectedModuleNavigation')
            this.currentModule = ele1?.key
          }
        })
      })
    } else {
      if (this.seletedPlant != sessionStorage.getItem('oldPlantId')) {
        sessionStorage.setItem('oldPlantId', this.seletedPlant)
        sessionStorage.setItem('selectedPlant', this.seletedPlant)
        let boolean = false;
        this.allModules?.forEach((val1, ind1) => {
          val1?.modules?.forEach((val2, ind2) => {
            if (val2?.disabled == false && boolean == false) {
              this.moduleRoute = val2
              boolean = true;
              let currPage = window.location.pathname;
              if (currPage.includes('vendor-management')) {
                let isVendor = JSON.parse(sessionStorage.getItem('vendor-login'));
                if (isVendor) {
                  sessionStorage.setItem('routePath', '/vendor-management/vendor/inventory-form');
                }
                else {
                  sessionStorage.setItem('routePath', '/vendor-management/client/dashboard');
                }
              }
              else {
                if(!JSON.parse(sessionStorage.getItem('global-search-notification'))){
                  sessionStorage.setItem('routePath', this.moduleRoute?.route_url)
                }
              }
              if(JSON.parse(sessionStorage.getItem('isControlTowerAccess'))){
                sessionStorage.setItem('routePath', 'central-tower/dashboard');
                sessionStorage.setItem('currentPath', 'central-tower/dashboard')
                this.currentRoute = 'central-tower/dashboard'
                this.currentModule = 'central-tower'
              }else{
                sessionStorage.setItem('currentModule', this.moduleRoute?.key)
                sessionStorage.setItem('currentPath', window?.location?.pathname)
                this.currentRoute = this.moduleRoute?.route_url
                this.currentModule = this.moduleRoute?.key
              }
            }
          })
        })
      }
    }
    // sessionStorage.setItem('selectedPlant', this.plantDetails?.id)
    // this.allModules?.forEach((val1, ind1) => {
    //   val1?.modules?.forEach((val2, ind2) => {
    //     if (val2?.disabled == false && this.firstRoute?.key?.length == 0) {
    //       this.firstRoute = val2
    //     }
    //   })
    // })
    // this.firstRoute = this.plantDetails?.application?.[0]
    // this.plantDetails?.application?.forEach((val, ind) => {
    //   if (val.key == 'safety_and_surveillance') {
    //     this.firstRoute = val
    //   }
    // })
    // this.currentModule = sessionStorage.getItem('currentModule')

    if(JSON.parse(sessionStorage.getItem('global-search-notification'))){
      let globalSearchObject = JSON.parse(sessionStorage.getItem('global-search-notification'))
      if(globalSearchObject.type == 'start_stream'){
        this.currentModule = 'live_streaming'
        sessionStorage.setItem('currentModule', this.currentModule)
        this.currentPlantName.emit(this.currentModule);
      }else{
        this.currentPlantName.emit(this.currentModule);
      }
    }else{
      this.currentPlantName.emit(this.currentModule);
    }
    singleSpa.navigateToUrl(sessionStorage.getItem('routePath'));

    if (booleanValue) {
      sessionStorage.setItem('selectedPlant', this.seletedPlant);
      sessionStorage.removeItem('routePath')
      sessionStorage.removeItem('currentModule')
      sessionStorage.removeItem('currentPath')
      // window.location.reload();
    }
    
    setTimeout(() => {
      if (booleanValue) {
        window.location.reload();
      }
      
    }, 2000);
  }
}

  defalutLoad() {
    this.allModules.forEach((val1, ind1) => {
      val1.modules.forEach((val2, ind2) => {
        this.allModules[ind1].modules[ind2].disabled = true;
      })
    })
    this.plants.forEach((val, ind) => {
      if (val.id == this.seletedPlant) {
        sessionStorage.setItem('plantDetails', JSON.stringify(val))
        this.plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      }
    })
    this.plantDetails?.application?.forEach((val, ind) => {
      this.allModules?.forEach((val1, ind1) => {
        val1?.modules?.forEach((val2, ind2) => {
          if (val?.key == val2?.key) {
            this.allModules[ind1].modules[ind2].disabled = false
          }
        })
      })
    })
    if (this.currentModule) {
      this.currentPlantName.emit(this.currentModule);
      this.seletedPlant = sessionStorage.getItem('selectedPlant') ? Number(sessionStorage.getItem('selectedPlant')) : this.plantDetails?.id
      singleSpa.navigateToUrl(sessionStorage.getItem('currentPath'));
    } else {
      if (sessionStorage.getItem('selectedPlant') != this.seletedPlant) {
        let boolean = false;
        this.allModules?.forEach((val1, ind1) => {
          val1?.modules?.forEach((val2, ind2) => {
            if (val2?.disabled == false && boolean == false) {
              this.moduleRoute = val2
              boolean = true;
              let currPage = window.location.pathname;
              if (currPage.includes('vendor-management')) {
                let isVendor = JSON.parse(sessionStorage.getItem('vendor-login'));
                if (isVendor) {
                  sessionStorage.setItem('routePath', '/vendor-management/vendor/inventory-form');
                }
                else {
                  sessionStorage.setItem('routePath', '/vendor-management/client/dashboard');
                }
              }
              else {
                sessionStorage.setItem('routePath', this.moduleRoute?.route_url)
              }
              sessionStorage.setItem('currentModule', this.moduleRoute?.key)
              sessionStorage.setItem('currentPath', window?.location?.pathname)
              this.currentRoute = this.moduleRoute?.route_url
              this.currentModule = this.moduleRoute?.key
              this.currentPlantName.emit(this.currentModule);
              singleSpa.navigateToUrl(sessionStorage.getItem('routePath'));
            }
          })
        })
      }
    }
  }

  getTopPosition(item, i, j) {
    let id = item + i + j
    let position = document.getElementById(id).getBoundingClientRect();
    let topPosition = 0;
    if (this.allModules?.length != (i + 1)) {
      topPosition = position.y + 85
    } else {
      topPosition = position.y - 70
    }
    return topPosition

  }

  getLeftPosition(item, i, j) {
    let id = item + i + j
    var left = document.getElementById(id).offsetLeft;
    return left + 10
  }

  // when we click on outside of the module switcher, the the module switcher should close and perform the actiosn accordingly 
  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if (!(event.target as HTMLElement).closest('#mySidenav')) {
      
      this.seletedPlant = Number(sessionStorage.getItem('selectedPlant'));
      this.currentModule = sessionStorage.getItem('currentModule');
      this.allModules.forEach((val1, ind1) => {
        val1.modules.forEach((val2, ind2) => {
          this.allModules[ind1].modules[ind2].disabled = true;
        })
      })
      this.plants.forEach((val, ind) => {
        if (val.id == this.seletedPlant) {
          sessionStorage.setItem('plantDetails', JSON.stringify(val))
          this.plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
        }
      })
      this.plantDetails?.application?.forEach((val, ind) => {
        this.allModules?.forEach((val1, ind1) => {
          val1?.modules?.forEach((val2, ind2) => {
            if (val?.key == val2?.key) {
              this.allModules[ind1].modules[ind2].disabled = false
            }
          })
        })
      })
      $('#mySidenav').css('width', 0);
    }
  }

  navigateToCentralTower(){
    sessionStorage.removeItem('availableUnits')
    sessionStorage.removeItem('selectedUnits')
    sessionStorage.setItem('selectedPlant', this.seletedPlant);
    sessionStorage.setItem('oldPlantId', this.seletedPlant);
    sessionStorage.removeItem('startAndEndDate')
    sessionStorage.removeItem('selectedActivePage')
    sessionStorage.removeItem('manually-selected-units')
    sessionStorage.removeItem('selectedDateRange')
    sessionStorage.removeItem('obsNavDate')
    sessionStorage.removeItem('manuallySelectedPermits')
    sessionStorage.removeItem('selectedObservation');
    sessionStorage.removeItem('selectedActionNavigation');
    sessionStorage.removeItem('selectedIncidentNavigation');
    sessionStorage.removeItem('searchObservation');  
    sessionStorage.setItem('routePath', 'central-tower/dashboard');
    singleSpa.navigateToUrl(sessionStorage.getItem('routePath'));
    sessionStorage.setItem('currentModule','central-tower')
    this.currentPlantName.emit(this.currentModule);
    window.location.reload();
  }
  
  ngOnDestroy() {
    sessionStorage.removeItem('routePath')
  }

}
