import { Injectable } from "@angular/core";
import { Router } from "@angular/router";

import { Auth } from "aws-amplify";
import { MatomoTracker } from '@ngx-matomo/tracker';

import { SnackbarService } from "./snackbar.service";
import { HttpService } from "./http.service";
import { DataService } from "./data.service";
import { CommonService } from "./common.service";

export interface IUser {
  email: string;
  password: string;
  showPassword: boolean;
  code: string;
  name: string;
  newPassword: string;
}

@Injectable({
  providedIn: "root",
})
export class CognitoService {
  plantDetails: any;
  showNoPlants: boolean;

  signedInUser: any = {};

  cognito = {
    userPoolId: "",
    userPoolWebClientId: "",
  };

  change2FaModeEnabled: boolean = false;
  allModules: any;
  msg: string;

  constructor(
    private snackbarService: SnackbarService,
    private httpService: HttpService,
    private dataService: DataService,
    private commonService: CommonService,
    private router: Router,
    private readonly tracker: MatomoTracker
  ) {
    sessionStorage.setItem('company-host', window.location.host.split(".")[0])
  }

  public signUp(user: IUser): Promise<any> {
    return Auth.signUp({
      username: user.email,
      password: user.password,
    });
  }


  public signIn(user: IUser): Promise<any> {
    this.dataService.passSpinnerFlag(true, true);
    Auth.configure({
      userPoolId: JSON.parse(sessionStorage.getItem("site-config")).cognito_user_pool_id,
      userPoolWebClientId: JSON.parse(sessionStorage.getItem("site-config")).cognito_app_client_id,
    });
    return Auth.signIn(user.email, user.password)
      .then((data: any) => {

        if (data.challengeName === "NEW_PASSWORD_REQUIRED") {
          this.commonService.sendMatomoEvent('Successful login', 'Login');
          window.dispatchEvent(new CustomEvent("forceChangePassword"));
          this.signedInUser = data;
        } else {
          sessionStorage.setItem(
            "access-token",
            data.signInUserSession.idToken.jwtToken
          );
          this.getAcessiblePlants();
          sessionStorage.setItem("userLoggedIn", JSON.stringify(true));
          var loggedInUser = user.email.split("@")[0]
          sessionStorage.setItem("loggedInUser", loggedInUser)
          sessionStorage.setItem("user-email", user.email);
          this.commonService.sendMatomoEvent('Successful login', 'Login');
          this.tracker.setUserId(user.email);
          sessionStorage.setItem(
            "navigated-to-application",
            JSON.stringify(false)
          );
          sessionStorage.setItem("welcomeMsgShown", JSON.stringify(false));
          localStorage.setItem('login-event', 'login / ' + loggedInUser)
          this.dataService.passSpinnerFlag(false, true);
        }
        this.httpService.invalidateUserSession(user.email).subscribe((data: any) => { })
      })
      .catch((err) => {
        this.commonService.sendMatomoEvent('Failed login', 'Login');
        this.dataService.passSpinnerFlag(false, true);
        if (err.message == "Password attempts exceeded") {
          this.snackbarService.show(
            "You have reached maximum attempts. Please try after some time.",
            true,
            false,
            false,
            false
          );
        } else {
          let msg =
          "Invalid login credentials. Please check your username and password.";
          this.snackbarService.show(msg, true, false, false, false);
        }
      });
  }

  public getUser(): Promise<any> {
    return Auth.currentUserInfo();
  }

  public updateUser(user: IUser): Promise<any> {
    return Auth.currentUserPoolUser().then((cognitoUser: any) => {
      return Auth.updateUserAttributes(cognitoUser, user);
    });
  }


