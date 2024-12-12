import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Subscription } from 'rxjs';

import { SafetyAndSurveillanceDataService } from '../../service/data.service';
import { PlantService } from '../../service/plant.service';

import { DateHeaderComponent } from '../date-header/date-header.component';
import * as moment from 'moment';

@Component({
  selector: 'app-home-navbar',
  templateUrl: './home-navbar.component.html',
  styleUrls: ['./home-navbar.component.css']
})
export class HomeNavbarComponent implements OnInit {

  @ViewChild('obsSearch') obsSearch: NgSelectComponent;
  readonly ExampleHeaderComponent = DateHeaderComponent;
  @Output() selectTab = new EventEmitter<string>();


  isTouchUIActivated = false;

  intervalDropdownList: any = [
    'Custom', 'Yearly', 'Monthly'
  ]
  yearlyDropdownList: any ;
  yearAndMonthDropdownList: any;
  monthlyDropdownList: any = [
    'Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'
  ]
  yearsData: any;
  months: any[] = [
    { 'key': 1, 'value': 'Jan' },
    { 'key': 2, 'value': 'Feb' },
    { 'key': 3, 'value': 'Mar' },
    { 'key': 4, 'value': 'Apr' },
    { 'key': 5, 'value': 'May' },
    { 'key': 6, 'value': 'Jun' },
    { 'key': 7, 'value': 'Jul' },
    { 'key': 8, 'value': 'Aug' },
    { 'key': 9, 'value': 'Sep' },
    { 'key': 10, 'value': 'Oct' },
    { 'key': 11, 'value': 'Nov' },
    { 'key': 12, 'value': 'Dec' },
  ]
  selectedInterval = this.intervalDropdownList[0]
  // yearlySelectedInterval = this.yearlyDropdownList[0]
  yearlySelectedInterval:any;
  yearAndMonthSelectedInterval:any;
  // yearAndMonthSelectedInterval = this.yearAndMonthDropdownList[0]
  monthlySelectedInterval = this.monthlyDropdownList[0]
  currentTab: string = 'home'

  selectedDate: any;
  startDate1: any;
  endDate1: any;
  today: Date = new Date();
  currentDate: Date = new Date();
  oneYearBack: Date =  new Date(new Date().setFullYear(new Date().getFullYear() - 1));
  oneMonthBack: Date = null;
  selectMonth: number = 1 + new Date().getMonth();
  observationList: any[] = [];
  obsInterval: any;
  selectedObservation: any;
  unitList: any;
  isbeingSearched: boolean = false;
  subscription: Subscription = new Subscription()
  searchString: string = "";
  disableDropdown: boolean = false;
  selectedUnits: any;
  constructor(private plantService: PlantService, private router: Router,  private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) {

    window.addEventListener('disable-inputs', (evt) => {
      this.disableDropdown = true
    })

    window.addEventListener('enable-inputs', (evt) => {
      this.disableDropdown = false
    })


   const month = this.today.getMonth();
    this.today.setMonth(month - 1);
    this.oneMonthBack = this.today
   }

  ngOnInit(): void {
    this.yearlyDropdownList = this.getYears(5);
    this.yearlyDropdownList.reverse()
    this.yearlySelectedInterval = this.yearlyDropdownList[0]
    this.yearAndMonthDropdownList = this.getYears(5)
    this.yearAndMonthDropdownList.reverse()
    this.yearAndMonthSelectedInterval = this.yearAndMonthDropdownList[0]
    let date = JSON.parse(sessionStorage.getItem('plantDetails'));
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
    this.startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
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
    this.endDate1 = edDate.getFullYear() + '-' + endMonth + '-' + endDate
    this.getObservations();
    this.getAvailableUnits();
  }

