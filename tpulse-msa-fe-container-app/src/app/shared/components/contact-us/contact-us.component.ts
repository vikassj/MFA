import { Component, OnInit } from '@angular/core';
declare var $: any;

import { DataService } from '../../services/data.service';
import { CommonService } from '../../services/common.service';
import { SnackbarService } from '../../services/snackbar.service';

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

  constructor(private dataService: DataService, private commonService: CommonService, private snackbarService: SnackbarService) { }

  ngOnInit() {
  }

  jhsfdahsfa(){
    $('#contactUsModal').modal('show');
  }

  contactUs() {
    // Contact Us form submission
    this.dataService.passSpinnerFlag(true, true);
    let body = { name: this.name, email: this.emailId, comments: this.comments, plant_id: sessionStorage.getItem('selectedPlant')}
    this.commonService.contactUs(body).subscribe(
      (data: any) => {
        this.name = '';
        this.emailId = '';
        this.comments = '';
        this.dataService.passSpinnerFlag(false, true);
        $('#contactUsModal').modal('hide');
        this.msg = 'Form submitted successfully';
        window.dispatchEvent(new CustomEvent('snackbar', {detail: {msg: this.msg, error: false, warning: false, confirmation: false, information: false} }))
      },
      (error: any) => {
        if(error.status == 400) {
          this.dataService.passSpinnerFlag(false, true);
          $('#contactUsModal').modal('hide');
          this.msg = 'Maximum limit for sending support services mail has been reached. Please try again after an hour';
          window.dispatchEvent(new CustomEvent('snackbar', {detail: {msg: this.msg, error: true, warning: false, confirmation: false, information: false} }))
        } else {
          this.dataService.passSpinnerFlag(false, true);
          $('#contactUsModal').modal('hide');
          this.msg = 'Error occured. Please try again.';
          window.dispatchEvent(new CustomEvent('snackbar', {detail: {msg: this.msg, error: true, warning: false, confirmation: false, information: false} }))
        }
        
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    )
  }

  validateEmail() {
    //email validation
    let regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
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
   return((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57)); 
}

}
