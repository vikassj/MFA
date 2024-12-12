import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  IAngularMyDpOptions,
  IMyCalendarViewChanged,
  IMyDateModel,
} from 'angular-mydatepicker';
import { Router } from '@angular/router';
import * as moment from 'moment';

import { PlantService } from 'src/app/shared/service/plant.service';
import { CommonService } from 'src/shared/services/common.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { DataService } from 'src/shared/services/data.service';
import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  unitsList: any[] = [{id: 1, name: 'unit-1'}, {id: 2, name: 'unit-2'},{id: 3, name: 'unit-3'},{id: 4, name: 'unit-4'},{id: 5, name: 'unit-5'},{id: 6, name: 'unit-6'},{id: 7, name: 'unit-7'},{id: 8, name: 'unit-8'},{id: 9, name: 'unit-9'},{id: 10, name: 'unit-10'},{id: 11, name: 'unit-12'},{id: 12, name: 'unit-12'},{id: 13, name: 'unit-13'},{id: 14, name: 'unit-14'},{id: 15, name: 'unit-15'},{id: 16, name: 'unit-16'},{id: 17, name: 'unit-17'},{id: 18, name: 'unit-18'}]

  checkMapView:boolean = false;

  availableDates: any[] = [];
  isShow = false;
  observationList: any[] = [];
  selectedObservation: any;
  obsInterval: any;
  isbeingSearched: boolean = false;
  readonly DAYWISE = 'Daywise';
  readonly MONTHWISE = 'Monthwise';
  readonly YEARWISE = 'Yearwise';
  selectedDays = [this.DAYWISE, this.MONTHWISE];
  selectedItemDay = this.selectedDays[0];
  custom_start_date: string ='';
  custom_end_date: string ='';
  selectedIds: any = [];
  iogp_custom_start_date: string ='';
  iogp_custom_end_date: string ='';
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
  selectedMonth: any = new Date().getMonth() + 1;
  selectedYear: any = this.getCurrentYear();
  safetyTrendData: any = {};
  xDataST: any[] = []; //
  yDataST: any[] = [];   //safety trend axis data

  riskRatio: any;
  loader: boolean = false;
  overAllCalenderOptions: IAngularMyDpOptions = {
    dateFormat: 'yyyy-mm-dd',
    dateRange: false,
    // disable all dates by default
    disableDateRanges: [{
      begin: { year: 1000, month: 1, day: 1 },
      end: { year: 9999, month: 12, day: 31 }
    }],
    enableDates: []
  };
  overAllCalenderModel: IMyDateModel = null;

  insightDays: any[] = ['1 week', '2 weeks', '1 month'];
  selectedInsightDay: string = '1 week';

  frequentObservations: any = {
    category: 'NA',
    count: 0,
    imagePath: 'NA'
  };

  obsBarData: any = {
    xAxisData: [],
    barData: [],
    masterBarData: [],
    openCount: 0,
    closeCount: 0
  };
  userActivityData: any = {};

  selectedDate: any = '';

  iogpCategories: any[] = [];
  dailyOpenCount: number = 0;
  dailyCloseCount: number = 0;
  totalOpenCount: any = 0;
  totalCloseCount: any = 0;

  iogp_dailyOpenCount: number = 0;
  iogp_dailyCloseCount: number = 0;
  obsCategories: any[] = [];
  subscription: Subscription = new Subscription();

  plantImageUrl: string = '';
  plantImageDetails: any;
  showBarChart: boolean = true;
  showCumulative: boolean = false;
  chartRefreshInterval: number = 10000;
  plantStartDate: any;
  plantEndDate: any;
  setInterval: any;
  dfd: number;
  dashboardDataInterval: number;
  units: any[] = [];
  unitList: any[] = [];
  msg: string;
  noDataMsg: string;
  carouselDefined: any;
  startDate: any;
  barOptions: any;
  onlyTotalCount: boolean;
  selectedDateSelector='selected';
  x_Axis_Data: any[];

  insightsCount = 0;
  insightActiveCard = '';

  insightsLoaded: boolean = false;
  noUnitData: boolean = false;
  insights_critical_count: any = 0;
  insights_category: any;
  insights_most_viewed: any;
  insights_total_obs = 0;
  insights_range_obs_count = 0;
  num_of_ongoing_critical_jobs = 0;
  iogpData = {};
  mapView: boolean =false;
  initializationDates: any;

  reportData: any;
  selectedObsCategory = ["HC","W@H","L&H","PPE","CSC", "FO","VS","HK" ,"OTH"];
  riskRating = [1,2,3,4,5]
  selectedStatus = ['Open','Snooze','Archive','Closed-False Positive', 'Closed-No Action', 'Closed-Action Taken']
  disableToggle: boolean=false;

  subscriptionDates: any = []
  callCount: any = 0;
  categoryMap: any;
  categoryMapStatus: any;
  isPermitEnabled: boolean = false;

  constructor(private router: Router, private commonService: CommonService, private plantService: PlantService, private snackbarService: SnackbarService, private dataService: DataService, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) {
    this.safetyAndSurveillanceDataService.passSelectedPage('home')
    window.addEventListener('units-changed', (evt) => {
      if(window.location.href.split("/").includes('dashboard')) {
        if(this.iogp_custom_start_date !== "" && this.iogp_custom_end_date !== "") {
          var iogpCustomDates = [this.iogp_custom_start_date, this.iogp_custom_end_date]
          this.getIogpDates(iogpCustomDates);
        } else {
          this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(dates => {
          var customDates = [dates['startDate'], dates['endDate']]
          this.getIogpDates(customDates);
          })
        }
      }
    })

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
      this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
    })
    
  }

  onOutsideClick() {
    // Handle the click outside event here
    window.dispatchEvent(new CustomEvent('close-filter'))
  }

  ngOnInit(): void {
    if(sessionStorage.getItem('selectedObservation')) {
      var selectedObservation = JSON.parse(sessionStorage.getItem('selectedObservation'))
      sessionStorage.setItem('navigatedUnit', selectedObservation.unit.split('+').join(' '))
    }

    this.subscription.add(this.safetyAndSurveillanceDataService.getSelectedUnitsAndDates.subscribe(data => {
      this.insights_category='NA';
        if(data['value'] == 'units') {
          this.selectedIds=data['data'] ? data['data'] : [];
        } else if(data['value'] == 'dates') {
          this.custom_start_date=data['data']['startDate'];
          this.custom_end_date=data['data']['endDate'];
        } else if(data['value'] == 'all') {
          this.selectedIds = data['data']['units']
          this.custom_start_date=data['data']['startDate'];
          this.custom_end_date=data['data']['endDate'];
        } else if(data['value'] == 'empty') {
          this.dailyOpenCount=0;
          this.dailyCloseCount=0;
          this.insights_critical_count=0;
          this.insights_category='NA';
          this.insights_most_viewed='NA';
          this.insights_total_obs=0;
          this.insights_range_obs_count=0;
          this.num_of_ongoing_critical_jobs=0;
          this.xDataST = [];
          this.yDataST = [];
          this.iogp_dailyOpenCount=0;
          this.iogp_dailyOpenCount=0;
          this. iogpData = {};
          this.disableToggle=true;
        }


        if((this.custom_start_date && this.custom_end_date) && this.selectedIds?.length > 0 && data['value'] != 'empty' ){
          this.fetchPlantDetails();
          this.getCompilianceData("initialize");
          this.getFrequentObservationCategory();
          this.getInsights();
          if(this.selectedDateSelector !== 'custom') {
            this.getIogpData();
          }
          this.disableToggle=false;
        }

    }))

    // this.safetyAndSurveillanceDataService.passPageData(this.selectedIds, this.custom_start_date, this.custom_end_date);


    let data = JSON.parse(sessionStorage.getItem("application-configuration"))

    this.subscription.add(this.safetyAndSurveillanceDataService.getBevData.subscribe(trigger => {
      if (trigger.validFlag) {
        this.commonService.readConfigurationsData().subscribe(data => {
          this.plantService.fetchBirdsEyeViewData().subscribe(item => {
            let plantImageDetails = (item[sessionStorage.getItem('plantName')]) ? item[sessionStorage.getItem('plantName')] : {};
            this.plantImageUrl = (Object.keys(plantImageDetails).length > 0) ? plantImageDetails.imageUrl : '';
            if (Object.keys(plantImageDetails).length > 0) {
              plantImageDetails.imageUrl = undefined;
            }
            this.plantImageDetails = { ...plantImageDetails };
          });
        });
      }
    }));

    this.dfd = 3;
    this.plantService.fetchBirdsEyeViewData().subscribe(item => {
      let plantImageDetails = (item[sessionStorage.getItem('plantName')]) ? item[sessionStorage.getItem('plantName')] : {};
      this.plantImageUrl = (Object.keys(plantImageDetails).length > 0) ? plantImageDetails.imageUrl : '';
      if (Object.keys(plantImageDetails).length > 0) {
        plantImageDetails.imageUrl = undefined;
      }
      this.plantImageDetails = plantImageDetails;
      this.plantImageDetails = { ...this.plantImageDetails };

    }, (error) => {

    },
    () => {
      this.getAvailableUnits();
    });
    let selectedActionDetails = JSON.parse(sessionStorage.getItem('selectedActionNavigation'));
    if(selectedActionDetails){
      setTimeout(()=>{
        sessionStorage.setItem('ActionId', selectedActionDetails.id);
        this.router.navigateByUrl('/safety-and-surveillance/actions');
        sessionStorage.removeItem('selectedActionNavigation');
      }, 2000)
    }
    let selectedIncidentDetails = JSON.parse(sessionStorage.getItem('selectedIncidentNavigation'));
    if(selectedIncidentDetails){
      setTimeout(()=>{
        sessionStorage.setItem('searchIncident', selectedIncidentDetails.id);
        this.router.navigateByUrl('/safety-and-surveillance/incidents');
        sessionStorage.removeItem('selectedIncidentNavigation');
      }, 2000)
    }

  }

  ngOnChanges(): void {
    // debugger

  }

  /**
   * get all the available units
   */
  getAvailableUnits() {
    this.dataService.passSpinnerFlag(true, true);
    if(sessionStorage.getItem('availableUnits')) {
      var availableUnits = JSON.parse(sessionStorage.getItem('availableUnits'))
        this.setAvailableUnits(availableUnits)
        if (this.unitList.length > 0) {
          this.getChartData();
          this.getDates();
          this.setInterval = setInterval(() => {
          this.getDailyCount("interval");
          }, this.chartRefreshInterval);
        } else {
          this.noUnitData = true;
          this.insightsLoaded = true;
          this.noDataMsg = 'You are not mapped to any unit. Please contact the administrator.';
          this.snackbarService.show(this.noDataMsg, false, false, false, true);
          this.dataService.passSpinnerFlag(false, true);
        }
    } else {
      this.plantService.getAvailableUnits().subscribe(
        (availableUnits: any) => {
         this.setAvailableUnits(availableUnits)
        },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          if (this.unitList.length > 0) {
          } else {
            this.noUnitData = true;
            this.insightsLoaded = true;
            this.noDataMsg = 'You are not mapped to any unit. Please contact the administrator.';
            this.snackbarService.show(this.noDataMsg, false, false, false, true);
            this.dataService.passSpinnerFlag(false, true);
          }
        }
      )
    }

  }

  /**
   * get the available dates.
   */
  getDates() {
    this.plantService.fetchDates().subscribe(
      (availableDates: any[]) => {
        this.availableDates = availableDates;
        if (availableDates.length > 0) {
          this.selectedDate = availableDates[availableDates.length - 1]
        } else {
          this.selectedDate = ''
        }
        this.overAllCalenderOptions.enableDates = [];
        this.availableDates.forEach(date => {
          let d = date.split('-').map(item => Number(item));
          this.overAllCalenderOptions.enableDates.push({ year: d[0], month: d[1], day: d[2] });
        });
        this.overAllCalenderOptions = { ...this.overAllCalenderOptions };
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.getDailyCount(null);
      }
    )
  }

  onCalendarViewChanged(event: IMyCalendarViewChanged) {
    // enables first, 15th and last date of month
    let copy: IAngularMyDpOptions = this.getCopyOfOptions();
    copy.enableDates = [
    ];
    this.availableDates.forEach(date => {
      let d = date.split('-').map(item => Number(item));
      copy.enableDates.push({ year: d[0], month: d[1], day: d[2] });
    });
  }

  getCopyOfOptions(): IAngularMyDpOptions {
    return JSON.parse(JSON.stringify(this.overAllCalenderOptions));
  }

  /**
   * get current year.
   * @returns current year
   */
  getCurrentYear() {
    const date = new Date();
    return date.getFullYear();
  }

  /**
   * get all the years.
   */
  getYears(howLong) {
    const years = [];
    const currentYear = this.getCurrentYear();
    for (let year = currentYear - howLong + 1; year <= currentYear; year++) {
      years.push(year);
    }
    return years;
  }

  fetchUserActivityData() {
    let startDate, endDate = '';
    startDate = this.returnStartEndDate()[0];
    endDate = this.returnStartEndDate()[1];
    this.dataService.passSpinnerFlag(true, true);
    this.plantService.fetchUserActivityData(startDate, endDate ,this.selectedIds).subscribe(
      userActivityData => {
        this.userActivityData = userActivityData;
        this.insightsCount = 0;
        this.insightActiveCard = '';
        if (this.frequentObservations?.count) {
          if (this.insightActiveCard == '') {
            this.insightActiveCard = 'count';
          }
          this.insightsCount += 1
        }
        if (this.userActivityData?.most_viewed_obs?.faultid != 'NA') {
          if (this.insightActiveCard == '') {
            this.insightActiveCard = 'faultid';
          }
          this.insightsCount += 1
        }
        if (this.userActivityData?.most_viewed_category?.category != 'NA') {
          if (this.insightActiveCard == '') {
            this.insightActiveCard = 'category';
          }
          this.insightsCount += 1
        }
        if ((this.obsBarData.openCount + this.obsBarData.closeCount)) {
          if (this.insightActiveCard == '') {
            this.insightActiveCard = 'closeCount';
          }
          this.insightsCount += 1
        }
        if (this.userActivityData?.most_repeated_obs?.observation != 'NA') {
          if (this.insightActiveCard == '') {
            this.insightActiveCard = 'observation';
          }
          this.insightsCount += 1
        }
        // this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.insightsLoaded = true;
      }
    )
  }

  /**
   * frequest observations category logic.
   */
  getFrequentObservationCategory() {
    this.insightsLoaded = false;
    let startDate = '';
    let endDate = '';
    startDate = this.custom_start_date;
    endDate = this.custom_end_date;
    this.plantService.getFrequentObservationCategory(startDate, endDate, 4,this.selectedIds).subscribe(
      frequentObservationCategory => {
        if (!this.carouselDefined) {
          this.carouselDefined = true;
        }
        let total_crictical_obs=0;
        for (const [key, value] of Object.entries(frequentObservationCategory)) {
          total_crictical_obs += value
        }
        this.insights_critical_count = total_crictical_obs;
        let counts = Object.values(frequentObservationCategory);
        this.frequentObservations.category = (counts.every(item => item === 0)) ? 'NA' : this.iogpCategories.find(category => Object.keys(frequentObservationCategory)[0] === category.acronym)?.name;
        this.frequentObservations.count = (counts.every(item => item === 0)) ? 0 : Object.values(frequentObservationCategory)[0];
        this.frequentObservations.iconPath = (counts.every(item => item === 0)) ? 'NA' : this.iogpCategories.find(category => Object.keys(frequentObservationCategory)[0] === category.acronym)?.iconPath;
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.getInsights();
      }
    )
  }

  returnStartEndDate() {
    let startDate, endDate: any;
    let d = new Date(this.selectedDate);
    if (this.selectedInsightDay === '1 week') {
      endDate = d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
      startDate = d.setTime(d.getTime() - 6 * 24 * 60 * 60 * 1000);
    }
    else if (this.selectedInsightDay === '2 weeks') {
      endDate = d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
      startDate = d.setTime(d.getTime() - 13 * 24 * 60 * 60 * 1000);
    }
    else {
      endDate = d.setTime(d.getTime() - (24 * 60 * 60 * 1000));
      startDate = d.setTime(d.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
    return [moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')];
  }

  /**
   * safety trend graph logic.
   */
  getDailyCount(calledFromFlag: string) {
    if (calledFromFlag == "interval") {
    }

    let selectedDate = ((this.selectedDate === '') || (this.selectedDate === undefined)) ? 'latest' : this.selectedDate;
    this.plantService.getDailyCount(this.custom_start_date , this.custom_end_date).subscribe(
      dailyStatistics => {
        this.selectedDate = dailyStatistics['date'];
        this.overAllCalenderModel = { dateRange: null, isRange: false, singleDate: { date: { year: Number(this.selectedDate.split('-')[0]), month: Number(this.selectedDate.split('-')[1]), day: Number(this.selectedDate.split('-')[2]) } } };
        sessionStorage.setItem('selectedUnitDate', this.selectedDate);
        this.iogpCategories.forEach(category => {
          category.openCount = Object.values(dailyStatistics['data']).map(item => { return item[category.acronym] }).map(item => item.open).reduce((a, b) => a + b, 0);
          category.closeCount = Object.values(dailyStatistics['data']).map(item => { return item[category.acronym] }).map(item => item.close).reduce((a, b) => a + b, 0);
        });
        setTimeout(() => {
          $('#firstDivHeading').css('width', $('#firstDiv').width() + 'px');
          if (this.showBarChart) {
            $('#secondDiv').css('width', '100%').css('width', '-=' + $('#firstDiv').width() + 'px');
            $('#secondDivHeading').css('width', '100%').css('width', '-=' + $('#firstDiv').width() + 'px');
          }
        }, 1000);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.noDataMsg = (this.unitList.length > 0) ? '' : 'You are not mapped to any unit. Please contact the administrator.';
        this.scrollHorizontally();
        this.getObservations(calledFromFlag);
      }
    )
  }

  scrollHorizontally() {
  }

  /**
   * get overall open and close count.
   */
  getOverallCount() {
    this.plantService.getOverallCount().subscribe(
      dailyStatistics => {
        this.iogpCategories.forEach(category => {
          category.totalOpenCount = Object.values(dailyStatistics['data']).map(item => { return item[category.acronym] }).map(item => item.open).reduce((a, b) => a + b, 0);
          category.totalCloseCount = Object.values(dailyStatistics['data']).map(item => { return item[category.acronym] }).map(item => item.close).reduce((a, b) => a + b, 0);
        });
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        if (this.showCumulative) {
          this.getCumulativeCount();
        }
      }
    )
  }

  /**
   * get cummulative count for graphs data.
   */
  getCumulativeCount() {
    this.startDate = JSON.parse(sessionStorage.getItem('plantDetails')).start_date;
    this.plantService.getCumulativeCount(this.startDate, this.selectedDate).subscribe(
      cumulativeCountData => {
        this.barOptions.series = [];
        this.barOptions.xAxis.data.forEach((category, index) => {
          if (['Open', 'Closed'].indexOf(category) === -1) {
            this.barOptions.series.push({ name: category, type: 'bar', stack: 'barChart', itemStyle: { color: this.safetyAndSurveillanceCommonService.getColorValue(category) }, label: { show: true, position: 'top', fontWeight: 'bolder' }, barMaxWidth: 50, barWidth: "7px", data: this.fillArray(index, (cumulativeCountData[category].open + cumulativeCountData[category].close), this.barOptions.xAxis.data.length) });
          }
          this.totalOpenCount = this.iogpCategories.map(category => category.acronym).map(item => { return cumulativeCountData[item]['open'] }).reduce((a, b) => a + b, 0);
          this.totalCloseCount = this.iogpCategories.map(category => category.acronym).map(item => { return cumulativeCountData[item]['close'] }).reduce((a, b) => a + b, 0);
        });
        this.barOptions = { ...this.barOptions };
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

  fetchPlantDetails() {
    this.dataService.passSpinnerFlag(true, true);
    this.plantService.fetchPlantDetails().subscribe(
      (plantData: any) => {
        let plantDetials: any = plantData;
        plantDetials.start_date = this.plantStartDate = plantData.start_date;
        plantDetials.end_date = this.plantEndDate = plantData.end_date;
        sessionStorage.setItem('plantDetails', JSON.stringify(plantData));
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.commonService.readModuleConfigurationsData('safety-and-surveillance').subscribe(data => {
          sessionStorage.setItem('hsseJsonData', JSON.stringify(data))
          this.iogpCategories = data['module_configurations']['iogp_categories'].filter(cat => cat.show_hide);
          this.obsCategories = this.iogpCategories.map(category => category.acronym);
          this.obsCategories.push('Closed');
          this.chartRefreshInterval = data['page_configurations']['dashboard_page']['chart_refresh_interval'];
          let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'));
          this.plantStartDate = plantDetails.start_date;
          this.plantEndDate = plantDetails.end_date;
          this.categoryMap = [];
          this.categoryMapStatus = {};
          let categoryMap = data['module_configurations']['iogp_categories']
          categoryMap.forEach(ele =>{
            this.categoryMap.push( { name: ele.acronym, value: ele.name })
            this.categoryMapStatus[ele.acronym] = true
          })
          this.categoryMapStatus['Closed'] = true
          this.categoryMap.push( { name: 'Closed', value: 'Closed Observations' },)
          let diffDays = Math.round(Math.abs((new Date(this.plantStartDate).getTime() - new Date(this.plantEndDate).getTime()) / 86400000));
          let date = new Date(this.plantStartDate + 'T00:00:00');
          for (var i = 0; i < diffDays + 1; i++) {
            this.obsBarData.xAxisData.push({ 'label': moment(date).add(i, 'days').format('D-MMM'), 'date': moment(date).add(i, 'days').format('YYYY-MM-DD') });
          }
        });
      }
    );
  }

  getReportData(reportData: any) {
    this.reportData = reportData
    this.dailyOpenCount=reportData['fault_counts']['iogp_fault_open_count'];
    this.dailyCloseCount=reportData['fault_counts']['iogp_fault_close_count'];
  }

  /**
   * gets total open and close counts for the selected dates and units.
   */
 getTotalCounts(){
  this.dataService.passSpinnerFlag(true, true);
  this.plantService.getChartData(this.custom_start_date,this.custom_end_date,this.selectedIds).subscribe(
    data=>{
        this.dailyOpenCount=data['fault_counts']['iogp_fault_open_count'];
        this.dailyCloseCount=data['fault_counts']['iogp_fault_close_count'];
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

 /**
  * insights api call logic
  */
 getInsights(){
  this.dataService.passSpinnerFlag(true, true);
  var permitPlantMap = JSON.parse(sessionStorage.getItem('permitPlantMap'))
  var selectedPlant = permitPlantMap.findIndex(plant => plant.plant_id == sessionStorage.getItem('selectedPlant'))
  this.isPermitEnabled = permitPlantMap[selectedPlant].isPermitEnabled
  this.plantService.fetchUserActivityData(this.custom_start_date,this.custom_end_date,this.selectedIds).subscribe(
    data=>{
        this.insights_category = data["most_repeated_obs"].category
        this.insights_most_viewed= data["most_viewed_obs"].faultid
        this.insights_total_obs = data['total_obs_count']
        this.insights_range_obs_count = data['total_obs_count_date_range']
        // this.dataService.passSpinnerFlag(false, true);
        this.num_of_ongoing_critical_jobs = data['num_of_ongoing_critical_jobs']
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

 /**
  * get data for the iogp cards.
  */
 getIogpData(){
  this.plantService.fetchCategoryFaultCount(this.custom_start_date,this.custom_end_date,this.selectedIds).subscribe(
    dailyStatistics=>{

        this.iogpData=dailyStatistics;
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

 /**
  * getting the counts for insights.
  */
  getChartData() {
      if(this.reportData != undefined) {
        var barChartData = this.reportData
        this.obsBarData.xAxisData = [...this.obsBarData.xAxisData];
        this.obsBarData.masterBarData = [];
        this.obsCategories.forEach((category, index) => {
          if (category != 'Closed') {
            this.obsBarData.masterBarData.push({ name: category, type: 'bar', stack: 'faultCount', barGap: '50px', barMaxWidth: 50, barWidth: "7px", data: [] });
            this.obsBarData.xAxisData.forEach((day, i) => {
              this.obsBarData.masterBarData[index].data.push(barChartData['iogp_categories'][i + 1][category]['open']);
            });
          }
          else {
            this.obsBarData.masterBarData.push({ name: category, type: 'bar', stack: 'faultCount', barGap: '50px', barMaxWidth: 50, barWidth: "7px", data: [] });
            this.obsBarData.xAxisData.forEach((day, i) => {
              this.obsBarData.masterBarData[index].data.push(Object.keys(barChartData['iogp_categories'][1]).map(item => { return barChartData['iogp_categories'][i + 1][item]['close'] }).reduce((a, b) => a + b, 0));
            });
          }
        });
        this.obsBarData.barData = this.obsBarData.masterBarData;
        this.obsBarData.openCount = barChartData['fault_counts'].iogp_fault_open_count;
        this.obsBarData.closeCount = barChartData['fault_counts'].iogp_fault_close_count;
        this.obsBarData.archiveCount = barChartData['fault_counts'].iogp_fault_archive_count;
        this.obsBarData.snoozeCount = barChartData['fault_counts'].iogp_fault_snooze_count;

        if(this.obsBarData.openCount == 0 && this.obsBarData.closeCount == 0 && this.obsBarData.archiveCount == 0 && this.obsBarData.snoozeCount == 0) {
          this.insightsLoaded = true;
          this.noUnitData = true;
        }
      }

      this.plantService.getFrequentObservationCategory(this.custom_start_date, this.custom_end_date, 4, this.selectedIds).subscribe(
        frequentObservationCategory =>{
            let total_crictical_obs=0;
            for (const [key, value] of Object.entries(frequentObservationCategory)) {
              total_crictical_obs += value
            }
            this.insights_critical_count =total_crictical_obs;
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

  fillArray(index, value, length) {
    let array = [];
    array.fill('-', 0, length - 1);
    array[index] = value
    return array;
  }

  returnCumulativeCount(category) {
  }

  onToggle() {
    this.onlyTotalCount = !this.onlyTotalCount;
    if (this.onlyTotalCount) {
      this.getCumulativeCount();
    }
    else {
      this.getDailyCount(null);
    }
  }

  navigateToUnitDashboard(selectedUnit) {
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = (selectedUnit) ? availableUnits.find(unit => unit.unitName === selectedUnit) : availableUnits[0];
    sessionStorage.setItem('selectedUnit', selectedUnit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    // sessionStorage.setItem('selectedUnitDate', this.selectedDate);
    this.safetyAndSurveillanceDataService.passSelectedUnits([selectedUnitDetails.id]);
    this.safetyAndSurveillanceDataService.passSelectedDates(selectedUnitDetails.startDate, selectedUnitDetails.endDate);
    this.safetyAndSurveillanceDataService.passDatesAndUnits([selectedUnitDetails.id],selectedUnitDetails.startDate,[selectedUnitDetails.endDate]);
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  keys(ob) {
    return Object.keys(ob);
  }

  /**
   * api call to populate the global search field.
   * @param calledFromFlag
   */
  getObservations(calledFromFlag: string) {
    this.plantService.getObservations().subscribe(
      observations => {
        let data: any = observations;
        this.observationList = data;
        this.obsInterval = setInterval(() => {
          let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
          if (unitDetails) {
            let selectedObservation = JSON.parse(sessionStorage.getItem('selectedObservation'));

            if (selectedObservation) {
              window.dispatchEvent(new CustomEvent('hide-banner'))
              this.selectedObservation = this.observationList.find(obs => obs.id === Number(selectedObservation.id));
              this.safetyAndSurveillanceCommonService.sendMatomoEvent('Opening observation from e-mail notification', 'Notification');
              this.navigateFromSearch();
              sessionStorage.removeItem('selectedObservation');
              clearInterval(this.obsInterval);
            }
            else {
              clearInterval(this.obsInterval);
            }
            let selectedActionDetails = JSON.parse(sessionStorage.getItem('selectedActionNavigation'));
            if(selectedActionDetails){
              setTimeout(()=>{
                sessionStorage.setItem('ActionId', selectedActionDetails.id);
                this.router.navigateByUrl('/safety-and-surveillance/actions');
                sessionStorage.removeItem('selectedActionNavigation');
              }, 1000)
            }
          }
        }, 1300);
        if (calledFromFlag === "dateChanged" || calledFromFlag == "interval") {
          this.dataService.passSpinnerFlag(false, true)
        }
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

  /**
   * compliance data for observations recorded for each category.
   */
  getCompilianceData(calledFromFlag: string) {
    if (this.selectedItemDay == 'Monthwise') {
      this.selectedMonth = undefined;
    }
    if (!this.selectedYear || (!this.selectedMonth && this.selectedItemDay != 'Monthwise'))
      return;

    this.riskRatio = {};
    this.loader = true;
    this.xDataST = [];
    this.yDataST = [];
    this.plantService.getComplianceChartData(this.custom_start_date,this.custom_end_date,this.selectedIds).subscribe((res: any) => {
      if (res) {

        if (this.selectedItemDay == 'Monthwise') {
          this.yDataST = Object.values(res).map((ob) => {
            return ob['month_wise_total'];
          })
          this.xDataST = Object.keys(res).map((monthIndex) => {
            const index = this.months.findIndex((x) => x['key'] == monthIndex);
            if (index >= 0) {
              return this.months[index]['value'];
            } else {
              this.xDataST = [];
              this.yDataST = [];
            }
          });
        }
        else if (this.selectedItemDay == 'Daywise') {
          this.xDataST = Object.keys(res);
          this.yDataST = Object.values(res).map((ob) => {
            return ob['day_wise_total'];
          })
          this.x_Axis_Data = []
          let selectedMonth;
          this.xDataST.forEach((value, index, array) => {
            let month = this.selectedMonth.toString().split("");
            if (this.selectedMonth <= 9 && month.length == 1) {
              selectedMonth = '0' + this.selectedMonth
            } else {
              selectedMonth = '' + this.selectedMonth
            }
            let date = value.toString().split("");
            if (value <= 9 && date.length == 1) {
              value = '0' + value
            } else {
              value = '' + value
            }

            if (value != "detail") {
              this.x_Axis_Data.push(moment(value).format('DD-MMM-YYYY'))
            }
          })
          this.xDataST = this.x_Axis_Data;
        }
        

      }
    },
      (err) => {
        this.dataService.passSpinnerFlag(false, true);
        var msg = "Error occured. Please try again."
        this.snackbarService.show(msg, true, false, false, false)
      },
      () => {
        if ((calledFromFlag == 'changeInterval' || calledFromFlag == 'yearValue' || calledFromFlag == 'monthValue')) {
          this.dataService.passSpinnerFlag(false, true);
        }
      })
  }

  changeInterval() {
    if (this.selectedItemDay == 'Monthwise') {
      this.selectedMonth = undefined;
    }
    else if (this.selectedItemDay == 'Daywise') {
      this.selectedMonth = new Date().getMonth() + 1;
    }
    this.getCompilianceData('changeInterval');
  }

  /**
   * logic for mail navigation.
   */
  navigateFromSearch() {
    sessionStorage.removeItem('filterData')
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnit', this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    sessionStorage.setItem('searchObservation', JSON.stringify(this.selectedObservation));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }


  navigateToUnitObservationBev(selectedUnit) {
    sessionStorage.removeItem('filterData')
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = (selectedUnit) ? availableUnits.find(unit => unit.unitName === selectedUnit) : availableUnits[0];
    sessionStorage.setItem('selectedUnit', selectedUnit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }
  navigateToUnitObservations(selectedUnit, data) {
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === selectedUnit);
    sessionStorage.setItem('selectedUnit', selectedUnit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    sessionStorage.setItem('searchObservation', JSON.parse(data));
    this.router.navigateByUrl('/safety-and-surveillance/unit/observations');
  }
  onDateChanged($event: any) {
    sessionStorage.setItem('selectedUnitDate', this.selectedDate);
    this.selectedDate = $event.singleDate.formatted;
    this.getDailyCount("dateChanged");
  }

  getColor(category) {
    return this.safetyAndSurveillanceCommonService.getColorValue(category);
  }

  /**
   * map view toggle.
   */
  toggal() {
    this.isShow = !this.isShow;
    if (this.isShow) {
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Viewing plant BEV', 'BEV');
    }
  };

  /**
   * date selector toggle event fro the iogp cards.
   */
  toggleDateSelector($event){
    this.selectedDateSelector=$event;
    if(this.selectedDateSelector == 'selected'){
      this.getIogpData();
    }
  }

  /**
   * map view toggle.
   */
  toggleMapView($event){
    this.mapView=$event
    this.toggal();
    this.checkMapView=!this.checkMapView;
    if(!this.checkMapView) {
      window.dispatchEvent(new CustomEvent('enable-inputs'))
    }
  }


  /**
   * setting graphs data.
   */
  pushGraphsData() {
    var series: any[] = [];
    var data: any[] = [{

    }, "unit-2", "unit-3", "unit-4", "unit-5"]


    data.forEach(label => {
      var seriesObject: any = {
          name: label.name,
          type: label.type,
          stack: label.stack,
          label: {
            show: true
          },
          data: []
        }

      series.push(seriesObject)

    })
  }

  /**
   * get dates for iogp cards and calling respective apis.
   */
  getIogpDates(newItem: any) {
    if(newItem[0] != '' && newItem[1] != '') {
      this.iogp_custom_start_date = newItem[0];
      this.iogp_custom_end_date = newItem[1];
    }
    this.plantService.getChartData(this.iogp_custom_start_date,this.iogp_custom_end_date,this.selectedIds).subscribe(
      data=>{
          this.iogp_dailyOpenCount=data['fault_counts']['iogp_fault_open_count'];
          this.iogp_dailyCloseCount=data['fault_counts']['iogp_fault_close_count'];
      },
        error => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    this.plantService.fetchCategoryFaultCount(this.iogp_custom_start_date,this.iogp_custom_end_date,this.selectedIds).subscribe(
    dailyStatistics=>{
        this.iogpData=dailyStatistics;
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

  /**
   * global search funtionalty.
   * @param id
   */
  getObservationsDetails(id) {
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    this.plantService.getObservations().subscribe(
      observations => {
        let data: any = observations;
        this.observationList = data;
        this.obsInterval = setInterval(() => {
          let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
          if (unitDetails) {
            if (id) {
              window.dispatchEvent(new CustomEvent('hide-banner'))
              this.selectedObservation = this.observationList.find(obs => obs.id === Number(id));
              this.navigateToViewedObs();
              sessionStorage.removeItem('selectedObservation');
              clearInterval(this.obsInterval);
            }
            else {
              clearInterval(this.obsInterval);
            }
          }
        }, 100);
          this.dataService.passSpinnerFlag(false, true)
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

  /**
   * most critical observation navigation logic.
   */
  navigateToCriticalObs(abc){
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    sessionStorage.setItem('selectedCategory', JSON.stringify(this.selectedObsCategory));
    sessionStorage.setItem('selectedStatus', JSON.stringify(this.selectedStatus));
    let riskRating = [4,5]
    if (riskRating) {
      sessionStorage.setItem('riskRating', JSON.stringify(riskRating));
    }
    sessionStorage.removeItem('filterData')
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedIds, "", "");
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   *category navigation logic.
   */
  navigateToCategoryObs(category){
    sessionStorage.removeItem('filterData')
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    sessionStorage.setItem('selectedStatus', JSON.stringify(this.selectedStatus));
    sessionStorage.setItem('riskRating', JSON.stringify(this.riskRating));
    let  selectedObsCategory = (category) ? [category] : [];
    sessionStorage.setItem('selectedCategory', JSON.stringify(selectedObsCategory));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedIds, "", "");
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * iogp category navigation logic.
   */
  navigateSelectedCategoryObs(category){
    sessionStorage.removeItem('filterData')
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    let  selectedObsCategory = (category) ? [category] : [];
    sessionStorage.setItem('selectedCategory', JSON.stringify(selectedObsCategory));
    sessionStorage.setItem('selectedStatus', JSON.stringify(this.selectedStatus));
    sessionStorage.setItem('riskRating', JSON.stringify(this.riskRating));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    sessionStorage.removeItem('filterData')
    if(this.selectedDateSelector =='custom'){
      sessionStorage.setItem('startAndEndDate', JSON.stringify([this.iogp_custom_start_date, this.iogp_custom_end_date]))
      this.safetyAndSurveillanceDataService.passSelectedDates(this.iogp_custom_start_date , this.iogp_custom_end_date);
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedIds, "", "");
      this.router.navigateByUrl('/safety-and-surveillance/observations');
    }else{
      this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedIds, "", "");
      this.router.navigateByUrl('/safety-and-surveillance/observations');
    }
  }

  /**
   * most viewed observation navigation logic.
   */
  navigateToViewedObs(){
    // let selectedUnitItems = [];
    // let startDate = '';
    // let endDate = '';
    // this.safetyAndSurveillanceDataService.getSelectedUnits.subscribe(units => {
    //   selectedUnitItems = units
    // })
    // this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(selectedDates => {
    //   if(selectedDates['startDate'] && selectedDates['endDate']){
    //     startDate = selectedDates['startDate'];
    //     endDate = selectedDates['endDate'];
    // }})
    sessionStorage.removeItem('filterData')
    let unit = this.unitList.filter(ele =>{return ele.unitName == this.selectedObservation.unit});
    let obj = {...this.selectedObservation, unit_id: unit[0].id, start_date: unit[0].startDate, end_date: unit[0].endDate}
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    sessionStorage.setItem('searchObservation', JSON.stringify(this.selectedObservation));
    this.safetyAndSurveillanceDataService.passGlobalSearch(obj);
    this.selectedObservation = [];
    sessionStorage.setItem('manually-selected-units',JSON.stringify([unit[0].id]))
    this.safetyAndSurveillanceDataService.passSelectedUnits([unit[0].id]);
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * observation page navigation logic.
   */
  navigateToObsPage(){
    sessionStorage.removeItem('filterData')
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    sessionStorage.setItem('selectedStatus', JSON.stringify(this.selectedStatus));
    sessionStorage.setItem('riskRating', JSON.stringify(this.riskRating));
    sessionStorage.setItem('selectedCategory', JSON.stringify(this.selectedObsCategory));
    sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
    this.safetyAndSurveillanceDataService.passSelectedUnits(this.selectedIds);
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * open close counts navigation logic.
   */
  navigateToOpenCloseObs(status){
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.removeItem('filterData')
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    sessionStorage.setItem('selectedCategory', JSON.stringify(this.selectedObsCategory));
    sessionStorage.setItem('riskRating', JSON.stringify(this.riskRating));
    let selectedStatus =[];
    if (status == 'open') {
      selectedStatus = ['Open']
      sessionStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
    } else if (status == 'close') {
      selectedStatus = ['Closed-False Positive', 'Closed-No Action', 'Closed-Action Taken']
      sessionStorage.setItem('selectedStatus', JSON.stringify(selectedStatus));
    }
    this.safetyAndSurveillanceDataService.passSelectedUnits(this.selectedIds);
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * setting available units after building the ids.
   * @param availableUnits units.
   */
  setAvailableUnits(availableUnits) {
    if (Object.keys(availableUnits).length > 0) {
      if (availableUnits['IOGP_Category']) {
        clearInterval(this.setInterval);
        this.units = [];
        this.unitList = [];
        let units: any = availableUnits;
        this.units = Object.keys(units.IOGP_Category);
        this.units.forEach((unit) => {
          if (units.IOGP_Category[unit].access_permissions[0].indexOf('view') > -1) {
            let unitDetails = {};
            unitDetails['obsData'] = {};
            unitDetails['unitName'] = unit;
            unitDetails['startDate'] = units.IOGP_Category[unit].start_date;
            unitDetails['endDate'] = units.IOGP_Category[unit].end_date;
            unitDetails['id'] = units.IOGP_Category[unit].id;
            unitDetails['totalObsFlights'] = units.IOGP_Category[unit].flights_count;
            unitDetails['userGroup'] = units.IOGP_Category[unit].access_permissions[0];
            unitDetails['obsData']['openCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].open }).reduce((a, b) => a + b, 0);
            unitDetails['obsData']['closeCount'] = Object.keys(units.IOGP_Category[unit].faults_count).map(item => { return units.IOGP_Category[unit].faults_count[item].close }).reduce((a, b) => a + b, 0);
            unitDetails['order'] = units.IOGP_Category[unit].order;
            this.unitList.push(unitDetails);
          }
        });
        if (Object.keys(this.plantImageDetails).length > 0) {
          this.plantImageDetails['locationMap'].forEach(unit => {
            unit.openCount = (this.unitList.find(data => data.unitName === unit.name)) ? this.unitList.find(item => item.unitName === unit.name)['obsData']['openCount'] : '-';
            unit.closeCount = (this.unitList.find(data => data.unitName === unit.name)) ? this.unitList.find(item => item.unitName === unit.name)['obsData']['closeCount'] : '-';
          });
          this.plantImageDetails.imageUrl = this.plantImageUrl;
          this.plantImageDetails = { ...this.plantImageDetails };
        }
        this.unitList.sort((a, b) => (a.order < b.order) ? -1 : 1);
        this.units = this.unitList.map(unit => unit.unitName);
        sessionStorage.setItem('unitDetails', JSON.stringify(this.unitList));
        sessionStorage.setItem('unitCount', this.unitList.length.toString());
      }
    } else {
      this.unitList = [];
      this.units = [];
    }
  }

navigateToCriticalJobs(){
  this.getFetchPermitFilters();
}

getFetchPermitFilters() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.fetchPermitFilters(this.selectedIds,'units').subscribe(
      data => {
          let unitDetails = JSON.parse(sessionStorage.getItem('unitDetails'));
          if (unitDetails) {
            // sessionStorage.setItem('permit_number', JSON.stringify(data['permit_number']))
            sessionStorage.setItem('type_of_permit', JSON.stringify(data['type_of_permit']))
            sessionStorage.setItem('nature_of_work', JSON.stringify(data['nature_of_work']))
            sessionStorage.setItem('vendor_name', JSON.stringify(data['vendor_name']))
            sessionStorage.setItem('issuer_name', JSON.stringify(data['issuer_name']))
            this.router.navigateByUrl('/safety-and-surveillance/observations');
            sessionStorage.setItem('selectedCategory', JSON.stringify(this.selectedObsCategory));
            this.safetyAndSurveillanceDataService.passDatesAndUnits(this.selectedIds, "", "");
          }
       
        this.dataService.passSpinnerFlag(false, true)
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
 

   
 

  ngOnDestroy() {
    clearInterval(this.setInterval);
    clearInterval(this.dashboardDataInterval);
    this.safetyAndSurveillanceDataService.passBevData('', false);
    this.subscription.unsubscribe();
  }

}
