import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonService } from '../common.service';
import { DataService } from '../data.service';
import { SnackbarService } from '../snackbar.service';
import { FormGroup, FormControl, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'auth-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css']
})
export class NotificationComponent implements OnInit {

  notificationForm: FormGroup;
  smsToggle = new FormControl(false);
  emailToggle = new FormControl(false);
  mobileToggle = new FormControl(false);
  webToggle = new FormControl(false);
  popUpToggle = new FormControl(false);

  initialFormValues: any; // Store initial form values

  msg = '';

  btnDisable = true;
  initialToggleValues: any;
  constructor(private cdr: ChangeDetectorRef, private formBuilder: FormBuilder, private dataService: DataService, private snackbarService: SnackbarService, private commonService: CommonService) { }

  ngOnInit(): void {
    // this.dataService.passSpinnerFlag(true, true);
    
    this.notificationForm = new FormGroup({
      smsToggle: new FormControl(false),
      emailToggle: new FormControl(false),
      mobileToggle: new FormControl(false),
      webToggle: new FormControl(false),
      popUpToggle: new FormControl(false),
      smsRiskRating: new FormGroup({
        very_high: new FormControl(false),
        high: new FormControl(false),
        medium: new FormControl(false),
        low: new FormControl(false),
        very_low: new FormControl(false)
      }),
      emailRiskRating: new FormGroup({
        very_high: new FormControl(false),
        high: new FormControl(false),
        medium: new FormControl(false),
        low: new FormControl(false),
        very_low: new FormControl(false)
      }),
      mobileRiskRating: new FormGroup({
        very_high: new FormControl(false),
        high: new FormControl(false),
        medium: new FormControl(false),
        low: new FormControl(false),
        very_low: new FormControl(false)
      }),
      webRiskRating: new FormGroup({
        very_high: new FormControl(false),
        high: new FormControl(false),
        medium: new FormControl(false),
        low: new FormControl(false),
        very_low: new FormControl(false)
      }),
      popUpRiskRating: new FormGroup({
        very_high: new FormControl(false),
        high: new FormControl(false),
        medium: new FormControl(false),
        low: new FormControl(false),
        very_low: new FormControl(false)
      })
    });
    this.notificationGet();
  }

  resetNotifications(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(controlName => {
      const control = formGroup.get(controlName);
      if (control instanceof FormControl) {
        control.setValue(false);
      }
    });
  }

  toggleRiskRating(type: string, risk: string) {
    
    // Get the FormControl corresponding to the risk rating
    const riskRatingControl = this.notificationForm.get(`${type}RiskRating.${risk}`);
  
    // Check if the risk rating is currently selected or not
    const currentSelection = riskRatingControl.value;
  
    // Toggle the selection by setting it to the opposite value
    riskRatingControl.setValue(!currentSelection);

    this.updateSaveButtonState()
  }

