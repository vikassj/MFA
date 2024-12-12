import { Component } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { CognitoService } from "./cognito.service";
import { HttpService } from "./http.service";
import { DataService } from "./data.service";
import { SnackbarService } from "./snackbar.service";
import { CommonService } from "./common.service";
import { MatomoTracker } from "@ngx-matomo/tracker";
import jwt_decode from 'jwt-decode';

@Component({
  selector: "auth-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "angular-cognito";
  isAuthenticated: boolean;
  currentPath: string = "";
  siteConfigLoaded: boolean = false
  plantDetails: any;

  constructor(
    private router: Router,
    private cognitoService: CognitoService,
    private httpService: HttpService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private commonService: CommonService,
    private readonly tracker: MatomoTracker) {
    this.router.events.subscribe((event: any) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.url;
      }
    });
  }

  public ngOnInit(): void {
    let userId = sessionStorage.getItem('user-email');
    if (userId) {
      this.tracker.setUserId(userId);
    }
    this.httpService.getCompanyConfigData().subscribe((data: any) => {
      sessionStorage.setItem("company-id", JSON.stringify(data.id))
      sessionStorage.setItem('site-config', JSON.stringify(data.configuration))
      sessionStorage.setItem('region', JSON.stringify(data.region));


    },
      (err) => {
      },
      () => {
        this.siteConfigLoaded = true;
        this.httpService.setConfigurations();

        if (window.location.hash != '') {
          sessionStorage.setItem('access-token', window.location.hash.split('#')[1].split('&')[1].split('=')[1])
          this.getAcessiblePlants();

          var accessToken = sessionStorage.getItem('access-token');
          var decodedAccessToken: any = jwt_decode(accessToken)
          sessionStorage.setItem('user-email', decodedAccessToken.email);
          this.tracker.setCustomVariable(1, 'E-mail', decodedAccessToken.email, 'visit');
          sessionStorage.setItem("userLoggedIn", JSON.stringify(true));
          sessionStorage.setItem("welcomeMsgShown", JSON.stringify(false));

        }
      })
  }

  public signOut(): void {

  }
  public getAcessiblePlants() {

    this.httpService.getUserAccessDetails().subscribe(
      (data: any) => {
        this.cognitoService.getAvailablePlantDetails(data);
        sessionStorage.setItem("userGroup", JSON.stringify(data.access_type));
        if (data.is_it_manager == true) {
          sessionStorage.setItem("itManager_access", JSON.stringify(true))
        }
        else {
          sessionStorage.setItem("itManager_access", JSON.stringify(false))

        }
        if (data.is_admin == true || data.is_it_manager == true) {
          if(data.is_admin == true){
            sessionStorage.setItem("admin-access", JSON.stringify(true));
          }else{
            sessionStorage.setItem("admin-access", JSON.stringify(false));
          }
          sessionStorage.setItem(
            "accessible-plants",
            JSON.stringify(data.plant_access)
          );
          window.dispatchEvent(
            new CustomEvent("admin-login", {
              detail: { navigateToApp: false },
            })
          )
        } else {
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
              data.plant_access.forEach((obj, i)=>{
                if(obj.application.length > 0 && plantIndex == -1){
                  plantIndex = i
                }
              })
              plantIndex = plantIndex;
              if (plantIndex > -1) {
                sessionStorage.setItem("selectedPlant", data.plant_access[plantIndex].id);
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
                      if (module.identifier.split("-").join('_').toLowerCase() == ApiModule.key.toLowerCase()) {
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
              }
            } else {
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
          } else {
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
          sessionStorage.setItem("userLoggedIn", JSON.stringify(true));
        }
      },
      (err) => {

        sessionStorage.setItem("userLoggedIn", JSON.stringify(false));
        var msg = "User is not registered with T-Pulse, Please contact Administrator";
        this.snackbarService.show(msg, true, false, false, false);
        sessionStorage.clear();
        window.addEventListener("click", (evt: any) => {
          window.location.assign(window.location.href.split('#')[0]);
        });
      },
      () => {

        this.fetchPlantDetails();
      }
    );
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
        window.dispatchEvent(new CustomEvent('plant-selected'));
        this.dataService.passSpinnerFlag(false, true);
      }
    );
  }
}


