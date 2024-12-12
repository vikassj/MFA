import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import "moment-timezone";

import {
  DateRange,
  MatCalendar,
  MatCalendarCellClassFunction,
  MatDateRangePicker,
} from '@angular/material/datepicker';

import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';

import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { DatesService } from '../../service/dates.service';
import { DataService } from 'src/shared/services/data.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { PlantService } from '../../service/plant.service';


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
  selector: 'app-date-header',
  templateUrl: './date-header.component.html',
  styleUrls: ['./date-header.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ]
})

export class DateHeaderComponent {

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
  disableCalendar: boolean =false;
  selectedUnits: any;
  timeZone: any;
  newDate: string;
  constructor(private plantService: PlantService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, private dataService: DataService, private unitService: UnitService, private snackbarService: SnackbarService) {

    window.addEventListener('disable-inputs', (evt) => {
      this.disableCalendar = true
    })

    window.addEventListener('enable-inputs', (evt) => {
      this.disableCalendar = false
    })

    window.addEventListener('reset-date-filters', (evt: CustomEvent) => {
      // this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)
      let today = new Date();
      let dd = String(today.getDate()).padStart(2, '0');
      let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      let yyyy = today.getFullYear();
      let endDate = yyyy+'-'+mm+'-'+dd;
      if(JSON.parse(sessionStorage.getItem('searchObservation'))){
        this.selectedDate = [moment(evt?.detail?.date), moment(endDate)]
        this.startingDate = moment(evt?.detail?.date)
        this.endingDate = moment(endDate)
      }else if(JSON.parse(sessionStorage.getItem('global-search-notification'))){
        let globalSearchNotification = JSON.parse(sessionStorage.getItem('global-search-notification'))
        this.selectedDate = [moment(globalSearchNotification?.date), moment(endDate)]
        this.startingDate = moment(globalSearchNotification?.date)
        this.endingDate = moment(endDate)
      }
    })

    const month = this.today.getMonth();
    this.today.setMonth(month - 2);
    this.oneMonthBack = this.today

    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(selectedDates => {
      // this.selectedUnitItems=selectedUnits;
      if (selectedDates['startDate'] && selectedDates['endDate']) {
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
        if(searchObservation || obsNavDate){
          let today = new Date();
          let dd = String(today.getDate()).padStart(2, '0');
          let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
          let yyyy = today.getFullYear();
          let endDate = yyyy+'-'+mm+'-'+dd;
          if(searchObservation){
            selectedDates['startDate'] = searchObservation['date']
            sessionStorage.setItem('selectedDateRange', JSON.stringify({'startDate':searchObservation['date'], 'endDate':endDate}))
          }else{
            selectedDates['startDate'] = obsNavDate
            sessionStorage.setItem('selectedDateRange', JSON.stringify({'startDate':obsNavDate, 'endDate':endDate}))
          }
        }
        else{
          let selectedDateRange = JSON.parse(sessionStorage.getItem('selectedDateRange'))
          if(selectedDateRange || JSON.parse(sessionStorage.getItem('navigatedObservation'))){
            if(JSON.parse(sessionStorage.getItem('navigatedObservation'))){
             
            }
            else{
              selectedDates = selectedDateRange
            }
          }
        }
        this.selectedDate = [moment(selectedDates['startDate']), moment(selectedDates['endDate'])]
        this.startingDate = moment(selectedDates['startDate'])
        this.endingDate = moment(selectedDates['endDate'])
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
    this.subscription.add(
      this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
        this.startingDate = data['data']?.['startDate']
        this.endingDate = data['data']?.['endDate']
      }))
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    this.newDate = moment()?.tz(this.timeZone)?.format("YYYY-MM-DD HH:mm:ss")
    sessionStorage.setItem('selectedLocationDate', this.newDate)
    this.currentDate = moment(this.newDate) as any
    // this.dataService.passSpinnerFlag(true, true);
    this.plantService.fetchPlantDetails().subscribe(
      (plantData: any) => {
        let plantDetials: any = plantData;
        sessionStorage.setItem('plantDetails', JSON.stringify(plantData));
      },
      error => {
      },
      () => {
        let date = JSON.parse(sessionStorage.getItem('plantDetails'));
        this.AllDatesStart = date.start_date
      });
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(selectedDates => {
      // this.selectedUnitItems=selectedUnits;
      if (selectedDates['startDate'] && selectedDates['endDate']) {
        let searchObservation = JSON.parse(sessionStorage.getItem('searchObservation'))
        let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
        if(searchObservation || obsNavDate){
          if(searchObservation){
            selectedDates['startDate'] = searchObservation['date']
          }else{
            selectedDates['startDate'] = obsNavDate
          }
        }
        else{
          let selectedDateRange = JSON.parse(sessionStorage.getItem('selectedDateRange'))
          if(selectedDateRange || JSON.parse(sessionStorage.getItem('navigatedObservation'))){
            if(JSON.parse(sessionStorage.getItem('navigatedObservation'))){
             
            }
            else{
              selectedDates = selectedDateRange
            }
          }
        }
        this.selectedDate = [moment(selectedDates['startDate']), moment(selectedDates['endDate'])]
        this.startingDate = moment(selectedDates['startDate'])
        this.endingDate = moment(selectedDates['endDate'])
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
    this.safetyAndSurveillanceDataService.passSelectedDates(this.startDate1, this.endDate1)
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      if(JSON.parse(sessionStorage.getItem('availableUnits'))){
         this.selectedUnits = units
      }
    })
    let selectedDateRange = JSON.parse(sessionStorage.getItem('selectedDateRange'))
    let obsNavDate = JSON.parse(sessionStorage.getItem('obsNavDate'))
    // let navigatedObservation = JSON.parse(sessionStorage.getItem('navigatedObservation'));
    if(obsNavDate){
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits,obsNavDate,this.endDate1);
    }
    else if(selectedDateRange){
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits,selectedDateRange?.startDate,selectedDateRange?.endDate);
    }
    // else if(navigatedObservation){
    //   console.log(this.startDate,this.endDate)
    //   this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits, this.startDate, this.endDate);
    // }
    else{
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits, this.startDate1, this.endDate1);
    }
  }

  /**
   * display start date and end date.
   */
  displayDates(selectedDates) {
    this.startDate = JSON.parse(selectedDates).startDate;
    this.endDate = JSON.parse(selectedDates).endDate;
  }

  /**
   * Reset the "All dates" option.
   */
  onCancelButtonClick() {
    this.isChecked = false;
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
    sessionStorage.setItem('selectedDateRange', JSON.stringify({'startDate':this.startDate, 'endDate':this.endDate}))
    // sessionStorage.setItem('manually-selected-dates', JSON.stringify([this.startDate, this.endDate]))
    this.safetyAndSurveillanceDataService.passSelectedDates(this.startDate, this.endDate)
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      this.selectedUnits = units
    })
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits, this.startDate, this.endDate);
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

  /**
   * select start date and end date.
   */
  dateRangeChange(
    dateRangeStart: HTMLInputElement,
    dateRangeEnd: HTMLInputElement
  ) {
    if (!this.isChecked) {
      sessionStorage.removeItem('searchObservation')
      sessionStorage.removeItem('obsNavDate')
      sessionStorage.removeItem('manuallySelectedPermits')
      sessionStorage.setItem('selectedActivePage', JSON.stringify(1))
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
      sessionStorage.setItem('selectedActivePage', JSON.stringify(1))
      sessionStorage.removeItem('searchObservation')
      sessionStorage.removeItem('obsNavDate')
      // sessionStorage.removeItem('manuallySelectedPermits')
      let date = sessionStorage.getItem('selectedLocationDate')
      this.startingDate = moment(this.AllDatesStart);
      this.endingDate = moment(date);
      this.datePicker([this.startingDate, this.endingDate])
    }
  }

  dateFormating(date){
    return moment(date).format('DD-MMM-YYYY')
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
        window.dispatchEvent(new CustomEvent('close-filter'))
    });
  }

  @HostListener('document:click', ['$event'])
  onClick(event: MouseEvent) {
    if ((event.target as HTMLElement).closest('.mat-calendar-body-selected')) {
      this.isChecked = false
    }
  }


}