  toggleNotification(type: string) {
    switch (type) {
      case 'sms':
        this.notificationForm.get('smsToggle').setValue(!this.notificationForm.get('smsToggle').value);
        if (this.notificationForm.get('smsToggle').value) {
          this.notificationForm.get('smsRiskRating').enable();
          this.btnDisable = true;
        } else {
          this.resetNotifications(this.notificationForm.get('smsRiskRating') as FormGroup);
          this.notificationForm.get('smsRiskRating').disable();
          this.btnDisable = false;
        }
        this.updateSaveButtonState();
        break;
      case 'email':
        this.notificationForm.get('emailToggle').setValue(!this.notificationForm.get('emailToggle').value);
        if (this.notificationForm.get('emailToggle').value) {
          this.notificationForm.get('emailRiskRating').enable();
          this.btnDisable = true;
        } else {
          this.resetNotifications(this.notificationForm.get('emailRiskRating') as FormGroup);
          this.notificationForm.get('emailRiskRating').disable();
          this.btnDisable = false;
        }
        this.updateSaveButtonState();
        break;
      case 'mobile':
        this.notificationForm.get('mobileToggle').setValue(!this.notificationForm.get('mobileToggle').value);
        if (this.notificationForm.get('mobileToggle').value) {
          this.notificationForm.get('mobileRiskRating').enable();
          this.btnDisable = true;
        } else {
          this.resetNotifications(this.notificationForm.get('mobileRiskRating') as FormGroup);
          this.notificationForm.get('mobileRiskRating').disable();
          this.btnDisable = false;
        }
        this.updateSaveButtonState();
        break;
      case 'web':
        this.notificationForm.get('webToggle').setValue(!this.notificationForm.get('webToggle').value);
        if (this.notificationForm.get('webToggle').value) {
          this.notificationForm.get('webRiskRating').enable();
          this.btnDisable = true;
        } else {
          this.notificationForm.get('popUpToggle').setValue(false);
          this.resetNotifications(this.notificationForm.get('popUpRiskRating') as FormGroup)
          this.resetNotifications(this.notificationForm.get('webRiskRating') as FormGroup);
          this.notificationForm.get('webRiskRating').disable();
          this.notificationForm.get('popUpRiskRating').disable();
          this.btnDisable = false;
        }
        this.updateSaveButtonState();
        break;
      case 'popUp':
          this.notificationForm.get('popUpToggle').setValue(!this.notificationForm.get('popUpToggle').value);
          if (this.notificationForm.get('popUpToggle').value) {
            this.notificationForm.get('popUpRiskRating').enable();
            this.btnDisable = true;
          } else {
            this.resetNotifications(this.notificationForm.get('popUpRiskRating') as FormGroup);
            this.notificationForm.get('popUpRiskRating').disable();
            this.btnDisable = false;
          }
          this.updateSaveButtonState();
        break;
    }

    

  }


  updateSaveButtonState() {
    let isSaveButtonDisabled = true; // Default to disabled
    let isAnyToggleEnabledWithoutRisk = false; // Flag to track if any toggle is enabled without risk ratings
  
    // Iterate over each toggle and its risk ratings
    ['sms', 'email', 'mobile', 'web', 'popUp'].forEach(type => {
      const toggleControl = this.notificationForm.get(`${type}Toggle`);
      const riskRatingControl = this.notificationForm.get(`${type}RiskRating`);
  
      // Check if the toggle is enabled
      if (toggleControl.value) {
        // Check if any risk rating is selected
        if (!this.isAnyRiskRatingSelected(type)) {
          isAnyToggleEnabledWithoutRisk = true; // Set flag if toggle is enabled without risk ratings
        }
      }
  
      // Check if there are changes from initial values
      if (!this.checkInitialValues(riskRatingControl.value, this.initialFormValues[`${type}RiskRating`], toggleControl.value, this.initialFormValues[`${type}Toggle`])) {
        isSaveButtonDisabled = false; // Enable save button if there are changes from initial values
      }
    });
  
    // Disable save button if any toggle is enabled without risk ratings
    if (isAnyToggleEnabledWithoutRisk) {
      isSaveButtonDisabled = true;
    }
  
    // Update the disabled state of the save button
    this.btnDisable = isSaveButtonDisabled;
  }
  
  
  
  
  // Function to check if any risk rating is selected for a specific notification type
  isAnyRiskRatingSelected(type: string): boolean {
    const riskRatingControl = this.notificationForm.get(`${type}RiskRating`);
    if (riskRatingControl instanceof FormGroup) {
      const riskRatings = Object.values(riskRatingControl.value);
      return riskRatings.some(rating => rating === true);
    }
    return false;
  }
  
  // Function to check if the current selection has changed from the initial values
  checkInitialValues(currentRatings: any, initialRatings: any, currentToggle: any, initialToggle) {
    return ((JSON.stringify(currentRatings) === JSON.stringify(initialRatings)) && (currentToggle === initialToggle))
  }



