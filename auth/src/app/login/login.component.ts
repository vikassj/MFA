import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { CognitoService, IUser } from "../cognito.service";
import { DataService } from "../data.service";
import { SnackbarService } from "../snackbar.service";
import { HttpService } from "../http.service";
import jwt_decode from 'jwt-decode';
import { CommonService } from "../common.service";
import { MatomoTracker } from "@ngx-matomo/tracker";
// import { LoginService } from '../../services/login.service';
// import { SnackbarService } from '../../../../shared/services/snackbar.service';
// import { CommonService } from '../../../../shared/services/common.service';
// import { DataService } from '../../../../shared/services/data.service';

declare let $: any;
@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  host: {
    class: "componentCss m-auto",
  },
})
export class LoginComponent implements OnInit {

  msg: string = "";
  defaultModule: string = "";
  username: string = "";
  password: string = "";
  showPassword: boolean = false;
  showTermsConditions = false;
  returnUrl: string = "";
  server_url: string = "";

  loading: boolean;
  user: IUser;
  isIframe = false;
  loginDisplay = false;

  isSignUpScreen: boolean = false;

  plantDetails: any;
  showNoPlants: boolean;

  siteConfig: any;

  constructor(
    private route: ActivatedRoute,
    private cognitoService: CognitoService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private httpService: HttpService,
    private commonService: CommonService,
    private readonly tracker: MatomoTracker
  ) {
    this.loading = false;
    this.user = {} as IUser;
    this.siteConfig = JSON.parse(sessionStorage.getItem('site-config'))

  }

  public signIn(): void {
    this.dataService.passSpinnerFlag(true, true);
    var cognitoDetails = JSON.parse(sessionStorage.getItem('cognito-details'))
    if ((this.user.email == null || '') && (this.user.password == null || '')) {
      this.commonService.sendMatomoEvent('Failed login', 'Login');
      this.dataService.passSpinnerFlag(false, true)
      var msg = 'Please enter credentials';
      this.snackbarService.show(msg, false, false, false, false)
    } else {
      this.dataService.passSpinnerFlag(false, true)
      this.httpService.checkUser(this.user.email).subscribe((data) => {
        if (data) {
          this.cognitoService
            .signIn(this.user)
            .then((data: any) => {
              var loggedIn: Event;
              this.dataService.passSpinnerFlag(false, true);
            })
            .catch(() => {
              this.commonService.sendMatomoEvent('Failed login', 'Login');
              this.dataService.passSpinnerFlag(false, true);
              this.msg = "Error occured. Please try again.";
              this.snackbarService.show(this.msg, true, false, false, false);
            });
        } else {
          this.dataService.passSpinnerFlag(false, true)
          this.commonService.sendMatomoEvent('Failed login', 'Login');
          var msg = "User is not registered with T-Pulse, Please contact Administrator."
          this.snackbarService.show(msg, true, false, false, false)
        }
      });

    }
  }

  public signUp(): void {
    var signUp: Event;
    window.dispatchEvent(new CustomEvent("sign-up", { detail: signUp }));
  }

  public signInWithAzure() {
    this.commonService.sendMatomoEvent('Interest in using SSO feature', 'SSO');
    // dev userpool SSO
    // window.location.assign(
    //   "https://mfa-angular-test.auth.ap-northeast-1.amazoncognito.com/oauth2/authorize?identity_provider=Azure-AD&redirect_uri=http://localhost:4200/cognito-auth/sign-in&response_type=TOKEN&client_id=4lcm5vn5dnohscmjsda24ihkln&scope=openid"
    // );

    // QA userpool SSO
    window.location.assign(
      this.siteConfig.sso_url
    );

    // Vedanta userpool SSO
    // window.location.assign(
    //   "https://tpulse-vedanta.auth.ap-south-1.amazoncognito.com/oauth2/authorize?identity_provider=Vedanta-Azure-AD&redirect_uri=https://tpulse-vedanta.detectpl.com/cognito-auth/sign-in&response_type=TOKEN&client_id=772ujmitl41i1l4nfg7llv1ms9&scope=openid"
    // );

    //UAT userpool SSO
    // window.location.assign(
    //   "https://tpulse-shell-accounts-test-v22.detectpl.com/account/sitemap/?url=https://tpulse-msa-uat.detectpl.com/cognito-auth/sign-in"
    // );


  }

