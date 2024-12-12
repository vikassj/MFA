import { Component, OnInit } from '@angular/core';
import { takeUntil, tap } from 'rxjs/operators';
declare var $: any;

import { SnackbarService, Message } from '../snackbar.service';

@Component({
  selector: 'app-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss']
})
export class SnackbarComponent implements OnInit {

  message?: string = '';
  error?: boolean = false;
  warning?: boolean = false;
  confirmation?: boolean = false;
  information?: boolean = false;

  constructor(private service: SnackbarService) { }

  ngOnInit() {
    this.service.events.pipe().subscribe((message: Message) => {
      this.message = message.msg;
      this.error = message.error;
      this.warning = message.warning;
      this.confirmation = message.confirmation;
      this.information = message.information;
      if (this.error == false && this.warning == false && this.confirmation == false && this.information == false) {
        var x: any = document.getElementById('snackbar');
        x.className = 'show';
        setTimeout(function () { x.className = x.className.replace('show', ''); }, 4000);
      }
      if (this.error === true || this.warning === true || this.confirmation === true || this.information === true) {
        $('#snackBarModal').modal('show');
      }
    });
  }

}
