import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { D } from 'angular-mydatepicker';
import * as moment from 'moment';
import * as CryptoJS from 'crypto-js';
import 'moment-timezone';
declare var $: any;
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import {
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
  MomentDateAdapter,
} from '@angular/material-moment-adapter';
import { ColumnMode } from '@swimlane/ngx-datatable';
declare var $: any;

import { PlantService } from '../../service/plant.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { DataService } from 'src/shared/services/data.service';
import { CommonService } from 'src/shared/services/common.service';
import { SafetyAndSurveillanceCommonService } from '../../service/common.service';

import { IncidentFormModel } from '../../models/incidentForm.model';

import { assetUrl } from 'src/single-spa/asset-url';

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD-MMM-YYYY', // How to display your date on the input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-incident-view',
  templateUrl: './incident-view.component.html',
  styleUrls: ['./incident-view.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE],
    },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT },
  ],
})
export class IncidentViewComponent implements OnInit {
  @Input() selectedIncidentObj: any;
  @Input() incidentData: any = [];
  @Input() totalIncidentData: any = [];
  @Input() allUserList: any = [];
  @Input() loginUserId: any;
  @Input() allPlantUsers: any;
  @Output() backToOverViewTable = new EventEmitter();
  @Output() filterResetEvent = new EventEmitter<void>();
  @ViewChild('root-top-card-height', { static: false })
  widgetsContent: ElementRef;
  minDate = new Date();
  actionDue_date: any;
  commentTagging: any;
  ColumnMode: ColumnMode;
  selectedOption = 'verify_initial_report';
  selectedInvestigator = {};
  selectedstakeholders: any[] = [];
  dueDates = [];
  selectedDates = [];
  reporters = [];
  selectedReporter = [];
  investigators = [];
  selectedInvestigators = [];
  status = [];
  selectedStatus = [];
  filterPopup = false;
  createIncident = false;
  units: any[];
  msg: string;
  selectedUnitName: any;
  zonesList: any[];
  unitDropdown: boolean;
  zoneDropdown: boolean;
  selectedZoneName: any;
  clientName: string;
  plantName: string;
  question: string = '';
  answer: string = '';
  confirmSubmitCreateIncident = false;
  evidenceData: any = [
    { evidence: 'Personal informations' },
    { evidence: 'Personal informations' },
    { evidence: 'Personal informations' },
    { evidence: 'Personal informations' },
    { evidence: 'Personal informations' },
    { evidence: 'Personal informations' },
  ];
  touchedfields = {};
  insightsData: any = [];
  insightsAvailable: boolean;
  insightsLoading: boolean;
  pinnedInsights: any = [];
  unPinnedInsights: any = [];
  pinIcon: any;
  unPinIcon: any;

  safety_equipment = [
    { cause: 'Cause testing', sub_cause: '' },
    { cause: 'Cause testing', sub_cause: 'Sub cause testing.' },
    { cause: 'Cause testing', sub_cause: '' },
  ];
  rootCauseAnalysis: any = [];
  evidence_list: any = [];
  selected_evidence_id: any;
  rootAnalysis: boolean = false;

  inputSchema: any = [];
  selectedId: string;
  newIncidentForm: any = [];
  newIncidentFormObj = {};
  selectedIncidentFormObj = {};
  newFormattedData: IncidentFormModel;
  selectedFormattedData: IncidentFormModel;
  IncidentZonesList: any;
  obsFilters: Object;
  tempIncidentData: any;
  selectedPlant: any;
  evidenceFormData: any = {};
  fishboneParameter: any;
  fishboneParameterCauseObj: any;
  fishboneParameterSubCauseObj: {};
  whywhyQuestionAnalysis: any;
  showfishboneNewCategory = false;
  confirmSubmitUpdateIncident = false;
  fishboneNewCategory = {
    name: '',
    key: '',
    description: '',
    incident_id: null,
  };
  selectedFormDataId: any = -1;
  allInvestigatorList: any;
  allStakeholdersList: any;
  todaysDate = new Date();
  testing = false;
  editCauseBtnsShow: {};
  editSubCauseBtnsShow: {};
  whywhyAnsBtns = {};
  whywhyQuestionBtns = {};
  whyPostAns: {};
  evidenceDataValidationObj: any;
  updateEvidenceDataValidationObj: any = {
    sector: 0,
    incident_factor: 0,
    damage: 0,
  };
  actionStatus: any;
  showAtTop: boolean;
  FishBoneTexts: any;
  disableApply: boolean = true;
  allCategory: any[] = [];
  selectedCategory: any;
  selectedCategories: any;
  categories: any;
  lengthOfRcaAndAction: any;
  insightsFound: boolean = true;
  isAIEnabled: boolean = false;
  showEvidence: boolean = false;
  lostTimeInjury: boolean = false;
  selectedPlantDetails:any;

  constructor(
    private plantService: PlantService,
    private snackbarService: SnackbarService,
    private dataService: DataService,
    public commonService: CommonService,
    private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,) {
      let plantDetails = JSON.parse(sessionStorage.getItem('plantDetails'))
      let accessiblePlants = JSON.parse(sessionStorage.getItem('accessible-plants'))
      this.selectedPlantDetails = accessiblePlants.filter((val,ind) => val?.id == plantDetails.id)
     }

  ngOnInit(): void {
    let timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    let date = moment()?.tz(timeZone)?.format('YYYY-MM-DD HH:mm:ss');
    this.todaysDate = new Date(date);
    this.pinIcon = assetUrl('/icons/pin-icon.svg');
    this.unPinIcon = assetUrl('/icons/unpin-icon.svg');
    this.newFormattedData = new IncidentFormModel({});
    this.insightsData.sort((v1, v2) => {
      return v1.pin === v2.pin ? 0 : v1.pin ? -1 : 1;
    });
    this.clientName = sessionStorage.getItem('company-name');
    this.plantName = sessionStorage.getItem('plantName');
    this.getCompanyName();
    this.getAvailableUnits();
    this.allCategory = [];
    this.categories = JSON.parse(
      sessionStorage.getItem('safety-and-surveillance-configurations')
    );
    this.categories['module_configurations']['iogp_categories']?.forEach(
      (ele) => {
        if (ele?.show_hide) {
          this.allCategory.push({ name: ele?.name, acronym: ele?.acronym });
        }
      }
    );
    this.commonService
      .readModuleConfigurationsData('safety-and-surveillance')
      .subscribe((data) => {
        this.insightsFound =
          data['page_configurations']?.['incidents_page']?.['page_features']?.[
            'insights_found'
          ];
        this.isAIEnabled =
          data['page_configurations']?.['incidents_page']?.['page_features']?.[
            'is_ai_enabled'
          ];
      });
  }
  ngOnChanges(changes: SimpleChanges): void {
    let selectedIncidentObj =
      changes['selectedIncidentObj'] &&
      changes['selectedIncidentObj'].currentValue !=
        changes['selectedIncidentObj'].previousValue;
    if (selectedIncidentObj) {
      this.getIncidentMetadata();
      this.getIncidentEvidenceForms();
      this.fishBoneSavedData = {};
      setTimeout(() => {
        this.selectIncidentViewObj(this.selectedIncidentObj);
        this.scrollToIncidentObj();
      }, 1000);
    }
  }
  // getAssigneeList(unit) {
  //   if(unit == null) {
  //     unit = sessionStorage.getItem('navigatedUnit')
  //   }
  //
  //   this.safetyAndSurveillanceCommonService.getAssigneeList(unit).subscribe(data => {
  //     this.listOfUsers = data
  //     this.commentFound = false
  //     this.newSubTask.assignee = data[0];
  //     this.commentTagging = [];
  //     let userMail = sessionStorage.getItem('user-email');
  //     this.userMail = sessionStorage.getItem('user-email');
  //     this.listOfUsers.forEach(element => {
  //       if (element.email == userMail) {
  //         this.loginUserId = element.id
  //       }
  //     });
  //     this.listOfUsers.forEach(ele => {
  //       this.commentTagging.push({ "key": ele.name, "value": ele.name, "email": ele.email, "id": ele.id, "username": ele.username, "mobile_number": ele.mobile_number, "mobile_token": ele.mobile_token },)
  //     })
  //     this.dataService.passSpinnerFlag(false, true);
  //   },
  //     error => {
  //       this.dataService.passSpinnerFlag(false, true);
  //       this.msg = 'Error occured. Please try again.';
  //       this.snackbarService.show(this.msg, true, false, false, false);
  //     },
  //     () => {
  //       this.dataService.passSpinnerFlag(false, true);
  //     }
  //   )
  // }

