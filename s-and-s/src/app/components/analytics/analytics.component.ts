import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { v4 as uuidv4 } from 'uuid';
import { NgSelectComponent } from '@ng-select/ng-select';

import { SafetyAndSurveillanceCommonService } from '../../shared/service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { PlantService } from 'src/app/shared/service/plant.service';
import { UnitService } from 'src/shared/components/unit-ss-dashboard/services/unit.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import * as moment from 'moment';

@Component({
  selector: 'app-analytics',
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.scss']
})
export class AnalyticsComponent implements OnInit {

  msg = '';
  ColumnMode = ColumnMode;
  people: any[] = [
  ];
  selectedPeople: any[] = [];
  formattedPeople: any = {};
  observationsByUnitAndRiskRating: any = {};
  observationByTimeAndRiskRating: any;
  observationByMonthDay: any = {};
  observationByRiskRating: any;
  recentObservations: any = [];
  selectedDate: any;
  startDate = '';
  endDate = '';
  dayDropdown: boolean;
  daysList = [{ days: 'Today', value: 1 }, { days: 'Last 7 Days', value: 7 }, { days: 'Last 15 Days', value: 15 }, { days: 'Last 1 Month', value: 30 }, { days: 'Last 3 Months', value: 90 }, { days: 'Last 6 Months', value: 180 }, { days: 'Last 1 Year', value: 365 }]
  selectedObservationDays = this.daysList[2];
  countOfUnitZone = {}
  unitWiseObservations = [];
  overviewOfCategory = [
  ];
  showUnitWise: boolean;
  selectedUnit: any;
  showCategoryWise: boolean;
  selectedCategory: any;
  coountOfDays = 0;
  analyticsCards: Object;
  unitWiseObservationsTree = true;
  criticalObsData: Object;
  observationTrendData: Object;
  unitWiseObservationsObj: Object;
  criticalZoneArray: any[];
  criticalZoneDropdown: boolean;
  selectedCriticalZone: Object;
  observationTrendDropdown: boolean;
  observationTrendOptions: any[];
  selectedObservationTrend: string;
  selectedObsStatus = 'All';
  overviewOfCategoryObj: Object;
  selectedOverviewOfCategory: any[];
  selectedOverviewOfUnitCategory: any[];
  selectedOverviewOfUnitCategoryObj: Object;
  unitZoneWiseObservations: any[];
  unitGrouping: boolean = true;
  criticalObservationSwitch: boolean = true;
  detailedToggle: boolean = true;
  selectedOverviewOfUnitCategoryLeft: any[];
  selectedOverviewOfUnitCategoryLeftObj: Object;
  overWiseCategory: boolean = true;
  clientName: string;
  mostCriticalObsData: any;
  unitWiseObservationsLargest: number;
  unitZoneWiseObservationsLargest: number;
  overviewOfCategoryLargest: number;
  selectedOverviewOfCategoryLargest: number;
  selectedOverviewOfUnitCategoryLargest: number;
  selectedOverviewOfUnitCategoryLeftLargest: number;
  unitWiseObservationsTotalCount: number;
  selectedOverviewOfUnitCategoryLeftTotalCount: number;
  overviewOfCategoryTotalCount: number;
  selectedOverviewOfUnitCategoryTotalCount: number;
  selectedOverviewOfCategoryTotalCount: number;
  obsFilters: Object;
  selectedCategoryId: number;
  tempUnitWiseObservations: any[];
  overAllWiseCategory: boolean = true;
  detailedUnitWiseToggle: boolean = true;
  detailedCategoryWiseToggle: boolean = true;
  unitZoneWiseObservationsTotalCount: number;
  sumOfObservationCategory: any[];
  sumOfUnitWiseObservations: any[];
  sumOfunitZoneWiseObservations: any[];
  sumOfSelectedOverviewOfUnitCategory: any[];
  sumOfSelectedOverviewOfCategory: any[];
  sumOfCriticalObs: any;
  formattedPeoples: {};
  selectedPeoples: any;
  tempUnitZoneWiseObservations: any[];
  totalCountUnit: number;
  disabledApplyBtn = true;
  allUnits: any;
  custom_start_date: string = '';
  custom_end_date: string = '';
  timeZone:any;
  selectedPlantDetails:any;
  constructor(private router: Router, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService, private dataService: DataService, private snackbarService: SnackbarService, private unitService: UnitService, private cd: ChangeDetectorRef, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) {
    let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
    let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
    this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)