  ngOnInit() {
    if (window.location.hash != '') {
      sessionStorage.setItem('access-token', window.location.hash.split('#')[1].split('&')[1].split('=')[1])
      // sessionStorage.setItem('selectedPlant', JSON.parse(sessionStorage.getItem('selectedObservation')).plant_id)
      this.getAcessiblePlants();
      var accessToken = sessionStorage.getItem('access-token');
      var decodedAccessToken: any = jwt_decode(accessToken)
      sessionStorage.setItem('user-email', decodedAccessToken.email);
      this.tracker.setCustomVariable(1, 'E-mail', decodedAccessToken.email, 'visit');
      // this.tracker.setUserId(decodedAccessToken.email);
      sessionStorage.setItem("userLoggedIn", JSON.stringify(true));
      sessionStorage.setItem("welcomeMsgShown", JSON.stringify(false));
    }
  }

  redirectToDestination() {
    const rediredObject = {};
    rediredObject["module"] = this.route.snapshot.queryParamMap.get("module");
    rediredObject["page"] = this.route.snapshot.queryParamMap.get("page");
    rediredObject["unit"] = this.route.snapshot.queryParamMap.get("unit");
    rediredObject["id"] = this.route.snapshot.queryParamMap.get("id");
    return (
      rediredObject["module"] +
      "/" +
      rediredObject["page"] +
      "?unit=" +
      rediredObject["unit"] +
      "&id=" +
      rediredObject["id"]
    );
  }

  showHidePassword() {
    this.showPassword = !this.showPassword;
  }

  public signUpClicked() {
    var signUpClicked: Event;
    window.dispatchEvent(
      new CustomEvent("signUpClicked", { detail: signUpClicked })
    );
  }

  public forgotPasswordClicked() {
    window.dispatchEvent(
      new CustomEvent("forgotPassword")
    );
  }

  public getAcessiblePlants() {
    this.httpService.getUserAccessDetails().subscribe(
      (data: any) => {
        // this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
        //   sessionStorage.setItem("safety-and-surveillance-configuration", JSON.stringify(data))
        //   sessionStorage.setItem("analyticsFound", data['analyticsFound'])
        // });
        var permitPlantMap: any[] = [];
          permitPlantMap = data.plant_access.map((plant: any) => {
            return {
              plant_id: plant.id,
              isPermitEnabled: plant.is_permit_enabled,
              modulesAccess: plant.application.length > 0
            }
          })
        sessionStorage.setItem('permitPlantMap', JSON.stringify(permitPlantMap))
        sessionStorage.setItem("userGroup", JSON.stringify(data.access_type));
        if(data.is_it_manager == true){
          sessionStorage.setItem("itManager_access",JSON.stringify(true))
        }
        else{
          sessionStorage.setItem("itManager_access",JSON.stringify(false))

        }
        if (data.is_admin == true || data.is_it_manager == true) {
          if(data.is_admin==true)
            sessionStorage.setItem("admin-access", JSON.stringify(true))
          // this.router.navigateByUrl('/admin-app/uam');
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
            if (data.plant_access.length == 1) {
              sessionStorage.setItem("selectedPlant", data.plant_access[0].id);
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
                // const myArrayFiltered = modules.filter((module) => {
                //   return plantModules.some((application) => {
                //     return (
                //       application.name.toLowerCase() ===
                //       module.moduleName.toLowerCase()
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
            this.showNoPlants = true;
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