  /**
   * get the current date.
   */
  getCurrentDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  /**
   * get the current time.
   */
  getCurrentTime(): string {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  /**
   * select date.
   */
  DateChange(event) {
    let stDate = new Date(this.selectedFormattedData.incident_date);
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
    let startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate;
    this.selectedFormattedData.incident_date = startDate1;
    this.actionDue_date = startDate1;
    if (this.selectedFormattedData.incident_date == this.getCurrentDate()) {
      this.selectedFormattedData.incident_time = this.getCurrentTime();
    }
  }

  /**
   * select time.
   */
  timeChange(event) {
    this.selectedFormattedData.incident_time = event.target.value;
    const currentTime = this.getCurrentTime();
    if (
      event.target.value > currentTime &&
      this.selectedFormattedData.incident_date == this.getCurrentDate()
    ) {
      this.selectedFormattedData.incident_time = currentTime;
      event.target.value = currentTime;

      this.snackbarService.show(
        'The incident time cannot be set in the future',
        false,
        false,
        false,
        true
      );
    }
  }

  /**
   * get all users list.
   */
  getAllAssigneeList(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.allUserList = [];
    this.commentTagging = [];

    this.SafetyAndSurveillanceCommonService.getAssigneeList(unit).subscribe(
      (data) => {
        let assignee: any = data;
        let userMail = sessionStorage.getItem('user-email');
        assignee.forEach((element) => {
          if (element.email == userMail) {
            this.loginUserId = element.id;
          }
          let userObj = this.allUserList.find((user) => user.id == element.id);
          if (!userObj) {
            this.allUserList.push(element);
            this.commentTagging.push({
              key: element.name,
              value: element.name,
              email: element.email,
              id: element.id,
              username: element.username,
              mobile_number: element.mobile_number,
              mobile_token: element.mobile_token,
            });
          }
        });
        this.commentTagging = [...this.commentTagging];

        this.selectedFormattedData.investigators.forEach((id) => {
          let index = this.allPlantUsers.findIndex((user) => {
            return user.id == id;
          });
          if (index >= 0) {
            this.selectedInvestigator = this.allPlantUsers[index];
          }
        });
        this.selectedFormattedData.stakeholders.forEach((id) => {
          let index = this.allPlantUsers.findIndex((user) => {
            return user.id == id;
          });
          if (index >= 0) {
            this.selectedstakeholders.push(this.allPlantUsers[index]);
          }
        });
        this.getFilterData();
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
   * get the company details.
   */
  getCompanyName(): any {
    this.commonService.getCompanyDetails().subscribe((data: any) => {
      this.clientName = data.name;
      sessionStorage.setItem('company-name', data.name);
      return data.name;
    });
  }
  /**
   * get all units and populate to units dropdown.
   */
  getAvailableUnits() {
    this.plantService.getAvailableUnits().subscribe(
      (availableUnits) => {
        if (availableUnits['IOGP_Category']) {
          let units: any = availableUnits;
          let unitList: any = [];
          this.units = [];
          Object.keys(units.IOGP_Category).forEach((unit) => {
            if (
              units.IOGP_Category[unit].access_permissions[0].indexOf('view') >
              -1
            ) {
              let unitDetails = {};
              unitDetails['unitName'] = unit;
              unitDetails['order'] = units.IOGP_Category[unit].order;
              unitList.push(unitDetails);
            }
          });
          unitList.sort((a, b) => (a.order < b.order ? -1 : 1));
          this.units = unitList.map((unit) => unit.unitName);
        }
      },
      (error) => {
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  getFilterData() {
    this.dataService.passSpinnerFlag(true, true);
    this.dueDates = [];
    this.reporters = [];
    this.investigators = [];
    this.status = [];
    this.tempIncidentData = this.totalIncidentData;

    this.totalIncidentData.forEach((ele) => {
      let index = this.dueDates.findIndex((date) => {
        return date == ele.investigation_due_date;
      });
      if (index == -1 && ele.investigation_due_date) {
        this.dueDates.push(ele.investigation_due_date);
      }

      let reporterIndex = this.reporters.findIndex((reporter) => {
        return reporter.id == ele.reporter;
      });
      if (reporterIndex == -1 && ele.reporter) {
        let index = this.allUserList.findIndex((obj) => {
          return obj.id == ele.reporter;
        });
        if (index >= 0) {
          this.reporters.push(this.allUserList[index]);
        }
      }
      ele.investigators.forEach((investigator) => {
        let investigatorsIndex = this.investigators.findIndex(
          (investigators) => {
            return investigators.id == investigator;
          }
        );
        if (investigatorsIndex == -1 && investigator) {
          let index = this.allUserList.findIndex((obj) => {
            return obj.id == investigator;
          });
          if (index >= 0) {
            this.investigators.push(this.allUserList[index]);
          }
        }
      });
      let statusIndex = this.status.findIndex((status) => {
        return status == ele.status;
      });
      if (statusIndex == -1 && ele.status) {
        this.status.push(ele.status);
      }
    });

    this.dataService.passSpinnerFlag(false, true);
  }

  /**
   * get the incident data.
   */
  getIncidents() {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getIncident('').subscribe(
      (data) => {
        this.dataService.passSpinnerFlag(true, true);
        this.incidentData = [];
        this.incidentData = data;
        this.dueDates = [];
        this.reporters = [];
        this.investigators = [];
        this.status = [];
        this.tempIncidentData = data;

        let index = this.incidentData.findIndex((ele) => {
          return ele.id == this.selectedFormattedData.id;
        });
        if (index >= 0) {
          this.dataService.passSpinnerFlag(true, true);
          this.selectIncidentViewObj(this.incidentData[index]);
        }
        this.incidentData.forEach((ele) => {
          let index = this.dueDates.findIndex((date) => {
            return date == ele.investigation_due_date;
          });
          if (index == -1 && ele.investigation_due_date) {
            this.dueDates.push(ele.investigation_due_date);
          }

          let reporterIndex = this.reporters.findIndex((reporter) => {
            return reporter.id == ele.reporter;
          });
          if (reporterIndex == -1 && ele.reporter) {
            let index = this.allUserList.findIndex((obj) => {
              return obj.id == ele.reporter;
            });
            if (index >= 0) {
              this.reporters.push(this.allUserList[index]);
            }
          }
          ele.investigators.forEach((investigator) => {
            let investigatorsIndex = this.investigators.findIndex(
              (investigators) => {
                return investigators.id == investigator;
              }
            );
            if (investigatorsIndex == -1 && investigator) {
              let index = this.allUserList.findIndex((obj) => {
                return obj.id == investigator;
              });
              if (index >= 0) {
                this.investigators.push(this.allUserList[index]);
              }
            }
          });
          let statusIndex = this.status.findIndex((status) => {
            return status == ele.status;
          });
          if (statusIndex == -1 && ele.status) {
            this.status.push(ele.status);
          }
        });
        this.fishBoneSavedData = {};
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  getIncident() {
    this.dataService.passSpinnerFlag(false, true);
    this.SafetyAndSurveillanceCommonService.getIncident(
      this.selectedFormattedData.id
    ).subscribe(
      (data) => {
        this.dataService.passSpinnerFlag(false, true);

        let index = this.incidentData.findIndex((ele) => {
          return ele.id == this.selectedFormattedData.id;
        });
        this.incidentData[index] = data[0];
        this.selectIncidentViewObj(data[0]);
        this.fishBoneSavedData = {};

        this.dataService.passSpinnerFlag(false, false);
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
   * new incident form functions.
   */
  getEvidenceFileForm(id) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getEvidenceFileForm(id).subscribe(
      (data) => {
        this.evidenceData = data;
        this.evidenceData = [...this.evidenceData];
        this.dataService.passSpinnerFlag(false, true);
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
   * display form to create new incident.
   */
  createNewIncident() {
    this.createIncident = true;
    this.confirmSubmitCreateIncident = false;
    this.getIncidentMetadata();
  }
  /**
   * get incident metadata to display selected incident.
   */
  getIncidentMetadata() {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getIncidentMetadata('').subscribe(
      (form) => {
        this.newIncidentForm = form;
        this.newIncidentForm.sort((a, b) => {
          if (a.key === 'others' && b.key !== 'others') {
            return 1;
          } else if (a.key !== 'others' && b.key === 'others') {
            return -1;
          } else {
            return 0;
          }
        });
        let groupedElements = {};
        this.newIncidentForm?.forEach((element) => {
          if (element.type) {
            if (!groupedElements[element.type]) {
              groupedElements[element.type] = [];
            }
            let obj = { ...element, checked: false };
            groupedElements[element.type].push(obj);
          }
        });

        for (const key in groupedElements) {
          if (Object.hasOwnProperty.call(groupedElements, key)) {
            this.newIncidentFormObj[key] = groupedElements[key];
          }
        }

        this.setDefaultData();
        this.selectIncidentFormObj();
        this.dataService.passSpinnerFlag(false, true);
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
   * set default data in the form.
   */
  setDefaultData() {
    let array = ['sector', 'incident_factor', 'damage'];
    array.forEach((type) => {
      let obj = {};
      this.newIncidentFormObj[type].forEach((ele) => {
        obj[ele.key] = ele.checked;
      });
      this.newFormattedData[type] = obj;
    });
    this.newFormattedData.serious_injury = {
      employee: 0,
      contractor: 0,
      others: 0,
    };
    this.newFormattedData.fatality = {
      employee: 0,
      contractor: 0,
      others: 0,
    };
    this.newFormattedData.plant = this.plantName;
    this.newFormattedData.unit = this.selectedUnitName;
    this.newFormattedData.zone = this.selectedZoneName;
  }
  setInjuriesFatalitiescoutn(type, name) {
    this.newFormattedData[type][name] += 1;
  }

  /**
   * select unit from unit dropdown.
   */
  selectedUnit(unit) {
    this.selectedIncidentObj.unit_name = unit;
    this.unitDropdown = false;
    this.fetchObservationData(unit);
  }

  /**
   * get the observation data.
   */
  fetchObservationData(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.fetchObservationData(
      unit
    ).subscribe(
      (response) => {
        let obsData = response;
        this.zonesList = [];
        this.zonesList = Object.keys(obsData);
        for (var i = 0; i < this.zonesList.length; i++) {
          if (this.zonesList[i].indexOf('All') > -1) {
            this.zonesList.splice(i, 1);
          }
        }
        this.selectedZone(this.zonesList[0]);
        this.dataService.passSpinnerFlag(false, true);
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
   * select  the zone from zone dropdown.
   */
  selectedZone(zone) {
    this.selectedIncidentObj.zone_name = zone;
    this.zoneDropdown = false;
  }
  /**
   * select the data from list using checklist.
   */
  selectCheckList(type, obj, i) {
    this.newIncidentFormObj[type][i].checked =
      !this.newIncidentFormObj[type][i].checked;
    this.newFormattedData[type] = {};
    this.newIncidentFormObj[type].forEach((ele) => {
      this.newFormattedData[type][ele.key] = ele.checked;
    });
  }

  submitNewIncidentData() {}

  /**
   * display confirmation popup to submit.
   */
  confirmToSubmit() {
    $('#confirmSubmit').modal('show');
  }

  /**
   * submit functionality for initial report.
   */
  submittedInitialReport() {
    this.createIncident = false;
    $('#confirmSubmit').modal('hide');
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.postNewIncident(
      this.newFormattedData
    ).subscribe(
      (form) => {
        this.msg = 'Created successfully.';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.getIncidents();
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
   * update incident form functions.
   */
  editableField = true;
  tempIncidentRow;
  selectIncidentViewObj(row) {
    let prevId = this.selectedIncidentObj?.id;
    if (row.id != prevId) {
      this.rootAnalysis = false;
    }
    this.tempIncidentRow = row;
    this.selectedIncidentObj = row;
    this.selectedFormattedData = this.selectedIncidentObj;
    this.selectedstakeholders = [];
    this.selectedInvestigator = {};
    this.fishBoneSavedData = {};
    this.getAllAssigneeList(this.selectedFormattedData.unit_name);

    if (this.selectedIncidentObj.status != 'incident_logged') {
      this.editableField = false;
      this.showAtTop = true;
    } else {
      this.showAtTop = false;
      this.editableField = true;
    }

    this.selectedUnitName = this.selectedFormattedData.unit_name;
    this.selectedZoneName = this.selectedFormattedData.zone_name;

    if (this.insightsFound) {
      this.getInsightsData();
    }

    this.addNewEvidenceFormData();
    this.selectIncidentFormObj();
    this.getEvidenceFileForm(this.selectedFormattedData.id);
    this.getFishboneParameter(this.selectedFormattedData.id);
    this.getFishboneCauseAnalysis(this.selectedFormattedData.id);
    this.getQuestionAnalysis(this.selectedFormattedData.id);
    this.getAllUsersCloseList(this.selectedFormattedData.unit_name);
    this.getAllUsersViewList(this.selectedFormattedData.unit_name);
    this.setTextAreaHeight();
  }

  /**
   * set height for textarea.
   */
  setTextAreaHeight() {
    const textareas = document.querySelectorAll('.expandable-textarea');
    textareas.forEach((textarea) => {
      const textAreaElement = textarea as HTMLTextAreaElement;
      textAreaElement.style.height = 'auto';
    });
  }

  /**
   * get insights data.
   */
  getInsightsData() {
    this.insightsLoading = true;
    this.insightsData = [];
    if (this.selectedFormattedData['status'] != 'incident_logged') {
      this.insightsAvailable = true;
      this.SafetyAndSurveillanceCommonService.getInsights(
        this.selectedFormattedData,
        this.newIncidentForm
      ).subscribe(
        (response: any) => {
          this.insightsLoading = false;
          this.insightsData = response?.map((item) => ({
            ...item,
            view: true,
            pin: false,
          }));
          this.getPinnedInsights();
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
          // do
        }
      );
    } else {
      this.insightsAvailable = false;
    }
  }

  pinInsight(insight: any) {
    let incidentId = this.selectedFormattedData.id;
    let insightsData = insight;
    this.SafetyAndSurveillanceCommonService.postPinnedInsights(
      'incident_id',
      incidentId,
      insightsData
    ).subscribe(
      (response) => {
        this.getPinnedInsights();
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.insightsAvailable = true;
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  unPinInsight(insight: any) {
    let insightId = insight.pinnedInsightId;
    this.SafetyAndSurveillanceCommonService.deletePinnedInsights(
      insightId
    ).subscribe(
      (response) => {
        this.getPinnedInsights();
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.insightsAvailable = true;
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  getPinnedInsights() {
    let incidentId = this.selectedFormattedData.id;
    this.SafetyAndSurveillanceCommonService.getPinnedInsights(
      'incident_id',
      incidentId
    ).subscribe(
      (response: any) => {
        this.pinnedInsights = response.map((item) => ({
          ...item.response,
          view: false,
          pin: true,
          pinnedInsightId: item.id,
        }));
        this.unPinnedInsights = this.insightsData?.filter(
          (item) =>
            !this.pinnedInsights.some(
              (pinnedItem) => pinnedItem.title === item.title
            )
        );
        this.unPinnedInsights = this.unPinnedInsights?.map((item) => ({
          ...item,
          pin: false,
        }));
        this.insightsData = [...this.pinnedInsights, ...this.unPinnedInsights];
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.insightsAvailable = true;
        this.msg = 'Error occured. Please try   again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  returningFrame(text) {
    if ((text = '-')) {
      text.split('-').join('/n');
    }
  }

  /**
   * get incident object from the form.
   */
  selectIncidentFormObj() {
    this.fetchSelectedUnitZones(this.selectedFormattedData?.unit_name);
    let sector = [];
    let incident_factor = [];
    let damage = [];
    let injury = [];
    let body_part = [];
    this.updateEvidenceDataValidationObj['sector'] = 0;
    this.updateEvidenceDataValidationObj['incident_factor'] = 0;
    this.updateEvidenceDataValidationObj['damage'] = 0;

    this.newIncidentForm.forEach((element) => {
      if (element.type == 'sector') {
        for (const [key, value] of Object.entries(
          this.selectedFormattedData?.sector
        )) {
          if (key == element.key) {
            let obj = element;
            obj.checked = value;
            sector.push(obj);
            if (value) {
              this.updateEvidenceDataValidationObj['sector'] += 1;
            }
          }
        }
      } else if (element.type == 'incident_factor') {
        for (const [key, value] of Object.entries(
          this.selectedFormattedData?.incident_factor
        )) {
          if (key == element.key) {
            let obj = element;
            obj.checked = value;
            incident_factor.push(obj);
            if (value) {
              this.updateEvidenceDataValidationObj['incident_factor'] += 1;
            }
          }
        }
      } else if (element.type == 'damage') {
        for (const [key, value] of Object.entries(
          this.selectedFormattedData?.damage
        )) {
          if (key == element.key) {
            let obj = element;
            obj.checked = value;
            damage.push(obj);
            if (value) {
              this.updateEvidenceDataValidationObj['damage'] += 1;
            }
          }
        }
      } else if (element.type == 'injury') {
      } else if (element.type == 'body_part') {
      }
    });
    this.selectedIncidentFormObj['sector'] = sector;
    this.selectedIncidentFormObj['incident_factor'] = incident_factor;
    this.selectedIncidentFormObj['damage'] = damage;
  }
  selectedCheckList(type, obj, i) {
    this.updateEvidenceDataValidationObj[type] = 0;
    this.selectedIncidentFormObj[type][i].checked =
      !this.selectedIncidentFormObj[type][i].checked;
    this.selectedFormattedData[type] = {};
    this.selectedIncidentFormObj[type].forEach((ele) => {
      this.selectedFormattedData[type][ele.key] = ele.checked;
      if (ele.checked) {
        this.updateEvidenceDataValidationObj[type] += 1;
      }
    });
  }
  selectedInjuriesFatalitiescoutn(type, name) {
    this.selectedFormattedData[type][name] += 1;
  }

  /**
   * select the unit in units dropdown.
   */
  selectIncidentUnit(unit) {
    this.selectedFormattedData.unit_name = unit;
    this.unitDropdown = false;
    this.fetchSelectedUnitZones(unit);
    this.getAllAssigneeList(unit);
  }

  /**
   * get zones list for selected unit.
   */
  fetchSelectedUnitZones(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.fetchObservationData(
      unit
    ).subscribe(
      (response) => {
        let obsData = response;
        this.IncidentZonesList = [];
        this.IncidentZonesList = Object.keys(obsData);
        for (var i = 0; i < this.IncidentZonesList.length; i++) {
          if (this.IncidentZonesList[i].indexOf('All') > -1) {
            this.IncidentZonesList.splice(i, 1);
          }
        }
        this.selectIncidentZone(this.IncidentZonesList[0]);
        this.dataService.passSpinnerFlag(false, true);
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
   * select zone in zone dropdown.
   */
  selectIncidentZone(zone) {
    if (this.selectedFormattedData) {
      this.selectedFormattedData.zone_name = zone;
    }
    this.zoneDropdown = false;
  }

  cancelUpdateIncidentData() {
    this.submitButtonClick = false;
    this.getIncident();
  }

  submitUpdateIncidentData() {
    if (this.validationUpdatingForm()) {
      this.submitButtonClick = true;
      $('#validateField').modal('show');
    } else {
      this.confirmSubmitUpdateIncident = true;
    }
  }

  /**
   * submitted the updated incident form.
   */
  submittedUpdatedIncidentForm() {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedFormattedData.unit = this.selectedFormattedData.unit_name;
    let selectedIncidentData = this.selectedFormattedData;
    this.SafetyAndSurveillanceCommonService.fetchObservationData(
      this.selectedFormattedData.unit
    ).subscribe((responce) => {
      this.editableField = false;
      this.obsFilters = responce;
      for (const [zoneKey, zoneValue] of Object.entries(this.obsFilters)) {
        if (zoneKey == this.selectedFormattedData.zone_name) {
          if (this.insightsFound) {
            this.getInsightsData();
          }

          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;
          delete this.selectedFormattedData.plant;
          this.selectedFormattedData.zone = this.obsFilters[zoneKey].id;
          this.selectedFormattedData.investigators = [
            this.selectedInvestigator['id'],
          ];
          let stakeholders = this.selectedstakeholders.map((ele) => {
            return ele.id;
          });
          this.selectedFormattedData.stakeholders = stakeholders;
          this.selectedFormattedData.status = 'initial_report_submitted';
          this.selectedFormattedData.reporter = this.loginUserId;
          this.selectedFormattedData.incident_date.slice(0, 10);
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              if (this.isAIEnabled) {
                this.triggerAIRCACreation();
              }
              this.getIncidents();
              this.msg = this.isAIEnabled
                ? 'Successfully updated. Cause(s)/ sub-cause(s) are being auto-generated by the AI algorithm. Please check after sometime.'
                : 'Successfully updated';
              this.snackbarService.show(this.msg, false, false, false, false);
            },
            (error) => {
              this.getIncidents();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        }
      }
    });
  }

  triggerAIRCACreation() {
    this.SafetyAndSurveillanceCommonService.triggerAIRCACreation(
      this.selectedFormattedData
    ).subscribe(
      (form) => {},
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  triggerAIActionCreation() {
    this.SafetyAndSurveillanceCommonService.triggerAIActionCreation(
      this.selectedFormattedData
    ).subscribe(
      (form) => {},
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
    this.msg =
      'Action(s) are being auto-generated by the AI algorithm. Please check after sometime.';
    this.snackbarService.show(this.msg, false, false, false, false);
    this.getIncidents();
  }

  // normal functions

  getIncidentEvidenceForms() {
    this.SafetyAndSurveillanceCommonService.getIncidentEvidenceForms().subscribe(
      (form) => {
        this.evidence_list = form;
        this.selectthisIncidentEvidenceForm(this.evidence_list[0]?.id);
      }
    );
  }
  selectthisIncidentEvidenceForm(id) {
    this.evidenceFormData = {};
    this.touchedfields = {};
    this.selected_evidence_id = id;
    for (const [objKey, objValue] of Object.entries(this.newIncidentFormObj)) {
      this.newIncidentFormObj[objKey].forEach((ele, i) => {
        this.newIncidentFormObj[objKey][i].checked = false;
      });
    }
    this.getIncidentEvidenceFormFields(this.selected_evidence_id);
  }

  /**
   * get evidence form field for select incident id.
   */
  getIncidentEvidenceFormFields(id) {
    this.SafetyAndSurveillanceCommonService.getIncidentEvidenceFormFields(
      id
    ).subscribe((form) => {
      this.inputSchema = form;
      this.inputSchema['mandatory_fields'] = [];
      this.evidenceDataValidationObj = {};

      this.inputSchema.forEach((ele, i) => {
        if (ele.is_mandatory) {
          this.inputSchema['mandatory_fields'].push(ele.field_key);
        }
        if (ele.field_type == 'file') {
          this.inputSchema[i].value = [];
          this.evidenceFormData[ele.field_key] = [];
        } else if (ele.field_type == 'checkbox') {
          this.evidenceFormData[ele.field_key] = {};
          this.newIncidentFormObj[ele.field_key].forEach((item) => {
            this.evidenceFormData[ele.field_key][item.key] = item.checked;
          });
          this.evidenceDataValidationObj[ele.field_key] = 0;
        } else if (ele.field_type == 'boolean') {
          this.evidenceFormData[ele.field_key] = false;
        } else {
          this.evidenceFormData[ele.field_key] = '';
        }
      });
    });
  }

  showAndHide(i) {
    this.insightsData[i].view = !this.insightsData[i].view;
  }
  /**
   * show and hide the unit dropdown.
   */
  unitDropdownShow() {
    if (!this.confirmSubmitUpdateIncident) {
      this.unitDropdown = !this.unitDropdown;
    }
  }

  /**
   * show and hide the zone dropdown.
   */
  zoneDropdownShow() {
    if (!this.confirmSubmitUpdateIncident) {
      this.zoneDropdown = !this.zoneDropdown;
    }
  }
  backToOverView() {
    this.backToOverViewTable.emit(false);
  }

  /**
   * apply the filters and get the incident based on filters.
   */
  applyFilters() {
    let filterByDates = [];
    let filterByReporter = [];
    let filterByInvestigator = [];
    let filterByStatus = [];
    if (this.selectedDates.length > 0) {
      this.tempIncidentData.forEach((element) => {
        let index = this.selectedDates.findIndex((date) => {
          return date == element.investigation_due_date;
        });
        if (index >= 0) {
          filterByDates.push(element);
        }
      });
    } else {
      filterByDates = this.tempIncidentData;
    }
    if (this.selectedReporter.length > 0) {
      filterByDates.forEach((element) => {
        let index = this.selectedReporter.findIndex((user) => {
          return user.id == element.reporter;
        });
        if (index >= 0) {
          filterByReporter.push(element);
        }
      });
    } else {
      filterByReporter = filterByDates;
    }
    if (this.selectedInvestigators.length > 0) {
      filterByReporter.forEach((element) => {
        let index = this.selectedInvestigators.findIndex((user) => {
          return user.id == element.investigators[0];
        });
        if (index >= 0) {
          filterByInvestigator.push(element);
        }
      });
    } else {
      filterByInvestigator = filterByReporter;
    }
    if (this.selectedStatus.length > 0) {
      filterByInvestigator.forEach((element) => {
        let index = this.selectedStatus.findIndex((status) => {
          return status == element.status;
        });
        if (index >= 0) {
          filterByStatus.push(element);
        }
      });
    } else {
      filterByStatus = filterByInvestigator;
    }
    this.incidentData = [...filterByStatus];
    this.disableApply = true;
    this.selectIncidentViewObj(this.incidentData[0]);
  }

  /**
   * reset the all filters and get the all incident.
   */
  onFilterReset() {
    this.getIncidents();
    this.selectedDates = [];
    this.selectedReporter = [];
    this.selectedInvestigators = [];
    this.selectedStatus = [];
    this.filterResetEvent.emit();
    this.disableApply = true;
  }

  selectOption(text) {
    if (text == 'verify_initial_report') {
      this.selectedOption = text;
    } else if (text == 'evidence_entry') {
      if (
        this.selectedFormattedData.investigators.length > 0 &&
        this.selectedFormattedData.stakeholders.length > 0
      ) {
        this.selectedOption = text;
      }
    } else {
      if (
        this.selectedFormattedData.investigators.length > 0 &&
        this.selectedFormattedData.stakeholders.length > 0 &&
        this.evidenceData.length >= 1
      ) {
        this.selectedOption = text;
      }
    }
  }

  /**
   * scroll to selected incident.
   */
  scrollToIncident(id) {
    document.getElementById(id).scrollIntoView();
    if (id == 'verify_initial_report') {
      document.getElementById(id).scrollIntoView();
    } else if (id == 'evidence_entry') {
      if (
        this.selectedFormattedData.investigators.length > 0 &&
        this.selectedFormattedData.stakeholders.length > 0
      ) {
        document.getElementById(id).scrollIntoView();
      }
    } else {
      if (
        this.selectedFormattedData.investigators.length > 0 &&
        this.selectedFormattedData.stakeholders.length > 0 &&
        this.evidenceData.length >= 1
      ) {
        document.getElementById(id).scrollIntoView();
      }
    }
  }

  scrollToIncidentObj() {
    setTimeout(() => {
      $('#overAllIncidents').animate({
        scrollTop:
          $('#incident' + this.selectedFormattedData['id']).position().top -
          200,
      });
    }, 500);
  }
  scrollToNewCategory() {
    setTimeout(() => {
      this.widgetsContent.nativeElement.scrollTo({
        left: this.widgetsContent.nativeElement.scrollLeft + 150,
        behavior: 'smooth',
      });
    }, 500);
  }
  /**
   * select all dates.
   */
  selectedAllDates() {
    this.disableApply = false;
    this.selectedDates = this.dueDates;
  }
  /**
   * unselect all dates.
   */
  unSelectAllDates() {
    this.disableApply = false;
    this.selectedDates = [];
  }
  /**
   * select all repoters.
   */
  selectedAllReporters() {
    this.disableApply = false;
    this.selectedReporter = this.reporters;
  }

  /**
   * unselect all repoters.
   */
  unSelectAllReporters() {
    this.disableApply = false;
    this.selectedReporter = [];
  }
  /**
   * select all investigators.
   */
  selectedAllInvestigators() {
    this.disableApply = false;
    this.selectedInvestigators = this.investigators;
  }
  /**
   * unselect all investigators.
   */
  unSelectAllInvestigators() {
    this.disableApply = false;
    this.selectedInvestigators = [];
  }
  /**
   * select all status.
   */
  selectedAllStatus() {
    this.disableApply = false;
    this.selectedStatus = this.status;
  }
  /**
   * unselect all status.
   */
  unSelectAllStatus() {
    this.disableApply = false;
    this.selectedStatus = [];
  }

  getSoonDelayedRow = (row) => {
    if (row.id) {
      return {
        open: row['status'] == 'Open',
        close: row['status'] == 'Close',
      };
    }
  };

  getMostCriticalTableHeight() {
    var insight_header = document.getElementById('right-insight-header');
    return insight_header.offsetHeight;
  }

  showSubCause(text, id) {
    if (this.getUserHaveViewAccess()) {
      let classList = document.getElementById(text + id).classList;
      let btnClassList = document.getElementById(
        text + 'SubCause' + id
      ).classList;
      classList.remove('d-none');
      btnClassList.add('d-none');
    }
  }
  showAddNewAns(i) {
    if (this.getUserHaveViewAccess()) {
      let classList = document.getElementById('addNewAns' + i).classList;
      let btnClassList = document.getElementById('addAns' + i).classList;
      classList.add('d-none');
      btnClassList.remove('d-none');
    }
  }

  createCause(id) {
    if (this.getUserHaveViewAccess()) {
      let classList = document.getElementById(id).classList;
      let btnClassList = document.getElementById(id + 'Btn').classList;
      classList.remove('d-none');
      btnClassList.add('d-none');
    }
  }

  getUserHaveViewAccess() {
    return (
      this.allStakeholdersList?.findIndex((user) => {
        return user.id == this.loginUserId;
      }) >= 0
    );
  }
  getUserHaveCloseAccess() {
    return (
      this.allInvestigatorList?.findIndex((user) => {
        return user.id == this.loginUserId;
      }) >= 0
    );
  }

  selectRootAnalysis() {
    this.rootAnalysis = !this.rootAnalysis;
  }

  onFileChange(isOverall, key, event, ind, isMultiple) {
    let invalidFiles = [];
    let assetList;
    let invalidSize = false;
    let invalidFileType = false;
    const allowedGenericTypes = ['audio/', 'video/', 'text/', 'image/'];
    const allowedSpecificTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    if (isOverall) {
      let index = this.inputSchema.findIndex((item) => item.field_key === key);
      this.inputSchema[index].value = isMultiple
        ? this.returnParsedData(this.inputSchema[index].value)
        : [];
      if (isMultiple) {
        for (var i = 0; i < event.target.files.length; i++) {
          if (event.target.files[0]?.size / 1024 / 1024 <= 5) {
            if (
              allowedSpecificTypes.includes(event.target.files[0].type) ||
              allowedGenericTypes.some((type) =>
                event.target.files[0].type.startsWith(type)
              )
            ) {
              this.inputSchema[index].value.push(event.target.files[i]);
            } else {
              invalidFileType = true;
              this.msg = 'Invalid file format found.Try uploading again.';
            }
          } else {
            invalidSize = true;
            this.msg = 'File size should not exceed 5MB.';
          }
        }
      } else {
        if (event.target.files[0]?.size / 1024 / 1024 <= 5) {
          if (
            allowedSpecificTypes.includes(event.target.files[0].type) ||
            allowedGenericTypes.some((type) =>
              event.target.files[0].type.startsWith(type)
            )
          ) {
            this.inputSchema[index].value = [event.target.files[0]];
          } else {
            invalidFileType = true;
            this.msg = 'Invalid file format found. Try uploading again.';
          }
        } else {
          invalidSize = true;
          this.msg = 'File size should not exceed 5MB.';
        }
      }
    }

    if (!invalidSize && !invalidFileType) {
      this.uploadFileToS3(isOverall, key, ind, isMultiple);
    } else {
      this.snackbarService.show(this.msg, false, false, false, true);
    }
  }

  /**
   * upload the selected iamges.
   */
  uploadFileToS3(isOverall, key, ind, isMultiple) {
    let allowedTypes = ['application/pdf', 'audio/*', 'video/*', 'text/*'];
    this.dataService.passSpinnerFlag(true, true);
    let files;
    if (isOverall) {
      files = this.inputSchema.find((item) => item.field_key === key).value;
    }
    files = files.filter((file) => typeof file != 'string');
    if (files.length > 0) {
      this.SafetyAndSurveillanceCommonService.uploadPdfFile(
        this.selectedFormattedData.unit_name,
        files
      ).subscribe(
        (response: any) => {
          this.evidenceFormData[key] = [
            ...this.evidenceFormData[key],
            ...response,
          ];
          let index = this.inputSchema.findIndex(
            (item) => item.field_key === key
          );
          this.inputSchema[index].value = [];
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'File(s) uploaded successfully.';
          this.snackbarService.show(this.msg, false, false, false, false);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    } else {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'No files are selected. Select a file to upload.';
      this.snackbarService.show(this.msg, true, false, false, false);
    }
  }

  /**
   * return the formated data.
   */
  returnParsedData(data) {
    if (typeof data === 'string' && data.includes('[')) {
      return JSON.parse(data.replace(/'/g, '"'));
    } else if (typeof data === 'string' && !data.includes('[')) {
      return [data];
    } else {
      return data;
    }
  }

  /**
   * delete the selected file.
   */
  removeFile(key, j) {
    this.evidenceFormData[key].splice(j, 1);
  }

  /**
   * return file name to display.
   */
  returnFileName(file) {
    let array = file.split('/');
    if (array[array.length - 1].length > 15) {
      let name = array[array.length - 1].slice(0, 14) + '...';
      return name;
    } else {
      return array[array.length - 1];
    }
  }
  /**
   * set the height for cards.
   */
  getTopHeight() {
    var top_card = document.getElementById('root-top-card-height');
    var left_card = document.getElementById('root-left-card-height');

    let heightOfTable = top_card.offsetHeight - left_card.offsetHeight / 2;
    if (heightOfTable > 0) {
      return heightOfTable - 10;
    } else {
      return 0;
    }
  }

  getTopMargin() {
    var top_card = document.getElementById('root-top-card-height');
    var left_card = document.getElementById('root-left-card-height');

    let heightOfTable = top_card.offsetHeight - left_card.offsetHeight / 2;
    if (heightOfTable < 0) {
      return -heightOfTable;
    } else {
      return 0;
    }
  }

  /**
   * calculate the card height and return.
   */
  getCalculateHeight() {
    var height = document.getElementById('top_card');
    return height.offsetHeight;
  }

  /**
   * close the create new incident form.
   */
  closeCreateIncident(event) {
    this.createIncident = false;
    this.backToOverViewTable.emit(false);
    // if (event) {
    //   this.getIncidents();
    // }
  }

  /**
   * validate the evidence form.
   */
  validateEvidenceForm() {
    let validate = false;

    this.inputSchema.forEach((ele) => {
      if (ele.field_type == 'email') {
        validate = !this.isValidEmail(this.evidenceFormData[ele.field_key]);
      }
      if (
        ele.is_mandatory &&
        typeof this.evidenceFormData[ele.field_key] != 'boolean'
      ) {
        if (
          (typeof this.evidenceFormData[ele.field_key] == 'string' ||
            Array.isArray(this.evidenceFormData[ele.field_key])) &&
          this.evidenceFormData[ele.field_key].length <= 0
        ) {
          validate = true;
        } else {
          for (const [key, value] of Object.entries(
            this.evidenceDataValidationObj
          )) {
            if (
              this.evidenceDataValidationObj[key] <= 0 &&
              this.inputSchema['mandatory_fields'].includes(key)
            ) {
              validate = true;
            }
          }
        }
      }
    });
    return validate;
  }

  /**
   * select the check list in evidence form.
   */
  selectEvidenceFormCheckList(type, item, i) {
    this.newIncidentFormObj[type][i].checked =
      !this.newIncidentFormObj[type][i].checked;
    this.evidenceFormData[type] = {};
    this.newIncidentFormObj[type].forEach((ele) => {
      this.evidenceFormData[type][ele.key] = ele.checked;
      if (ele.key == 'others') {
        if (ele.checked) {
          this.evidenceFormData[type]['description'] = ele.description;
        } else {
          this.evidenceFormData[type]['description'] = '';
        }
      }
    });

    for (const [key, value] of Object.entries(this.evidenceFormData)) {
      if (
        !(
          typeof value == 'string' ||
          Array.isArray(value) ||
          typeof value == 'boolean'
        )
      ) {
        this.evidenceDataValidationObj[key] = 0;
        for (const [objKey, objValue] of Object.entries(
          this.evidenceFormData[key]
        )) {
          if (this.evidenceFormData[key][objKey]) {
            this.evidenceDataValidationObj[key] += 1;
          }
        }
      }
    }
  }

  selectEvidenceFormDescription(type, item, i) {
    this.evidenceFormData[type] = {};
    this.newIncidentFormObj[type].forEach((ele) => {
      this.evidenceFormData[type][ele.key] = ele.checked;
      if (ele.key == 'others') {
        if (ele.checked) {
          this.evidenceFormData[type]['description'] = ele.description;
        } else {
          this.evidenceFormData[type]['description'] = '';
        }
      }
    });
  }

  /**
   * submit the new evidence form data.
   */
  submitNewEvidenceFormData() {
    let formObj = {
      incident_id: this.selectedFormattedData.id,
      form_id: this.selected_evidence_id,
      form_values: this.evidenceFormData,
    };

    if (this.selectedFormDataId == -1) {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.postEvidenceForm(
        formObj
      ).subscribe(
        (data) => {
          this.msg = 'Evidence data successfully created';
          this.snackbarService.show(this.msg, false, false, false, false);
          this.addNewEvidenceFormData();
          if (
            this.selectedFormattedData.status != 'investigation_in_progress'
          ) {
            this.selectedFormattedData.status = 'investigation_in_progress';
            this.selectedFormattedData.unit =
              this.selectedFormattedData.unit_name;

            delete this.selectedFormattedData.plant;
            this.SafetyAndSurveillanceCommonService.updateNewIncident(
              this.selectedFormattedData
            ).subscribe(
              (responce) => {
                this.getIncidents();
              },
              (error) => {
                this.getIncidents();
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              },
              () => {}
            );
          } else {
            this.getIncidents();
          }
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    } else {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.updateEvidenceForm(
        formObj,
        this.selectedFormDataId
      ).subscribe(
        (data) => {
          this.msg = 'Evidence data successfully updated';
          this.snackbarService.show(this.msg, false, false, false, false);
          this.addNewEvidenceFormData();
          if (
            this.selectedFormattedData.status != 'investigation_in_progress'
          ) {
            this.selectedFormattedData.status = 'investigation_in_progress';
            this.selectedFormattedData.unit =
              this.selectedFormattedData.unit_name;

            delete this.selectedFormattedData.plant;
            this.SafetyAndSurveillanceCommonService.updateNewIncident(
              this.selectedFormattedData
            ).subscribe(
              (responce) => {
                this.getIncidents();
              },
              (error) => {
                this.getIncidents();
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              },
              () => {}
            );
          } else {
            this.getIncidents();
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
  }

  createNewEvidenceFormData() {
    let formObj = {
      incident_id: this.selectedFormattedData.id,
      form_id: this.selected_evidence_id,
      form_values: this.evidenceFormData,
    };

    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.postEvidenceForm(formObj).subscribe(
      (data) => {
        // this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Evidence data successfully created';
        this.snackbarService.show(this.msg, false, false, false, false);
        this.addNewEvidenceFormData();
        if (this.selectedFormattedData.status != 'investigation_in_progress') {
          this.selectedFormattedData.status = 'investigation_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncidents();
              // this.dataService.passSpinnerFlag(false, true);
              // this.msg = 'Successfully updated';
              // this.snackbarService.show(this.msg, false, false, false, false);
            },
            (error) => {
              this.getIncidents();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {
              // this.dataService.passSpinnerFlag(false, true);
            }
          );
        } else {
          this.getIncidents();
        }
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        // this.dataService.passSpinnerFlag(false, true);
      }
    );
  }
  resetShowEvidence() {
    if (this.selectedFormattedData?.status === 'closed') {
      this.showEvidence = false;
    }
  }
  /**
   * display the selected evidence form data.
   */
  viewSelectedEvidenceForm(row) {
    this.showEvidence = true;
    document.getElementById('evidence-start')?.scrollIntoView();
    this.selectthisIncidentEvidenceForm(row.form_id);
    this.selectedFormDataId = row.id;
    setTimeout(() => {
      for (const [key, value] of Object.entries(row.form_values)) {
        if (
          typeof value == 'string' ||
          typeof value == 'number' ||
          Array.isArray(value) ||
          typeof value == 'boolean'
        ) {
          this.evidenceFormData[key] = value;
        } else {
          for (const [objKey, objValue] of Object.entries(
            row.form_values[key]
          )) {
            let index = this.newIncidentFormObj[key].findIndex((ele) => {
              return ele.key == objKey;
            });
            if (index >= 0) {
              this.newIncidentFormObj[key][index].checked = objValue;
              this.evidenceFormData[key][objKey] = objValue;
              if (objKey == 'others') {
                if (objValue) {
                  this.evidenceFormData[key]['description'] =
                    row.form_values[key]['description'];
                  this.newIncidentFormObj[key][index]['description'] =
                    row.form_values[key]['description'];
                }
              }
            }
          }
        }
      }

      for (const [key, value] of Object.entries(this.evidenceFormData)) {
        if (
          !(
            typeof value == 'string' ||
            typeof value == 'number' ||
            Array.isArray(value) ||
            typeof value == 'boolean'
          )
        ) {
          this.evidenceDataValidationObj[key] = 0;
          for (const [objKey, objValue] of Object.entries(
            this.evidenceFormData[key]
          )) {
            if (this.evidenceFormData[key][objKey]) {
              this.evidenceDataValidationObj[key] += 1;
            }
          }
        }
      }
    }, 500);
  }

  /**
   * delete the evidence.
   */
  deleteEvidenceForm(row) {
    if (this.loginUserId == this.selectedFormattedData.investigators[0]) {
    }
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.deleteEvidenceForm(
      row.id
    ).subscribe(
      (data) => {
        $('#confirmSubmit').modal('hide');
        this.addNewEvidenceFormData();
        this.getIncidents();
        this.msg = 'Evidence data successfully deleted';
        this.snackbarService.show(this.msg, false, false, false, false);
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
   * add new evidence form.
   */
  addNewEvidenceFormData() {
    this.selectedFormDataId = -1;
    this.selectthisIncidentEvidenceForm(this.evidence_list[0]?.id);
  }

  selectedEvidenceRow;
  getSelectedEvidenceRow(row) {
    this.selectedEvidenceRow = row;
  }

  /**
   * get fishbone parameters.
   */
  getFishboneParameter(id) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getFishboneParameter(
      this.selectedFormattedData.id
    ).subscribe(
      (data) => {
        this.fishboneParameter = data;
        this.fishboneParameterCauseObj = {};
        this.fishboneParameter.forEach((element) => {
          if (!this.fishboneParameterCauseObj[element.key]) {
            this.fishboneParameterCauseObj[element.key] = '';
          }
        });
        this.dataService.passSpinnerFlag(false, true);
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
   * get fishbone cause analysis for selected incident.
   */
  getFishboneCauseAnalysis(id) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getFishboneCauseAnalysis(
      this.selectedFormattedData.id
    ).subscribe(
      (data) => {
        this.rootCauseAnalysis = data;
        this.rootCauseAnalysis.sort((a, b) => a.id - b.id);
        this.fishboneParameterSubCauseObj = {};
        this.editCauseBtnsShow = {};
        this.editSubCauseBtnsShow = {};
        this.rootCauseAnalysis.forEach((element) => {
          if (!this.fishboneParameterSubCauseObj['subCause' + element.id]) {
            this.fishboneParameterSubCauseObj['subCause' + element.id] = '';
          }
          this.editCauseBtnsShow['causeBtn' + element.id] = false;
          element.sub_causes.forEach((sub) => {
            this.editSubCauseBtnsShow[
              'subCauseBtn' + element.id + '' + sub.id
            ] = false;
          });
        });

        this.dataService.passSpinnerFlag(false, true);
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
   * update fishbone cause.
   */
  updateFishboneCause(id, text, flag) {
    if (this.loginUserId == this.selectedFormattedData.investigators[0]) {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.updateFishboneCause(
        id,
        text,
        flag
      ).subscribe(
        (data) => {
          this.getFishboneParameter('');
          this.getFishboneCauseAnalysis('');
          if (this.selectedFormattedData.status != 'capa_in_progress') {
            this.selectedFormattedData.status = 'capa_in_progress';
            this.selectedFormattedData.unit =
              this.selectedFormattedData.unit_name;

            delete this.selectedFormattedData.plant;
            this.SafetyAndSurveillanceCommonService.updateNewIncident(
              this.selectedFormattedData
            ).subscribe(
              (responce) => {
                this.getIncident();
              },
              (error) => {
                this.getIncident();
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              },
              () => {}
            );
          } else {
            this.getIncident();
          }
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }

  /**
   * cancel the new fishbone cause.
   */
  cancelFishboneCause() {
    this.getIncident();
  }

  /**
   * update fishbone sub cause.
   */
  updateFishboneSubCause(id, text, flag) {
    if (this.loginUserId == this.selectedFormattedData.investigators[0]) {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.updateFishboneSubCause(
        id,
        text,
        flag
      ).subscribe(
        (data) => {
          this.getFishboneParameter('');
          this.getFishboneCauseAnalysis('');
          this.selectedOption = 'root_cause_analysis';
          this.onContentScroll();
          if (this.selectedFormattedData.status != 'capa_in_progress') {
            this.selectedFormattedData.status = 'capa_in_progress';
            this.selectedFormattedData.unit =
              this.selectedFormattedData.unit_name;

            delete this.selectedFormattedData.plant;
            this.SafetyAndSurveillanceCommonService.updateNewIncident(
              this.selectedFormattedData
            ).subscribe(
              (responce) => {
                this.getIncident();
              },
              (error) => {
                this.getIncident();
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              },
              () => {}
            );
          } else {
            this.getIncident();
          }
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }

  /**
   * delete the fishbone cause and sub cause.
   */
  deleteFishboneCauseSubcause(type, id) {
    if (this.loginUserId == this.selectedFormattedData.investigators[0]) {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.deleteFishboneCauseSubcause(
        id,
        type
      ).subscribe(
        (data) => {
          this.getFishboneParameter('');
          this.getFishboneCauseAnalysis('');
          if (this.selectedFormattedData.status != 'capa_in_progress') {
            this.selectedFormattedData.status = 'capa_in_progress';
            this.selectedFormattedData.unit =
              this.selectedFormattedData.unit_name;

            delete this.selectedFormattedData.plant;
            this.SafetyAndSurveillanceCommonService.updateNewIncident(
              this.selectedFormattedData
            ).subscribe(
              (responce) => {
                this.getIncident();
              },
              (error) => {
                this.getIncident();
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              },
              () => {}
            );
          } else {
            this.getIncident();
          }
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }

  /**
   * create new fishbone cause.
   */
  postFishboneCause(id, text, flag) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.postFishboneCause(
      id,
      text,
      flag
    ).subscribe(
      (data) => {
        this.getFishboneParameter('');
        this.getFishboneCauseAnalysis('');
        this.dataService.passSpinnerFlag(false, true);
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
   * get all RCA ids list.
   */
  rca_id_list;
  getRcaIdList(data) {
    this.rca_id_list = data;
  }
  fishBoneSavedData = {};

  saveCauseData(id, key, parameter_id) {
    if (!this.fishBoneSavedData['causes']) {
      this.fishBoneSavedData['causes'] = {};
    }
    this.fishBoneSavedData['causes'][parameter_id] = {
      id: id,
      key: key,
      parameter_id: parameter_id,
    };
  }

  saveSubCauseData(text, id, causeId) {
    if (!this.fishBoneSavedData['subcauses']) {
      this.fishBoneSavedData['subcauses'] = {};
    }
    this.fishBoneSavedData['subcauses'][causeId] = {
      id: id,
      causeId: causeId,
      text: text,
    };
  }

  onFishBoneSave() {
    let causeValues;
    let subCauseValues;
    this.dataService.passSpinnerFlag(false, false);
    if (this.fishBoneSavedData && this.fishBoneSavedData['causes']) {
      causeValues = Object.values(this.fishBoneSavedData['causes']);
      causeValues.forEach((causeValue) => {
        if (this.fishboneParameter[causeValue['key']]) {
          this.submitCause(
            causeValue['id'],
            causeValue['key'],
            causeValue['parameter_id']
          );
        }
      });
    }
    if (this.fishBoneSavedData && this.fishBoneSavedData['subcauses']) {
      subCauseValues = Object.values(this.fishBoneSavedData['subcauses']);
      subCauseValues.forEach((subCauseValue) => {
        if (
          this.fishboneParameterSubCauseObj[
            'subCause' + subCauseValue['causeId']
          ]
        ) {
          this.submitSubCause(
            subCauseValue['text'],
            subCauseValue['id'],
            subCauseValue['causeId']
          );
        }
      });
    }
    this.getIncident();
  }

  isEmptyObject(obj) {
    if (!obj) {
      return true;
    }
    return Object.keys(obj).length === 0;
  }

  onFishBoneCancel() {
    this.fishBoneSavedData = {};
    this.getFishboneCauseAnalysis('');
    this.getIncident();
  }

  /**
   * submit the new fishbone cause.
   */
  submitCause(id, key, parameter_id) {
    this.SafetyAndSurveillanceCommonService.postFishboneCause(
      this.selectedFormattedData.id,
      parameter_id,
      this.fishboneParameter[key]
    ).subscribe(
      (data) => {
        let classList = document.getElementById(id).classList;
        let btnClassList = document.getElementById(id + 'Btn').classList;
        classList.add('d-none');
        btnClassList.remove('d-none');
        this.fishboneParameter[key] = '';
        this.getFishboneParameter('');
        this.getFishboneCauseAnalysis('');

        if (this.selectedFormattedData.status != 'capa_in_progress') {
          this.selectedFormattedData.status = 'capa_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncident();
              this.msg = 'Successfully updated';
              this.snackbarService.show(this.msg, false, false, false, false);
            },
            (error) => {
              this.getIncidents();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        } else {
          this.getIncident();
        }
        this.dataService.passSpinnerFlag(false, true);
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
   * cancel the new fishbone cause.
   */
  cancelCause(id, key, parameter_id) {
    // this.fishBoneSavedData={}
    // this.getIncident()
    this.fishboneParameter[key] = '';
    let classList = document.getElementById(id).classList;
    let btnClassList = document.getElementById(id + 'Btn').classList;
    classList.add('d-none');
    btnClassList.remove('d-none');
    if (
      this.fishBoneSavedData['causes'] &&
      this.fishBoneSavedData['causes'][parameter_id]
    ) {
      delete this.fishBoneSavedData['causes'][parameter_id];
    }
  }

  /**
   * cancel create new question.
   */
  cancelQuestion(itemId) {
    this.whywhyQuestionBtns['question' + itemId] = false;
    this.getQuestionAnalysis('', '');
  }

  /**
   * create new fishbone sub cause.
   */
  submitSubCause(text, id, causeId) {
    this.SafetyAndSurveillanceCommonService.postFishboneSubCause(
      causeId,
      this.fishboneParameterSubCauseObj['subCause' + causeId]
    ).subscribe(
      (data) => {
        let classList = document.getElementById(text + id).classList;
        let btnClassList = document.getElementById(
          text + 'SubCause' + id
        ).classList;
        classList.add('d-none');
        btnClassList.remove('d-none');
        this.fishboneParameterSubCauseObj['subCause' + causeId] = '';
        this.getFishboneParameter('');
        this.getFishboneCauseAnalysis('');
        if (this.selectedFormattedData.status != 'capa_in_progress') {
          this.selectedFormattedData.status = 'capa_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncident();
            },
            (error) => {
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        } else {
        }
        this.dataService.passSpinnerFlag(false, true);
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
   * cancel new fishbone sub cause.
   */
  cancelSubCause(text, id, causeId) {
    let classList = document.getElementById(text + id).classList;
    let btnClassList = document.getElementById(
      text + 'SubCause' + id
    ).classList;
    classList.add('d-none');
    btnClassList.remove('d-none');
    this.fishboneParameterSubCauseObj['subCause' + causeId] = '';
    if (
      this.fishBoneSavedData['subcauses'] &&
      this.fishBoneSavedData['subcauses'][causeId]
    ) {
      delete this.fishBoneSavedData['subcauses'][causeId];
    }
  }

  /**
   * cancel posting new ans.
   */
  cancelAns(id1, id2) {
    this.whywhyAnsBtns['ans' + id1 + '' + id2] = true;
    this.getQuestionAnalysis('', '');
  }

  /**
   * create new category.
   */
  submitNewCategory() {
    let key = this.fishboneNewCategory.name.split(' ').join('_');
    this.fishboneNewCategory.key = key;
    this.fishboneNewCategory.incident_id = this.selectedFormattedData.id;
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.postFishboneParameter(
      this.fishboneNewCategory
    ).subscribe(
      (data) => {
        this.showfishboneNewCategory = false;
        this.fishboneNewCategory = {
          name: '',
          key: '',
          description: '',
          incident_id: null,
        };
        this.getFishboneParameter('');
        this.getFishboneCauseAnalysis('');
        this.dataService.passSpinnerFlag(false, true);
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
   * cancel create new category.
   */
  cancelNewCategory() {
    this.showfishboneNewCategory = false;
    this.fishboneNewCategory = {
      name: '',
      key: '',
      description: '',
      incident_id: null,
    };
  }

  /**
   * get all questions for analysis.
   */
  latestQuestion;
  getQuestionAnalysis(id, answer?) {
    this.dataService.passSpinnerFlag(true, true);
    this.question = '';
    this.SafetyAndSurveillanceCommonService.getQuestionAnalysis(
      this.selectedFormattedData.id
    ).subscribe(
      (data) => {
        this.whywhyQuestionAnalysis = data;
        this.latestQuestion =
          this.whywhyQuestionAnalysis[this.whywhyQuestionAnalysis.length - 1];

        if (answer) {
          this.SafetyAndSurveillanceCommonService.postNewAns(
            this.latestQuestion['id'],
            answer
          ).subscribe((data) => {
            this.getQuestionAnalysis('');
            this.answer = '';
          });
        }

        this.whywhyAnsBtns = {};
        this.whywhyQuestionBtns = {};

        this.whyPostAns = {};
        this.whywhyQuestionAnalysis.forEach((element) => {
          this.whywhyQuestionBtns['question' + element.id] = false;
          element.answers.forEach((ele) => {
            this.whywhyAnsBtns['ans' + element.id + '' + ele.id] = false;
          });
          this.whyPostAns['ans' + element.id] = '';
        });
        this.answer = '';
        this.dataService.passSpinnerFlag(false, true);
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
   * update the questions.
   */
  updateQuestion(questionId, question) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.updateQuestion(
      questionId,
      question
    ).subscribe(
      (data) => {
        this.getQuestionAnalysis('');
        if (this.selectedFormattedData.status != 'capa_in_progress') {
          this.selectedFormattedData.status = 'capa_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncident();
            },
            (error) => {
              this.getIncident();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        } else {
          this.getIncident();
        }
        this.dataService.passSpinnerFlag(false, true);
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
   * update the ans.
   */
  updateAns(ansId, ans, rca) {
    this.dataService.passSpinnerFlag(true, true);

    this.SafetyAndSurveillanceCommonService.updateAns(
      ansId,
      ans,
      rca
    ).subscribe(
      (data) => {
        this.getQuestionAnalysis('');
        if (this.selectedFormattedData.status != 'capa_in_progress') {
          this.selectedFormattedData.status = 'capa_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncident();
            },
            (error) => {
              this.getIncident();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        } else {
          this.getIncident();
        }
        this.dataService.passSpinnerFlag(false, true);
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
   * delete the selected ans.
   */
  deleteAns(type, id) {
    this.dataService.passSpinnerFlag(true, true);

    this.SafetyAndSurveillanceCommonService.deleteFishboneCauseSubcause(
      id,
      type
    ).subscribe(
      (data) => {
        this.getQuestionAnalysis('');
        if (this.selectedFormattedData.status != 'capa_in_progress') {
          this.selectedFormattedData.status = 'capa_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncident();
            },
            (error) => {
              this.getIncident();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        } else {
          this.getIncident();
        }
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  updateAnsRca(ansId, ans, rca) {
    if (this.loginUserId == this.selectedFormattedData.investigators[0]) {
      this.dataService.passSpinnerFlag(true, true);
      this.SafetyAndSurveillanceCommonService.updateAns(
        ansId,
        ans,
        rca
      ).subscribe(
        (data) => {
          this.getQuestionAnalysis('');
          if (this.selectedFormattedData.status != 'capa_in_progress') {
            this.selectedFormattedData.status = 'capa_in_progress';
            this.selectedFormattedData.unit =
              this.selectedFormattedData.unit_name;

            delete this.selectedFormattedData.plant;
            this.SafetyAndSurveillanceCommonService.updateNewIncident(
              this.selectedFormattedData
            ).subscribe(
              (responce) => {
                this.getIncident();
              },
              (error) => {
                this.getIncident();
                this.dataService.passSpinnerFlag(false, true);
                this.msg = 'Error occured. Please try again.';
                this.snackbarService.show(this.msg, true, false, false, false);
              },
              () => {}
            );
          } else {
            this.getIncident();
          }
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    }
  }

  /**
   * posting new ans.
   */
  submitNewAns(questionId, ans, i) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.postNewAns(
      questionId,
      ans
    ).subscribe(
      (data) => {
        this.whyPostAns['ans' + questionId] = '';
        let classList = document.getElementById('addNewAns' + i).classList;
        let btnClassList = document.getElementById('addAns' + i).classList;
        classList.remove('d-none');
        btnClassList.add('d-none');
        this.getQuestionAnalysis('');
        if (this.selectedFormattedData.status != 'capa_in_progress') {
          this.selectedFormattedData.status = 'capa_in_progress';
          this.selectedFormattedData.unit =
            this.selectedFormattedData.unit_name;

          delete this.selectedFormattedData.plant;
          this.SafetyAndSurveillanceCommonService.updateNewIncident(
            this.selectedFormattedData
          ).subscribe(
            (responce) => {
              this.getIncident();
            },
            (error) => {
              this.getIncident();
              this.dataService.passSpinnerFlag(false, true);
              this.msg = 'Error occured. Please try again.';
              this.snackbarService.show(this.msg, true, false, false, false);
            },
            () => {}
          );
        } else {
          this.getIncident();
        }
        this.dataService.passSpinnerFlag(false, true);
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
   * cancel posting new ans.
   */
  cancelNewAns(id, i) {
    this.whyPostAns['ans' + id] = '';
    let classList = document.getElementById('addNewAns' + i).classList;
    let btnClassList = document.getElementById('addAns' + i).classList;
    classList.remove('d-none');
    btnClassList.add('d-none');
  }

  /**
   * post new questions for analysis.
   */
  postQuestionAnalysis(id) {
    this.dataService.passSpinnerFlag(false, true);

    if (this.question == '') {
      this.question = 'WHY';
    }
    this.SafetyAndSurveillanceCommonService.postQuestionAnalysis(
      this.selectedFormattedData.id,
      this.question
    ).subscribe(
      (data) => {
        this.getQuestionAnalysis(id, this.answer);
        this.dataService.passSpinnerFlag(false, true);
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
   * cancel posting question.
   */
  cancelWhyQuestion() {
    this.getQuestionAnalysis('', '');
  }
  selectList(event) {
    let index = this.selectedstakeholders.findIndex((data) => {
      return data == '';
    });
    if (index >= 0) {
      this.selectedstakeholders.splice(index, 1);
    }
    this.selectedstakeholders.splice(index, 1);
  }
  decryptData(encryptedData: string, key: any) {
    // Decrypt the value
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    });

    // Convert the decrypted data to a UTF-8 string and return it
    return decrypted.toString(CryptoJS.enc.Utf8);
  }
  /**
   * get all users having close access.
   */
  getAllUsersCloseList(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getAllUsersList(
      unit,
      'close',
      true,
      true
    ).subscribe(
      (data) => {
        this.allInvestigatorList = data;
        const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
        const key = CryptoJS.enc.Hex.parse(encryptionKey);
        this.allInvestigatorList.forEach((item) => {
          // Decrypt email
          item.email = this.decryptData(item.email, key).replace(
            /^"(.*)"$/,
            '$1'
          );

          // Decrypt id
          item.id = Number(this.decryptData(item.id, key));

          // Decrypt name
          item.name = this.decryptData(item.name, key).replace(
            /^"(.*)"$/,
            '$1'
          );

          // Decrypt username
          item.username = this.decryptData(item.username, key).replace(
            /^"(.*)"$/,
            '$1'
          );
        });
        this.dataService.passSpinnerFlag(false, true);
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
   * get all users.
   */
  getAllUsersViewList(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getAllUsersList(
      unit,
      'view',
      true,
      true
    ).subscribe(
      (data) => {
        this.allStakeholdersList = data;
        const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
        const key = CryptoJS.enc.Hex.parse(encryptionKey);
        this.allStakeholdersList.forEach((item) => {
          // Decrypt email
          item.email = this.decryptData(item.email, key).replace(
            /^"(.*)"$/,
            '$1'
          );

          // Decrypt id
          item.id = Number(this.decryptData(item.id, key));

          // Decrypt name
          item.name = this.decryptData(item.name, key).replace(
            /^"(.*)"$/,
            '$1'
          );

          // Decrypt username
          item.username = this.decryptData(item.username, key).replace(
            /^"(.*)"$/,
            '$1'
          );
        });
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  showCauseBtns(id) {
    setTimeout(() => {
      this.editCauseBtnsShow['causeBtn' + id] = true;
    }, 300);
  }
  showSubCauseBtns(causeId, subCauseId) {
    setTimeout(() => {
      this.editSubCauseBtnsShow['subCauseBtn' + causeId + '' + subCauseId] =
        true;
    }, 300);
  }
  showQuestionBtns(id) {
    setTimeout(() => {
      this.whywhyQuestionBtns['question' + id] = true;
    }, 300);
  }
  showAnsBtns(id1, id2) {
    setTimeout(() => {
      this.whywhyAnsBtns['ans' + id1 + '' + id2] = true;
    }, 300);
  }
  closeAllOpenBtns() {
    for (const [key, value] of Object.entries(this.editCauseBtnsShow)) {
      this.editCauseBtnsShow[key] = false;
    }
    for (const [key, value] of Object.entries(this.editSubCauseBtnsShow)) {
      this.editSubCauseBtnsShow[key] = false;
    }
    for (const [key, value] of Object.entries(this.whywhyAnsBtns)) {
      this.whywhyAnsBtns[key] = false;
    }
  }

  getCauseTaskTextHeight(itemId, causeID) {
    let height = document.getElementById(
      'cause' + itemId + causeID
    ).scrollHeight;
    return height;
  }
  getSubCauseTaskTextHeight(causeID, subCauseId) {
    let height = document.getElementById(
      'subCauseTaskText' + causeID + subCauseId
    ).scrollHeight;
    return height;
  }

  /**
   * validate the form fields.
   */
  submitButtonClick;
  validateField(fieldName: string) {
    if (fieldName == 'investigators') {
      return this.selectedInvestigator['id'] == null && this.submitButtonClick
        ? true
        : false;
    }
    if (fieldName == 'stakeholders') {
      return this.selectedstakeholders.length <= 0 && this.submitButtonClick
        ? true
        : false;
    }

    if (typeof this.selectedFormattedData[fieldName] == 'string') {
      return this.selectedFormattedData[fieldName].trim().length <= 0 &&
        this.submitButtonClick
        ? true
        : false;
    } else if (Array.isArray(this.selectedFormattedData[fieldName])) {
      return this.selectedFormattedData[fieldName].length <= 0 &&
        this.submitButtonClick
        ? true
        : false;
    } else if (typeof this.selectedFormattedData[fieldName] == 'number') {
      return this.selectedFormattedData[fieldName] <= 0 &&
        this.submitButtonClick
        ? true
        : false;
    } else {
      return this.updateEvidenceDataValidationObj[fieldName] <= 0 &&
        this.submitButtonClick
        ? true
        : false;
    }
  }

  validationUpdatingForm() {
    let validate = false;
    for (const [key, value] of Object.entries(this.selectedFormattedData)) {
      if (
        typeof this.selectedFormattedData[key] == 'string' ||
        Array.isArray(this.selectedFormattedData[key])
      ) {
        if (
          this.selectedFormattedData.description.trim().length <= 0 ||
          this.selectedFormattedData.immediate_response.trim().length <= 0 ||
          (this.selectedFormattedData.incident_factor['fire_explosion'] &&
            this.selectedFormattedData.duration_of_fire <= 0) ||
          (this.selectedFormattedData.sector['others'] &&
            (this.selectedFormattedData.sector_description?.length <= 0 ||
              !this.commonService.alphaNumericWithoutSpaceValidator(
                this.selectedFormattedData.sector_description
              ))) ||
          (this.selectedFormattedData.incident_factor['others'] &&
            (this.selectedFormattedData.incident_factor_description?.length <=
              0 ||
              !this.commonService.alphaNumericWithoutSpaceValidator(
                this.selectedFormattedData.incident_factor_description
              ))) ||
          (this.selectedFormattedData.damage['others'] &&
            (this.selectedFormattedData.damage_description?.length <= 0 ||
              !this.commonService.alphaNumericWithoutSpaceValidator(
                this.selectedFormattedData.damage_description
              ))) ||
          this.selectedFormattedData.summary.trim().length <= 0 ||
          this.selectedFormattedData.incident_time.length <= 0 ||
          this.selectedFormattedData.incident_date.length <= 0 ||
          this.selectedstakeholders.length <= 0 ||
          this.selectedFormattedData.zone.length <= 0 ||
          this.selectedFormattedData.unit.length <= 0 ||
          this.selectedFormattedData.plant.length <= 0
        ) {
          validate = true;
        }
      } else {
        let serious_injury = 0;
        let fatality = 0;
        for (const [key, value] of Object.entries(
          this.selectedFormattedData.fatality
        )) {
          fatality += this.selectedFormattedData.fatality[key];
        }
        for (const [key, value] of Object.entries(
          this.selectedFormattedData.serious_injury
        )) {
          serious_injury += this.selectedFormattedData.serious_injury[key];
        }
        if (
          this.updateEvidenceDataValidationObj?.sector <= 0 ||
          this.updateEvidenceDataValidationObj?.damage <= 0 ||
          this.updateEvidenceDataValidationObj?.incident_factor <= 0
        ) {
          validate = true;
        }
      }
    }
    return validate;
  }

  /**
   * close the incident report.
   */
  closeIncidentReport() {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedFormattedData.status = 'closed';
    this.selectedFormattedData.unit = this.selectedFormattedData.unit_name;
    delete this.selectedFormattedData.plant;
    this.SafetyAndSurveillanceCommonService.updateNewIncident(
      this.selectedFormattedData
    ).subscribe(
      (responce) => {
        this.getIncidents();
        this.msg = 'Successfully updated';
        this.snackbarService.show(this.msg, false, false, false, false);
      },
      (error) => {
        this.getIncidents();
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }

  findOpenStatusActions(boolean) {
    this.actionStatus = boolean;
  }

  returnCategoryName(item) {
    this.allCategory.forEach((ele) => {
      if (item == ele.acronym) {
        return ele.name;
      }
    });
  }

  /**
   * scroll down to selected tab.
   */
  onContentScroll() {
    let scrollPosition = document.getElementById('incident_report').scrollTop;

    if (
      scrollPosition >=
        document.getElementById('verify_initial_report')?.offsetTop - 150 &&
      scrollPosition <
        document.getElementById('evidence_entry')?.offsetTop - 150
    ) {
      this.selectedOption = 'verify_initial_report';
    } else if (
      scrollPosition >=
        document.getElementById('evidence_entry')?.offsetTop - 150 &&
      scrollPosition <
        document.getElementById('root_cause_analysis')?.offsetTop - 150
    ) {
      this.selectedOption = 'evidence_entry';
    } else if (
      scrollPosition >=
        document.getElementById('root_cause_analysis')?.offsetTop - 150 &&
      scrollPosition < document.getElementById('actions')?.offsetTop - 150
    ) {
      this.selectedOption = 'root_cause_analysis';
    } else if (
      scrollPosition >= document.getElementById('actions')?.offsetTop - 150 &&
      scrollPosition < document.getElementById('comment')?.offsetTop - 150
    ) {
      this.selectedOption = 'actions';
    } else if (
      scrollPosition >=
      document.getElementById('comment')?.offsetTop - 150
    ) {
      this.selectedOption = 'comment';
    }
  }

  onContentInteraction(tab) {
    this.selectedOption = tab;
    // document.getElementById(this.selectedOption).scrollIntoView();
  }

  getTextareaHeight(elementClass) {
    const textarea = document.querySelector(
      `.${elementClass}`
    ) as HTMLTextAreaElement;
    let height = textarea.scrollHeight + 'px';
    return height;
  }

  getTopPositionHeight() {
    const textarea = document.getElementById('root-top-card-height');
    let height = textarea.offsetHeight - 121;
    if (height > 3) {
      return height;
    } else {
      return 2;
    }
  }
  getMarginTopHeight() {
    const textarea = document.getElementById('root-top-card-height');
    let height = textarea.offsetHeight;
    if (height > 124) {
      return 0;
    } else {
      return 124 - height;
    }
  }

  checkEmailValidity(input: any): void {
    if (input && input.dirty) {
      if (!this.isValidEmail(input.value)) {
        input.control.setErrors({ invalidMobile: true });
      }
    }
  }

  isValidEmail(value: any): boolean {
    // Add your email validation logic here (you can use a more complex regex)
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
  }

  isTouchedField(key) {
    this.touchedfields[key] = true;
  }

  onFilterChange() {
    this.disableApply = false;
  }

  rcaAndActionCount(event) {
    this.lengthOfRcaAndAction = event;
  }
}