    window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
      this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
    })
    
  }

  ngOnInit(): void {
    this.timeZone =  JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    setTimeout(() => {
      this.clientName = sessionStorage.getItem('plantName');
    }, 100);
    this.getUnitZoneDropdown();

    this.safetyAndSurveillanceCommonService.fetchObservationData('').subscribe((response) => {
      this.obsFilters = response;
    })
  }

  /**
   * select all units from the list of units to display on load.
   * @param event
   */
  selectList(event) {
    this.disabledApplyBtn = false;
    let unique = event.map(i => i.id).filter(this.onlyUnique);
    this.formattedPeoples = {};
    unique.forEach(item => {
      this.formattedPeoples[item] = event.filter(i => i.id === item).map(e => e.zoneId);
    });
    delete this.formattedPeoples['undefined'];
    let unit = 0;
    let zone = 0;
    for (const [key, value] of Object.entries(this.formattedPeoples)) {
      unit += 1
      zone += this.formattedPeoples[key].length
    }
    this.countOfUnitZone['unit'] = unit
    this.countOfUnitZone['zone'] = zone
    let index = this.selectedPeople.findIndex(data => { return data == '' })
    if (index >= 0) {
      this.selectedPeople.splice(index, 1)
    }
    this.selectedPeople.splice(index, 1)
  }

  /**
   * unselect all the units from the list.
   */
  unSelectAll() {
    this.disabledApplyBtn = false;
    this.formattedPeoples = {};
    this.selectedPeoples = [];
    this.selectedPeople = [''];
    let unit = 0;
    let zone = 0;
    for (const [key, value] of Object.entries(this.formattedPeoples)) {
      unit += 1
      zone += this.formattedPeoples[key].length
    }
    this.countOfUnitZone['unit'] = unit
    this.countOfUnitZone['zone'] = zone
  }


  onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  /**
   * apply button functionality for unit dropdown.
   * @param select ng-select component
   */
  applyBtn(select: NgSelectComponent) {
    this.disabledApplyBtn = true;
    this.formattedPeople = this.formattedPeoples
    this.selectedUnitZone();
    this.criticalObservationSwitch = true;
    this.overWiseCategory = true;
    this.detailedUnitWiseToggle = true;
    this.detailedCategoryWiseToggle = true;
    if (Object.keys(this.formattedPeople).length == 0) {
      this.showUnitWise = false;
      this.showCategoryWise = false;
      this.selectedOverviewOfUnitCategoryLeft = [];
      this.overviewOfCategory = [];
      this.selectedOverviewOfCategory = [];
      this.selectedOverviewOfUnitCategory = [];
      this.msg = "Select Unit/ Zone to show the analytics.";
      this.snackbarService.show(this.msg, false, false, false, true);
    }
    select.close();
    this.getPlantAnalytics4cards(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
    this.getCategoryWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.overWiseCategory);
    this.getUnitWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.criticalObservationSwitch);
    this.getCriticalObsGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
    this.getObservationTrendGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
  }

  /**
   * unit and zone mapping to populate the units dropdown.
   */
  getUnitZoneDropdown() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getUnitZoneDropdown().subscribe((response: any) => {
      this.allUnits = response
      let people = []
      if (response[0] == '') {
        this.dataService.passSpinnerFlag(false, true)
        var msg = "You are not mapped to any unit. Please contact the administrator."
        this.snackbarService.show(msg, false, false, false, true)
      } else {
        let index = 0;
        for (const [key, value] of Object.entries(response)) {
          let subprojects = [];
          index += 1
          response[key].forEach((data, i) => {
            subprojects.push({ title: data.name, id: key, zoneId: data.id, uuid: uuidv4() })
          })
          people.push({
            'title': key, uuid: uuidv4(),
            'subprojects': subprojects,
            index
          })
        }
        people.sort((i1, i2) => { return i2.index - i1.index })
        this.people = people;
        this.people.reverse();
        this.selectedAll(true);
        setTimeout(() => {
          this.selectDate();
        }, 100);
        this.dataService.passSpinnerFlag(false, true);
      }
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {

      })
  }

  /**
   * get the count of selected units and zones if all are selected.
   * @param boolean
   */
  selectedAll(boolean) {
    this.selectedPeoples = [];
    this.people.forEach(unit => {
      unit.subprojects.forEach(item => {
        this.selectedPeoples.push(item.uuid)
      })
    });
    this.selectedPeople = this.selectedPeoples;
    let unique = this.people.map(i => i.title);
    this.formattedPeoples = {};
    unique.forEach(item => {
      this.formattedPeoples[item] = this.people.find(i => i.title === item).subprojects.map(e => e.zoneId);
    });
    if (boolean) {
      this.formattedPeople = this.formattedPeoples
      this.selectedUnitZone();
      this.totalCountUnit = this.countOfUnitZone['zone'] + this.countOfUnitZone['unit']
    } else {
      this.disabledApplyBtn = false;
      let unit = 0;
      let zone = 0;
      for (const [key, value] of Object.entries(this.formattedPeoples)) {
        unit += 1
        zone += this.formattedPeoples[key].length
      }
      this.countOfUnitZone['unit'] = unit
      this.countOfUnitZone['zone'] = zone
      this.totalCountUnit = this.countOfUnitZone['zone'] + this.countOfUnitZone['unit']
    }
  }

  /**
   * get the count of the selected units and zones.
   */
  selectedUnitZone() {
    this.countOfUnitZone = {};
    let unit = 0;
    let zone = 0;
    for (const [key, value] of Object.entries(this.formattedPeople)) {
      unit += 1
      zone += this.formattedPeople[key].length
    }

    this.selectedPeople = [''];
    if (Object.keys(this.formattedPeople).length > 0) {
      this.people.forEach(unit => {
        for (const [key, value] of Object.entries(this.formattedPeople)) {
          if (unit.title == key) {
            this.selectedPeople.push(unit.uuid)
          }
        }
        unit.subprojects.forEach(item => {
          this.formattedPeople[unit.title]?.forEach(id => {
            if (item.zoneId == id) {
              this.selectedPeople.push(item.uuid)
            }
          })
        })
      });
    } else {

    }

    this.countOfUnitZone['unit'] = unit
    this.countOfUnitZone['zone'] = zone
  }


  /**
   * get plant analytics api call.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays interval of days.
   */
  getPlantAnalytics4cards(formattedPeople, startDate, endDate, coountOfDays) {
    this.dataService.passSpinnerFlag(true, true);
    this.observationsByUnitAndRiskRating = {};
    this.safetyAndSurveillanceCommonService.getPlantAnalytics4cards(formattedPeople, startDate, endDate, coountOfDays).subscribe((response) => {
      this.analyticsCards = response;
      this.observationByTimeAndRiskRating = response['risk_trend']
      this.observationByRiskRating = response['overall_risk']
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * get category wise observation details.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays interval of days.
   * @param is_critical critical or not boolean.
   */
  getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical) {
    this.dataService.passSpinnerFlag(true, true);

    this.overviewOfCategory = [];
    let categoryArr = []
    this.safetyAndSurveillanceCommonService.getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        let obj = response[key].category_deatils
        obj['location'] = key;
        obj['category_id'] = response[key].category_deatils.category_id;
        obj['total'] = response[key].category_deatils['total_obs'] + (response[key].category_deatils['difference'] < 0 ? -response[key].category_deatils['difference'] : response[key].category_deatils['difference'])
        totalCount += response[key].category_deatils['total_obs']
        categoryArr.push(obj)
      }
      this.overviewOfCategoryTotalCount = totalCount
      this.overviewOfCategory = categoryArr
      this.overviewOfCategoryObj = response
      this.overviewOfCategoryLargest = Math.max(...this.overviewOfCategory.map(v1 => v1.total))
      this.overviewOfCategory.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      let sumOfObservationCategory = [];
      this.overviewOfCategory.forEach(category => {
        if (this.overviewOfCategory[0].total_obs == category.total_obs && this.overviewOfCategory[0].difference == category.difference) {
          sumOfObservationCategory.push(category)
        }
      })
      this.sumOfObservationCategory = sumOfObservationCategory
      if (this.showCategoryWise && Object.keys(this.formattedPeople).length > 0) {
        this.getChangeDetailedCategoryWiseToggle(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.detailedCategoryWiseToggle, false);
        this.selectCategory(this.selectedCategory, false)
      }
      if (this.overviewOfCategoryTotalCount == 0 && this.overWiseCategory) {
        this.overWiseCategory = false;
        this.getChangeOverWiseCategory(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.overWiseCategory)
      }

      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
 * get unit wise observation details.
 * @param formattedPeople units.
 * @param startDate start date.
 * @param endDate end date.
 * @param coountOfDays interval of days.
 * @param is_critical critical or not boolean.
 */
  getUnitWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical) {
    this.dataService.passSpinnerFlag(true, true);
    let data = [];
    this.safetyAndSurveillanceCommonService.getUnitWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        for (const [objKey, objValue] of Object.entries(response[key])) {
          if (objKey == 'unit_details') {
            let obj = objValue;
            obj['location'] = key + '_manager'
            obj['unitName'] = key
            obj['unit_name'] = key
            obj['name'] = key
            obj['manager'] = null
            obj['total'] = objValue['total_obs'] + (objValue['difference'] < 0 ? -objValue['difference'] : objValue['difference'])
            obj['unitWiseObservationsTree'] = true
            totalCount += objValue['total_obs']
            data.push(obj)
          } else {
            for (const [zoneKey, zoneValue] of Object.entries(objValue)) {
              let obj = zoneValue
              obj['unitName'] = zoneKey + Math.random()
              obj['location'] = zoneKey + Math.random()
              obj['name'] = zoneKey
              obj['manager'] = key + '_manager'
              obj['unit_name'] = key
              obj['total'] = zoneValue['total_obs'] + (zoneValue['difference'] < 0 ? -zoneValue['difference'] : zoneValue['difference'])
              obj['unitWiseObservationsTree'] = null
              data.push(obj)
            }
          }
        }
      }
      this.unitWiseObservationsTotalCount = totalCount;
      this.unitWiseObservations = data;
      let unitArray = [];
      this.unitWiseObservations.forEach(data => {
        if (!data.manager) {
          unitArray.push(data)
        }
      })
      unitArray.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      this.unitWiseObservationsLargest = Math.max(...this.unitWiseObservations.map(v1 => v1.total))
      this.unitWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      this.tempUnitWiseObservations = this.unitWiseObservations;
      let sumOfUnitWiseObservations = [];
      this.tempUnitWiseObservations.forEach(unit => {
        if (unitArray[0].total_obs == unit.total_obs && unitArray[0].difference == unit.difference && !unit.manager) {
          sumOfUnitWiseObservations.push(unit)
        }
      })
      this.sumOfUnitWiseObservations = sumOfUnitWiseObservations

      this.unitWiseObservationsObj = response
      let data1 = [];
      let zoneTotalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        for (const [objKey, objValue] of Object.entries(response[key])) {
          if (objKey == 'zone_details') {
            for (const [zoneKey, zoneValue] of Object.entries(objValue)) {
              let obj = zoneValue
              obj.location = zoneKey;
              obj['total'] = zoneValue['total_obs'] + (zoneValue['difference'] < 0 ? -zoneValue['difference'] : zoneValue['difference'])
              obj.sameLocation = false;
              zoneTotalCount += zoneValue['total_obs']

              let index = data1.findIndex(dd => {
                return dd.location === zoneKey
              })
              if (index >= 0) {
                obj['sameLocation'] = true;
                data1[index].sameLocation = true;
              }
              data1.push(obj)
            }
          }
        }
      }
      this.unitZoneWiseObservations = data1;
      this.tempUnitZoneWiseObservations = data1;
      this.unitZoneWiseObservationsTotalCount = zoneTotalCount;
      this.unitZoneWiseObservationsLargest = Math.max(...this.unitZoneWiseObservations.map(v1 => v1.total))
      this.unitZoneWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      let sumOfunitZoneWiseObservations = [];
      this.unitZoneWiseObservations.forEach(zone => {
        if (this.unitZoneWiseObservations[0].total_obs == zone.total_obs && this.unitZoneWiseObservations[0].difference == zone.difference) {
          sumOfunitZoneWiseObservations.push(zone)
        }
      })
      this.sumOfunitZoneWiseObservations = sumOfunitZoneWiseObservations
      if (this.showUnitWise && Object.keys(this.formattedPeople).length > 0 && Object.keys(this.formattedPeople).find(unit => { unit == this.selectedUnit })) {
        this.selectUnit(this.selectedUnit);
      } else {
        this.showUnitWise = false;
      }
      if (this.unitWiseObservationsTotalCount == 0 && this.criticalObservationSwitch) {
        this.criticalObservationSwitch = false;
        this.getChangeCriticalObservationSwitch(formattedPeople, startDate, endDate, coountOfDays, this.criticalObservationSwitch)
      }

      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * get critical observation details for a category.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays interval of days.
   * @param category category.
   */
  getCriticalObsGraph(formattedPeople, startDate, endDate, coountOfDays, category?) {
    this.dataService.passSpinnerFlag(true, true);
    let data = [];
    this.safetyAndSurveillanceCommonService.getCriticalObsGraph(formattedPeople, startDate, endDate, coountOfDays, category).subscribe((response) => {
      this.criticalObsData = response;
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * get observations trend for a category.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays interval of days.
   * @param category category.
   */
  getObservationTrendGraph(formattedPeople, startDate, endDate, coountOfDays, category?) {
    this.dataService.passSpinnerFlag(true, true);
    this.observationTrendOptions = [];
    this.safetyAndSurveillanceCommonService.getObservationTrendGraph(formattedPeople, startDate, endDate, coountOfDays, category).subscribe((response) => {
      this.observationTrendData = response;
      for (const [key, value] of Object.entries(response)) {
        if (key != 'mode') {
          let index = this.observationTrendOptions.findIndex(ele => { return ele == key });
          if (index < 0) {
            this.observationTrendOptions.push(key)
          }
        }
      }
      let index = this.observationTrendOptions.findIndex(item => { return 'rating' == item })
      if (index >= 0) {
        this.observationTrendOptions.splice(index, 1)
        this.observationTrendOptions.splice(0, 0, 'rating')
      }
      this.selectedObservationTrend = this.selectedObservationTrend ? this.selectedObservationTrend : this.observationTrendOptions[0];
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * navigation logic to observatios page with the selected observation.
   * @param observationData selected observation.
   */
  navigateFromSearch(observationData) {
    sessionStorage.removeItem('filterData')
    let obj = { "id": observationData.faults[0].id, "date": observationData.date, "unit": observationData.unit, "category": observationData.category, "fault_status": observationData.faults[0].status }
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === obj.unit);
    sessionStorage.setItem('selectedUnit', obj.unit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    sessionStorage.setItem('searchObservation', JSON.stringify(obj));
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  backToAddObservationData(time) {
  }

  /**
   * toggle dropdown of  days interval.
   */
  dayListShow() {
    this.dayDropdown = !this.dayDropdown;
  }

  /**
   * toggle dropdown for critical zone dropdown
   */
  criticalZoneDropdownShow() {
    this.criticalZoneDropdown = !this.criticalZoneDropdown;
  }

  /**
   * toggle dropdown for observations trend
   */
  observationTrendDropdownShow() {
    this.observationTrendDropdown = !this.observationTrendDropdown;
  }

  /**
   * select a date from the days interval dropdown.
   */
  selectDate() {
    this.dataService.passSpinnerFlag(true, true);
    this.formattedPeoples = this.formattedPeople;
    this.selectedUnitZone();
    this.criticalObservationSwitch = true;
    this.overWiseCategory = true;
    this.detailedUnitWiseToggle = true;
    this.detailedCategoryWiseToggle = true;
    this.coountOfDays = this.selectedObservationDays.value;
    this.getDates(this.coountOfDays);
    let enDate = new Date()
    let endDate: any = enDate.getDate();
    if (endDate < 10) {
      endDate = '0' + endDate;
    } else {
      endDate = endDate;
    }
    let endMonth: any = enDate.getMonth() + 1;
    if (endMonth < 10) {
      endMonth = '0' + endMonth;
    } else {
      endMonth = endMonth;
    }
    this.endDate =moment().tz(this.timeZone).format("YYYY-MM-DD")
    // this.startDate = stDate.getFullYear() + '-' + (stDate.getMonth() + 1) + '-' + stDate.getDate()

    let stDate = new Date(moment().tz(this.timeZone).format("YYYY-MM-DD HH:mm:ss"))
    stDate.setDate(stDate.getDate() - (this.selectedObservationDays.value - 1));
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
    this.startDate = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    if (Object.keys(this.formattedPeople).length == 0) {
      this.showUnitWise = false;
      this.showCategoryWise = false;
      this.selectedOverviewOfUnitCategoryLeft = [];
      this.overviewOfCategory = [];
      this.selectedOverviewOfCategory = [];
      this.selectedOverviewOfUnitCategory = [];
      this.msg = "Select Unit/ Zone to show the analytics.";
      this.snackbarService.show(this.msg, false, false, false, true);
    }
    let time = moment().format("HH:mm:ss")
    this.startDate = moment(this.startDate+' '+time).tz(this.timeZone).format("YYYY-MM-DD")
    this.endDate = moment(this.endDate+' '+time).tz(this.timeZone).format("YYYY-MM-DD")
    this.getPlantAnalytics4cards(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
    this.getCategoryWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.overWiseCategory);
    this.getUnitWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.criticalObservationSwitch);
    this.getCriticalObsGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
    this.getObservationTrendGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
  }


  /**
   * build dates from the interval selected.
   * @param value interval selected
   */
  getDates(value){
    let date = moment().tz(this.timeZone).format("YYYY-MM-DD HH:mm:ss")
    let stDate = new Date(date)
    let day = stDate.getDate();
    let month = stDate.getMonth() + 1;
    let year = stDate.getFullYear();
    this.custom_end_date = moment().tz(this.timeZone).format("YYYY-MM-DD HH:mm:ss");
    stDate.setDate(stDate.getDate() - (value - 1));
    day =  stDate.getDate();
    month = stDate.getMonth() + 1 ;
    year = stDate.getFullYear();
    if (day <= 9) day = '0' + day as any;
    if (month <= 9) month = '0' + month as any;
    this.custom_start_date = year + "-" + month + "-" + day + ' 00:00:00';
  }

  /**
   * select unit of the observation selected.
   * @param row row from the datatable.
   */
  selectUnit(row) {
    if (row.unitWiseObservationsTree) {
      this.criticalZoneArray = [];
      this.people.forEach(unit => {
        if (unit.title == row.unitName) {
          this.criticalZoneArray = unit.subprojects
        }
      })
      this.selectedCriticalZone = { title: 'All zones' };
      this.showUnitWise = true;
      this.showCategoryWise = false;
      this.selectedUnit = row;
      let unit = row.unitName;
      let zoneIds = this.criticalZoneArray.map(zone => { return zone.zoneId })
      this.overWiseCategory = true;
      let selectedUnitArray = [];
      this.tempUnitWiseObservations.forEach(data => {
        if (row.location == data.location || row.location == data.manager) {
          data.treeStatus = 'expanded';
          selectedUnitArray.push(data)
        }
      })
      this.unitWiseObservations = selectedUnitArray;
      this.unitWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      this.getCategoryWiseObsDetailsLeft(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.overWiseCategory);
      this.getSelectedUnitWiseObsDetails({ [unit]: zoneIds }, this.startDate, this.endDate, this.coountOfDays, this.detailedToggle);
      this.getCriticalObsGraph({ [unit]: zoneIds }, this.startDate, this.endDate, this.coountOfDays);
      this.getObservationTrendGraph({ [unit]: zoneIds }, this.startDate, this.endDate, this.coountOfDays);
    }
  }

  /**
   * select category of the observation selected.
   */
  selectCategory(category, boolean) {
    let categoryArr = [];
    let totalCount = 0;
    for (const [key, value] of Object.entries(this.overviewOfCategoryObj[category].unit_details)) {
      let obj = value
      obj['location'] = key;
      obj['total'] = value['total_obs'] + (value['difference'] < 0 ? -value['difference'] : value['difference'])
      categoryArr.push(obj)
      totalCount += value['total_obs'];
    }
    this.selectedOverviewOfCategoryTotalCount = totalCount;
    this.selectedOverviewOfCategory = categoryArr;
    this.selectedOverviewOfCategoryLargest = Math.max(...this.selectedOverviewOfCategory.map(v1 => v1.total))
    this.selectedOverviewOfCategory.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference });
    let sumOfSelectedOverviewOfCategory = [];
    this.selectedOverviewOfCategory.forEach(category => {
      if (this.selectedOverviewOfCategory[0].total_obs == category.total_obs && this.selectedOverviewOfCategory[0].difference == category.difference) {
        sumOfSelectedOverviewOfCategory.push(category)
      }
    })
    this.sumOfSelectedOverviewOfCategory = sumOfSelectedOverviewOfCategory
    this.criticalZoneArray = []
    this.people.forEach(unit => {
      if (unit.title == this.selectedOverviewOfCategory[0].location) {
        this.criticalZoneArray = unit.subprojects
      }
    })

    this.showUnitWise = false;
    this.selectedCategory = category;
    this.selectedCategoryId = 0;
    let categoryIndex = this.overviewOfCategory.findIndex(obj => { return obj.location == this.selectedCategory });
    if (this.overviewOfCategory[categoryIndex].category_id) {
      this.selectedCategoryId = this.overviewOfCategory[categoryIndex].category_id;
    } else {
      this.selectedCategoryId = null
    }
    if (this.selectedOverviewOfCategoryTotalCount == 0 && this.detailedCategoryWiseToggle && !boolean) {
      this.detailedCategoryWiseToggle = false;
      this.getChangeDetailedCategoryWiseToggle(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.detailedCategoryWiseToggle);
    }
    this.getCriticalObsGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.selectedCategoryId);
    this.getObservationTrendGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.selectedCategoryId);

  }

  /**
   * select zone of the observation selected.
   */
  selectedZone(selectedZone) {
    if (selectedZone == 'all') {
      let zoneIds = this.criticalZoneArray.map(zone => { return zone.zoneId })
      this.getCriticalObsGraph({ [this.criticalZoneArray[0].id]: zoneIds }, this.startDate, this.endDate, this.coountOfDays);
    } else {
      this.getCriticalObsGraph({ [selectedZone.id]: [selectedZone.zoneId] }, this.startDate, this.endDate, this.coountOfDays);
    }
  }

  /**
   * get the selected unit wise details of observations.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays days interval.
   * @param is_critical critical or not boolean.
   */
  getSelectedUnitWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical) {
    this.dataService.passSpinnerFlag(true, true);

    this.overviewOfCategory = [];
    let categoryArr = []
    this.safetyAndSurveillanceCommonService.getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        let obj = response[key].category_deatils
        obj['location'] = key;
        obj['unit'] = this.selectedUnit.unit_name;
        obj['total'] = response[key].category_deatils['total_obs'] + (response[key].category_deatils['difference'] < 0 ? -response[key].category_deatils['difference'] : response[key].category_deatils['difference'])
        categoryArr.push(obj)
        totalCount += response[key].category_deatils['total_obs'];
      }
      this.selectedOverviewOfUnitCategoryTotalCount = totalCount;
      this.selectedOverviewOfUnitCategory = categoryArr
      this.selectedOverviewOfUnitCategoryObj = response
      this.selectedOverviewOfUnitCategoryLargest = Math.max(...this.selectedOverviewOfUnitCategory.map(v1 => v1.total))
      this.selectedOverviewOfUnitCategory.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      let sumOfSelectedOverviewOfUnitCategory = [];
      this.selectedOverviewOfUnitCategory.forEach(category => {
        if (this.selectedOverviewOfUnitCategory[0].total_obs == category.total_obs && this.selectedOverviewOfUnitCategory[0].difference == category.difference) {
          sumOfSelectedOverviewOfUnitCategory.push(category)
        }
      })
      this.sumOfSelectedOverviewOfUnitCategory = sumOfSelectedOverviewOfUnitCategory
      if (this.selectedOverviewOfUnitCategoryTotalCount == 0 && this.detailedUnitWiseToggle) {
        this.detailedUnitWiseToggle = false;
        this.getChangeDetailedUnitWiseToggle(formattedPeople, startDate, endDate, coountOfDays, this.detailedUnitWiseToggle)
      }
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * get the selected category wise details of observations.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays days interval.
   * @param is_critical critical or not boolean.
   */
  getCategoryWiseObsDetailsLeft(formattedPeople, startDate, endDate, coountOfDays, is_critical) {
    this.dataService.passSpinnerFlag(true, true);

    this.overviewOfCategory = [];
    let categoryArr = []
    this.safetyAndSurveillanceCommonService.getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        let obj = response[key].category_deatils
        obj['location'] = key;
        obj['total'] = response[key].category_deatils['total_obs'] + (response[key].category_deatils['difference'] < 0 ? -response[key].category_deatils['difference'] : response[key].category_deatils['difference'])
        totalCount += response[key].category_deatils['total_obs']
        categoryArr.push(obj)
      }
      this.selectedOverviewOfUnitCategoryLeftTotalCount = totalCount
      this.selectedOverviewOfUnitCategoryLeft = categoryArr
      this.selectedOverviewOfUnitCategoryLeftObj = response
      this.selectedOverviewOfUnitCategoryLeftLargest = Math.max(...this.selectedOverviewOfUnitCategoryLeft.map(v1 => v1.total))
      this.selectedOverviewOfUnitCategoryLeft.sort((v1, v2) => { return v2.total_obs - v1.total_obs })
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }


  /**
   * toggle unit grouping.
   */
  changeUnitGrouping() {
    this.unitGrouping = !this.unitGrouping
    if (this.showUnitWise) {
      let selectedUnitZoneArray = [];
      this.tempUnitZoneWiseObservations.forEach(data => {
        if (this.selectedUnit?.location == data.manager) {
          selectedUnitZoneArray.push(data)
        }
      })
      this.unitZoneWiseObservations = selectedUnitZoneArray;
      this.unitZoneWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
    } else {
      this.unitZoneWiseObservations = this.tempUnitZoneWiseObservations;
      this.unitZoneWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
    }
  }

  /**
   * toggle critical observations switch.
   */
  changeCriticalObservationSwitch() {
    this.criticalObservationSwitch = !this.criticalObservationSwitch
    this.getChangeCriticalObservationSwitch(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.criticalObservationSwitch);
  }

  /**
   * on true toggle of the critical observation switch.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays days interval.
   * @param is_critical critical or not boolean.
   */
  getChangeCriticalObservationSwitch(formattedPeople, startDate, endDate, coountOfDays, is_critical) {
    this.dataService.passSpinnerFlag(true, true);
    let data = [];
    this.safetyAndSurveillanceCommonService.getUnitWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        for (const [objKey, objValue] of Object.entries(response[key])) {
          if (objKey == 'unit_details') {
            let obj = objValue;
            obj['location'] = key + '_manager'
            obj['unitName'] = key
            obj['unit_name'] = key
            obj['name'] = key
            obj['manager'] = null
            obj['total'] = objValue['total_obs'] + (objValue['difference'] < 0 ? -objValue['difference'] : objValue['difference'])
            obj['unitWiseObservationsTree'] = true
            totalCount += objValue['total_obs']
            data.push(obj)
          } else {
            for (const [zoneKey, zoneValue] of Object.entries(objValue)) {
              let obj = zoneValue
              obj['unitName'] = zoneKey + Math.random()
              obj['location'] = zoneKey + Math.random()
              obj['name'] = zoneKey
              obj['manager'] = key + '_manager'
              obj['unit_name'] = key
              obj['total'] = zoneValue['total_obs'] + (zoneValue['difference'] < 0 ? -zoneValue['difference'] : zoneValue['difference'])
              obj['unitWiseObservationsTree'] = null
              data.push(obj)
            }
          }
        }
      }
      this.unitWiseObservationsTotalCount = totalCount;
      this.unitWiseObservations = data;
      let unitArray = [];
      this.unitWiseObservations.forEach(data => {
        if (!data.manager) {
          unitArray.push(data)
        }
      })
      unitArray.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      this.unitWiseObservationsLargest = Math.max(...this.unitWiseObservations.map(v1 => v1.total))
      this.unitWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      this.tempUnitWiseObservations = this.unitWiseObservations;
      if (this.showUnitWise) {
        let selectedUnitArray = [];
        this.tempUnitWiseObservations.forEach(data => {
          if (this.selectedUnit?.location == data.location || this.selectedUnit?.location == data.manager) {
            selectedUnitArray.push(data)
          }
        })
        this.unitWiseObservations = selectedUnitArray;
        this.unitWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      }
      let sumOfUnitWiseObservations = [];
      this.tempUnitWiseObservations.forEach(unit => {
        if (unitArray[0].total_obs == unit.total_obs && unitArray[0].difference == unit.difference && !unit.manager) {
          sumOfUnitWiseObservations.push(unit)
        }
      })
      this.sumOfUnitWiseObservations = sumOfUnitWiseObservations

      this.unitWiseObservationsObj = response
      let data1 = [];
      let zoneTotalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        for (const [objKey, objValue] of Object.entries(response[key])) {
          if (objKey == 'zone_details') {
            for (const [zoneKey, zoneValue] of Object.entries(objValue)) {
              let obj = zoneValue
              obj.location = zoneKey;
              obj['total'] = zoneValue['total_obs'] + (zoneValue['difference'] < 0 ? -zoneValue['difference'] : zoneValue['difference'])
              obj.sameLocation = false;
              zoneTotalCount += zoneValue['total_obs']
              let index = data1.findIndex(dd => {
                return dd.location === zoneKey
              })
              if (index >= 0) {
                obj['sameLocation'] = true;
                data1[index].sameLocation = true;
              }
              data1.push(obj)
            }
          }
        }
      }
      this.unitZoneWiseObservations = data1;
      this.tempUnitZoneWiseObservations = data1;
      this.unitZoneWiseObservationsTotalCount = zoneTotalCount;
      this.unitZoneWiseObservationsLargest = Math.max(...this.unitZoneWiseObservations.map(v1 => v1.total))
      this.unitZoneWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      if (this.showUnitWise) {
        let selectedUnitZoneArray = [];
        this.tempUnitZoneWiseObservations.forEach(data => {
          if (this.selectedUnit?.location == data.manager) {
            selectedUnitZoneArray.push(data)
          }
        })
        this.unitZoneWiseObservations = selectedUnitZoneArray;
        this.unitZoneWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      }
      let sumOfunitZoneWiseObservations = [];
      this.unitZoneWiseObservations.forEach(zone => {
        if (this.unitZoneWiseObservations[0].total_obs == zone.total_obs && this.unitZoneWiseObservations[0].difference == zone.difference) {
          sumOfunitZoneWiseObservations.push(zone)
        }
      })
      this.sumOfunitZoneWiseObservations = sumOfunitZoneWiseObservations
      if (this.showUnitWise && Object.keys(this.formattedPeople).length > 0 && Object.keys(this.formattedPeople).find(unit => { unit == this.selectedUnit })) {
        this.selectUnit(this.selectedUnit);
      } else {
      }

      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * toggle switch for detailed obs view.
   */
  changeDetailedToggle() {
    this.detailedToggle = !this.detailedToggle
    if (this.showUnitWise) {
      this.selectUnit(this.selectedUnit);
      return
    }
    if (this.showCategoryWise) {
      this.getCategoryWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.detailedToggle);
      this.selectCategory(this.selectedCategory, false);
      return
    }
    if (!this.showUnitWise && !this.showCategoryWise) {
      this.getCategoryWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.detailedToggle);
    }
  }

  /**
  * toggle switch for overview obs view.
  */
  changeOverWiseCategory() {
    this.overWiseCategory = !this.overWiseCategory;
    this.getChangeOverWiseCategory(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.overWiseCategory)

  }

  /**
  * on true toggle of the overview observation switch.
  * @param formattedPeople units.
  * @param startDate start date.
  * @param endDate end date.
  * @param coountOfDays days interval.
  * @param overWiseCategory category overview.
  */
  getChangeOverWiseCategory(formattedPeople, startDate, endDate, coountOfDays, overWiseCategory) {
    this.dataService.passSpinnerFlag(true, true);
    let categoryArr = []
    this.safetyAndSurveillanceCommonService.getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, overWiseCategory).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        let obj = response[key].category_deatils
        obj['location'] = key;
        obj['category_id'] = response[key].category_deatils.category_id;
        obj['total'] = response[key].category_deatils['total_obs'] + (response[key].category_deatils['difference'] < 0 ? -response[key].category_deatils['difference'] : response[key].category_deatils['difference'])
        totalCount += response[key].category_deatils['total_obs']
        categoryArr.push(obj)
      }
      this.overviewOfCategoryTotalCount = totalCount
      this.overviewOfCategory = categoryArr
      this.overviewOfCategoryObj = response
      this.overviewOfCategoryLargest = Math.max(...this.overviewOfCategory.map(v1 => v1.total))
      this.overviewOfCategory.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      let sumOfObservationCategory = [];
      this.overviewOfCategory.forEach(category => {
        if (this.overviewOfCategory[0].total_obs == category.total_obs && this.overviewOfCategory[0].difference == category.difference) {
          sumOfObservationCategory.push(category)
        }
      })
      this.sumOfObservationCategory = sumOfObservationCategory
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }


  /**
   * expand and collapse logic for units and zones unitwise datatable.
   * @param event
   */
  onTreeAction(event: any) {
    const index = event.rowIndex;
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    let data = [];
    let totalCount = 0;
    for (const [key, value] of Object.entries(this.unitWiseObservationsObj)) {
      for (const [objKey, objValue] of Object.entries(this.unitWiseObservationsObj[key])) {
        if (objKey == 'unit_details') {
          let obj = objValue;
          obj['location'] = key + '_manager'
          obj['unit_name'] = key
          obj['unitName'] = key
          obj['name'] = key
          obj['manager'] = null
          obj['total'] = objValue['total_obs'] + (objValue['difference'] < 0 ? -objValue['difference'] : objValue['difference'])
          obj['unitWiseObservationsTree'] = true
          totalCount += objValue['total_obs']
          data.push(obj)
        } else {
          for (const [zoneKey, zoneValue] of Object.entries(objValue)) {
            let obj = zoneValue
            obj['unitName'] = zoneKey + Math.random()
            obj['location'] = zoneKey + Math.random()
            obj['name'] = zoneKey
            obj['manager'] = key + '_manager'
            obj['unit_name'] = key
            obj['total'] = zoneValue['total_obs'] + (zoneValue['difference'] < 0 ? -zoneValue['difference'] : zoneValue['difference'])
            obj['unitWiseObservationsTree'] = null
            data.push(obj)
          }
        }
      }
    }
    this.unitWiseObservationsTotalCount = totalCount;
    this.unitWiseObservations = data;
    this.unitWiseObservationsLargest = Math.max(...this.unitWiseObservations.map(v1 => v1.total))
    this.unitWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })

    if (this.showUnitWise) {
      let selectedUnitArray = [];
      this.tempUnitWiseObservations.forEach(data => {
        if (this.selectedUnit?.location == data.location || this.selectedUnit?.location == data.manager) {
          selectedUnitArray.push(data)
        }
      })
      this.unitWiseObservations = selectedUnitArray;
    }
  }

  /**
   * expand and collapse logic for units and zones overview datatable.
   * @param event
   */
  onTreeActionOverView(event: any) {
    const index = event.rowIndex;
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.overviewOfCategory = [...this.overviewOfCategory];
  }


  /**
   * navigation to central dashboard.
   */
  navigateToCentralDashboard() {
    sessionStorage.setItem('show-central-dashboard', JSON.stringify(false));
    sessionStorage.setItem("navigated-to-application", JSON.stringify(false))
    window.dispatchEvent(new CustomEvent('central-dashboard'))
    sessionStorage.setItem('menuItems', '');
  }

  /**
   * navigation of selected observation to observations page.
   * @param row row of the selected obs.
   */
  navigateToObservation(row) {
    this.safetyAndSurveillanceCommonService.sendMatomoEvent('Observations navigation from overview cards', 'Analytics overview');
    let criticalRating = [4, 5]
    if (this.criticalObservationSwitch) {
      sessionStorage.setItem('riskRating', JSON.stringify(criticalRating))
    } else {
      sessionStorage.setItem('riskRating', JSON.stringify([]))
    }

    let selectedUnits = []

    this.safetyAndSurveillanceCommonService.fetchUnitData(row.unit_name).subscribe((unitData) => {
      let id = unitData[0].unit_id;
      selectedUnits.push(id);
      if (row.unitWiseObservationsTree) {
        sessionStorage.removeItem('filterData')
        sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
        let startDate = this.custom_start_date.split(' ')
        sessionStorage.setItem('obsNavDate',JSON.stringify(startDate[0]))
        sessionStorage.setItem('manually-selected-units', JSON.stringify(selectedUnits))
        this.safetyAndSurveillanceDataService.passDatesAndUnits(selectedUnits, this.custom_start_date, this.custom_end_date);
        sessionStorage.setItem('startAndEndDate', JSON.stringify([this.custom_start_date, this.custom_end_date]))
        this.safetyAndSurveillanceDataService.passSelectedDates(this.custom_start_date, this.custom_end_date);
        this.safetyAndSurveillanceDataService.passSelectedUnits(selectedUnits)
        sessionStorage.setItem('selectedUnits', JSON.stringify(selectedUnits));
        sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
        window.dispatchEvent(new CustomEvent('global-search-used'))
        this.router.navigateByUrl('/safety-and-surveillance/observations');
      } else {
        sessionStorage.removeItem('filterData')
        // sessionStorage.setItem('selectedUnit', row.unit_name)
        sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
        let startDate = this.custom_start_date.split(' ')
        sessionStorage.setItem('obsNavDate',JSON.stringify(startDate[0]))
        sessionStorage.setItem('manually-selected-units', JSON.stringify(selectedUnits))
        this.safetyAndSurveillanceDataService.passDatesAndUnits(selectedUnits, this.custom_start_date, this.custom_end_date)
        sessionStorage.setItem('startAndEndDate', JSON.stringify([this.custom_start_date, this.custom_end_date]))
        this.safetyAndSurveillanceDataService.passSelectedDates(this.custom_start_date, this.custom_end_date);
        this.safetyAndSurveillanceDataService.passSelectedUnits(selectedUnits)
        let zone = [];
        zone.push(row.name)
        sessionStorage.setItem('selectedZone', JSON.stringify(zone))
        sessionStorage.setItem('selectedUnits', JSON.stringify(selectedUnits));
        sessionStorage.setItem('navigated-from-dashboard', JSON.stringify(true))
        window.dispatchEvent(new CustomEvent('global-search-used'))
        this.router.navigateByUrl('/safety-and-surveillance/observations');
      }
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {


        this.dataService.passSpinnerFlag(false, true);
      }
    )


  }


  /**
   * navigation of selected observation with selected category to observations page.
   * @param row row of the selected obs.
   */
  navigateToObservationWithSelectedCategory(row) {
    this.safetyAndSurveillanceCommonService.sendMatomoEvent('Observations navigation from overview cards', 'Analytics overview');
    let criticalRating = [4, 5]
    if (this.detailedUnitWiseToggle) {
      sessionStorage.setItem('riskRating', JSON.stringify(criticalRating))
    } else {
      sessionStorage.setItem('riskRating', JSON.stringify([]))
    }
    let category = [];
    category.push(row.location)
    let selectedUnits = []
    for (const [key, value] of Object.entries(this.formattedPeople)) {
      for (const [name, value] of Object.entries(this.allUnits)) {
        if (key === name) {
          selectedUnits.push(parseInt(value[0].unit_id))
        }
      }
    }
    sessionStorage.removeItem('filterData')
    sessionStorage.setItem('selectedCategory', JSON.stringify(category))
    sessionStorage.setItem('navigatedObservation', JSON.stringify(true));
    this.safetyAndSurveillanceDataService.passDatesAndUnits(selectedUnits, this.custom_start_date , this.custom_end_date)
    sessionStorage.setItem('startAndEndDate', JSON.stringify([this.custom_start_date, this.custom_end_date]))
    this.safetyAndSurveillanceDataService.passSelectedDates(this.custom_start_date , this.custom_end_date);
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * drawing out the most critical obs graph.
   * @param data graph data
   */
  mostCriticalObs(data) {
    this.mostCriticalObsData = data;
  }

  /**
   * sum of critical observations
   * @param array data
   */
  getSumOfCritical(array) {
    this.sumOfCriticalObs = array;
  }

  /**
   * count of the most critical obs.
   */
  getMostCriticalObsCount() {
    let count = 0;
    this.sumOfCriticalObs.forEach(data => {
      count += data.countOfSelectedTime
    })
    return count;
  }

  getTaskRowClass = (row) => {
    setInterval(() => {
      let downArrow = document.getElementsByClassName('datatable-icon-down')[0];
      if (downArrow) {
        downArrow.classList.add('fas')
        downArrow.classList.add('fa-caret-down')
        downArrow.classList.remove('icon')
        downArrow.classList.remove('datatable-icon-down')
      }
      let upArrow = document.getElementsByClassName('datatable-icon-up')[0];
      if (upArrow) {
        upArrow.classList.add('fas')
        upArrow.classList.add('fa-caret-up')
        upArrow.classList.remove('icon')
        upArrow.classList.remove('datatable-icon-up')
      }
    }, 100)
    if (!row.unitWiseObservationsTree) {
      return 'treeRow'

    }
  }
  getCellClass = (row) => {

    if (!row.unitWiseObservationsTree) {
      return 'treeCell'

    } else {
      return 'location'
    }
  }
  getBtnCellClass() {
    return "obsBtn"
  }
  onStatusChange(status) {
    this.selectedObsStatus = status;
  }

  /**
   * reset the view to initial load after some actions have been performed.
   */
  resetSelectedActions() {
    this.tempUnitWiseObservations.map(data => { data.treeStatus = 'collapsed' })
    this.unitWiseObservations = this.tempUnitWiseObservations;
    this.unitZoneWiseObservations = this.tempUnitZoneWiseObservations;
    this.unitZoneWiseObservations.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
    this.showCategoryWise = false;
    this.showUnitWise = false;
    this.selectedCategory = '';
    this.selectedObservationTrend = this.observationTrendOptions[0];
    this.getCategoryWiseObsDetails(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.overWiseCategory);
    this.getCriticalObsGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
    this.getObservationTrendGraph(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays);
  }

  /**
   * detailed unit wise observation toggle logic
   */
  changeDetailedUnitWiseToggle() {
    this.detailedUnitWiseToggle = !this.detailedUnitWiseToggle;
    this.criticalZoneArray
    this.selectedUnit
    let zoneIds = this.criticalZoneArray.map(zone => { return zone.zoneId });
    this.getChangeDetailedUnitWiseToggle({ [this.selectedUnit.location]: zoneIds }, this.startDate, this.endDate, this.coountOfDays, this.detailedUnitWiseToggle)

  }

  /**
   * api call for the detailed unitwise obs toggle.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays days interval.
   * @param is_critical critical or not boolean.
   */
  getChangeDetailedUnitWiseToggle(formattedPeople, startDate, endDate, coountOfDays, is_critical) {
    this.dataService.passSpinnerFlag(true, true);
    this.overviewOfCategory = [];
    let categoryArr = []
    this.safetyAndSurveillanceCommonService.getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        let obj = response[key].category_deatils
        obj['location'] = key;
        obj['unit'] = this.selectedUnit.unit_name;
        obj['total'] = response[key].category_deatils['total_obs'] + (response[key].category_deatils['difference'] < 0 ? -response[key].category_deatils['difference'] : response[key].category_deatils['difference'])
        categoryArr.push(obj)
        totalCount += response[key].category_deatils['total_obs'];
      }
      this.selectedOverviewOfUnitCategoryTotalCount = totalCount;
      this.selectedOverviewOfUnitCategory = categoryArr
      this.selectedOverviewOfUnitCategory.sort((v1, v2) => { return v2.total_obs - v1.total_obs || v2.difference - v1.difference })
      this.selectedOverviewOfUnitCategoryObj = response
      this.selectedOverviewOfUnitCategoryLargest = Math.max(...this.selectedOverviewOfUnitCategory.map(v1 => v1.total))
      let sumOfSelectedOverviewOfUnitCategory = [];
      this.selectedOverviewOfUnitCategory.forEach(category => {
        if (this.selectedOverviewOfUnitCategory[0].total_obs == category.total_obs && this.selectedOverviewOfUnitCategory[0].difference == category.difference) {
          sumOfSelectedOverviewOfUnitCategory.push(category)
        }
      })
      this.sumOfSelectedOverviewOfUnitCategory = sumOfSelectedOverviewOfUnitCategory
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * detailed category wise observation toggle logic
   */
  changeDetailedCategoryWiseToggle() {
    this.detailedCategoryWiseToggle = !this.detailedCategoryWiseToggle;
    this.getChangeDetailedCategoryWiseToggle(this.formattedPeople, this.startDate, this.endDate, this.coountOfDays, this.detailedCategoryWiseToggle, true);
  }

  /**
   * api call for the detailed categorywise obs toggle.
   * @param formattedPeople units.
   * @param startDate start date.
   * @param endDate end date.
   * @param coountOfDays days interval.
   * @param is_critical critical or not boolean.
   */
  getChangeDetailedCategoryWiseToggle(formattedPeople, startDate, endDate, coountOfDays, is_critical, boolean?) {
    this.dataService.passSpinnerFlag(true, true);
    let categoryArr = []
    this.safetyAndSurveillanceCommonService.getCategoryWiseObsDetails(formattedPeople, startDate, endDate, coountOfDays, is_critical).subscribe((response) => {
      let totalCount = 0;
      for (const [key, value] of Object.entries(response)) {
        let obj = response[key].category_deatils
        obj['location'] = key;
        obj['total'] = response[key].category_deatils['total_obs'] + (response[key].category_deatils['difference'] < 0 ? -response[key].category_deatils['difference'] : response[key].category_deatils['difference'])
        totalCount += response[key].category_deatils['total_obs']
        categoryArr.push(obj)
      }
      this.overviewOfCategoryObj = response
      if (this.showCategoryWise && Object.keys(this.formattedPeople).length > 0) {
        this.selectCategory(this.selectedCategory, boolean)
      }
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  /**
   * sum of all the categories.
   */
  getSummationOfAllCategorys(text) {
    if (text == 'names') {
      let locations = this.sumOfObservationCategory.map(location => { return location.location })
      return locations
    } else {
      let locations = 0;
      this.sumOfObservationCategory.forEach(location => { locations += location.total_obs })
      return locations
    }
  }

  /**
   * sum of all the units.
   */
  getSummationOfAllUnits(text) {
    if (text == 'names') {
      let locations = this.sumOfUnitWiseObservations.map(location => { return location.unit_name })
      return locations
    } else {
      let locations = 0;
      this.sumOfUnitWiseObservations.forEach(location => { locations += location.total_obs })
      return locations
    }
  }

  /**
   * sum of all the units-zones.
   */
  getSummationOfAllUnitZones(text) {
    if (text == 'names') {
      let locations = this.sumOfunitZoneWiseObservations.map(location => { return location.name })
      return locations
    } else {
      let locations = 0;
      this.sumOfunitZoneWiseObservations.forEach(location => { locations += location.total_obs })
      return locations
    }
  }

  /**
   * sum of all the selected overview of unit and category.
   */
  getSummationOfSelectedOverviewOfUnitCategory(text) {
    if (text == 'names') {
      let locations = this.sumOfSelectedOverviewOfUnitCategory.map(location => { return location.location })
      return locations
    } else {
      let locations = 0;
      this.sumOfSelectedOverviewOfUnitCategory.forEach(location => { locations += location.total_obs })
      return locations
    }
  }

  /**
   * sum of all the selected overview of category.
   */
  getSummationOfSelectedOverviewOfCategory(text) {
    if (text == 'names') {
      let locations = this.sumOfSelectedOverviewOfCategory.map(location => { return location.location })
      return locations
    } else {
      let locations = 0;
      this.sumOfSelectedOverviewOfCategory.forEach(location => { locations += location.total_obs })
      return locations
    }
  }

  /**
   * adjusting the table height based on screen height.
   */
  getTableHeight() {
    var overall_table = document.getElementById("overall_table");
    var unit_table = document.getElementById("unit_table");
    var category_table = document.getElementById("category_table");
    let heightOfTable = overall_table.offsetHeight - unit_table.offsetHeight
    return heightOfTable;
  }

  /**
   * adjusting the table height based on screen height.
   */
  getMostCriticalTableHeight() {
    var critical_chart = document.getElementById("critical_chart");
    var most_critical_chart = document.getElementById("most_critical_chart");
    let heightOfTable = critical_chart.offsetHeight - most_critical_chart.offsetHeight
    return heightOfTable - 10;
  }
}
