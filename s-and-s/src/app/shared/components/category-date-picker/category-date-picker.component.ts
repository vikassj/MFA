import { Component, ElementRef, EventEmitter, HostListener, OnInit, Output, ViewChild } from '@angular/core';
import { MatDateRangePicker } from '@angular/material/datepicker';
import * as moment from 'moment';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { SnackbarService } from 'src/shared/services/snackbar.service';
import { SafetyAndSurveillanceDataService } from '../../service/data.service';

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'D-MMM-YYYY', // How to display your date on the input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
@Component({
  selector: 'app-category-date-picker',
  templateUrl: './category-date-picker.component.html',
  styleUrls: ['./category-date-picker.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ],
})
export class CategoryDatePickerComponent implements OnInit {

  @Output() iogp_custom_date = new EventEmitter<string[]>();

  showCalendar: boolean = false;

  startDate: string;
  endDate: string;
  selectedDate: any;
  startDate1: any;
  endDate1: any;
  today: Date = new Date();
  currentDate: Date = new Date();
  oneYearBack: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  oneMonthBack: Date = null;
  timeZone: any;
  newDate: string;
  constructor(private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private snackbarService: SnackbarService) {
    const month = this.today.getMonth();
    this.today.setMonth(month - 2);
    this.oneMonthBack = this.today

  }

  ngOnInit(): void {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    this.newDate = moment()?.tz(this.timeZone)?.format("YYYY-MM-DD HH:mm:ss")
    sessionStorage.setItem('selectedLocationDate', this.newDate)
    this.currentDate = moment(this.newDate) as any;
    let date = JSON.parse(sessionStorage.getItem('plantDetails'));
    this.AllDatesStart = date.start_date
    this.selectedDate = [this.oneMonthBack, this.currentDate]
    let stDate = new Date(this.selectedDate[0])
    let startDate: any = stDate.getDate();
    if (startDate < 10) {
      startDate = '0' + startDate
    } else {
      startDate = startDate;
    }
    let startMonth: any = stDate.getMonth() + 1;
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    } else {
      startMonth = startMonth;
    }
    this.startDate1 = moment(this.selectedDate[0]).format('YYYY-MM-DD');
    let edDate = new Date(this.selectedDate[1])
    let endDate: any = edDate.getDate();
    if (endDate < 10) {
      endDate = '0' + endDate;
    } else {
      endDate = endDate;
    }
    let endMonth: any = edDate.getMonth() + 1;
    if (endMonth < 10) {
      endMonth = '0' + endMonth;
    } else {
      endMonth = endMonth;
    }
    this.endDate1 = moment(this.selectedDate[1]).format('YYYY-MM-DD');

    this.startingDate = moment(this.startDate1)
    this.endingDate = moment(this.endDate1)
    this.iogp_custom_date.emit([this.startDate1, this.endDate1]);
  }

  /**
   * populate start date and end date.
   */
  displayDates(selectedDates) {
    this.startDate = JSON.parse(selectedDates).startDate;
    this.endDate = JSON.parse(selectedDates).endDate;
  }

  /**
   * select start and end dates.
   */
  datePicker(data) {
    this.selectedDate = data
    // let date = this.selectedDate.split(',');
    let stDate = new Date(this.selectedDate[0])
    let startDate: any = stDate.getDate();
    if (startDate < 10) {
      startDate = '0' + startDate;
    } else {
      startDate = startDate;
    }
    let startMonth: any = stDate.getMonth() + 1;
    if (startMonth < 10) {
      startMonth = '0' + startMonth;
    } else {
      startMonth = startMonth;
    }
    this.startDate = moment(this.selectedDate[0]).format('YYYY-MM-DD')
    // this.startDate = stDate.getFullYear() + '-' + (stDate.getMonth() + 1) + '-' + stDate.getDate()
    let edDate = new Date(this.selectedDate[1])
    let endDate: any = edDate.getDate();
    if (endDate < 10) {
      endDate = '0' + endDate;
    } else {
      endDate = endDate;
    }
    let endMonth: any = edDate.getMonth() + 1;
    if (endMonth < 10) {
      endMonth = '0' + endMonth;
    } else {
      endMonth = endMonth;
    }
    this.endDate = moment(this.selectedDate[1]).format('YYYY-MM-DD')

    this.iogp_custom_date.emit([this.startDate, this.endDate]);
    // this.safetyAndSurveillanceDataService.passDatesAndUnits("", this.startDate, this.endDate)
  }


  startingDate: any
  endingDate: any
  AllDatesStart: any
  isChecked: boolean
  @ViewChild('dateRangeStart', { read: ElementRef })
  dateRangeStartInput: ElementRef;
  @ViewChild('dateRangeEnd', { read: ElementRef })
  dateRangeEndInput: ElementRef;
  @ViewChild('rangePicker') rangePicker: MatDateRangePicker<Date>;

  rangeFilter(date: Date): boolean {
    if (moment(date) > moment()) {
      return false
    } else {
      return true
    }

  }


  dateRangeChange(
    dateRangeStart: HTMLInputElement,
    dateRangeEnd: HTMLInputElement
  ) {
    if(!this.isChecked){
      if((this.endingDate == null || this.endingDate.length == 0)) {
        this.endingDate = this.startingDate
      } else {
        this.datePicker([this.startingDate, this.endingDate])
      }
    } else {
      let date = sessionStorage.getItem('selectedLocationDate')
      this.startingDate = moment(this.AllDatesStart);
      this.endingDate = moment(date);
      this.datePicker([this.startingDate, this.endingDate])
    }
  }


  onDateChange(): void {

  }

  onCheckboxChange() {

  }

  dateFormating(date){
    return moment(date).format('DD-MMM-YYYY')
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.mat-calendar-body-selected')) {
      this.isChecked = false
    }
  }

}

