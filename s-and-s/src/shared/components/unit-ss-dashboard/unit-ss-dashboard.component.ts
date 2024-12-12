import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { IAngularMyDpOptions, IMyCalendarViewChanged, IMyDateModel } from 'angular-mydatepicker';
import { Router } from '@angular/router';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
declare var $: any;

import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import { PlantService } from 'src/app/shared/service/plant.service';
import { CommonService } from '../../services/common.service';
import { DataService } from '../../services/data.service';
import { SnackbarService } from '../../services/snackbar.service';
import { IogpService } from './services/iogp.service';
import { UnitService } from './services/unit.service';


@Component({
  selector: 'app-unit-ss-dashboard',
  templateUrl: './unit-ss-dashboard.component.html',
  styleUrls: ['./unit-ss-dashboard.component.scss']
})
export class UnitSsDashboardComponent implements OnInit, OnChanges {

  @Output() mapView = new EventEmitter<boolean>();
  @Output() reportData = new EventEmitter<any>();
  @Input() checkMapView: boolean;
  @Input() categoryMapStatus: any;
  @Input() categoryMap: any;


  unitWiseCalenderOptions: IAngularMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    dateRange: false,
    // disable all dates by default
    disableDateRanges: [{
      begin: { year: 1000, month: 1, day: 1 },
      end: { year: 9999, month: 12, day: 31 }
    }],
    enableDates: []
  };
  overAllUnitWiseCalenderModel: IMyDateModel = null;
  overAllUnitWiseCalenderOptions: IAngularMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    dateRange: false,
    // disable all dates by default
    disableDateRanges: [{
      begin: { year: 1000, month: 1, day: 1 },
      end: { year: 9999, month: 12, day: 31 }
    }]
  };
  unitWiseCalenderModel: IMyDateModel = null;

  observationsFormCalenderOptions1: IAngularMyDpOptions = {
    dateRange: true,
    dateFormat: 'dd-mm-yyyy'
  };
  observationsFormCalenderModel: IMyDateModel = null;
  selectedButton = 'all';
  observationsByUnitAndRiskRating: any = {
  };

  obsBarData: any = {
    xAxisData: [],
    barData: [],
    masterBarData: [],
    openCount: 0,
    closeCount: 0
  };

  startDate: any = '';
  selectedDate: any = '';

  observationIsShow = false;

  totalPendingCount: number = 0;
  unitList: any[] = [];
  msg: string = '';
  iogpCategories: any[] = [];
  iogpCategoriesGreen: any[] = [];
  selectedUnit: string = '';
  custom_start_date: string = '';
  custom_end_date: string = '';
  selectedIds: any[] = [];
  obs_Status: string = 'close';

  riskWiseData: any = {};

  endDate: string = '';
  obsDropdownData: any;
  selectedObsZone: string = '';
  selectedObsCategory: any[] = [];
  setInterval: any;
  showRiskRatingDetails: boolean = false;
  showDetailedLegend: boolean = false;
  showSessionFlights: boolean = false;
  dataIsThere: boolean = false;
  chartRefreshInterval: number = 10000;
  obsSelectedToggle: string = 'all';
  obsCategories: any[] = [];
  selectedMode: boolean = true;
  dailyOpenCount: number = 0;
  dailyCloseCount: number = 0;
  selectedStatus: any[] = [];
  showUnitwiseGraph: boolean = false;
  expand_collapse_unit: string = 'Expand';
  showRiskwiseGraph: boolean = false;
  expand_collapse_risk: string = 'Expand';
  riskRatio: any;
  riskwiseAttribution: any;
  disableToggle: boolean = false;
  sessionBarData: any = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    legend: {
      x: 'center',
      y: 'bottom',
      icon: 'circle',
      selector: [
        {
          type: 'all or inverse',
          title: 'Toggle Selection'
        }
      ],
      data: []
    },
    grid: {
      left: '0.5%',
      right: '0.5%',
      top: '10%',
      bottom: '30',
      containLabel: true
    },
    xAxis: [
      {
        type: 'category',
        data: []
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [],
    openCount: 0,
    closeCount: 0
  };
  riskLevels: any[] = [];
  riskRatingDetails: any;
  subscription: Subscription = new Subscription();
  availableDates: any;
  intervalId: any;
  currentUnitPage: string = '';
  units: any[] = [];
  unitName: string = '';
  userName: string = '';
  shortName: string = '';
  selectedSideBarItem: any;
  fullyLoaded: boolean = false;
  allObsDropdownData: Object;
  iogpDashboardDetails: any = {
    "sidebar": [],
    "showRiskRatingDetails": true,
    "showDetailedLegend": true,
    "showSessionFlights": true,
    "chartRefreshInterval": 30000
  };
  loader: boolean;
  unitListItems: any;
  allCategory = ["HC","W@H","L&H","PPE","CSC", "FO","VS","HK","OTH"];
  allRiskRating = [1,2,3,4,5]
  allStatus = ['Open','Snooze','Archive','Closed-False Positive', 'Closed-No Action', 'Closed-Action Taken']
  selectedPlantDetails:any;
  constructor(private dataService: DataService, private router: Router, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService, private commonService: CommonService, private unitService: UnitService, private snackbarService: SnackbarService, private iogpService: IogpService, private plantService: PlantService) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
    window.addEventListener('units-changed', (evt) => {
      if (this.expand_collapse_unit == 'Collapse' && this.expand_collapse_risk == 'Collapse') {
        this.toggleUnitStackChart();
        this.toggleRiskStackChart();
      }
    })
  }

  ngOnChanges(): void {
  }

  ngOnInit() {
    this.getAvailableUnits();
    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
      if (data['value'] == 'units') {
        this.selectedIds = data['data'] ? data['data'] : [];
      } else if (data['value'] == 'dates') {
        this.custom_start_date = data['data']['startDate'];
        this.custom_end_date = data['data']['endDate'];
      } else if (data['value'] == 'all') {
        this.selectedIds = data['data']['units']
        this.custom_start_date = data['data']['startDate'];
        this.custom_end_date = data['data']['endDate'];
      } else if (data['value'] == 'empty') {
        this.riskRatio = {};
        this.observationsByUnitAndRiskRating = {};
        this.riskWiseData = {};
        this.riskwiseAttribution = {};
        this.obsBarData.xAxisData = [];
        this.obsBarData.barData = [];
        this.disableToggle = true;
      }

      if ((this.custom_start_date && this.custom_end_date) && this.selectedIds?.length > 0 && data['value'] != 'empty') {
        // waits for resolution from the promise to execute loadDashboardData
        this.waitForSelectedUnit().then(() => {
          this.loadDashboardData();
        });

        this.showUnitwiseGraph = false;
        this.showRiskwiseGraph = false;
        this.disableToggle = false;
      }
    }))

    this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
      this.iogpCategories = data['module_configurations']['iogp_categories'].filter(cat => cat.show_hide);
      this.obsCategories = this.iogpCategories.map(category => category.acronym);
      this.obsCategories.push('Closed');
      this.riskLevels = data['module_configurations']['risk_rating_levels'];
      this.showRiskRatingDetails = this.iogpDashboardDetails.showRiskRatingDetails;
      this.showDetailedLegend = this.iogpDashboardDetails.showDetailedLegend;
      this.showSessionFlights = this.iogpDashboardDetails.showSessionFlights;
      this.chartRefreshInterval = data['page_configurations']['dashboard_page']['chart_refresh_interval'];
      this.dataService.passSpinnerFlag(true, true)

    });

    this.unitName = sessionStorage.getItem('selectedUnit');
    this.userName = sessionStorage.getItem('firstName') + ' ' + sessionStorage.getItem('lastName');
    this.shortName = this.userName.slice(0, 1);

  }

  /**
  * unit mapping to populate the units dropdown.
  */
  getAvailableUnits() {
    this.plantService.getAvailableUnits().subscribe(
      (availableUnits: any) => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          this.units = [];
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
          this.unitListItems = unitList
          this.units = unitList.map(unit => unit.unitName);

          sessionStorage.setItem('unitDetails', JSON.stringify(unitList));
          sessionStorage.setItem('unitCount', unitList.length.toString());
          if (!this.unitName || this.unitName == 'null') {
            let selectedUnitDetails: any = unitList[0];
            sessionStorage.setItem('selectedUnit', selectedUnitDetails.unitName);
            sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
            this.onUnitSelect(this.units[0], 'initial-call');
          }
        }
      },
      error => {
        this.dataService.passSpinnerFlag(false, true)
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }


  /**
  * select unit in units dropdown.
  */
  onUnitSelect(selectedUnit, calledFromFlag) {
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.removeItem('selectedUnitDate');
    this.onMenuClick('', this.currentUnitPage);
    this.unitName = selectedUnit;
    sessionStorage.setItem('selectedUnit', this.unitName);
    let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(unitDetails.find(unit => unit.unitName === this.unitName)));
    this.safetyAndSurveillanceDataService.passSelectedUnit(this.unitName, true);
  }
  onMenuClick(page, menu) {
    if (screen.width < 992) {
      document.getElementById('navbar-toggler').click();
    }
    if (page === '2fa') {
      let userData = JSON.parse(sessionStorage.getItem('userData'));
      userData.page = 'settings';
      sessionStorage.setItem('userData', JSON.stringify(userData));
    }
    this.currentUnitPage = menu;
  }

  waitForSelectedUnit(): Promise<void> {
    // retry checking the sessionStorage for selected unit until it is not null , then return the resolution of promise
    return new Promise((resolve) => {
      this.intervalId = setInterval(() => {
        this.selectedUnit = sessionStorage.getItem('selectedUnit');
        let unitDetails = sessionStorage.getItem('selectedUnitDetails')
        if (this.selectedUnit !== null && unitDetails !== null && unitDetails !== "undefined") {
          clearInterval(this.intervalId);
          resolve();
        }
      }, 100);
    });
  }
  /**
  * get dashboard data.
  */

  loadDashboardData() {
    this.fullyLoaded = false;
    clearInterval(this.setInterval);
    this.selectedUnit = sessionStorage.getItem('selectedUnit');
    if (this.selectedUnit != null) {
      let selectedUnitDetails: any = JSON.parse(sessionStorage.getItem('selectedUnitDetails'));
      this.obsBarData.xAxisData = [];
      this.startDate = selectedUnitDetails.startDate;
      this.endDate = selectedUnitDetails.endDate;
      var dateofvisit = moment(this.custom_start_date);
      var today = moment(this.custom_end_date);
      let diffDays = today.diff(dateofvisit, 'days')
      // let diffDays = Math.round(Math.abs((moment(this.custom_start_date).days() - moment(this.custom_end_date).) / 86400000));
      let date = moment(this.custom_start_date + 'T00:00:00');
      for (var i = 0; i < diffDays + 1; i++) {
        this.obsBarData.xAxisData.push({ 'label': moment(date).add(i, 'days').format('D-MMM'), 'date': moment(date).add(i, 'days').format('YYYY-MM-DD') });
      }
      if (this.selectedMode) {
        this.getChartData();
      }
      else {
        this.getFlightChartData();
      }
      this.setInterval = setInterval(() => {
        this.getDailyStatistics();
        if (this.selectedMode) {
          this.getChartData();
        }
        else {
          this.getFlightChartData();
        }
      }, this.chartRefreshInterval);
    } else {
      this.dataService.passSpinnerFlag(false, true)
    }

  }

  /**
  * get the filter data and populating zones in zones dropdown .
  */
  getFilters() {
    this.unitService.fetchSidebarData(this.selectedIds).subscribe(
      dropdownData => {
        this.allObsDropdownData = dropdownData
        this.obsDropdownData = Object.keys(dropdownData);
        let allZones = this.obsDropdownData.find(data => { return data == 'All Zones' })
        if (allZones) {
          this.selectedObsZone = 'All Zones';
        } else {
          this.selectedObsZone = this.obsDropdownData[0];

        }
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.getDates();
      }
    )
  }

  returnTitle(category) {
    let title = '<p class="text-left mb-0">';
    if (!$.isEmptyObject(this.riskRatingDetails)) {
      this.riskLevels.forEach(risk => {
        let counts = this.riskRatingDetails[risk.rating][category];
        let totalCount = counts.open + counts.close
        title = title + risk.ratingName + ' | ' + totalCount + '<br/>';
      });
    }
    title = title + '</p>';
    return title;
  }

  formatTooltip() {
    setTimeout(() => {
      $('[data-toggle="tooltip"]').tooltip('dispose');
      $('[data-toggle="tooltip"]').tooltip();
    }, 100);
  }

  getDates() {
    this.dataService.passSpinnerFlag(true, true)
    this.unitService.fetchDates().subscribe(
      availableDates => {
        this.availableDates = availableDates;
        this.unitWiseCalenderOptions.enableDates = [];
        this.availableDates.forEach(date => {
          let d = date.split('-').map(item => Number(item));
          this.unitWiseCalenderOptions.enableDates.push({ year: d[0], month: d[1], day: d[2] });
        });
        let selectedUnitDate = sessionStorage.getItem('selectedUnitDate');
        this.selectedDate = (this.availableDates.length > 0) ? (this.availableDates.indexOf(selectedUnitDate) > -1) ? selectedUnitDate : this.availableDates[this.availableDates.length - 1] : this.commonService.formatDate(new Date());
        this.unitWiseCalenderModel = { dateRange: null, isRange: false, singleDate: { date: { year: Number(this.selectedDate.split('-')[0]), month: Number(this.selectedDate.split('-')[1]), day: Number(this.selectedDate.split('-')[2]) } } };
        this.unitWiseCalenderOptions = { ...this.unitWiseCalenderOptions };
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.getDailyStatistics();
      }
    )
  }

  onCalendarViewChanged(event: IMyCalendarViewChanged) {
    let copy: IAngularMyDpOptions = this.getCopyOfOptions();
    copy.enableDates = [];
    this.availableDates.forEach(date => {
      let d = date.split('-').map(item => Number(item));
      copy.enableDates.push({ year: d[0], month: d[1], day: d[2] });
    });
    this.unitWiseCalenderOptions = copy;
  }

  getCopyOfOptions(): IAngularMyDpOptions {
    return JSON.parse(JSON.stringify(this.unitWiseCalenderOptions));
  }

  /**
  * get the open and close count.
  */
  getDailyStatistics() {
    if (this.selectedObsZone && this.selectedDate) {
      let zone;
      if (this.selectedObsZone != 'All Zones') {
        for (const [key, value] of Object.entries(this.allObsDropdownData)) {
          if (this.selectedObsZone == key) {
            zone = [value.id]
          }
        }
      } else {
        zone = this.selectedObsZone;
      }
      this.iogpService.fetchFaultCount('', zone, 'All Categories', [this.selectedDate], 'All Timestamps', 'All').subscribe(
        faultCountData => {
          this.iogpCategories.forEach(item => {
            item.openCount = faultCountData[item.acronym]['open'];
            item.closeCount = faultCountData[item.acronym]['close'];
          });
          this.dailyOpenCount = this.iogpCategories.map(category => category.openCount).reduce((a, b) => a + b, 0);
          this.dailyCloseCount = this.iogpCategories.map(category => category.closeCount).reduce((a, b) => a + b, 0);
        },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          this.getBirdsEyeViewData();
        }
      )
    }
  }

  /**
  * get birds eye view data.
  */
  getBirdsEyeViewData() {
    this.iogpService.fetchZonewiseFaultCount().subscribe(faultCount => {
      let data = faultCount[this.selectedObsZone];
      this.iogpCategories.forEach(category => {
        category.totalOpenCount = data[category.acronym].open;
        category.totalCloseCount = data[category.acronym].close;
      });
      if (this.showRiskRatingDetails) {
        this.getRiskRatingDetails();
      }
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      });
  }

  /**
   * get risk rating details.
   */
  getRiskRatingDetails() {
    this.iogpService.getRiskRatingDetails(this.selectedDate).subscribe(riskRatingDetails => {
      this.riskRatingDetails = riskRatingDetails;
      this.riskLevels.forEach(risk => risk.openCount = Object.values(this.riskRatingDetails[risk.rating]).reduce((a: any, b: any) => a += b.open, 0));
      this.riskLevels.forEach(risk => risk.closeCount = Object.values(this.riskRatingDetails[risk.rating]).reduce((a: any, b: any) => a += b.close, 0));
      this.formatTooltip();
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        window.dispatchEvent(new Event("fullyLoaded"))
        this.fullyLoaded = true;
      });
  }

  /**
   * formating the data for populating in chart.
   */
  getChartData() {
    let selectedUnitDetails: any = JSON.parse(sessionStorage.getItem('selectedUnitDetails'));
    this.unitService.getChartData(this.custom_start_date, this.custom_end_date, this.selectedIds).subscribe(
      barChartData => {

        this.obsBarData.xAxisData = [...this.obsBarData.xAxisData];
        this.obsBarData.masterBarData = [];
        this.obsCategories.forEach((category, index) => {

          if (category != 'Closed') {
            this.obsBarData.masterBarData.push({ name: category, type: 'bar', stack: 'faultCount', barGap: '50px', barMaxWidth: 50, barWidth: "7px", data: [] });
            this.obsBarData.xAxisData.forEach((day, i) => {
              let obsBarDataIndex = barChartData['iogp_categories'][i + 1];

              if (obsBarDataIndex) {
                this.obsBarData.masterBarData[index].data.push(obsBarDataIndex[category]['open']);
              }

            });
          }
          else {
            this.obsBarData.masterBarData.push({ name: category, type: 'bar', stack: 'faultCount', barGap: '50px', barMaxWidth: 50, barWidth: "7px", data: [] });
            this.obsBarData.xAxisData.forEach((day, i) => {
              let obsBarDataIndex = barChartData['iogp_categories'][1];
              let categoryIndex = barChartData['iogp_categories'][i + 1];
              if (obsBarDataIndex && categoryIndex) {
                this.obsBarData.masterBarData[index].data.push(Object.keys(obsBarDataIndex).map(item => { return categoryIndex[item]['close'] }).reduce((a, b) => a + b, 0));
              }
            });
          }
        });
        this.toggleObsBarChart(this.obsSelectedToggle);
        this.obsBarData.openCount = barChartData['fault_counts'].iogp_fault_open_count;
        this.obsBarData.closeCount = barChartData['fault_counts'].iogp_fault_close_count;
        this.reportData.emit(barChartData)
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  /**
   * formating the data for populating in chart.
   */
  getFlightChartData() {
    this.unitService.getFlightChartData(this.startDate, this.endDate).subscribe(
      flightChartData => {
        this.sessionBarData.series = [];
        let data: any = flightChartData;
        let dates = data.map(item => item.date);
        let sessions = data.map(item => item.session);
        this.sessionBarData.xAxis[0].data = dates.filter((date, i) => { return dates.indexOf(date) === i });
        this.sessionBarData.legend.data = sessions.filter((session, i) => { return sessions.indexOf(session) === i });
        this.sessionBarData.legend.data.forEach(session => {
          let barData = [];
          this.sessionBarData.xAxis[0].data.forEach(date => {
            barData.push(data.filter(item => item.date === date && item.session === session).map(item => item.flight_count).reduce((a, b) => a + b, 0));
          });
          this.sessionBarData.series.push({ name: session, type: 'bar', barGap: 0, barMaxWidth: 50, data: barData });
        });
        this.sessionBarData = { ...this.sessionBarData };
      },
      error => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  onDateChanged($event: any) {
  }

  changeMode() {
    this.selectedMode = !this.selectedMode;
    if (this.selectedMode) {
      this.getChartData();
    }
    else {
      this.getFlightChartData();
    }
    clearInterval(this.setInterval);
    this.setInterval = setInterval(() => {
      this.getDailyStatistics();
      if (this.selectedMode) {
        this.getChartData();
      }
      else {
        this.getFlightChartData();
      }
    }, this.chartRefreshInterval);
  }

  toggleObsBarChart($event) {
    this.expand_collapse_risk = "Expand"
    this.expand_collapse_unit = "Expand"
    this.showUnitwiseGraph = false;
    this.showRiskwiseGraph = false;
    this.selectedButton = $event;
    this.obsSelectedToggle = $event;
    let barData = JSON.parse(JSON.stringify([...this.obsBarData.masterBarData.slice()]));
    if (this.custom_start_date && this.custom_end_date && this.selectedIds.length > 0) {
      this.getUnitwisebarChart();
      this.getRiskwisebarChart();
    }
    if ($event === 'all') {
      this.obsBarData.barData = barData.slice();
    }
    else if ($event === 'open') {
      this.obsBarData.barData = barData.filter(item => item.name != 'Closed').slice();
    }
    else if ($event === 'closed') {
      this.obsBarData.barData = barData.filter(item => item.name == 'Closed').slice();
    }
    this.obsBarData = JSON.parse(JSON.stringify({ ...this.obsBarData }));
  }

  /**
   * navigate to observation page with selected category or risk rating or status.
   */
  navigateToObservations(category, riskRating, status) {
    $('.riskTooltip').tooltip('hide');
    let selectedZones = [];
    this.selectedObsCategory = (category) ? [category] : [];
    if (this.selectedObsZone == 'All Zones') {
      selectedZones = this.obsDropdownData;
    } else {
      selectedZones = [this.selectedObsZone];
    }
    selectedZones.forEach((category, i) => {
      let removeAllCategorie = RegExp('\\b' + 'all' + '\\b').test(category.toLowerCase())
      if (removeAllCategorie) {
        selectedZones.splice(i, 1);
      }
    })
    if (status == 'open') {
      this.selectedStatus = ['Open']
      sessionStorage.setItem('selectedStatus', JSON.stringify(this.selectedStatus));
    } else if (status == 'close') {
      this.selectedStatus = ['Closed-False Positive', 'Closed-No Action', 'Closed-Action Taken']
      sessionStorage.setItem('selectedStatus', JSON.stringify(this.selectedStatus));
    }
    sessionStorage.setItem('selectedZone', JSON.stringify(selectedZones));
    sessionStorage.setItem('selectedCategory', JSON.stringify(this.selectedObsCategory));
    sessionStorage.setItem("selectedRiskRatingDate", this.selectedDate)
    if (riskRating) {
      sessionStorage.setItem('riskRating', JSON.stringify(riskRating));
    }
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * navigate to observation page with open and close count.
   */
  navigateToOpenCloseObs(status, riskRating) {
    sessionStorage.removeItem('filterData')
    let selectedStatus = [];
    if (status == 'open') {
      selectedStatus = ['Open']
      sessionStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
    } else if (status == 'close') {
      selectedStatus = ['Closed-False Positive', 'Closed-No Action', 'Closed-Action Taken']
      sessionStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
    }

    if (riskRating) {
      let selectedRating = [];
      selectedRating.push(riskRating)
      sessionStorage.setItem('riskRating', JSON.stringify(selectedRating));
    }
    sessionStorage.setItem('selectedCategory', JSON.stringify(this.allCategory));
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedIds, "", "");
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }
  navigateToUnitOpenCloseObs(status, unit) {
    sessionStorage.removeItem('filterData')
    let selectedStatus = [];
    if (status == 'open') {
      selectedStatus = ['Open']
      sessionStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
    } else if (status == 'close') {
      selectedStatus = ['Closed-False Positive', 'Closed-No Action', 'Closed-Action Taken']
      sessionStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
    }
    let index = this.unitListItems.findIndex(ele => { return ele.unitName == unit });
    let unitId = '';
    if (index >= 0) {
      unitId = this.unitListItems[index].id;
    }
    sessionStorage.setItem('selectedCategory', JSON.stringify(this.allCategory));
    sessionStorage.setItem('riskRating', JSON.stringify(this.allRiskRating));
    sessionStorage.setItem('manually-selected-units', JSON.stringify([unitId]))
    sessionStorage.setItem('selectedUnits', JSON.stringify([unitId]));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    var dates = []
    this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(data => {
      dates = data
    })
    this.safetyAndSurveillanceDataService.passSelectedUnits([unitId]);
    this.safetyAndSurveillanceDataService.passDatesAndUnits([unitId], dates['startDate'], [dates['endDate']]);
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }


  getColor(category) {
    return this.safetyAndSurveillanceCommonService.getColorValue(category);
  }

  ngOnDestroy() {
    sessionStorage.removeItem('selectedUnitDate');
    clearInterval(this.setInterval);
    this.selectedIds = [];
    this.custom_start_date = "";
    this.custom_end_date = "";
    this.subscription.unsubscribe();
  }

  observationtoggal() {
    this.observationIsShow = !this.observationIsShow;
  };

  toggleUnitStackChart() {
    this.showUnitwiseGraph = !this.showUnitwiseGraph
    if (this.showUnitwiseGraph) {
      this.expand_collapse_unit = 'Collapse'
    } else {
      this.expand_collapse_unit = 'Expand'
    }
  }

  toggleRiskStackChart() {
    this.showRiskwiseGraph = !this.showRiskwiseGraph
    if (this.showRiskwiseGraph) {
      this.expand_collapse_risk = 'Collapse'
    } else {
      this.expand_collapse_risk = 'Expand'
    }
  }

  /**
   * formating the data for bar chart.
   */
  getUnitwisebarChart() {
    this.dataService.passSpinnerFlag(true, true);
    this.riskRatio = {};
    this.loader = true;
    this.plantService.getRiskRatio(this.custom_start_date, this.custom_end_date, this.selectedIds, this.obsSelectedToggle).subscribe((res: any) => {

      if (res) {

        //unitwise chart data
        let sortable = [];
        for (var unit in res) {
          let total = res[unit]['rating_1'] + res[unit]['rating_2'] + res[unit]['rating_3'] + res[unit]['rating_4'] + res[unit]['rating_5'];
          sortable.push([unit, res[unit], total]);
        }

        sortable.sort((a, b) => {
          return b[2] - a[2];
        });
        let obj = {};
        sortable.forEach(data => {
          obj[data[0]] = data[1]
        })

        //riskwise chart data
        let array = [];
        let riskObj = {
        };
        for (const [key, value] of Object.entries(res)) {
          riskObj[key] = { "5": res[key]['rating_5'], "4": res[key]['rating_4'], "3": res[key]['rating_3'], "2": res[key]['rating_2'], "1": res[key]['rating_1'] };
          array.push({
            unitName: key,
            ratingValue: { "5": res[key]['rating_5'], "4": res[key]['rating_4'], "3": res[key]['rating_3'], "2": res[key]['rating_2'], "1": res[key]['rating_1'] },
            open: res[key].open,
            close: res[key].close,
          })
        }
        this.observationsByUnitAndRiskRating = array;
        this.riskRatio = obj;
        this.loader = false;
      } else {
        this.riskRatio = res;
        this.loader = false;
      }
      this.dataService.passSpinnerFlag(false, true);
    }, (error) => {
      this.loader = false;
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
      () => {
        setTimeout(() => {
          this.dataService.passSpinnerFlag(false, true);
        }, 1000);

      })
  }

  /**
   * formating the data for risk rating chart.
   */
  getUnitwiseRiskChart() {
    this.dataService.passSpinnerFlag(true, true);
    this.riskRatio = {};
    this.loader = true;
    this.plantService.getRiskRatio(this.custom_start_date, this.custom_end_date, this.selectedIds, this.obsSelectedToggle).subscribe((res: any) => {
      let array = [];
      let obj = {
      };
      for (const [key, value] of Object.entries(res)) {
        obj[key] = { "5": res[key]['rating_5'], "4": res[key]['rating_4'], "3": res[key]['rating_3'], "2": res[key]['rating_2'], "1": res[key]['rating_1'] };
        array.push({
          unitName: key,
          ratingValue: { "5": res[key]['rating_5'], "4": res[key]['rating_4'], "3": res[key]['rating_3'], "2": res[key]['rating_2'], "1": res[key]['rating_1'] },
          open: res[key].open,
          close: res[key].close,
        })
      }
      this.observationsByUnitAndRiskRating = array;
      this.dataService.passSpinnerFlag(false, true);
    },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })

  }

  /**
   * formating the data for bar chart.
   */
  getRiskwisebarChart() {
    this.riskwiseAttribution = {};
    this.dataIsThere = false;
    this.unitService.getRiskwisebarChart(this.custom_start_date, this.custom_end_date, this.selectedIds, this.obsSelectedToggle).subscribe(
      data => {
        let obj = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        let obj1 = {
          1: { 'open': 0, 'close': 0 },
          2: { 'open': 0, 'close': 0 },
          3: { 'open': 0, 'close': 0 },
          4: { 'open': 0, 'close': 0 },
          5: { 'open': 0, 'close': 0 },
        };
        for (let i = 1; i < 6; i++) {
          for (const [key, value] of Object.entries(data[i])) {
            obj[i] += (data[i][key].open + data[i][key].close)
            obj1[i]['open'] += (data[i][key].open)
            obj1[i]['close'] += (data[i][key].close)

            if (obj1[i]['open'] > 0 || obj1[i]['close'] > 0) {
              this.dataIsThere = true;
            }
          }
        }
        this.riskWiseData = obj
        this.riskwiseAttribution = obj1
        this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      }
    )
  }

  toggleMapView() {
    this.mapView.emit(true);
    this.checkMapView = !this.checkMapView;
    if (this.checkMapView) {
      window.dispatchEvent(new CustomEvent('disable-inputs'))
    }
  }
}
