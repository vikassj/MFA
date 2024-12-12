import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { AngularMyDatePickerDirective, IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import { Subscription } from 'rxjs';
import * as CryptoJS from 'crypto-js';
declare var $: any;

import { CommonService } from '../../services/common.service';
import { DataService } from '../../services/data.service';
import { ModalPdfViewerService } from '../../services/modal-pdf-viewer.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ManpowerCountingCommonService } from '../../shared/services/common.service';
import { ManpowerCountingDataService } from '../../shared/services/data.service';
import { UnitService } from '../../shared/services/unit.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  @ViewChild('dp') adp: AngularMyDatePickerDirective;
  isRouteClicked: boolean;
  selected = [];
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  selectedItems = ["Month wise", "Year wise"];
  selectedItemDate = this.selectedItems[0];
  startDateOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm-yyyy'
  };
  reportStartDate: IMyDateModel = null;
  endDateOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm-yyyy'
  };
  reportEndDate: IMyDateModel = null;
  msg: string = '';
  reportColumns: any[] = [];
  subscription: Subscription = new Subscription();
  location: string = '';
  reportRows: any[] = [];
  selectedRow: any;
  showSideBar: boolean = false;
  //location names
  locationMpcData: any[] = [];
  noDataMsg: string = '';
  zones: string = ""
  //getMpcZones()
  mpcChartInterval: any;
  mpcZones: any[] = [];
  selectedMpcZone: string = '';
  unitsAndZones: any;
  locationFilter: any;
  refreshDayMonthYear: boolean = true;
  selectedYear: any = new Date().getFullYear();
  year: number = new Date().getFullYear();
  month: number = 1 + new Date().getMonth();
  selectMonth: number = 1 + new Date().getMonth();
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
  monthWiseNone: boolean = true;

  constructor(public changeDetectorRef: ChangeDetectorRef, private commonService: CommonService, private manpowerCountingDataService: ManpowerCountingDataService, private dataService: DataService, private unitService: UnitService, private snackbarService: SnackbarService, private modalPdfViewerService: ModalPdfViewerService, private manpowerCountingCommonService: ManpowerCountingCommonService) {
  }

  ngOnInit() {
    this.getAvailableUnits()
  }

  /**
   * get units mapping to populate the units dropdown.
   */
  getAvailableUnits() {
    this.dataService.passSpinnerFlag(true, true);
    this.manpowerCountingCommonService.getAvailableUnits().subscribe((data) => {
      this.getMpcLocations()
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      })
  }

  /**
   * get Locations mapping to populate the Locations dropdown.
   */
  getMpcLocations() {
    this.manpowerCountingCommonService.getMpcLocations().subscribe(
      locationsData => {
        this.unitsAndZones = locationsData['data'];
        if (locationsData['response_code'] === 1) {
          this.locationMpcData = [];
          this.locationMpcData = locationsData['data'];
          this.zones = this.locationMpcData[0].name
          this.unitsAndZones.map(item => {
            if (this.zones == item.name) {
              this.locationFilter = item.location
              sessionStorage.setItem('mpcSelectedUnit', item.unit);
            }
          })
          this.DayMonthYearWiseData()
          this.locationMpcData.forEach(location => {
            if (location.location === 'UL') {
              location.filter = 'Unit-wise';
            }
            else {
              location.filter = 'Gate-wise';
            }
          })
          this.locationMpcData.sort((a, b) => (a.order < b.order) ? -1 : 1);
          this.noDataMsg = (this.locationMpcData.length > 0) ? '' : 'No locations available.';
        }
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      })
  }

  /**
   * disable the date input.
   */
  disabledDates() {
    let d = new Date();
    let ed = d.getDate() + 1;
    let st = d.getDate() - 1;
    this.startDateOptions = {
      dateRange: false,
      monthSelector: true,
      yearSelector: true,
      highlightDates: [],
      disableDates: [],
      disableHeaderButtons: true,
      showWeekNumbers: false,
      disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
    };
    if (this.reportStartDate !== null) {
      var Year = this.reportStartDate["singleDate"]["date"]["year"]
      var Month = this.reportStartDate["singleDate"]["date"]["month"]
      var Day = this.reportStartDate["singleDate"]["date"]["day"]
      if (Day == 1) {
        if (Month == 1) {
          Month = 12
          Day = 31
        }
        else if (Month == 2) {
          Month = 1
          Day = 31
        }
        else if (Month == 3) {
          Month = 2
          Day = 28
        }
        else if (Month == 4) {
          Month = 3
          Day = 31
        }
        else if (Month == 5) {
          Month = 4
          Day = 30
        }
        else if (Month == 6) {
          Month = 5
          Day = 31
        }
        else if (Month == 7) {
          Month = 6
          Day = 30
        }
        else if (Month == 8) {
          Month = 7
          Day = 31
        }
        else if (Month == 9) {
          Month = 8
          Day = 31
        }
        else if (Month == 10) {
          Month = 9
          Day = 30
        }
        else if (Month == 11) {
          Month = 10
          Day = 31
        }
        else if (Month == 12) {
          Month = 11
          Day = 30
        }
      }
    }
    if (Month == 12 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 1 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 2 && Day == 28) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 3 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 4 && Day == 30) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 5 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 6 && Day == 30) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 7 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 8 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 9 && Day == 30) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 10 && Day == 31) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else if (Month == 11 && Day == 30) {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
    else {
      this.endDateOptions = {
        dateRange: false,
        monthSelector: true,
        yearSelector: true,
        highlightDates: [],
        disableDates: [],
        disableHeaderButtons: true,
        showWeekNumbers: false,
        disableUntil: { year: Year, month: Month, day: Day - 1 },
        disableSince: { year: d.getFullYear(), month: d.getMonth() + 1, day: ed },
      };
    }
  }

  /**
   * get zones mapping to populate the zones dropdown.
   */
  getMpcZones() {
    this.unitService.getMpcZones().subscribe(
      mpcZones => {
        if (mpcZones['response_code'] === 1) {
          clearInterval(this.mpcChartInterval);
          let units: any = mpcZones['data'];
          units.sort((a, b) => (a.order < b.order) ? -1 : 1);
          this.mpcZones = units.map(item => item.name);
          this.mpcZones.unshift('All Locations');
          if (sessionStorage.getItem('mpcSelectedZone')) {
            this.selectedMpcZone = sessionStorage.getItem('mpcSelectedZone');
          }
          else {
            this.selectedMpcZone = this.mpcZones[0];
          }
        }
      })
  }

  /**
   * get reports for selected zones, start date and end date.
   */
  fetchReportsData() {
    this.getMpcZones();
    let startDate = this.reportStartDate["singleDate"]["date"]["year"] + "-" + this.reportStartDate["singleDate"]["date"]["month"] + "-" + this.reportStartDate["singleDate"]["date"]["day"]
    let endDate = this.reportStartDate["singleDate"]["date"]["year"] + "-" + this.reportStartDate["singleDate"]["date"]["month"] + "-" + this.reportStartDate["singleDate"]["date"]["day"]
    this.dataService.passSpinnerFlag(true, true);
    this.unitService.fetchReportsData(this.zones, startDate, endDate).subscribe(
      data => {
        let reportRows: any = data;
        this.reportRows = [];
        this.reportRows = reportRows;
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      });
  }

  /**
   * get reports for selected filter.
   */
  fetchFilterReportsData() {
    if (this.reportStartDate !== null && this.reportEndDate !== null) {
      this.getMpcZones();
      let startDate = this.reportStartDate["singleDate"]["date"]["year"] + "-" + this.reportStartDate["singleDate"]["date"]["month"] + "-" + this.reportStartDate["singleDate"]["date"]["day"]
      let endDate = this.reportEndDate["singleDate"]["date"]["year"] + "-" + this.reportEndDate["singleDate"]["date"]["month"] + "-" + this.reportEndDate["singleDate"]["date"]["day"]
      this.dataService.passSpinnerFlag(true, true);
      this.unitService.fetchReportsData(this.zones, startDate, endDate).subscribe(
        data => {
          let reportRows: any = data;
          this.reportRows = [];
          this.reportRows = reportRows;
        },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.dataService.passSpinnerFlag(false, true);
        });
    }
  }

  fetchReportsData1() {
    this.getMpcZones();
    this.dataService.passSpinnerFlag(true, true);
    let today = new Date();
    let date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    this.unitService.fetchReportsData(this.zones, date, date).subscribe(
      data => {
        let reportRows: any = data;
        this.reportRows = [];
        this.reportRows = reportRows;
        this.DayMonthYearWiseData()
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      });
  }

  onRouteClicked() {
    this.isRouteClicked = !this.isRouteClicked
  }

  active(data) {
    if(sessionStorage.getItem('mpcSelectedUnit') != data){
    this.refreshDayMonthYear = !this.refreshDayMonthYear;
    this.zones = data;
    this.selectedItemDate = this.selectedItems[0];
    this.unitsAndZones.map(item => {
      if (data == item.name) {
        this.locationFilter = item.location
        sessionStorage.setItem('mpcSelectedUnit', item.unit);
      }
    })
   }
  }

  inputClick(): void {
    this.toggleCalendar();
  }

  toggleCalendar(): void {
    this.adp.toggleCalendar();
    this.changeDetectorRef.detectChanges();
  }

  onZsFilterReset() {
    this.reportEndDate = null;
    this.reportStartDate = null;
  }

  /**
   * select the date.
   */
  DayMonthYearWiseData() {
    let date = new Date()
    let day = date.getDate()
    let year = date.getFullYear()
    let module = 'mpc';
    this.year = this.selectedYear;
    this.month = this.selectMonth;
    this.unitService.DayMonthYearWiseData(this.year, this.locationFilter, this.zones, module, this.month).subscribe(data => {
      let reportRows: any = data;
      this.reportRows = [];
      this.reportRows = reportRows;
    })
  }

  /**
   * select the date.
   */
  dayMonthYearWiseData(data: any) {
    if (this.selectedItems[0] == data) {
      let module = 'mpc';
      this.year = this.selectedYear;
      this.month = this.selectMonth;
      this.unitService.DayMonthYearWiseData(this.year, this.locationFilter, this.zones, module, this.month).subscribe(data => {
        let reportRows: any = data;
        this.reportRows = [];
        this.reportRows = reportRows;
      })
    }
    if (this.selectedItems[1] == data) {
      let module = 'mpc';
      this.month = undefined;
      this.year = this.selectedYear;
      this.unitService.DayMonthYearWiseData(this.year, this.locationFilter, this.zones, module, this.month).subscribe(data => {
        let reportRows: any = data;
        this.reportRows = [];
        this.reportRows = reportRows;
      })
    }
  }
  /**
   * open pdf file.
   */
  openPDF(fileUrl) {
    var encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
    var encryptedFilepath = fileUrl;
    var key = CryptoJS.enc.Hex.parse(encryptionKey);
    var decrypted = CryptoJS.AES.decrypt({
        ciphertext: CryptoJS.enc.Base64.parse(encryptedFilepath)
      }, key, {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7
        });
    var decryptedFilepath = decrypted.toString(CryptoJS.enc.Utf8);
    fileUrl= decryptedFilepath;

    let name = fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');
    // this.modalPdfViewerService.show(name, fileUrl);
    const urlStartIndex = decryptedFilepath.indexOf('https');
    let extractedURL = decryptedFilepath.substring(urlStartIndex); 
    // Remove double quotes from start and end
    extractedURL = extractedURL.replace(/^"|"$/g, '');
    this.modalPdfViewerService.show(name, extractedURL);

  }

  getCurrentYear() {
    const date = new Date();
    return date.getFullYear();
  }

  getYears(howLong) {
    const years = [];
    const currentYear = this.getCurrentYear();
    for (let year = currentYear - howLong + 1; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }

}
