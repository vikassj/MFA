import { Component, OnInit, OnDestroy } from '@angular/core';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker';
import * as moment from 'moment';
import "moment-timezone";
import { Subscription } from 'rxjs';


import { CommonService } from '../../services/common.service';
import { DataService } from '../../services/data.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ManpowerCountingCommonService } from '../../shared/services/common.service';
import { ManpowerCountingDataService } from '../../shared/services/data.service';
import { PlantService } from '../../shared/services/plant.service';
import { UnitService } from '../../shared/services/unit.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  selectedNavItem = 'All locations';
  startDateCalenderOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm-yyyy',
  };
  startDateCalenderModel: IMyDateModel = null;

  endDateCalenderOptions: IAngularMyDpOptions = {
    dateRange: false,
    dateFormat: 'dd-mm-yyyy',
  };
  endDateCalenderModel: IMyDateModel = null;
  locationMpcData: any[] = [];
  overallMpcData: any = {
    gateCount: 'NA',
    unitCount: 'NA',
    date: 'NA',
    time: 'NA',
  };
  locationFilters: any[] = ['All locations'];
  selectedFilter: string = '';
  noDataMsg: string = '';
  selectedLocation: any;
  setLiveCount: any;
  mpcData: any[] = [];
  locationData: any;
  mpcChartRefreshInterval: number = 0;
  invalidZones: any[] = [];
  mpcSidebarConf: any = {
    zoneName: true,
    startDate: true,
    endDate: true,
    startTime: true,
    endTime: true,
    minimumThreshold: false,
    maximumThreshold: false,
  };
  reportsSidebarConf: any = {
    zoneName: true,
    startDate: true,
    endDate: true,
  };
  currentUnitPage: string = '';
  helpModule: string = '';
  mpcZones: any[] = [];
  mpcChartInterval: any;
  mpcStartDate: any;
  mpcEndDate: any;
  startTime: any;
  endTime: any;
  startMaxTime: Date;
  endMinTime: Date;
  inOutCount: any;
  minThreshold: number = 0;
  maxThreshold: number = 0;
  min: number = 0;
  max: number = 0;
  elem: any;
  zoneList: any;
  liveTime: any;
  liveDate: any;
  liveZone: any;
  liveCount: any;
  mpcDataTemp: any;
  mpcDataTemp1: any;

  //chart data variables
  msg: string = '';
  moduleName: string = '';
  shortModuleName: string = '';
  selectedUnit: string = '';
  mpcTitle: string = '';
  mpcInCount: any = '--';
  mpcOutCount: any = '--';
  selectedMpcZone: string = '';
  mpcChartData: any[] = [];
  mpcThresholds: any[] = [];
  mpcDataInterval: any;
  mpcRefreshInterval: number = 10000;
  mpcLiveData: any = {};
  subscription: Subscription = new Subscription();
  currentDate: any;
  currentTime: any;
  startDate: any;
  endDate: any;
  mappedUnitName: string = '';
  fixSDate: any;
  fixEDate: any;
  fdate: any;
  sTime: any;
  eTime: any;
  defalutSD: any;
  defalutED: any;
  zonesList: any;
  mpcBarChartData: any;
  firstZone: any;
  unitsAndZones: any;
  selectedZone: any;
  unitLevelMpcData: any;
  unitLevelMpcDataLive: any[] = [];
  unitLevelMpcDataLive1: any[] = [];
  gateLevelMpcData: any;
  gateLevelMpcDataLive: any[] = [];
  gateLevelMpcDataLive1: any[] = [];
  unitWiseLiveCount: number = 0;
  gateWiseLiveCount: number = 0;
  filteredZone: any;
  latestCount: any[] = [];
  fedate: any;
  helpItems: any;
  timeZone : any;

  constructor(
    private plantService: PlantService,
    private snackbarService: SnackbarService,
    private manpowerCountingCommonService: ManpowerCountingCommonService,
    private dataService: DataService,
    private commonService: CommonService,
    private manpowerCountingDataService: ManpowerCountingDataService,
    private unitService: UnitService
  ) {}

  ngOnInit(): void {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let minDate = moment().tz(this.timeZone).format("YYYY-MM-DD")
    console.log(minDate)
    this.getMpcLocations();
    this.dataService.passSpinnerFlag(true, true);
    this.commonService
      .readModuleConfigurationsData('manpower-counting')
      .subscribe((data) => {
        const application_features =
          data['module_configurations']['application_features'];
        if (application_features['unit_wise']) {
          if (!this.locationFilters.includes('Unit-wise')) {
            this.locationFilters.push('Unit-wise');
          }
        }
        if (application_features['gate_wise']) {
          if (!this.locationFilters.includes('Gate-wise')) {
            this.locationFilters.push('Gate-wise');
          }
        }
      this.selectedFilter = this.locationFilters[0];
      this.mpcRefreshInterval = data['page_configurations']['dashboard_page']['chart_refresh_interval'];
      this.shortModuleName = this.commonService.returnShortModuleName('manpower-counting');
     // this.getMpcLocations();
      this.setLiveCount = setInterval(() => {
        this.getLiveCount();
      }, this.mpcRefreshInterval);

      // this.mpcRefreshInterval = data['unitModule'].liveCountDetails.mpcRefreshInterval;
      this.shortModuleName = this.commonService.returnShortModuleName('manpower-counting');
      this.moduleName = this.commonService.returnModuleName('manpower-counting');
      this.currentDate = this.commonService.formatDate(new Date());
      this.currentTime = this.commonService.formatTime();
      // this.selectedUnit = sessionStorage.getItem('selectedUnit');

      this.subscription.add(this.manpowerCountingDataService.getUnitMpcFilters.subscribe(mpcData => {
        if (mpcData.validFlag) {
          this.selectedUnit = mpcData.unit;
          this.currentDate = this.commonService.formatDate(new Date());
          this.currentTime = this.commonService.formatTime();
          this.selectedMpcZone = mpcData.zone;
          this.getManpowerCountingLiveCount();
          this.startDate = mpcData.startDate;
          console.log(this.startDate)
          let syear = this.startDate.slice(0, 4)
          let smonth = this.startDate.slice(5, 7)
          let sday = this.startDate.slice(8, 10)
          this.defalutSD = sday + "-" + smonth + "-" + syear
          this.endDate = mpcData.endDate;
          console.log(this.endDate)
          let eyear = this.endDate.slice(0, 4)
          let emonth = this.endDate.slice(5, 7)
          let eday = this.endDate.slice(8, 10)
          this.defalutED = eday + "-" + emonth + "-" + eyear
          this.mpcTitle = (this.selectedMpcZone) ? this.moduleName + ' for ' + this.selectedMpcZone + ' from ' + this.startDate + ' to ' + this.endDate : this.moduleName;
          this.mpcInCount = mpcData.inOutCount['in_count'];
          this.mpcOutCount = mpcData.inOutCount['out_count'];
          this.mpcChartData = mpcData.mpcChartData;
          this.mpcThresholds = [
            {
              yAxis: mpcData.minThreshold
            },
            {
              yAxis: mpcData.maxThreshold
            }
          ]
        }}
          )
        );
        this.mpcDataInterval = setInterval(() => {
          if (this.selectedMpcZone) {
            this.getManpowerCountingLiveCount();
          }
        }, this.mpcRefreshInterval);
      });
    this.subscription.add(
      this.manpowerCountingDataService.getSelectedUnit.subscribe(
        (selectedUnit) => {
          this.loadModuleData(true);
        }
      )
    );
    this.subscription.add(
      this.manpowerCountingDataService.getCurrentUnitPage.subscribe(
        (currentUnitPage) => {
          this.currentUnitPage = currentUnitPage.currentUnitPage;
          this.loadModuleData(false);
        }

    ));

      this.mpcDataInterval = setInterval(() => {
        if (this.selectedMpcZone) {
          this.getManpowerCountingLiveCount();
        }
      }, this.mpcRefreshInterval);



    this.commonService.readModuleConfigurationsData('manpower-counting').subscribe(data => {
      this.helpItems = data['page_configurations']['help_page']['page_sidebar'];
      this.mpcChartRefreshInterval = data['page_configurations']['dashboard_page']['chart_refresh_interval']
      //this.invalidZones = data['unitModule'].liveCountDetails.invalidZones;
      //this.mpcSidebarConf = data['unitModule'].liveCountDetails.sidebar;
      //this.reportsSidebarConf = data['unitModule'].reportsDetails.sidebar;
      this.subscription.add(this.manpowerCountingDataService.getSelectedUnit.subscribe(selectedUnit => {
        //if (selectedUnit.validFlag) {
          setTimeout(() => {this.loadModuleData(true);}, 300);
        //}
      }));
      this.subscription.add(this.manpowerCountingDataService.getCurrentUnitPage.subscribe(currentUnitPage => {
        //if (currentUnitPage.validFlag) {
        this.currentUnitPage = currentUnitPage.currentUnitPage;
        this.loadModuleData(false);
        //}
      }));
    });
  }

  /**
   * get the mpc locations.
   */
  getMpcLocations() {
    this.manpowerCountingCommonService.getMpcLocations().subscribe(
      (locationsData) => {
        this.unitsAndZones = locationsData['data'];
        this.firstZone = this.unitsAndZones[0]?.['name'];
        this.selectedZone = this.unitsAndZones[0]?.['name'];
        this.unitsAndZones.map((item) => {
          if (this.firstZone == item.name) {
            sessionStorage.setItem('mpcSelectedUnit', item.unit);
            this.getMpcZones();
          }
        });
        if (locationsData['response_code'] === 1) {
          this.locationMpcData = [];
          this.locationMpcData = locationsData['data'];
          this.unitLevelMpcData = [];
          this.gateLevelMpcData = [];
          this.locationMpcData.forEach((location) => {
            if (location['location'] === 'UL') {
              this.unitLevelMpcData.push(location);
              location.filter = 'Unit-wise';
            } else if (location['location'] === 'GL') {
              this.gateLevelMpcData.push(location);
              location.filter = 'Gate-wise';
            }
          });
          this.locationMpcData.sort((a, b) => (a.order < b.order ? -1 : 1));
          this.noDataMsg =
            this.locationMpcData.length > 0 ? '' : 'No locations available.';
          this.getLiveCount();
        }
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    );
  }

  /**
   * get the live count.
   */
  getLiveCount() {
    let data: any;
    this.plantService.getLiveCount().subscribe(
      (mpcData: any) => {
        if (mpcData.data.length > this.unitsAndZones.length) {
          this.getMpcLocations();
        }
        mpcData['data'].forEach((element) => {
          if (element['zone'] == this.firstZone) {
            data = element;
            this.liveTime = data['time'];
            this.liveDate = data['date'];
            this.liveZone = data['zone'];
            this.liveCount = data['count'];
          }
        });
        mpcData['data'].forEach((element, index) => {
          this.mpcData.forEach((ele) => {
            if (
              element['zone'] == ele['zone'] &&
              element['count'] !== ele['count']
            ) {
              this.latestCount = [];
              this.latestCount.push(element);
            }
          });
        });
        if (mpcData['response_code'] === 1) {
          data = mpcData['data'];
          this.mpcData = data;
          this.latestCount.forEach((element) => {
            this.mpcData.forEach((ele, index) => {
              if (element['zone'] == ele['zone']) {
                this.mpcData.splice(index, 1);
              }
            });
          });
          this.latestCount.forEach((element) => {
            this.mpcData.unshift(element);
          });
          if (!this.filteredZone) {
            this.mpcDataTemp = data;
            this.mpcDataTemp1 = data;
          }
          let counts = 0;
          let GateCounts = 0;
          if (!this.filteredZone) {
            this.gateLevelMpcDataLive = [];
            this.unitLevelMpcDataLive = [];
          }
          this.mpcData.forEach((ele) => {
            if (!this.filteredZone) {
              this.unitLevelMpcData.forEach((val) => {
                if (ele['zone'] == val['name']) {
                  this.unitLevelMpcDataLive?.push(ele);
                  this.unitLevelMpcDataLive1?.push(ele);
                }
              });
              this.gateLevelMpcData.forEach((val) => {
                if (ele['zone'] == val['name']) {
                  this.gateLevelMpcDataLive?.push(ele);
                  this.gateLevelMpcDataLive1?.push(ele);
                }
              });
            }
          });
          for (const [key, value] of Object.entries(
            this.unitLevelMpcDataLive
          )) {
            let mpcCount = value;
            counts += mpcCount['count'];
            this.unitWiseLiveCount = counts;
          }
          for (const [key, value] of Object.entries(
            this.gateLevelMpcDataLive
          )) {
            let mpcGate = value;
            GateCounts += mpcGate['count'];
            this.gateWiseLiveCount = GateCounts;
          }
          this.locationMpcData.forEach((location) => {
            let locationMpcData = data.filter(
              (item) => item.zone === location.name
            );
            if (locationMpcData.length > 0) {
              location.count = locationMpcData[0].count;
              location.date = locationMpcData[0].date;
              location.time = locationMpcData[0].time;
            } else {
              location.count = 'NA';
              location.data = 'NA';
              location.time = 'NA';
            }
          });
          this.overallMpcData = {
            gateCount:
              data.length > 0
                ? data
                    .filter(
                      (item) =>
                        this.locationMpcData
                          .filter((item) => item.location === 'GL')
                          .map((item) => item.name)
                          .indexOf(item.zone) > -1
                    )
                    .map((location) => location.count)
                    .reduce((a, b) => a + b, 0)
                : 'NA',
            unitCount:
              data.length > 0
                ? data
                    .filter(
                      (item) =>
                        this.locationMpcData
                          .filter((item) => item.location === 'UL')
                          .map((item) => item.name)
                          .indexOf(item.zone) > -1
                    )
                    .map((location) => location.count)
                    .reduce((a, b) => a + b, 0)
                : 'NA',
            date: data.length > 0 ? data[0].date : 'NA',
            time: data.length > 0 ? data[0].time : 'NA',
          };
          let Year = this.overallMpcData['date'].slice(0, 4);
          let Month = this.overallMpcData['date'].slice(4, 7);
          let Day = this.overallMpcData['date'].slice(8, 10);
          this.overallMpcData['date'] = Day + Month + '-' + Year;
        } else {
          this.locationMpcData.forEach((gate) => {
            gate.count = 'NA';
            gate.data = 'NA';
            gate.time = 'NA';
          });
          this.overallMpcData = {
            gateCount: 'NA',
            unitCount: 'NA',
            date: 'NA',
            time: 'NA',
          };
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  /**
   * get the online camera count, date, time and total camera count.
   */
  getManpowerCountingLiveCount() {
    this.unitService.getLiveCount().subscribe(
      (mpcLiveCountData) => {
        if (mpcLiveCountData['response_code'] === 1) {
          let mpcLiveData: any = mpcLiveCountData['data'];
          if (this.selectedMpcZone === 'All Locations') {
            if (mpcLiveData.length > 0) {
              this.mpcLiveData = {
                date: mpcLiveData[0].date,
                time: mpcLiveData[0].time,
                count: mpcLiveData
                  .map((item) => item.count)
                  .reduce((a, b) => a + b, 0),
                onlineCameras: mpcLiveData
                  .map((item) => item.onlineCameras)
                  .reduce((a, b) => a + b, 0),
                totalCameras: mpcLiveData
                  .map((item) => item.totalCameras)
                  .reduce((a, b) => a + b, 0),
              };
            } else {
              this.mpcLiveData = {};
            }
          } else {
            this.mpcLiveData = mpcLiveData.find(
              (item) => item.zone === this.selectedMpcZone
            )
              ? mpcLiveData.find((item) => item.zone === this.selectedMpcZone)
              : {};
          }
        } else {
          this.mpcLiveData = {};
        }
      },
      (error) => {},
      () => {}
    );
  }

  loadModuleData(reloadDatesFlag) {
    if (reloadDatesFlag) {
      this.selectedUnit = sessionStorage.getItem('mpcSelectedUnit');
    }
    this.currentUnitPage = 'Live Count';
    this.dataService.passSpinnerFlag(true, true);
    this.getMpcZones();
  }

  /**
   * get the mpc zones for selected location and unit.
   */
  getMpcZones() {
    this.unitService.getMpcZones().subscribe(
      (mpcZones) => {
        if (mpcZones['response_code'] === 1) {
          clearInterval(this.mpcChartInterval);
          let units: any = mpcZones['data'];
          units.sort((a, b) => (a.order < b.order ? -1 : 1));
          this.mpcZones = units.map((item) => item.name);
          this.mpcZones.unshift('All Locations');
          if (sessionStorage.getItem('mpcSelectedZone')) {
            this.selectedMpcZone = sessionStorage.getItem('mpcSelectedZone');
          } else {
            this.selectedMpcZone = this.mpcZones[1];
          }
          if (this.currentUnitPage === 'Live Count') {
            let dates = moment().tz(this.timeZone);
            let todayDate : any = this.commonService
              .formatDate(new Date())
              .split('-');
            let startDate: any = new Date();
            startDate.setDate(startDate.getDate() + 1);

            let endDate: any = new Date();
            endDate.setDate(endDate.getDate() - 1);
            this.startDateCalenderOptions.disableSince = {
              year: Number(startDate[0]),
              month: Number(startDate[1]),
              day: Number(startDate[2]),
            };
            this.endDateCalenderOptions.disableUntil = {
              year: Number(endDate[0]),
              month: Number(endDate[1]),
              day: Number(endDate[2]),
            };
            this.mpcStartDate = todayDate.join('-');
            this.mpcEndDate = this.mpcStartDate;
            let date = new Date();

            this.startTime = new Date(
              Number(todayDate[0]),
              Number(todayDate[1]),
              Number(todayDate[2]),
              0,
              0
            );

            this.endTime = new Date(
              Number(todayDate[0]),
              Number(todayDate[1]),
              Number(todayDate[2]),
              dates.hours(),
              dates.minutes()
            );

            this.startMaxTime = new Date(
              Number(todayDate[0]),
              Number(todayDate[1]),
              Number(todayDate[2]),
              this.endTime.getHours(),
              this.endTime.getMinutes()
            );
            this.endMinTime = new Date(
              Number(todayDate[0]),
              Number(todayDate[1]),
              Number(todayDate[2]),
              0,
              0
            );
            if (
              this.mpcSidebarConf.minimumThreshold &&
              this.mpcSidebarConf.maximumThreshold
            ) {
              document
                .getElementsByClassName('k-input')[4]
                .setAttribute('disabled', 'true');
              document
                .getElementsByClassName('k-input')[5]
                .setAttribute('disabled', 'true');
            }
            setTimeout(() => {
              this.getManpowerCountingChartData(
                this.mpcStartDate,
                this.mpcEndDate,
                '00:00',
                this.commonService.twoDigitFormatter(this.endTime.getHours()) +
                  ':' +
                  this.commonService.twoDigitFormatter(
                    this.endTime.getMinutes()
                  ),
                true
              );
              this.mpcChartInterval = setInterval(() => {
                let date = new Date();

                this.endTime = new Date(
                  Number(todayDate[0]),
                  Number(todayDate[1]),
                  Number(todayDate[2]),
                  date.getHours(),
                  date.getMinutes()
                );
                this.getManpowerCountingChartData(
                  this.mpcStartDate,
                  this.mpcEndDate,
                  this.commonService.twoDigitFormatter(
                    this.startTime.getHours()
                  ) +
                    ':' +
                    this.commonService.twoDigitFormatter(
                      this.startTime.getMinutes()
                    ),
                  this.commonService.twoDigitFormatter(
                    this.endTime.getHours()
                  ) +
                    ':' +
                    this.commonService.twoDigitFormatter(
                      this.endTime.getMinutes()
                    ),
                  false
                );
              }, this.mpcChartRefreshInterval);
            }, 1000);
          }
        }
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  /**
   * get the people count for chart data.
   */
  getManpowerCountingChartData(
    startDate,
    endDate,
    startTime,
    endTime,
    spinnerFlag
  ) {
    if (!this.startDate) {
      let d : any = new Date();
      // let ed = d.getDate() + 1;
      // let st = d.getDate() - 1;
      // let syear = d.getFullYear();
      // let smonth = d.getMonth() + 1;
      this.startDate = moment().tz(this.timeZone).format("YYYY-MM-DD");
    } else if (!this.endDate) {
      let d : any = new Date();
      // let ed = d.getDate() + 1;
      // let st = d.getDate() - 1;
      // let syear = d.getFullYear();
      // let smonth = d.getMonth() + 1;
      this.endDate = moment().tz(this.timeZone).format("YYYY-MM-DD");
    }
    this.unitService
      .getZoneManpowerCountingChartData(
        this.firstZone,
        this.startDate,
        this.endDate,
        startTime,
        endTime
      )
      .subscribe(
        (mpcChartData) => {
          if (mpcChartData['response_code'] === 1) {
            let chartData: any;
            this.inOutCount = { in_count: '--', out_count: '--' };
            chartData = mpcChartData['data'];
            this.mpcChartData = [];
            if (chartData.people_count_values.length > 0) {
              for (var i = 0; i < chartData.people_count_values.length; i++) {
                var dat = [
                  moment(chartData.people_count_values[i].date).format(
                    'D-MMM'
                  ) +
                    ' ' +
                    chartData.people_count_values[i].time,
                  chartData.people_count_values[i].count,
                ];
                this.mpcChartData.push(dat);
              }
            }
            this.inOutCount =
              this.invalidZones.indexOf(this.selectedMpcZone) > -1
                ? { in_count: '--', out_count: '--' }
                : chartData.crowd_count_values.crowd_interval_diff;
            this.minThreshold =
              this.mpcChartData.length > 0
                ? Math.min.apply(
                    null,
                    this.mpcChartData.map((item) => item[1])
                  )
                : 0;
            this.maxThreshold =
              this.mpcChartData.length > 0
                ? Math.max.apply(
                    null,
                    this.mpcChartData.map((item) => item[1])
                  )
                : 0;
            this.min = this.minThreshold;
            this.max = this.maxThreshold;
            let validFlag =
              this.selectedMpcZone && this.mpcStartDate && this.mpcEndDate
                ? true
                : false;
            this.manpowerCountingDataService.passUnitMpcFilters(
              this.selectedUnit,
              this.selectedMpcZone,
              this.startDate,
              this.endDate,
              this.mpcChartData,
              this.minThreshold,
              this.maxThreshold,
              this.inOutCount,
              validFlag
            );
          }
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.manpowerCountingDataService.passUnitMpcFilters(
            this.selectedUnit,
            this.selectedMpcZone,
            this.startDate,
            this.endDate,
            [],
            0,
            0,
            { in_count: '--', out_count: '--' },
            true
          );
        },
        () => {
          this.dataService.passSpinnerFlag(false, true);
        }
      );
  }

  /**
   * select start time.
   */
  onChangeStartTime(data) {
    this.timeZone =  JSON.parse( sessionStorage.getItem('site-config'))
    this.sTime = data['value'].getHours() + ':' + data['value'].getMinutes();
    let eTime = this.endTime.getHours() + ':' + this.endTime.getMinutes();
    let sTime = this.startTime.getHours() + ':' + this.startTime.getMinutes();
    if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.sTime !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    }
  }

  /**
   * select end time.
   */
  onChangeEndTime(data) {
    this.eTime = data['value'].getHours() + ':' + data['value'].getMinutes();
    let sTime = this.startTime.getHours() + ':' + this.startTime.getMinutes();
    let eTime = this.endTime.getHours() + ':' + this.endTime.getMinutes();
    if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.sTime !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    }
  }

  /**
   * select start date.
   */
  onStartDateChanged(event) {
    this.fdate = event['singleDate']['formatted'];
    let sdate =
      event['singleDate']['date']['year'] +
      '-' +
      event['singleDate']['date']['month'] +
      '-' +
      event['singleDate']['date']['day'];
    this.fixSDate = sdate;
    this.startDate = moment(this.fixSDate).format("YYYY-MM-DD");
    let sTime = this.startTime.getHours() + ':' + this.startTime.getMinutes();
    let eTime = this.endTime.getHours() + ':' + this.endTime.getMinutes();
    let eyear = this.fdate.slice(6, 10);
    let year = parseInt(eyear);
    let emonth = this.fdate.slice(3, 5);
    let month = parseInt(emonth);
    let eday = this.fdate.slice(0, 2);
    let date = parseInt(eday);
    this.endDateCalenderOptions = {
      dateRange: false,
      dateFormat: 'dd-mm-yyyy',
      monthSelector: true,
      yearSelector: true,
      highlightDates: [],
      disableDates: [],
      disableHeaderButtons: true,
      showWeekNumbers: false,
      disableUntil: { year: year, month: month, day: date },
    };
    if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixEDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.fixEDate !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    }
  }

  /**
   * select end date.
   */
  onEndDateChanged(event) {
    this.fedate = event['singleDate']['formatted'];
    let edate =
      event['singleDate']['date']['year'] +
      '-' +
      event['singleDate']['date']['month'] +
      '-' +
      event['singleDate']['date']['day'];
    this.fixEDate = edate;
    let sTime = this.startTime.getHours() + ':' + this.startTime.getMinutes();
    let eTime = this.endTime.getHours() + ':' + this.endTime.getMinutes();
    this.endDate = moment(this.fixEDate).format("YYYY-MM-DD")
    if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.sTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.fixEDate !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixEDate !== undefined &&
      this.sTime !== undefined &&
      this.eTime !== undefined
    ) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.eTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined && this.sTime !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined && this.fixEDate !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate !== undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate !== undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    }
  }

  /**
   * disable the date inputs.
   */
  disabledDates() {
    let d = moment().tz(this.timeZone);
    let ed = d.date() + 1;
    let st = d.date() - 1;
    let syear: any;
    let smonth: any;
    if (this.startDate.length == 9 || this.startDate.length == 8) {
      syear = this.startDate?.slice(0, 4);
      smonth = this.startDate?.slice(5, 6);
    } else {
      syear = this.startDate?.slice(0, 4);
      smonth = this.startDate?.slice(5, 7);
    }
    if (!this.startDate) {
      syear = d.year();
      smonth = d.month() + 1;
    }
    this.startDateCalenderOptions = {
      disableSince: { year: syear, month: smonth, day: ed },
    };
    if (this.fdate == undefined) {
      this.endDateCalenderOptions = {
        disableUntil: { year: syear, month: smonth, day: st },
        disableSince: { year: syear, month: smonth, day: ed }
      };
    } else if (this.fdate != undefined) {
      let eyear = this.fdate.slice(6, 10);
      let year = parseInt(eyear);
      let emonth = this.fdate.slice(3, 5);
      let month = parseInt(emonth);
      let eday = this.fdate.slice(0, 2);
      let date = parseInt(eday);
      let d = date - 1;
      if (d == 0) {
        month = month - 1;
        if (
          emonth == 1 ||
          emonth == 5 ||
          emonth == 7 ||
          emonth == 10 ||
          emonth == 12
        ) {
          d = 30;
        } else if (emonth == 8) {
          d = 31;
        } else if (emonth == 3) {
          d = 28;
        }
      }
      this.endDateCalenderOptions = {
        disableUntil: { year: year, month: month, day: d },
      };
    }
  }

  /**
   * select the location from list of locations.
   */
  selectedNavItems(data: any) {
    this.filteredZone = '';
    this.selectedNavItem = data;
    if (this.filteredZone == '') {
      this.getLiveCount();
      this.getManpowerCountingLiveCount();
    }
  }

  active(data) {
    this.locationData = data;
    this.liveCount = this.locationData['count'];
    this.firstZone = this.locationData['zone'];
    this.liveCount = this.locationData['count'];
    sessionStorage.setItem('selectedMPCZone', this.firstZone);
    this.unitsAndZones.map((item) => {
      if (this.firstZone == item.name) {
        sessionStorage.setItem('mpcSelectedUnit', item.unit);
      }
    });
    if (this.fixSDate == undefined && this.fixEDate == undefined) {
      this.fixSDate = this.liveDate;
      this.fixEDate = this.liveDate;
    }
    if (this.fdate == undefined && this.fedate == undefined) {
      this.fdate = this.overallMpcData.date;
      this.fedate = this.overallMpcData.date;
    }
    this.selectedMpcZone = this.locationData['zone'];
    let sTime = this.startTime.getHours() + ':' + this.startTime.getMinutes();
    let eTime = this.endTime.getHours() + ':' + this.endTime.getMinutes();
    if (
      this.fixSDate != undefined &&
      this.fixEDate != undefined &&
      this.sTime != undefined &&
      this.eTime != undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate == undefined &&
      this.fixEDate == undefined &&
      this.sTime == undefined &&
      this.eTime == undefined
    ) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate != undefined &&
      this.fixEDate != undefined &&
      this.sTime != undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (
      this.fixSDate != undefined &&
      this.fixEDate != undefined &&
      this.eTime != undefined
    ) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate != undefined && this.sTime != undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate != undefined && this.fixEDate != undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.fixEDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.sTime != undefined && this.eTime != undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate != undefined && this.sTime != undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate != undefined && this.eTime != undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate != undefined && this.eTime != undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixSDate != undefined) {
      this.getManpowerCountingChartData(
        this.fixSDate,
        this.endDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.fixEDate != undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.fixEDate,
        sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.sTime != undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        this.sTime,
        eTime,
        'this.spinnerFlag'
      );
    } else if (this.eTime != undefined) {
      this.getManpowerCountingChartData(
        this.startDate,
        this.endDate,
        sTime,
        this.eTime,
        'this.spinnerFlag'
      );
    }
  }

  searchFilter(key?) {
    if (this.filteredZone !== '') {
      if (this.selectedNavItem == 'All locations') {
        this.mpcDataTemp1 = this.mpcDataTemp.filter((filter) => {
          return filter.zone
            .toLowerCase()
            .match(this.filteredZone.toLowerCase());
        });
      }

      if (this.selectedNavItem == 'Gate-wise') {
        this.gateLevelMpcDataLive1 = this.gateLevelMpcDataLive.filter(
          (filter) => {
            return filter.zone
              .toLowerCase()
              .match(this.filteredZone.toLowerCase());
          }
        );
      }

      if (this.selectedNavItem == 'Unit-wise') {
        this.unitLevelMpcDataLive1 = this.unitLevelMpcDataLive.filter(
          (filter) => {
            return filter.zone
              .toLowerCase()
              .match(this.filteredZone.toLowerCase());
          }
        );
      }
    } else {
      this.mpcDataTemp1 = [];
      this.gateLevelMpcDataLive1 = [];
      this.unitLevelMpcDataLive1 = [];
      this.getLiveCount();
      this.getManpowerCountingLiveCount();
    }
  }

  /**
   * select the zones from the list.
   */
  slectedZoneHighlight(data: any) {
    this.selectedZone = data;
    sessionStorage.setItem('selectedMPCZone', this.selectedZone);
  }

  ngOnDestroy() {
    clearInterval(this.setLiveCount);
    clearInterval(this.mpcDataInterval);
    this.manpowerCountingDataService.passUnitMpcFilters(
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      false
    );
    this.subscription.unsubscribe();
    clearInterval(this.mpcChartInterval);
    this.manpowerCountingDataService.passCurrentUnitPage('', false);
    this.subscription.unsubscribe();
  }
}
