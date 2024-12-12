import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import "moment-timezone";
import { Subscription } from 'rxjs';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  DateRange,
  MatCalendar,
  MatCalendarCellClassFunction,
  MatDateRangePicker,
} from '@angular/material/datepicker';

import { LiveStreamingDataService } from '../../services/data.service';


const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'MMM D, YYYY', // How to display your date on the input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
@Component({
  selector: 'app-date-header',
  templateUrl: './date-header.component.html',
  styleUrls: ['./date-header.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ]
})
export class DateHeaderComponent implements OnInit {

  subscription: Subscription = new Subscription();
  showCalendar: boolean = false;

  startDate: string;
  endDate: string;

  dateFormat = 'MMMM/dd/yy';
  selectedDate: any;
  startDate1: any;
  endDate1: any;
  today: Date = new Date();
  currentDate: Date = new Date();
  oneYearBack: Date = new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  oneMonthBack: Date = null;
  isChecked: any;
  disableCalendar: boolean = false;
  selectedUnits: any;
  timeZone: any;
  newDate: string;
  filterData: any;
  constructor(private liveStreamingDataService: LiveStreamingDataService) {

    window.addEventListener('disable-inputs', (evt) => {
      this.disableCalendar = true
    })

    window.addEventListener('enable-inputs', (evt) => {
      this.disableCalendar = false
    })

    // if we need to select from plant start date by default.
    // let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    // let allPlants = JSON.parse(sessionStorage.getItem("accessible-plants"));
    // allPlants.forEach(ele =>{
    //   if(ele.id == selectedPlantId){
    //     this.oneMonthBack = ele.start_date
    //   }
    // })
    // if we need to select last 2 months by default.
    const month = this.today.getMonth();
    this.today.setMonth(month - 2);
    this.oneMonthBack = this.today

    this.subscription.add(this.liveStreamingDataService.getSelectedFilterData.subscribe(filterData => {
      // this.selectedUnitItems=selectedUnits;
      this.filterData = filterData
      if (filterData['startDate'] && filterData['endDate']) {
        this.selectedDate = [moment(filterData['startDate']), moment(filterData['endDate'])]
        this.startingDate = moment(filterData['startDate'])
        this.endingDate = moment(filterData['endDate'])
      } else {
        let startAndEndDate = JSON.parse(sessionStorage.getItem('startAndEndDate'))
        if (startAndEndDate?.length == 2) {
          this.selectedDate = startAndEndDate
        } else {
          this.selectedDate = [this.oneMonthBack, this.currentDate]
        }
      }
    }))
  }

  ngOnInit(): void {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    this.newDate = moment()?.tz(this.timeZone)?.format("YYYY-MM-DD HH:mm:ss")
    sessionStorage.setItem('selectedLocationDate', this.newDate)
    this.currentDate = moment(this.newDate) as any
    let selectedPlantId = JSON.parse(sessionStorage.getItem("selectedPlant"));
    let allPlants = JSON.parse(sessionStorage.getItem("accessible-plants"));
    allPlants.forEach(ele =>{
      if(ele.id == selectedPlantId){
        this.AllDatesStart = ele.start_date
      }
    })
    this.subscription.add(this.liveStreamingDataService.getSelectedFilterData.subscribe(filterData => {
      // this.selectedUnitItems=selectedUnits;
      if (filterData['startDate'] && filterData['endDate']) {
        this.selectedDate = [moment(filterData['startDate']), moment(filterData['endDate'])]
        this.startingDate = moment(filterData['startDate'])
        this.endingDate = moment(filterData['endDate'])
      } else {
        let startAndEndDate = JSON.parse(sessionStorage.getItem('startAndEndDate'))
        if (startAndEndDate?.length == 2) {
          this.selectedDate = startAndEndDate
        } else {
          this.selectedDate = [this.oneMonthBack, this.currentDate]
        }
      }
    }))
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
    sessionStorage.setItem('startAndEndDate', JSON.stringify([this.startDate1, this.endDate1]))
    this.liveStreamingDataService.passSelectedDates(this.startDate1, this.endDate1)
    this.liveStreamingDataService.passFilterData(this.filterData.units, this.filterData.zones, this.filterData.time, this.filterData.source, this.filterData.camera_name, this.filterData.permit_number, this.filterData.type_of_permit, this.filterData.sort, this.filterData.nature_of_work, this.filterData.videoType, this.startDate1, this.endDate1);
  }

  /**
   * display start date and end date.
   */
  displayDates(selectedDates) {
    this.startDate = JSON.parse(selectedDates).startDate;
    this.endDate = JSON.parse(selectedDates).endDate;
  }

  /**
   * select start date and end date.
   */
  datePicker(data) {
    // let date = this.selectedDate.split(',');

    this.selectedDate = data
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
    sessionStorage.setItem('startAndEndDate', JSON.stringify([this.startDate, this.endDate]))
    sessionStorage.setItem('manually-selected-dates', JSON.stringify([this.startDate, this.endDate]))
    this.liveStreamingDataService.passSelectedDates(this.startDate, this.endDate)
    this.liveStreamingDataService.passFilterData(this.filterData.units, this.filterData.zones, this.filterData.time, this.filterData.source, this.filterData.camera_name, this.filterData.permit_number, this.filterData.type_of_permit, this.filterData.sort, this.filterData.nature_of_work, this.filterData.videoType, this.startDate, this.endDate);
  }


  startingDate: any
  endingDate: any
  AllDatesStart: any
  disableApplyButton: boolean = true;
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
    if (!this.isChecked) {
      if ((this.endingDate == null || this.endingDate.length == 0)) {
        // this.snackbarService.show('Please select both start and end dates to filter by range', true, false, false, false)
        // dateRangeStart.value = ""
        // dateRangeEnd.value = ""
        // this.startingDate = "";
        // this.endingDate = "";
        this.endingDate = this.startingDate
        this.datePicker([this.startingDate, this.endingDate])
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



  // onApplyClick() {

  // }

  onCheckboxChange() {
    this.rangeFilter(null)
  }

  ngAfterViewInit() {
    // Attach a click event listener to the date picker element
    this.rangePicker.openedStream.subscribe((opened: boolean) => {
      // if (opened) {
      window.dispatchEvent(new CustomEvent('close-filter'))
      // Handle the date range picker opened event here
      // }
    });
  }


}