  getAvailablePlantDetails(data){
    this.dataService.passSpinnerFlag(true, true);
    let plantId = null;
    let selectedPlantDetails = {}
    data?.['plant_access']?.forEach(ele =>{
      if(ele?.application?.length > 0 && !plantId){
        plantId = ele.id
        selectedPlantDetails = ele
      }
    })
    this.commonService.getAllApplications(plantId).subscribe({
      next: (plant: any) => {
        this.allModules = plant
        let mod = this.allModules.map(i => i.modules)
        let mod1 = mod[0].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod2 = mod[1].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod3 = mod[2].sort((a, b) => (a.order < b.order) ? -1 : 1);
        let mod4 = mod[3].sort((a, b) => (a.order < b.order) ? -1 : 1);
        this.allModules.forEach((val1, ind1) => {
          val1.modules.forEach((val2, ind2) => {
            this.allModules[ind1].modules[ind2].disabled = true;
          })
        })
        let plantDetails = selectedPlantDetails['application']
        plantDetails?.forEach((val, ind) => {
          this.allModules?.forEach((val1, ind1) => {
            val1?.modules?.forEach((val2, ind2) => {
              if (val?.key == val2?.key) {
                this.allModules[ind1].modules[ind2].disabled = false
              }
            })
          })
        })
        sessionStorage.setItem('selectedPlantAccessModules', JSON.stringify(this.allModules))
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        //get the otp validity from api.
        sessionStorage.setItem('timer', data['timer'])
        //check if the user has 2fa enabled.
        if (data["2fa"] == true) {
          sessionStorage.setItem("2fa", JSON.stringify(data["2fa"]));
          if (data["2fa_type"] == null) { //if no 2fa_type is assigned, assign email.
            data["2fa_type"] = "email";
          }
          //check whether more than one 2fa types are available
          this.commonService.readModuleConfigurationsData('host-auth').subscribe((data: any) => {
            if (data.changeMfaMode == true) {
              sessionStorage.setItem('change-2fa-mode-enabled', JSON.stringify(true))
            } else {
              sessionStorage.setItem('change-2fa-mode-enabled', JSON.stringify(false))
            }
          })
          //set required session storage items.
          sessionStorage.setItem("2fa_type", JSON.stringify(data["2fa_type"]));
          sessionStorage.setItem("email", data["email"]);
          //send 2fa otp to the registered user's email. `params : user_email , 2fa_type`
          this.httpService
            .sendMfaOtp(data["email"], data["2fa_type"])
            .subscribe(
              (data: any) => {
                window.dispatchEvent(new CustomEvent("mfaEnabled"));
                this.dataService.passSpinnerFlag(false, true)
              },
              (err) => {
                //rate limiter error handling.
                var msg = "Maximum limit for sending OTP has been reached. Please try again after an hour";
                this.snackbarService.show(msg, true, false, false, false);
                window.addEventListener("click", (evt) => {
                  window.location.reload();
                });
              }
            );
          //Listen to otp-validation event fired by 2-fact-auth component.
          window.addEventListener("otp_validated", (evt) => {
            sessionStorage.setItem(
              "userGroup",
              JSON.stringify(data.access_type)
            );
            var permitPlantMap: any[] = [];
            permitPlantMap = data.plant_access.map((plant: any) => {
              return {
              plant_id: plant.id,
              isPermitEnabled: plant.is_permit_enabled,
              modulesAccess: plant.application.length > 0
              }
            })
            sessionStorage.setItem('permitPlantMap', JSON.stringify(permitPlantMap))
            if(data.is_it_manager == true){
              sessionStorage.setItem("itManager_access",JSON.stringify(true))
            }else {
              sessionStorage.setItem("itManager_access", JSON.stringify(false))
            }
            if (data.is_admin == true || data.is_it_manager==true) {
              if(data.is_admin == true){
                sessionStorage.setItem("admin-access", JSON.stringify(true));
              }else{
                sessionStorage.setItem("admin-access", JSON.stringify(false));
              }

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
              ////////////////////////////////////////////////////////
            } else {
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

                    this.fetchPlantDetails();
                    var apiUrl = sessionStorage.getItem("apiUrl") || "";
                    var selectedPlantApiUrl = apiUrl?.concat(
                      sessionStorage.getItem("selectedPlant") + "/" || ""
                    );
                    var selectedPlantDetails = this.plantDetails.filter(
                      (plant: any) =>
                        plant.id == sessionStorage.getItem("selectedPlant")
                    );

                    // var selectedPlantId = sessionStorage.getItem('selectedPlant');
                    // var plantModules = this.plantModules.filter
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
                      sessionStorage.setItem("accessible-modules", JSON.stringify(myArrayFiltered)
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
                  else if(sessionStorage.getItem('selectedActionNavigation')) {
                    var selectedActionNavigation = JSON.parse(sessionStorage.getItem('selectedActionNavigation'))
                    sessionStorage.setItem("selectedPlant", selectedActionNavigation.plant_id);
                    this.fetchPlantDetails();
                    var apiUrl = sessionStorage.getItem("apiUrl") || "";
                    var selectedPlantApiUrl = apiUrl?.concat(
                      sessionStorage.getItem("selectedPlant") + "/" || ""
                    );


                    var selectedPlantDetails = this.plantDetails.filter(
                      (plant: any) =>
                        plant.id == sessionStorage.getItem("selectedPlant")
                    );

                    // var selectedPlantId = sessionStorage.getItem('selectedPlant');
                    // var plantModules = this.plantModules.filter
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
                  else if(sessionStorage.getItem('selectedIncidentNavigation')) {
                    var selectedIncidentNavigation = JSON.parse(sessionStorage.getItem('selectedIncidentNavigation'))
                    sessionStorage.setItem("selectedPlant", selectedIncidentNavigation.plant_id);
                    this.fetchPlantDetails();
                    var apiUrl = sessionStorage.getItem("apiUrl") || "";
                    var selectedPlantApiUrl = apiUrl?.concat(
                      sessionStorage.getItem("selectedPlant") + "/" || ""
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
                  else if(sessionStorage.getItem('selectedLiveStreaming')) {
                    var selectedLiveStreaming = JSON.parse(sessionStorage.getItem('selectedLiveStreaming'))
                    sessionStorage.setItem("selectedPlant", selectedLiveStreaming.plant_id);
                    this.fetchPlantDetails();
                    var apiUrl = sessionStorage.getItem("apiUrl") || "";
                    var selectedPlantApiUrl = apiUrl?.concat(
                      sessionStorage.getItem("selectedPlant") + "/" || ""
                    );
                    sessionStorage.setItem(
                      "selectedPlantApiUrl",
                      selectedPlantApiUrl || ""
                    );
                    // this.plantDetails.forEach((plant : any) => {
                    //   this.plantModules.push(plant.application)
                    // })
                    var selectedPlantDetails = this.plantDetails.filter(
                      (plant: any) =>
                        plant.id == sessionStorage.getItem("selectedPlant")
                    );
                    // var selectedPlantId = sessionStorage.getItem('selectedPlant');
                    // var plantModules = this.plantModules.filter
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
            }
          })
          //////////////////////////////////////////////////////////////////
        } else {
          sessionStorage.setItem("logged_in_user", data.user_id)
          sessionStorage.setItem("user_entity", data?.user_entity)
          var permitPlantMap: any[] = [];
          permitPlantMap = data.plant_access.map((plant: any) => {
            return {
              plant_id: plant.id,
              isPermitEnabled: plant.is_permit_enabled,
              modulesAccess: plant.application.length > 0
            }
          })
          sessionStorage.setItem('permitPlantMap', JSON.stringify(permitPlantMap))
          sessionStorage.setItem(
            "userGroup",
            JSON.stringify(data.access_type)
          );
          if (data.is_it_manager == true) {
            sessionStorage.setItem("itManager_access", JSON.stringify(true))
          }
          else {
            sessionStorage.setItem("itManager_access", JSON.stringify(false))

          }
          if (data.is_admin == true || data.is_it_manager == true) {
            if (data.is_admin == true){
              sessionStorage.setItem("admin-access", JSON.stringify(true));
            }else{
              sessionStorage.setItem("admin-access", JSON.stringify(false));
            }
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
            ////////////////////////////////////////////////////////
          } else {
            if (data.plant_access.length > 0) {
              sessionStorage.setItem("role-name", data.role_name);
              sessionStorage.setItem("access-level", data.access_level);
              this.plantDetails = data.plant_access;
              sessionStorage.setItem(
                "accessible-plants",
                JSON.stringify(data.plant_access)
              );
              let plantIndex = -1;
              data.plant_access.forEach((obj, i) => {
                if (obj.application.length > 0 && plantIndex == -1) {
                  plantIndex = i
                }
              })
              plantIndex = plantIndex
              if (plantIndex > -1) {
                sessionStorage.setItem("selectedPlant", data.plant_access[plantIndex].id);
              }
           
              if (data.plant_access.length == 1) {
                sessionStorage.setItem("selectedPlant", data.plant_access[0].id);
                window.dispatchEvent(new CustomEvent("plant-selected"))
                this.fetchPlantDetails();
                var apiUrl = sessionStorage.getItem("apiUrl") || "";
                var selectedPlantApiUrl = apiUrl?.concat(
                  sessionStorage.getItem("selectedPlant") + "/" || ""
                );
                sessionStorage.setItem(
                  "selectedPlantApiUrl",
                  selectedPlantApiUrl || ""
                );
                // this.plantDetails.forEach((plant : any) => {
                //   this.plantModules.push(plant.application)
                // })
                var selectedPlantDetails = this.plantDetails.filter(
                  (plant: any) =>
                    plant.id == sessionStorage.getItem("selectedPlant")
                );
                // var selectedPlantId = sessionStorage.getItem('selectedPlant');
                // var plantModules = this.plantModules.filter
       //start

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

         sessionStorage.setItem("isControlTowerAccess",JSON.stringify(true))

         sessionStorage.setItem('projectName',selectedPlant?.[0].group_name)

       }else{

         sessionStorage.setItem("selectedPlant", data.plant_access[plantIndex].id);

         sessionStorage.setItem("isControlTowerAccess",JSON.stringify(false))

       }

       //end

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
                  //   return plantModules.some((application) => {
                  //     return (
                  //       application.name.toLowerCase() ===
                  //       module.moduleName.toLowerCase()
                  //     );
                  //   });
                  // });
                  const myArrayFiltered = []

                  this.fetchPlantDetails();
                  var apiUrl = sessionStorage.getItem("apiUrl") || "";
                  var selectedPlantApiUrl = apiUrl?.concat(
                    sessionStorage.getItem("selectedPlant") + "/" || ""
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
                  var selectedPlantDetails = this.plantDetails.filter(
                    (plant: any) =>
                      plant.id == sessionStorage.getItem("selectedPlant")
                  );

                  // var selectedPlantId = sessionStorage.getItem('selectedPlant');
                  // var plantModules = this.plantModules.filter
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
                else if(sessionStorage.getItem('selectedActionNavigation')) {
                  var selectedActionNavigation = JSON.parse(sessionStorage.getItem('selectedActionNavigation'))
                  sessionStorage.setItem("selectedPlant", selectedActionNavigation.plant_id);
                  this.fetchPlantDetails();
                  var apiUrl = sessionStorage.getItem("apiUrl") || "";
                  var selectedPlantApiUrl = apiUrl?.concat(
                    sessionStorage.getItem("selectedPlant") + "/" || ""
                  );
                  var selectedPlantDetails = this.plantDetails.filter(
                    (plant: any) =>
                      plant.id == sessionStorage.getItem("selectedPlant")
                  );

                  // var selectedPlantId = sessionStorage.getItem('selectedPlant');
                  // var plantModules = this.plantModules.filter
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
                else if(sessionStorage.getItem('selectedIncidentNavigation')) {
                  var selectedIncidentNavigation = JSON.parse(sessionStorage.getItem('selectedIncidentNavigation'))
                  sessionStorage.setItem("selectedPlant", selectedIncidentNavigation.plant_id);
                  this.fetchPlantDetails();
                  var apiUrl = sessionStorage.getItem("apiUrl") || "";
                  var selectedPlantApiUrl = apiUrl?.concat(
                    sessionStorage.getItem("selectedPlant") + "/" || ""
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
                else if(sessionStorage.getItem('selectedLiveStreaming')) {
                  var selectedLiveStreaming = JSON.parse(sessionStorage.getItem('selectedLiveStreaming'))
                  sessionStorage.setItem("selectedPlant", selectedLiveStreaming.plant_id);
                  this.fetchPlantDetails();
                  var apiUrl = sessionStorage.getItem("apiUrl") || "";
                  var selectedPlantApiUrl = apiUrl?.concat(
                    sessionStorage.getItem("selectedPlant") + "/" || ""
                  );
                  sessionStorage.setItem("selectedPlantApiUrl",selectedPlantApiUrl || "");
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
          }
        }
      }
    })
  }
  public getAcessiblePlants() {
    this.dataService.passSpinnerFlag(true, true);
    this.httpService.getUserAccessDetails().subscribe(
      (data: any) => {
        this.getAvailablePlantDetails(data);
      },
      (err) => {
        if (err.status != 403) {
          sessionStorage.setItem("userLoggedIn", JSON.stringify(false));
          var msg = "Error occured. Please try again.";
          this.snackbarService.show(msg, true, false, false, false);
          sessionStorage.clear();
          window.addEventListener("click", (evt: any) => {
            sessionStorage.clear();
            localStorage.clear();
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
            sessionStorage.clear();
            localStorage.clear();
            window.location.reload();
          });
          this.dataService.passSpinnerFlag(false, true);
        }
      },
      () => { })
  }

  // validate forgot password feature
  public forgotPassword(email: string): Promise<any> {
    this.dataService.passSpinnerFlag(true, true)
    Auth.configure({
      userPoolId: JSON.parse(sessionStorage.getItem("site-config")).cognito_user_pool_id,
      userPoolWebClientId: JSON.parse(sessionStorage.getItem("site-config")).cognito_app_client_id,
    });

    return Auth.forgotPassword(email)
      .then((data) => {
        this.dataService.passSpinnerFlag(false, true)
      })
      .catch((err) => {
        this.dataService.passSpinnerFlag(false, true);
        if (err.code == "LimitExceededException") {
          this.snackbarService.show(
            "You have reached maximum attempts. Please try after some time.",
            true,
            false,
            false,
            false
          );
          window.addEventListener("click", (evt: any) => {
            window.location.reload();
          });
        }
      });

  }

  // submit new password
  public forgotPasswordSubmit(email, code, new_password): Promise<any> {
    this.dataService.passSpinnerFlag(true, true);
    Auth.configure({
      userPoolId: JSON.parse(sessionStorage.getItem("site-config")).cognito_user_pool_id,
      userPoolWebClientId: JSON.parse(sessionStorage.getItem("site-config")).cognito_app_client_id,
    });

    return Auth.forgotPasswordSubmit(email, code, new_password)
      .then((data) => {
        this.commonService.sendMatomoEvent('Successful reset password', 'Forgot password');
        this.dataService.passSpinnerFlag(false, true);
        localStorage.setItem('login-event', 'login' + Math.random())
        var msg =
          "Password changed successfully. Please login again with new credentials";
        this.snackbarService.show(msg, false, false, false, true);
        window.addEventListener("click", (ev) => {
          window.location.reload();
        });
        this.httpService.invalidateUserSession(email).subscribe((data: any) => { })
        this.dataService.passSpinnerFlag(false, true);
      })
      .catch((err) => {
        this.commonService.sendMatomoEvent('Failed reset password', 'Forgot password');
        if (err.code == "CodeMismatchException") {
          this.dataService.passSpinnerFlag(false, true);
          var msg =
            "The verification code provided is invalid. Please try again with the correct verification code.";
          this.snackbarService.show(msg, true, false, false, false);
        } else if (err.code == "InvalidPasswordException") {
          this.dataService.passSpinnerFlag(false, true);
          var msg =
            "The password provided doesn't match the password criteria. Please try again.";
          this.snackbarService.show(msg, true, false, false, false);
        } else if (err.code == "LimitExceededException") {
          this.dataService.passSpinnerFlag(false, true);
          var msg =
            "Attempt limit exceeded, please try after some time.";
          window.addEventListener("click", (ev) => {
            window.location.reload();
          });
          this.snackbarService.show(msg, true, false, false, false);
        } else {
          this.dataService.passSpinnerFlag(false, true);
          var msg =
            "Error occured. Please try again.";
          this.snackbarService.show(msg, true, false, false, false);
        }
        this.dataService.passSpinnerFlag(false, true);
      });

  }


  public forceChangePassword(newPassword: string): Promise<any> {
    this.dataService.passSpinnerFlag(true, true);
    Auth.configure({
      userPoolId: JSON.parse(sessionStorage.getItem("site-config")).cognito_user_pool_id,
      userPoolWebClientId: JSON.parse(sessionStorage.getItem("site-config")).cognito_app_client_id,
    });
    return Auth.completeNewPassword(this.signedInUser, newPassword, {})
      .then((data: any) => {
        this.dataService.passSpinnerFlag(false, true);
      })
      .catch((err) => {
        this.dataService.passSpinnerFlag(false, true);
        this.snackbarService.show(
          err.log ? err.log : err.code,
          true,
          false,
          false,
          false
        );
      });
  }

  public resetPassword(oldPassword: string, newPassword: string) {
    this.dataService.passSpinnerFlag(true, true);
    Auth.configure({
      userPoolId: JSON.parse(sessionStorage.getItem("site-config")).cognito_user_pool_id,
      userPoolWebClientId: JSON.parse(sessionStorage.getItem("site-config")).cognito_app_client_id,
    });
    Auth.currentAuthenticatedUser().then(
      (user) => {
        if (oldPassword == newPassword) {
          this.dataService.passSpinnerFlag(false, true);
          var msg = "New password cannot be the same as current password.";
          this.snackbarService.show(msg, true, false, false, false);
        } else {
          return Auth.changePassword(user, oldPassword, newPassword).then(
            (data: any) => {
              this.commonService.sendMatomoEvent('Usage of change password', 'Change password');
              this.httpService.invalidateUserSession(user.email).subscribe((data: any) => { })
              window.dispatchEvent(new CustomEvent("password-reset-done"));
            },
            (err) => {
              if (err.code == "LimitExceededException") {
                this.dataService.passSpinnerFlag(false, true);
                sessionStorage.clear();
                this.snackbarService.show(
                  "You have reached maximum attempts. Please try after some time.",
                  true,
                  false,
                  false,
                  false
                );
                window.addEventListener("click", (evt: any) => {
                  window.location.reload();
                });
              } else {
                this.dataService.passSpinnerFlag(false, true);
                var msg =
                  "Error occured. Please try again with correct credentials.";
                this.snackbarService.show(msg, true, false, false, false);
              }
            }
          );
        }
      },
      (err) => {
        this.dataService.passSpinnerFlag(false, true);
        this.snackbarService.show(
          err.log ? err.log : err.code,
          true,
          false,
          false,
          false
        );
      }
    );
  }

  fetchPlantDetails() {
    // this.commonService.fetchPlantDetails().subscribe(
    //   (plantData: any) => {
    //     let plantDetials: any = plantData;
    //     plantDetials.start_date = plantData.start_date;
    //     plantDetials.end_date = plantData.end_date;
    //     sessionStorage.setItem("plantDetails", JSON.stringify(plantData));
    //     this.dataService.passSpinnerFlag(false, true);
    //   },
    //   (error) => {
    //     this.dataService.passSpinnerFlag(false, true);
    //   },
    //   () => {
    //     this.dataService.passSpinnerFlag(false, true);
    //     window.dispatchEvent(
    //       new CustomEvent("successful-sign-in", {
    //         detail: { navigateToApp: true },
    //       })
    //     );
    //   }
    // );
  }
}
