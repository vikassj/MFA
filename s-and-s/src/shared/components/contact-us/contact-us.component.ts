import { Component, OnInit } from '@angular/core';
declare var $: any;

import { DataService } from '../../services/data.service';
import { CommonService } from '../../services/common.service';
import { SnackbarService } from '../../services/snackbar.service';
import { SafetyAndSurveillanceCommonService } from '../../../app/shared/service/common.service';

@Component({
  selector: 'app-contact-us',
  templateUrl: './contact-us.component.html',
  styleUrls: ['./contact-us.component.scss']
})
export class ContactUsComponent implements OnInit {

  msg: string = '';
  name: string = '';
  emailId: string = '';
  comments: string = '';

  constructor(private dataService: DataService, private commonService: CommonService, private snackbarService: SnackbarService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) { }

  ngOnInit() {
  }

  jhsfdahsfa() {
    $('#contactUsModal').modal('show');
  }

   /**
   * send support request.
   */
  contactUs() {
    this.dataService.passSpinnerFlag(true, true);
    let body = { comments: this.comments, plant_id: sessionStorage.getItem('selectedPlant') }
    this.commonService.contactUs(body).subscribe(
      (data: any) => {
        // this.name = '';
        // this.emailId = '';
        this.comments = '';
        this.dataService.passSpinnerFlag(false, true);
        $('#contactUsModal').modal('hide');
        this.msg = 'Form submitted successfully';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful submission of contact us', 'Contact us');
      },
      (error: any) => {
        if (error.status == 400) {
          this.dataService.passSpinnerFlag(false, true);
          $('#contactUsModal').modal('hide');
          this.msg = 'Maximum limit for sending support services mail has been reached. Please try again after an hour';
          this.snackbarService.show(this.msg, true, false, false, false);
        } else {
          this.dataService.passSpinnerFlag(false, true);
          $('#contactUsModal').modal('hide');
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      },
      () => {
      }
    )
  }

  /**
   * validate the email.
   */
  validateEmail() {
    const regexp = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (regexp.test(this.emailId) == false) {
      this.msg = 'Please enter a valid Email.';
      return false;
    }
    else {
      this.msg = '';
      return true;
    }
  }

  resetContactUsData() {
    this.name = '';
    this.emailId = '';
    this.comments = '';
    $('#contactUsModal').modal('hide');
  }

  omit_special_char(event) {
    var k;
    k = event.charCode;  //         k = event.keyCode;  (Both can be used)
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }

}