  notificationSubmit() {
    
    let obj = {};

    if (!this.smsToggle && !this.emailToggle && !this.mobileToggle && !this.webToggle && !this.popUpToggle) {
      alert("SMS, Email, Mobile push, Web Popup and Popup Sounds Notification  fields are disabled")
    }

    this.dataService.passSpinnerFlag(true, true);
    ['sms', 'email', 'mobile', 'web', 'popUp'].forEach(type => {
      const toggleControl = this.notificationForm.get(`${type}Toggle`);
      const riskRatingControl = this.notificationForm.get(`${type}RiskRating`);
  
      // Check if the toggle is enabled
      if (toggleControl.value) {
        if(type == 'web') {
          obj['web_popup_notify'] = riskRatingControl.value
        } else if(type == 'popUp') {
          obj['web_popup_sound_notify'] = riskRatingControl.value
        } else {
          obj[type] = riskRatingControl.value
        }
        } else {
          if(type == 'web') {
            obj['web_popup_notify'] = { very_low: false, low: false, medium: false, high: false, very_high: false }
          } else if(type == 'popup') {
            obj['web_popup_sound_notify'] = { very_low: false, low: false, medium: false, high: false, very_high: false }
          } else {
            obj[type] = { very_low: false, low: false, medium: false, high: false, very_high: false }
          }
        }
    });

 

    // POST API for notifications - where if we make some  some changes, or edit or update the level of a notification then with the updated values can be sent through this POST API
    this.commonService.notificationPost(obj).subscribe(response => {
      this.notificationGet();
      
    },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.commonService.sendMatomoEvent('Usage of notifications', 'Notifications');
        this.msg = "Notification alerts saved sucessfully.";
        this.snackbarService.show(this.msg, false, false, false, false);
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('notifications-saved'));
          window.dispatchEvent(new CustomEvent('plant-selected'));
          window.dispatchEvent(new CustomEvent('load-dashboard'))
        }, 2000);
      })
  }

  // // GET API where we get key and value pairs which we donates it's level like low, high .... 
  notificationGet() {
    this.commonService.notificationget().subscribe(response => {
      // SMS notification

      if (response['sms'].very_low == true || response['sms'].low == true || response['sms'].medium == true || response['sms'].high == true || response['sms'].very_high == true) {
        this.notificationForm.get('smsToggle').setValue(true);
      } else {
        this.notificationForm.get('smsToggle').setValue(false);
      }
      if (response['email'].very_low == true || response['email'].low == true || response['email'].medium == true || response['email'].high == true || response['email'].very_high == true) {
        this.notificationForm.get('emailToggle').setValue(true);
      } else {
        this.notificationForm.get('emailToggle').setValue(false);
      }
      if (response['mobile'].very_low == true || response['mobile'].low == true || response['mobile'].medium == true || response['mobile'].high == true || response['mobile'].very_high == true) {
        this.notificationForm.get('mobileToggle').setValue(true);
      } else {
        this.notificationForm.get('mobileToggle').setValue(false);
      }
      if (response['web_popup_notify'].very_low == true || response['web_popup_notify'].low == true || response['web_popup_notify'].medium == true || response['web_popup_notify'].high == true || response['web_popup_notify'].very_high == true) {
        this.notificationForm.get('webToggle').setValue(true);
      } else {
        this.notificationForm.get('webToggle').setValue(false);
      }
      if (response['web_popup_sound_notify'].very_low == true || response['web_popup_sound_notify'].low == true || response['web_popup_sound_notify'].medium == true || response['web_popup_sound_notify'].high == true || response['web_popup_sound_notify'].very_high == true) {
        this.notificationForm.get('popUpToggle').setValue(true);
      } else {
        this.notificationForm.get('popUpToggle').setValue(false);
      }
      this.setRiskRating(response['sms'], 'smsRiskRating');

      // Email notification
      this.setRiskRating(response['email'], 'emailRiskRating');

      // Mobile notification
      this.setRiskRating(response['mobile'], 'mobileRiskRating');

      // Web Popup notification
      this.setRiskRating(response['web_popup_notify'], 'webRiskRating');

      // Popup Notification Sounds
      this.setRiskRating(response['web_popup_sound_notify'], 'popUpRiskRating');
    
      // this.btnDisable = true;
      this.dataService.passSpinnerFlag(false, true);
      this.cdr.detectChanges()
      // Store the initial form values
      this.initialFormValues = JSON.parse(JSON.stringify(this.notificationForm.value));
      console.log(this.initialFormValues)
    },
    (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occurred. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
    () => {
    });
  }

  // Function to set risk ratings in the form group
  setRiskRating(riskRatingObj: any, formControlName: string): void {
    const riskRatingForm = this.notificationForm.get(formControlName);
    if (riskRatingForm) {
      Object.keys(riskRatingObj).forEach(key => {
        if (riskRatingForm.get(key)) {
          riskRatingForm.get(key).setValue(riskRatingObj[key]);
        }
      });
    }
  }

}
