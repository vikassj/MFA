import { Component } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { CommonService } from './services/common.service';
import { DataService } from './services/data.service';
import { HttpService } from './services/http.service';
import { MatomoTracker } from '@ngx-matomo/tracker';

declare var $: any

@Component({
  selector: 'central-dashboard-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'central-dashboard';

  plantDetails: any[] = [];
  plantModules: any[] = [];
  selectedPlantDetails: any[] = [];
  showNoPlants: boolean = false;
  showNoApplications: boolean = false;
  centralDashboard: boolean = false;
  vendorCentralDashboard: boolean = false;
  hasHsseAccess: boolean;

  constructor(
    private router: Router,
    private httpService: HttpService,
    private dataService: DataService,
    private commonService: CommonService,
    private readonly tracker: MatomoTracker
  ) {
    this.router.events.subscribe((ev) => {
      if(ev) {
        if(!(sessionStorage.getItem("access-token") || sessionStorage.getItem("vm-access-token") )) {
          window.dispatchEvent(new CustomEvent("Log-out"))
        }
      }
    })
   }

  apiUrl: string = sessionStorage.getItem('apiUrl') || '';

  ngOnInit() {
    let userId = sessionStorage.getItem('user-email');
    if (userId) {
      this.tracker.setUserId(userId);
    }
    var nullMenuItems = [];
    nullMenuItems.push('a')
    sessionStorage.setItem('menuItems', nullMenuItems.toString())
    this.dataService.passSpinnerFlag(true, true);
    this.httpService.getCompanyDetails().subscribe((data: any) => {
      sessionStorage.setItem("company-name", data.name);
      sessionStorage.setItem('cdPlantName', data.name);
    });

    if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
      this.vendorCentralDashboard = true;
      this.centralDashboard = false;
    } else {
      this.vendorCentralDashboard = false;
      this.centralDashboard = true;
    }
    if (JSON.parse(sessionStorage.getItem("accessible-plants"))) {
      this.plantDetails = JSON.parse(sessionStorage.getItem("accessible-plants"))
    } else {
      this.showNoPlants = true;
    }
    this.dataService.passSpinnerFlag(false, true)
  }

  selectPlant(plantId: any, plantName: any) {
    if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
      sessionStorage.setItem('selectedPlant', plantId);
      sessionStorage.setItem('plantName', plantName);
      // this.fetchPlantDetails();
      window.dispatchEvent(new CustomEvent("vendor-module", { detail: { "navigateToApp": true } }));
    } else {
      sessionStorage.setItem('selectedPlant', plantId);

      this.apiUrl = sessionStorage.getItem('apiUrl') || '';
      var selectedPlantApiUrl = this.apiUrl?.concat(
        sessionStorage.getItem('selectedPlant') + '/' || ''
      );
      console.log(selectedPlantApiUrl);
      sessionStorage.setItem('selectedPlantApiUrl', selectedPlantApiUrl || '');


      this.selectedPlantDetails = this.plantDetails.filter(
        (plant: any) => plant.id == sessionStorage.getItem('selectedPlant')
      );
      console.log(
        'this.selectedPlantDetails' + JSON.stringify(this.selectedPlantDetails)
      );

      if (this.selectedPlantDetails[0].application.length > 0) {
        sessionStorage.setItem(
          'plantModules',
          JSON.stringify(this.selectedPlantDetails[0].application)
        );
      } else {
      }
      sessionStorage.setItem('plantName', this.selectedPlantDetails[0].name);
      var modules = JSON.parse(sessionStorage.getItem('modules'));
      var plantModules = JSON.parse(sessionStorage.getItem('plantModules'));
      // const myArrayFiltered = modules.filter((module) => {
      //   return plantModules.some((application) => {
      //     return (
      //       application.name.toLowerCase() === module.moduleName.toLowerCase()
      //     );
      //   });
      // });
      const myArrayFiltered = []
      modules.forEach(module => {
        plantModules.forEach(ApiModule => {
          if (module.identifier.split("-").join('_').toLowerCase() == ApiModule.key.toLowerCase()) {
            module['is_permitted'] = ApiModule['is_permitted'];
            module['id'] = ApiModule['id'];
            myArrayFiltered.push(module);
          }
        });
      });
      sessionStorage.setItem(
        'accessible-modules',
        JSON.stringify(myArrayFiltered)
      );
      this.hasHsseAccess = myArrayFiltered.some((application) => {
        if(application.identifier == 'safety-and-surveillance') {
          return true;
        } else {
          return false;
        }
      })
      if(this.hasHsseAccess) {
        this.fetchPlantDetails();
      } else {
        if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
          window.dispatchEvent(new CustomEvent("vendor-module", { detail: { "navigateToApp": true } }));
        } else {
          window.dispatchEvent(new CustomEvent('plant-selected'));
          this.dataService.passSpinnerFlag(false, true);
        }
      }
      sessionStorage.setItem('navigated-to-application', JSON.stringify(true));
    }
    sessionStorage.setItem('show-central-dashboard', JSON.stringify(true))
  }

  fetchPlantDetails() {
    this.commonService.fetchPlantDetails().subscribe(
      (plantData: any) => {
        let plantDetials: any = plantData;
        plantDetials.start_date = plantData.start_date;
        plantDetials.end_date = plantData.end_date;
        sessionStorage.setItem('plantDetails', JSON.stringify(plantData));

        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);

      },
      () => {
        if (sessionStorage.getItem('vendor-login') == 'true' || sessionStorage.getItem('vendor-login')) {
          window.dispatchEvent(new CustomEvent("vendor-module", { detail: { "navigateToApp": true } }));
        } else {
          window.dispatchEvent(new CustomEvent('plant-selected'));
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    );
  }
}