  /**
   * select home page or analytic page.
   */
  navigateToTab(tab) {
    this.selectTab.emit(tab)
    this.currentTab = tab;
  }
  /* dynamic years */
  getYears(howLong) {
    const years = [];
    const currentYear = this.getCurrentYear();
    for (let year = currentYear - howLong + 1; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }

  /* get current year */
  getCurrentYear() {
    const date = new Date();
    return date.getFullYear();
  }

  /**
   * select start and end date.
   */
  datePicker(data) {
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
    this.startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
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
    this.endDate1 = edDate.getFullYear() + '-' + endMonth + '-' + endDate
    sessionStorage.setItem('selectedDates', JSON.stringify([this.startDate1, this.endDate1]))
  }


  intervalSelected(event: any) {
    this.selectedInterval = event;
  }

    /**
   * functionaly for yearly selected in day dropdown.
   */
  yearlyIntervalSelected(event: any) {
    this.yearlySelectedInterval = event;
    let firstDate = this.yearlySelectedInterval + "-" + '01' + "-" + '01';
    let lastDate = this.yearlySelectedInterval + "-" + 12 + "-" + 31;
    sessionStorage.setItem('startAndEndDate', JSON.stringify([firstDate ,lastDate]))
    this.safetyAndSurveillanceDataService.passSelectedDates(firstDate ,lastDate);
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      this.selectedUnits = units
    })
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits, firstDate ,lastDate);
  }

   /**
   * functionaly for monthly selected in day dropdown.
   */
  monthlyIntervalSelected(event: any) {
    this.monthlySelectedInterval = event;
    this.getDates(this.selectMonth,this.yearAndMonthSelectedInterval)
  }

  yearAndMonthIntervalSelected(event: any) {
    this.yearAndMonthSelectedInterval = event;
    this.getDates(this.selectMonth,this.yearAndMonthSelectedInterval)
  }

  monthchange(event: any)
  {
    this.getDates(this.selectMonth,this.yearAndMonthSelectedInterval)
  }

  getDates(selectedMonth , selectedYear){
    function getFirstDayOfMonth(year, month) {
       let firstDate = new Date(year, month, 1);
       let d: any  = firstDate.getDate()
       let m: any = firstDate.getMonth()+1;
       let y = firstDate.getFullYear();

       if (d < 10) {
        d = '0' + d;
      } else {
        d = d;
      }

       if (m < 10) {
        m = '0' + m;
      } else {
        m = m;
      }

       return y + "-" + m + "-" + d;
    }

    function getLastDayOfMonth(year, month) {
      let lastDate = new Date(year, month + 1, 0);
      let d = lastDate.getDate()
      let m = lastDate.getMonth()+1;
      let y = lastDate.getFullYear();
      return y + "-" + m + "-" + d;
    }

    let firstDate = getFirstDayOfMonth(selectedYear, selectedMonth-1);
    let lastDate = getLastDayOfMonth(selectedYear, selectedMonth-1);
    sessionStorage.setItem('startAndEndDate', JSON.stringify([firstDate ,lastDate]))
    this.safetyAndSurveillanceDataService.passSelectedDates(firstDate ,lastDate);
    this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
      this.selectedUnits = units;
    })
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedUnits, firstDate ,lastDate);
  }

   /**
   * get the observation data.
   */
  getObservations() {
    this.plantService.getObservations().subscribe(
      observations => {
        let data: any = observations;
        this.observationList = data;
        this.observationList.sort((v1, v2)=>{ return v1.id -v2.id});
        this.obsInterval = setInterval(() => {
          let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
          if (unitDetails) {
            let selectedObservation = JSON.parse(sessionStorage.getItem('selectedObservation'));
            if (selectedObservation) {
              window.dispatchEvent(new CustomEvent('hide-banner'))
              this.selectedObservation = this.observationList.find(obs => obs.id === Number(selectedObservation.id));
              this.navigateFromSearch();
              sessionStorage.removeItem('selectedObservation');
              clearInterval(this.obsInterval);
            }
            else {
              clearInterval(this.obsInterval);
            }
          }
        }, 1300);
      },
      error => {
      },
      () => {
      }
    )
  }

   /**
   * get the all units and populating to unit dropdown.
   */
  getAvailableUnits() {
    this.plantService.getAvailableUnits().subscribe(
      availableUnits => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          Object.keys(units.IOGP_Category).forEach((unit) => {
            if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
              let unitDetails = {};
              unitDetails['obsData'] = {};
              unitDetails['unitName'] = unit;
              unitDetails['id'] = units.IOGP_Category[unit].id;
              unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
              unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
              unitDetails['totalObsFlights'] = units.IOGP_Category[unit].flights_count;
              unitDetails['userGroup'] = units.IOGP_Category[unit].access_permissions[0];
              unitDetails['obsData']['openCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].open }).reduce((a, b) => a + b, 0);
              unitDetails['obsData']['closeCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].close }).reduce((a, b) => a + b, 0);
              unitDetails['order'] = units.IOGP_Category[unit].order;
              unitList.push(unitDetails);

            }
          });
          unitList.sort((a, b) => (a.order < b.order) ? -1 : 1);
          this.unitList = unitList
          sessionStorage.setItem('unitDetails', JSON.stringify(unitList));
          sessionStorage.setItem('unitCount', unitList.length.toString());

        }

      },
      error => {
      },
      () => {
      }
    )
  }

  OnOpen() {
    if (!this.isbeingSearched) {
      this.obsSearch.close()
    }
  }

   /**
   * search functionality for globale search.
   */
  OnSearch(event: any) {
    if(event.term.length > 0) {
      this.isbeingSearched = true;
      this.obsSearch.open()
    } else {
      this.isbeingSearched = false;
      this.obsSearch.close();
    }
  }

  OnBlue() {
    this.isbeingSearched = false;
    this.obsSearch.close()
  }


  /**
   * navigate to observation page with selected onservation id.
   */
  navigateFromSearch() {
    sessionStorage.removeItem('filterData')
    let unit = this.unitList.filter(ele =>{return ele.unitName == this.selectedObservation.unit});
    let obj = {...this.selectedObservation, unit_id: unit[0].id, start_date: unit[0].startDate, end_date: new Date()}
    this.currentTab = 'observations';
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    sessionStorage.setItem('searchObservation', JSON.stringify(this.selectedObservation));
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    this.safetyAndSurveillanceDataService.passGlobalSearch(obj);
    this.selectedObservation = [];
    let today = new Date();
        let dd:any = today.getDate();
        let mm:any = today.getMonth()+1;//January is 0!`

        let yyyy = today.getFullYear();
        if(dd<10){dd='0'+dd}
        if(mm<10){mm='0'+mm}
        let timeZone =  JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
        let toDay = moment()?.tz(timeZone)?.format("YYYY-MM-DD")
        sessionStorage.setItem('startAndEndDate', JSON.stringify([unit[0].startDate, toDay]))
    this.safetyAndSurveillanceDataService.passSelectedDates(unit[0].startDate, toDay)
    this.safetyAndSurveillanceDataService.passSelectedUnits(unit[0].id);
    this.safetyAndSurveillanceDataService.passDatesAndUnits(unit[0].id, unit[0].startDate, toDay)
    sessionStorage.setItem('selectedUnits', JSON.stringify(unit[0].id));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    window.dispatchEvent(new CustomEvent('global-search-used'))
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

}
