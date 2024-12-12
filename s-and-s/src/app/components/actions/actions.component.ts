import { Component, HostListener, OnInit, ViewChild, Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';
import { NgSelectComponent } from '@ng-select/ng-select';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Subscription } from 'rxjs';
import * as CryptoJS from 'crypto-js';
// import { DatePipe } from '@angular/common';
// import { DateFormatPipe } from 'src/shared/pipes/date-format.pipe';
// import { data } from 'jquery';
// import { IDropdownSettings } from 'ng-multiselect-dropdown';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
declare var $: any;
import { number } from 'echarts';
import * as moment from 'moment';

import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { PlantService } from 'src/app/shared/service/plant.service';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SafetyAndSurveillanceDataService } from '../../shared/service/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';

import { IDropdownSettings } from 'ng-multiselect-dropdown/multiselect.model';


@Pipe({ name: 'myPipe' })
export class MyPipe implements PipeTransform {
  transform(val) {
    return val.toUpperCase()
  }
}

const MY_DATE_FORMAT = {
  parse: {
    dateInput: 'MM/DD/YYYY', // this is how your date will be parsed from Input
  },
  display: {
    dateInput: 'DD-MMM-YYYY', // How to display your date on the input
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  }
};
@Component({
  selector: 'app-actions',
  templateUrl: './actions.component.html',
  styleUrls: ['./actions.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ]
})
export class ActionsComponent implements OnInit {

  @ViewChild('obsSearch', { static: true }) obsSearch: NgSelectComponent;
  selectedUnit: any
  ColumnMode: ColumnMode;
  unitsData: any;
  dropdownSettings: IDropdownSettings;
  minDate: any = new Date();
  imageModalData: any = {};
  listOfUsers: any = []
  selectAction: any;
  assignee: any = [];
  newAssignee: any = [];
  listOfIssue: any = [];
  isRouteClicked: boolean = false;
  isRouteActionsClicked: boolean = false;
  subscription: Subscription = new Subscription();
  msg = '';
  totalLength: number = 0;
  filterActionsPopup = false;
  obsDates: any[] = [];
  sndAction: boolean = false;
  sndDescription: boolean = false;
  selectedAssignee = this.assignee[0];
  dropdownList = ['Open', 'Close']
  arraySelect: any[];
  linkedIssueData: any = []
  newSubTask = { summary: '', description: '', due_date: '22-02-2022', assignee: '', approver: '', faultId: '' }
  selectedAssigneeId: any = [];
  selectedId: any = [];
  loginUserId: any;
  assigneesLIstDropdown = []
  selectedPeople: any[] = [];
  selectingPeople: any[] = [];
  allUnits = [];
  actionsData: any;
  allUserList: any = [];
  tempLinkedIssueData: any = [];
  userGroup: any;
  isbeingSearched: boolean = false;
  selectedFaultId: any = [];
  assigneeName: any;
  editActionData: boolean;
  selectedAction: any;
  listOfObservations: any = [];
  disabledApplyBtn = true;
  noDataMsg: string;
  observationList: any;
  obsInterval: any;
  selectedObservation: any;
  unitList: any[];
  setInterval: any;
  units: string[];
  plantImageDetails: {};
  selectedItemDescription: any;
  selectedItemSummary: any;
  commentTagging = [];
  chatboxHide: boolean;
  butDisabled: boolean = true;
  noOfRows: number = 0;
  activePage: any = 0;
  issuesLength: number = 0;
  startIndex: any;
  endIndex: any;
  navigationTo: boolean = true;
  offset: number;
  noTempOfRows: number;
  fromDateFliter: any = '';
  toDateFliter: any = '';
  selectedStatus: any = [];
  selectedFilterAssignee: any = [];
  status_type_id: any;
  statusTypeIds: any[] = [];
  selectAssigneeFilter: any[] = [];
  status_types_list: any = [];
  sortByList: any[] = [];
  selectedSortBy: string = 'dateDesc';
  screenHeight: number = 0;
  actionCommentImage1: any;
  actionCommentImage: any[] = [];
  supportingDocuments: any[] = [];
  file_list: any;
  arrayOfImages: any;
  selectedImageName: any;
  selectedImage: any;
  buttonDis: boolean = true
  selectedActionId: any;
  selectedDescriptionId: any;
  allAssignee: any;
  unitAssignee: Object;
  assignorList: any;
  selectedItemAssignor: any;
  removeOption: boolean;
  actionDue_date: any;
  selectedAssignorId: any;
  actionDocumentImagesUrl: any;
  action_Id: any;
  image_Id: any

  arrayParsedData: any;
  timeZone: any;
  actionId: any;
  constructor(private router: Router, public safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private dataService: DataService, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService,
    private snackbarService: SnackbarService, public commonServices: CommonService, private plantService: PlantService) {
      window.addEventListener('in-page-obs-nav', (evt: CustomEvent) => {
        this.safetyAndSurveillanceDataService.passGlobalSearch(evt.detail)   
      })
     }

  /**
   * On component initialization get all the units and the assignee list.
   * Initialize the dropdown with required settings.
   * set userGroup from session storage.
   */
  ngOnInit(): void {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    this.minDate = moment(this.minDate).tz(this.timeZone).format("YYYY-MM-DD")
    // setTimeout(()=>{
    this.dataService.passSpinnerFlag(true, true);
    this.getAvailableUnits();
    this.getAllAssigneeList();
    this.userGroup = JSON.parse(sessionStorage.getItem('selectedUnitDetails'))?.userGroup;
    this.getAssigneeAccessList('', '')
    // },500)
    // this.sortByList = data['unitModule'].sortByList;
    this.dropdownSettings = {
      idField: 'id',
      textField: 'name',
      enableCheckAll: false,
      itemsShowLimit: 1,
      allowSearchFilter: true,
    };

  }
  //   this.dropdownSettings = {
  //     // singleSelection: false,
  //     idField: 'id',
  //     textField: 'name',
  //     enableCheckAll: false,
  //     itemsShowLimit: 1,
  //     allowSearchFilter: true
  //   };
  //   this.selectedCategory = this.notificationCategories[0]?.id
  // }

  /**
   * pass actions filter to the subscription.
   */
  onRouteClicked() {
    this.safetyAndSurveillanceDataService.passActionsFilter('no', true);
  }

  getActionData() {
    this.offset = 0
    let actionId = sessionStorage.getItem('ActionId');
    this.dataService.passSpinnerFlag(true, true);
    if (actionId) {
      this.dataService.passSpinnerFlag(true, true);
      let screenSize = window.innerHeight;
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 240) / 50;
      this.noOfRows = Math.round(ss);
      this.safetyAndSurveillanceCommonService.getActionsPageNum('', '', this.statusTypeIds, this.fromDateFliter, this.toDateFliter, this.noOfRows, actionId).subscribe({
        next: (data: any) => {
          if (typeof (data) == 'number') {
            this.activePage = data;
            sessionStorage.setItem('selectedPageNum', this.activePage)
            this.filterActions()
          }
          else {
            this.activePage = 1
            this.filterActions()
            this.msg = data.message
            this.snackbarService.show(this.msg, false, false, false, true);
          }
          this.activePage = data;
          sessionStorage.setItem('selectedPageNum', this.activePage)
          this.filterActions()
          // this.fromDateFliter = ''
          // this.toDateFliter = ''
          // this.selectedStatus = []

        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          // this.dataService.passSpinnerFlag(false, true);
        }
      })
    } else {
      this.activePage = 1
      this.filterActions()
    }
    this.getStatus()
  }

  /**
   * get the available observations for the actions.
   */
  getavailableObservations() {
    this.allUnits = [];
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getavailableObservations().subscribe(data => {
      this.listOfIssue = data
      this.observationList = data;
      if (this.listOfIssue?.length > 0) {
        this.listOfIssue.sort((id1, id2) => { return id2.id - id1.id })
        this.listOfIssue.forEach(unit => {
          let index = this.allUnits.findIndex(ele => { return ele == unit.unit })
          if (index == -1) {
            this.allUnits.push(unit.unit)
          }

        })
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
   * get the assignees for the actions.
   */
  getAllAssigneeList() {
    this.dataService.passSpinnerFlag(true, true);
    this.allUserList = [];
    this.safetyAndSurveillanceCommonService.getAllUsersList('', '', false, false).subscribe(data => {
      let arrayData: any = data
      const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      arrayData.forEach(item => {
        // Decrypt email
        item.email = this.decryptData(item.email, key).replace(/^"(.*)"$/, '$1');

        // Decrypt id
        item.id = this.decryptData(item.id, key);

        // Decrypt name
        item.name = this.decryptData(item.name, key).replace(/^"(.*)"$/, '$1');


        // Decrypt username
        item.username = this.decryptData(item.username, key).replace(/^"(.*)"$/, '$1');
      });
      let assignee: any = arrayData
      this.allAssignee = arrayData
      sessionStorage.setItem('allAssignee', JSON.stringify(this.allAssignee))
      assignee.forEach(element => {
        let userMail = sessionStorage.getItem('user-email');
        if (element.email == userMail) {
          this.loginUserId = Number(element.id)
        }
        let userObj = this.allUserList.find(user => user.id == element.id);
        if (!userObj) {
          this.allUserList.push(element)
        }
      });
      this.getSearchObservations();
      this.getActionData();
      this.getavailableObservations();
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
   * open the filter popup and get the statuses of the actions available.
   */
  onFilterClick() {
    this.filterActionsPopup = true
    this.getStatus()
  }

  /**
   * get the statuses to populate in the filter.
   */
  getStatus() {
    this.safetyAndSurveillanceCommonService.getStatus().subscribe({
      next: (data: any) => {
        this.status_types_list = data
        // this.status_types_list = data.map(e =>(e.name))
        this.status_type_id = this.status_types_list[0]?.id
        // this.status_type_id= data.map(e =>(e.id))
        // this.dataService.passSpinnerFlag(false, true);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
      }
    })
  }

  /**
   * on select of any of the status, push it into an array for further use.
   */
  onItemSelect(data) {
    this.statusTypeIds = []
    this.selectedStatus.forEach((element) => {
      this.statusTypeIds.push(element?.id)
    });
    if (this.fromDateFliter === '' || this.toDateFliter === '' || this.fromDateFliter > this.toDateFliter) {
      this.buttonDis = false;
    } else {
      this.buttonDis = true;
    }
  }

  /**
   * on de-select of any of the status, pop it from the selectedIds array for further use.
   */
  onItemDeSelect(data) {
    this.statusTypeIds = []
    this.selectedStatus.forEach((element) => {
      this.statusTypeIds.push(element?.id)
    });
    if (this.fromDateFliter === '' || this.toDateFliter === '' || this.fromDateFliter > this.toDateFliter) {
      this.buttonDis = false;
    } else {
      this.buttonDis = true;
    }
  }

  /**
   * on select of any of the asignee, push it into an array for further use.
   */
  onItemsSelect(data) {
    this.selectAssigneeFilter = []
    this.selectedFilterAssignee.forEach((ele) => {
      this.selectAssigneeFilter.push(ele?.id)
    });
    if (this.fromDateFliter === '' || this.toDateFliter === '' || this.fromDateFliter > this.toDateFliter) {
      this.buttonDis = false;
    } else {
      this.buttonDis = true;
    }
  }

  /**
   * on de-select of any of the asignee, push it into an array for further use.
   */
  onItemsDeSelect(data) {
    this.selectAssigneeFilter = []
    this.selectedFilterAssignee.forEach((ele) => {
      this.selectAssigneeFilter.push(ele?.id)
    })

    if (this.fromDateFliter === '' || this.toDateFliter === '' || this.fromDateFliter > this.toDateFliter) {
      this.buttonDis = false;
    } else {
      this.buttonDis = true;
    }
  }

  decryptUrl(url) {
    var encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
    var encryptedFilepath = url;
    var key = CryptoJS.enc.Hex.parse(encryptionKey);
    const decrypted = CryptoJS.AES.decrypt(encryptedFilepath, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });
    var decryptedFilepath = decrypted.toString(CryptoJS.enc.Utf8);
    return decryptedFilepath.replace(/^"|"$/g, '');
  }

  /**
   * get the actions absed on the filters selected.
   */
  getActionsData() {
    this.assigneesLIstDropdown = [];
    let userId = [];
    this.offset = this.offset ? this.offset < 0 ? 0 : this.offset : 0
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getActions('', '', this.statusTypeIds, this.fromDateFliter, this.toDateFliter, this.noOfRows, this.offset, this.selectAssigneeFilter).subscribe((data: any) => {
      let datas = data['actions']
      datas.forEach((element, i) => {
        datas[i].action_files.forEach((ele, j) => {
          datas[i].action_files[j].url = this.decryptUrl(ele.url);
        })
      });
      this.linkedIssueData = data['actions']
      this.totalLength = data['total_count']
      this.tempLinkedIssueData = data['actions']
      let actionId = sessionStorage.getItem('ActionId');
      if (actionId) {
        this.tempLinkedIssueData.forEach(data => {
          if (data.id == actionId) {
            this.selectAction = data;
          }
        })
        this.selectActionItem(this.selectAction)
        this.scrollToObs();
      } else {
        if (this.selectedPeople?.length > 0) {
          this.linkedIssueData = [];
          this.tempLinkedIssueData.forEach(data => {
            let index = this.selectedPeople.find(user => { return user == data.assignee })
            if (index) {
              this.linkedIssueData.push(data);
            }
          })
        } else {
          this.linkedIssueData = this.tempLinkedIssueData
        }
      }
      if (this.linkedIssueData?.length > 0) {
        this.linkedIssueData = [...this.linkedIssueData]
        this.linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
      }
      this.tempLinkedIssueData?.forEach(element => {
        userId.push(element.assignee)
      })
      if (!this.selectAction?.id) {
        this.selectActionItem(this.linkedIssueData?.[0])
        this.scrollToObs()
      }
      else {
        let selectedIndex = this.linkedIssueData.findIndex(obj => { return obj.id === this.selectAction.id });
        if (selectedIndex >= 0) {
          this.selectActionItem(this.linkedIssueData[selectedIndex])
          this.scrollToObs()
        } else {
          this.selectActionItem(this.linkedIssueData[0])
          this.scrollToObs()
        }
      }
      userId.forEach(id => {
        let index = this.assigneesLIstDropdown.find(user => user.id == id);
        if (!index) {
          let userIndex = this.allUserList.findIndex(userIndex => { return userIndex.id == id })
          if (userIndex >= 0) {
            this.assigneesLIstDropdown.push(this.allUserList[userIndex])
          }
        }
      })
      this.assigneesLIstDropdown = [...this.assigneesLIstDropdown]
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

  /**
   * change the due date on an action and send it to the api to update.
   */
  changeDate(event) {
    let stDate = new Date(this.actionDue_date)
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
    let startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    this.selectAction.due_date = moment(this.actionDue_date).format('YYYY-MM-DD')
    this.actionDue_date = moment(this.actionDue_date).format('YYYY-MM-DD')
    // this.selectAction.due_date=this.formatDate(this.selectAction.due_date)
    this.changingActionStatu(this.selectAction.id, this.selectAction.object_type_id, this.selectAction.summary, this.selectAction.description, this.selectAction.assignee, this.selectAction.due_date, this.selectAction.status, this.selectAction.assignor)
  }

  selectedAssignees = []
  updateItemName(event) {
    // this.selectedAssignees = event.map((ele) => ele.id)
  }
  /**
   * When the assignor is changed, build the request object and call the api to update.
   * @param action_id
   * @param object_type_id
   * @param summary
   * @param description
   * @param assignee_id
   * @param due_date
   * @param status
   * @param assignor
   */
  changingActionAssignor(action_id, object_type_id, summary, description, assignee_id, due_date, status, assignor) {
    if (assignor) {
      this.changingActionStatu(action_id, object_type_id, summary, description, assignee_id, due_date, status, assignor)
    }
  }

  /**
   * When an action is updated and the params are built,
   * call this funtion to make the api call to update an action.
   * @param action_id
   * @param object_type_id
   * @param summary
   * @param description
   * @param assignee_id
   * @param due_date
   * @param status
   * @param assignor
   */
  changingActionStatu(action_id, object_type_id, summary, description, assignee_id, due_date, status, assignor) {
    // this.selectedAssignees = this.selectedId.map((ele)=>ele.id)
    // this.selectedAssigneIds.push(assignee_id)
    let selectedList = [...this.selectedAssignees, ...this.selectAction.assignee]
    let selUnit = JSON.parse(sessionStorage.getItem('selectedUnitDetails'));
    if (selUnit) {
      const jsonData = selUnit;
      this.selectedUnit = jsonData.unitName;
    }
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.actionUpdate(action_id, object_type_id, summary, description, selectedList, due_date, status, assignor, this.selectedUnit).subscribe(data => {
      this.getActionsData()
      this.dataService.passSpinnerFlag(false, true);
      this.selectedAssignees = []
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
   * get username based on name and type.
   * @param name
   * @param type
   * @returns full name || name based on the type
   */
  getUserName(name: any, type: string) {
    let index = this.allUserList.findIndex(ele => { return ele.id == name })
    if (index >= 0) {
      if (type == 'full') {
        return this.allUserList[index].name
      } else {
        return this.allUserList[index].name.slice(0, 1)
      }
    }
  }

  decryptData(encryptedData: string, key: any) {
    // Decrypt the value
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7
    });

    // Convert the decrypted data to a UTF-8 string and return it
    return decrypted.toString(CryptoJS.enc.Utf8)
  }

  createNewAction() {
    this.arrayParsedData = JSON.parse(sessionStorage.getItem('unitAssignee'));
    this.unitAssignee = [...this.arrayParsedData];

    // if (this.totalLength > 0) {
    this.getAssigneeAccessList('', '')
    this.selectedAction = {};
    this.editActionData = false;
    this.newSubTask.approver = sessionStorage.getItem('userName')
    this.newSubTask.summary = ''
    this.newSubTask.description = ''
    this.newSubTask.due_date = ''
    this.selectedAssigneeId = []
    this.selectedAssignorId = this.loginUserId
    this.selectedFaultId = []
    this.actionCommentImage = [];
    this.file_list = [];
    $('#bulkConfirmationModal').modal('show');
  }

  /**
   * getting observations and ordering them.
   */
  getSearchObservations() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getSearchObservations().subscribe(data => {
      this.listOfObservations = data
      if (this.listOfObservations?.length > 0) {
        this.listOfObservations.sort((id1, id2) => { return id2.id - id1.id })
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
   * get the ids of all the assignees.
   */
  selectedAssigneeIds
  changesAssignee() {
    this.selectedAssigneeIds = this.selectedAssigneeId.map((item) => item.id)
  }

  /**
   * open method for the search input.
   */
  OnOpen() {
    if (!this.isbeingSearched) {
      this.obsSearch?.close()
    }
  }

  /**
   * search method for the search input.
   */
  OnSearch() {
    this.isbeingSearched = true;
    this.obsSearch?.open()
  }

  /**
 * close method for the search input.
 */
  OnBlue() {
    this.isbeingSearched = false;
    this.obsSearch?.close()
  }

  /**
   * gets assignee access list based on the unit and close access.
   */
  changeSelectedLinked() {
    this.selectedAssigneeId = [];
    this.commentTagging = [];
    if (this.selectedFaultId['unit']) {
      this.getAssigneeAccessList(this.selectedFaultId['unit'], 'close')
    } else {
      this.getAssigneeAccessList('', 'close')
    }
  }

  /**
   * gets assignee access list based on the unit.
   */
  getAssigneeList(unit) {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getAssigneeList(unit).subscribe(data => {
      sessionStorage.setItem('unitAssignee', JSON.stringify(data));
      this.commentTagging = [];
      let assignee: any = data;
      this.chatboxHide = false;
      assignee?.forEach(ele => {
        this.commentTagging.push({ "key": ele.name, "value": ele.name, "email": ele.email, "id": ele.id, "username": ele.username, "mobile_number": ele.mobile_number, "mobile_token": ele.mobile_token },)
      })
      this.commentTagging = [...this.commentTagging]
      setTimeout(() => {
        this.chatboxHide = true;
      }, 50)
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
   * gets assignee access list based on the unit and close access.
   */
  getAssigneeAccessList(unit, access) {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.getAllUsersList(unit, access, true, true).subscribe(data => {
      let arrayDatas: any = data
      const encryptionKey = '6b27a75049e3a129ab4c795414c1a64e';
      const key = CryptoJS.enc.Hex.parse(encryptionKey);
      arrayDatas.forEach(item => {
        // Decrypt email
        item.email = this.decryptData(item.email, key).replace(/^"(.*)"$/, '$1');

        // Decrypt id
        item.id = Number(this.decryptData(item.id, key));

        // Decrypt name
        item.name = this.decryptData(item.name, key).replace(/^"(.*)"$/, '$1');


        // Decrypt username
        item.username = this.decryptData(item.username, key).replace(/^"(.*)"$/, '$1');
      });

      sessionStorage.setItem('unitAssignee', JSON.stringify(arrayDatas));
      this.assignee = arrayDatas
      this.chatboxHide = false;
      setTimeout(() => {
        this.chatboxHide = true;
      }, 50)
      this.dataService.passSpinnerFlag(false, true);
      this.selectAction.assignee.forEach((email, taggedIndex) => {
        this.assignee?.forEach((allEmail, i) => {
          if (email == allEmail.id) {
            this.assignee.splice(i, 1);
          }
        })
      });
      this.newAssignee = [...this.assignee];
      this.assignorList = JSON.parse(sessionStorage.getItem('unitAssignee'));
      sessionStorage.setItem('allAssignees', JSON.stringify(this.assignee))
      this.unitAssignee = [...this.arrayParsedData];

      let assignorList = JSON.parse(sessionStorage.getItem('allAssignee'))
      let indexAssignor = this.assignorList?.findIndex(ele => { return ele.id == this.selectAction.assignor });
      let indexAssignor1 = assignorList?.findIndex(ele => { return ele.id == this.selectAction.assignor });
      this.removeOption = false;
      if (indexAssignor == -1) {
        if (indexAssignor1 != -1) {
          this.assignorList.push(assignorList[indexAssignor1]);
          this.removeOption = true
        } else {
        }
      } else {
      }
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
   * enables the button to update an action summary.
   */
  showAction() {
    setTimeout(() => {
      this.sndAction = true
    }, 300)
  }

  /**
  * enables the button to update an action description.
  */
  showDescription() {
    setTimeout(() => {
      this.sndDescription = true
    }, 300)
  }

  /**
   * disables the button to update an action description and summary.
   */
  showActionDescription() {
    this.sndAction = false
    this.sndDescription = false
  }

  /**
   * submits the action creation or updation based on the editActionDate.
   */
  submitAction() {
    sessionStorage.setItem('type', 'HSSE/actions/create_action')
    window.dispatchEvent(new CustomEvent('button_click'))
    // let stDate = moment(this.newSubTask.due_date + ' 00:00:00')
    // let startDate: any = stDate.getDate();
    // if (startDate < 10) {
    //   startDate = '0' + startDate;
    // } else {
    //   startDate = startDate;
    // }
    // let startMonth: any = stDate.getMonth() + 1;
    // if (startMonth < 10) {
    //   startMonth = '0' + startMonth;
    // } else {
    //   startMonth = startMonth;
    // }
    // let startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    this.newSubTask.due_date = moment(this.newSubTask.due_date).format('YYYY-MM-DD') as any
    if (this.editActionData) {
      this.dataService.passSpinnerFlag(true, true);
      this.safetyAndSurveillanceCommonService.actionUpdate(this.selectedAction.id, this.selectedFaultId['id'], this.newSubTask.summary, this.newSubTask.description, this.selectedAssigneeIds, this.newSubTask.due_date, this.selectedAction.status, this.selectAction.assignor, this.selectedUnit).subscribe(data => {
        this.getActionsData()
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful action creation/ updation', 'Create/ update action');
        this.dataService.passSpinnerFlag(false, true);
        $('#bulkConfirmationModal').modal('hide');
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
    } else {
      this.dataService.passSpinnerFlag(true, true);
      let object_type
      if (this.selectedFaultId['id']) {
        object_type = "fault_id"
      }
      // console.log(this.selectedUnit)
      this.safetyAndSurveillanceCommonService.creatingAction(object_type, this.selectedFaultId['id'], this.newSubTask.summary, this.newSubTask.description, this.selectedAssigneeIds, this.newSubTask.due_date, 'Open', this.selectedAssignorId, this.file_list).subscribe(data => {
        this.getActionsData()
        this.safetyAndSurveillanceCommonService.sendMatomoEvent('Successful action creation/ updation', 'Create/ update action');
        $('#bulkConfirmationModal').modal('hide');
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
  }

  /**
   * removes the selected assignee from the assignee list.
   */
  removeTaggedEmail(values: any) {
    const index = this.selectAction.assignee.indexOf(values);
    if (index !== -1) {
      this.selectAction.assignee.splice(index, 1); // Remove the email from the array
    }
    this.changingActionStatu(this.selectAction.id, this.selectAction.object_type_id, this.selectAction.summary, this.selectAction.description, this.selectAction.assignee, this.selectAction.due_date, this.selectAction.status, this.selectAction.assignor)
  }

  /**
   * cancels a create action process by hiding the modal.
   */
  cancelAction() {
    $('#bulkConfirmationModal').modal('hide');
    if (this.selectAction['unit_name']) {
      this.getAssigneeAccessList(this.selectAction['unit_name'], 'close')
    } else {
      this.getAssigneeAccessList('', '')
    }
  }

  /**
   * builds the selected action navigation object for any kind of navigation to actions page.
   * @param row
   */
  navigateTo(row) {
    this.dataService.passSpinnerFlag(true, true)
    if (row?.fault_id) {
      this.selectedObservation = this.observationList.find(obs => obs.id === Number(row?.fault_id));
      this.navigateToViewedObs();
      sessionStorage.removeItem('selectedObservation');
    }
  }

  /**
   * navigates to the selected action navigation object for any kind of navigation to actions page.
   */
  navigateToViewedObs() {
    sessionStorage.removeItem('filterData')
    let unit = this.unitList.filter(ele => { return ele.unitName == this.selectedObservation.unit });
    let obj = { ...this.selectedObservation, unit_id: unit[0].id, start_date: unit[0].startDate, end_date: new Date() }
    let availableUnits = JSON.parse(sessionStorage.getItem('unitDetails'));
    let selectedUnitDetails: any = availableUnits.find(unit => unit.unitName === this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnit', this.selectedObservation.unit);
    sessionStorage.setItem('selectedUnitDetails', JSON.stringify(selectedUnitDetails));
    let findUnitId:any = JSON.parse(!sessionStorage.getItem('availableUnits')?sessionStorage.getItem('actionsUnits'):sessionStorage.getItem('availableUnits'))
    for(let [key,value] of Object.entries(findUnitId['IOGP_Category']) as any){
       if(key === this.selectedObservation?.unit){
        sessionStorage.setItem('manually-selected-units',JSON.stringify([value.id]))
       }
    }
    sessionStorage.setItem('searchObservation', JSON.stringify(this.selectedObservation));
    this.safetyAndSurveillanceDataService.passGlobalSearch(obj);
    this.selectedObservation = [];
    this.safetyAndSurveillanceDataService.passDatesAndUnits(unit[0].id, "", "");
    this.router.navigateByUrl('/safety-and-surveillance/observations');
  }

  /**
   * gets all the available units for the logged in user.
   */
  getAvailableUnits() {
    this.dataService.passSpinnerFlag(true, true);
    this.plantService.getAvailableUnits().subscribe(
      (availableUnits: any) => {
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
            // if(this.plantImageDetails){
            if (this.plantImageDetails && Object?.keys(this.plantImageDetails)?.length > 0) {
              this.plantImageDetails['locationMap'].forEach(unit => {
                unit.openCount = (this.unitList.find(data => data.unitName === unit.name)) ? this.unitList.find(item => item.unitName === unit.name)['obsData']['openCount'] : '-';
                unit.closeCount = (this.unitList.find(data => data.unitName === unit.name)) ? this.unitList.find(item => item.unitName === unit.name)['obsData']['closeCount'] : '-';
              });
              this.plantImageDetails = { ...this.plantImageDetails };
              // }
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
        this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
        this.dataService.passSpinnerFlag(false, true);
        // this.noDataMsg = (this.unitList.length > 0) ? 'Please select a Unit to proceed further to view the Unit Dashboard.' : 'You are not mapped to any unit. Please contact the administrator.';

        if (this.unitList.length > 0) {
          this.snackbarService.show(this.noDataMsg, false, false, false, false);
        } else {
          this.snackbarService.show(this.noDataMsg, false, false, false, true);
        }
      }
    )
  }


  /**
   * sets id to be navigated to in the incidents page and navigates to incident page.
   * @param id incident id
   */
  navigateToIncident(id) {
    sessionStorage.setItem('searchIncident', id)
    this.router.navigateByUrl('/safety-and-surveillance/incidents');
  }

  /**
   * Enables apply button
   * @param event
   */
  selectList(event) {
    this.disabledApplyBtn = false;

  }

  /**
   * apply button functionality for the ng-select component.
   * @param select ng-select component
   */
  applyBtn(select: NgSelectComponent) {
    this.disabledApplyBtn = true;
    select.close();
    this.selectedPeople = this.selectingPeople
    this.linkedIssueData = this.tempLinkedIssueData.filter(action => {
      return
    })
    if (this.selectedPeople?.length > 0) {
      this.linkedIssueData = [];
      this.tempLinkedIssueData.forEach(data => {
        let index = this.selectedPeople.find(user => { return user == data.assignee })
        if (index) {
          this.linkedIssueData.push(data);
        }
      })
    } else {
      this.linkedIssueData = this.tempLinkedIssueData
    }
    this.linkedIssueData = [...this.linkedIssueData]
    this.linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
    this.selectActionItem(this.linkedIssueData[0])
  }

  /**
   * select all funtionality.
   */
  selectedAll() {
    this.disabledApplyBtn = false;
    this.selectingPeople = [];
    this.selectingPeople = this.assigneesLIstDropdown.map(ids => { return ids.id });
    this.selectingPeople = [...this.selectingPeople]
  }

  /**
   * deselect all funtionality.
   */
  unSelectAll() {
    this.disabledApplyBtn = false;
    this.selectingPeople = [];
  }

  /**
   * check for the actions which are soon to be delayed.
   * @param row row of the action
   * @returns true or false for the open and close
   */
  getSoonDelayedRow = (row) => {
    if (row.id) {
      return {
        'open': row['status'] == 'Open',
        'close': row['status'] == 'Close',
      }
    }
  }


  inputDisabled() {
    var dtToday: any = new Date();
    // this.timeZone =  JSON.parse( sessionStorage.getItem('site-config'))
    dtToday = moment(dtToday).tz(this.timeZone).format("YYYY-MM-DD")
    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var minDate = year + '-' + month + '-' + day;

    $('#txtDate').attr('min', minDate);
  }

  inputDisable() {
    var dtToday = new Date();

    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    var minDate = year + '-' + month + '-' + day;

    $('#txtDates').attr('min', minDate);
  }

  /**
   * returns class to be added to that row.
   * @param row action row
   * @returns class to be added to that row.
   */
  getCellClass = (row) => {
    return 'actionIson'
  }

  /**
   * Delete action funtionality.
   * @param action_id action to be deleted.
   */
  removeAction(action_id) {
    this.actionId = action_id
    $('#deleteAction').modal('show');

  }

  deleteAction() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteAction(this.actionId).subscribe(data => {
      this.getActionsData()
      $('#deleteAction').modal('hide');
      this.snackbarService.show('Action deleted successfully', false, false, false, true);
      this.dataService.passSpinnerFlag(false, true);
      this.safetyAndSurveillanceCommonService.sendMatomoEvent('Deletion of action', 'Delete action')
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
   * edit action functionality.
   * @param obj action row object.
   */
  editAction(obj) {
    this.selectedAction = obj;
    this.editActionData = true;
    this.newSubTask.approver = sessionStorage.getItem('userName')
    this.newSubTask.summary = obj.summary
    this.newSubTask.description = obj.description
    this.newSubTask.due_date = obj.due_date
    let index = this.listOfIssue.findIndex(obs => { return obs.id == obj.image_id })
    this.commentTagging = [];
    this.getAssigneeList(this.listOfIssue[index]['unit'])
    this.selectedFaultId = this.listOfIssue[index]
    let assigneeIndex = this.assigneesLIstDropdown.findIndex(user => { return user.id == obj.assignee })
    this.selectedAssigneeId = this.assigneesLIstDropdown[assigneeIndex]
    $('#bulkConfirmationModal').modal('show');
  }

  /**
   * hides the filter actions popup.
   */
  onBackClicked() {
    this.filterActionsPopup = false
  }

  /**
   * resets action selection.
   */
  resetSelectedActions() {
    this.filterActionsPopup = false;
    this.selectingPeople = [];
    this.selectedPeople = [];
    this.linkedIssueData = this.tempLinkedIssueData
    this.linkedIssueData = [...this.linkedIssueData]
    this.linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
    this.selectAction = this.linkedIssueData[0]
    this.fromDateFliter = ''
    this.toDateFliter = ''
    this.selectedStatus = []
    this.offset = 0
    this.selectedFilterAssignee = []
    this.selectAssigneeFilter = []
    this.statusTypeIds = []
    this.selectActionItem(this.selectAction)
    this.filterActions()
    this.scrollToObs()
  }

  /**
   * selects action item in the table.
   * @param item action row.
   */
  selectActionItem(item) {
    if (item) {
      this.selectAction = item;
      this.selectedItemSummary = this.selectAction.summary
      this.selectedItemDescription = this.selectAction.description
      this.selectedItemAssignor = this.selectAction.assignor
      this.actionDue_date = this.selectAction.due_date
      this.commentTagging = [];
      this.chatboxHide = true;
      if (this.selectAction['unit_name']) {
        this.getAssigneeList(this.selectAction['unit_name'])
        this.getAssigneeAccessList(this.selectAction['unit_name'], 'close')
      } else {
        this.getAssigneeAccessList('', '')
        this.commentTagging = []
        let allAssignee = JSON.parse(sessionStorage.getItem('allAssignee'))
        allAssignee?.forEach(ele => {
          this.commentTagging.push({ "key": ele.name, "value": ele.name, "email": ele.email, "id": ele.id, "username": ele.username, "mobile_number": ele.mobile_number, "mobile_token": ele.mobile_token },)
        })
        this.commentTagging = [...this.commentTagging]
      }

      this.selectedAssignees = []

      setTimeout(() => {
        sessionStorage.removeItem('ActionId');
        sessionStorage.removeItem('selectedPageNum')
      }, 2000)
    }


  }

  /**
   * gets the description for the selected action item.
   * @param value description
   */
  getDescription(value) {
    this.selectedItemDescription = value;
  }
  /**
  * gets the summary for the selected action item.
  * @param value summary
  */
  getSummary(value) {
    this.selectedItemSummary = value;
  }

  /**
   * returns assignee name for  an action
   * @param name name
   * @param id action id
   * @returns assignee name
   */
  returnAssigneeName(name, id) {
    let index = this.allUserList.findIndex(ele => { return ele.id == id });
    if (typeof (this.allUserList[index].name) == 'string') {
      if (this.allUserList[index].name?.length > 0) {
        return this.allUserList[index].name.slice(0, 1)
      } else {
        return ''
      }
    } else {
      if (this.allUserList[index].name.name?.length > 0) {
        return this.allUserList[index].name.name.slice(0, 1)
      } else {
        return ''
      }
    }

  }

  /**
   * returns assignee full name for  an action
   * @param name name
   * @param id action id
   * @returns assignee full name
   */
  returnAssigneeFullName(name, id) {
    let index = this.allUserList.findIndex(ele => { return ele.id == id });
    if (typeof (this.allUserList[index].name) == 'string') {
      if (this.allUserList[index].name?.length > 0) {
        return this.allUserList[index].name
      } else {
        return ''
      }
    } else {
      if (this.allUserList[index].name.name?.length > 0) {
        return this.allUserList[index].name.name
      } else {
        return ''
      }
    }

  }

  /**
   * resets the selected assignees list.
   */
  addAssignee() {
    this.selectedAssignees = []
  }

  /**
   * scroll to the observations by adding animations
   */
  scrollToObs() {
    setTimeout(() => {
      $('#actionContainer').animate({
        scrollTop: $('#action' + this.selectAction?.id)?.position()?.top - 200

      });

    }, 500);
  }

  /**
   * on click of the actions filter.
   */
  onRouteActionsClicked() {
    this.safetyAndSurveillanceDataService.passActionsFilter('yes', true);
  }

  /**
   * removes and shows hidden buttons.
   * @param btn_id button id
   */
  hideBtns(btn_id) {
    let classList = document.getElementById(btn_id).classList
    classList.add('d-none')
    setTimeout(() => {
      classList.remove('d-none')
    }, 100)
  }

  /**
   * triggered on resize of the windows and calls displayActivePage funtion.
   * @param event window.resize event
   */
  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    if (this.screenHeight != screenSize) {
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 240) / 50;
      this.noOfRows = Math.round(ss);
      this.displayActivePage(this.activePage, true);
    }
  }

  /**
   * displays active page in the pagination component.
   * @param activePageNumber
   * @param value
   */
  displayActivePage(activePageNumber: number, value?: boolean) {
    let num: any = sessionStorage.getItem('selectedPageNum');
    if (num > 0) {
      this.activePage = Number(num)
    } else {
      this.activePage = activePageNumber
    }
    let offset;
    if (this.activePage > 0) {
      offset = Number(this.noOfRows * (this.activePage - 1));
      if (this.offset != offset || this.noTempOfRows != this.noOfRows) {
        this.offset = offset
        this.noTempOfRows = this.noOfRows;
        if (this.offset >= 0 && this.noOfRows > 0) {
          this.getActionsData()
        }
      }
    }
  }

  /**
   * filters actions based on the the selected filters.
   */
  filterActions() {
    this.screenHeight = 0
    this.dataService.passSpinnerFlag(true, true);
    this.offset = -1
    this.activePage = 1
    this.buttonDis = false;
    this.safetyAndSurveillanceCommonService.getActions('', '', this.statusTypeIds, this.fromDateFliter, this.toDateFliter, 1, 1, this.selectAssigneeFilter).subscribe({
      next: (data: any) => {
        this.totalLength = data?.total_count;
        this.getScreenSize()
        this.filterActionsPopup = false
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
      }
    })
  }

  /**
   * disables start date.
   */
  startInputDisabled() {
    let dtToday = new Date();
    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    let minDate = ''
    let maxDate = ''
    minDate = year + '-' + month + '-' + day;

    $('#startDate').attr('max', minDate);
  }

  /**
   * disables end date.
   */
  endInputDisabled() {
    let dtToday = new Date();
    var month: any = dtToday.getMonth() + 1;
    var day: any = dtToday.getDate();
    var year = dtToday.getFullYear();
    if (month < 10)
      month = '0' + month.toString();
    if (day < 10)
      day = '0' + day.toString();

    let minDate = ''
    let maxDate = ''
    minDate = year + '-' + month + '-' + day;

    $('#endDate').attr('max', minDate);
  }

  /**
   * selects file to upload and reads the files to be sent to the api.
   * @param event file select event from the input-file type.
   * @returns file select as a dataUrl
   */
  onSelectFile(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    let allImages = [];
    event.target.files.forEach((ele, i) => {
      let actionImage: any
      this.actionCommentImage1 = ''
      if (ele?.name?.includes('.png') || ele?.name?.includes('.jpg') || ele?.name?.includes('.jpeg') || ele?.name?.includes('.gif')) {
        if (ele.size / 1024 / 1024 <= 5) {
          let mineType = ele.type;
          if (mineType.match(/image\/*/) == null) {
            return;
          }
          let reader = new FileReader();
          reader.readAsDataURL(ele);
          reader.onload = (_event) => {
            actionImage = reader.result;
            this.actionCommentImage1 = reader.result;
            let actionImageName = ele.name

            let data = actionImageName.split('.')
            let row_pathName = Math.floor((Math.random() * 99) * 7) + '' + data[0] + '.' + data[1];

            var file = this.dataURLtoFile(this.actionCommentImage1, row_pathName);
            let base64Image = [file]
            this.dataService.passSpinnerFlag(true, true);
            this.dataService.passSpinnerFlag(true, true);
            allImages.push({ actionImage: this.actionCommentImage1, base64Image, actionImageName })
          }
        } else {
          this.snackbarService.show('Max. size is 5MB', false, false, false, true);
        }
      } else {
        this.snackbarService.show('Please upload an image file (jpg, jpeg, png, gif).', false, false, false, true);
      }
      if (event.target.files.length == (i + 1)) {
        setTimeout(() => {
          allImages.forEach(ele1 => {
            this.safetyAndSurveillanceCommonService.actionImageUpload(this.selectedFaultId['unit'], ele1.base64Image).subscribe(data => {
              this.actionCommentImage.push({ actionImage: ele1.actionImage, actionImageName: ele1.actionImageName, imagePath: data })
              this.file_list = this.actionCommentImage.map(o => o.imagePath[0]);
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
          })
        }, 500)
      }
    })
  }

  /**
   * uploads the selected image file for an action.
   * @param event file upload event from the input-file type.
   * @returns file uploaded as a dataUrl
   */
  onAddSelectActionDocumentsFile(event: any) {
    if (!event.target.files[0] || event.target.files[0].length == 0) {
      return;
    }
    this.actionDocumentImagesUrl = [];
    let allImages = [];
    event.target.files.forEach((ele, index) => {
      if (ele?.name?.includes('.png') || ele?.name?.includes('.jpg') || ele?.name?.includes('.jpeg') || ele?.name?.includes('.gif')) {
        if (ele.size / 1024 / 1024 <= 5) {
          allImages.push(ele)
        } else {
          this.snackbarService.show('Max. size is 5MB', false, false, false, true);
        }
      } else {
        this.snackbarService.show('Please upload an image file (jpg, jpeg, png, gif).', false, false, false, true);
      }
    })
    allImages.forEach((ele, index) => {
      let actionImage: any
      let actionDocumentImage: any = ''
      let mineType = ele.type;
      if (mineType.match(/image\/*/) == null) {
        return;
      }
      let reader = new FileReader();
      reader.readAsDataURL(ele);
      reader.onload = (_event) => {
        actionImage = reader.result;
        actionDocumentImage = reader.result;
        let actionImageName = ele.name

        let data = actionImageName.split('.')
        let row_pathName = Math.floor((Math.random() * 99) * 7) + '' + data[0] + '.' + data[1];

        var file = this.dataURLtoFile(actionDocumentImage, row_pathName);
        let base64Image = [file]
        this.dataService.passSpinnerFlag(true, true);
        this.safetyAndSurveillanceCommonService.createActionImageUpload(this.selectAction['unit_name'], base64Image).subscribe(data => {
          this.actionDocumentImagesUrl.push(data[0])
          if (this.actionDocumentImagesUrl.length == allImages.length) {
            setTimeout(() => {
              this.addActionDocumentFiles(this.selectAction['id'], this.actionDocumentImagesUrl)
            }, 500)
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
    })
  }

  /**
   * selects file and reads the files to be sent to the api for a selected action.
   * @param actionId action id to which the documents are uploaded.
   * @param files files to be uploaded.
   */
  addActionDocumentFiles(actionId, files) {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.addActionDocumentFiles(actionId, files).subscribe(data => {
      this.getActionsData()
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
   * deletes the image from selected comment.
   * @param i selected comment
   */
  deleteSlectedCommentImg(i) {
    this.actionCommentImage.splice(i, 1)
    this.file_list.splice(i, 1)
  }

  /**
   * Returns a mime type file of the image uploaded.
   * @param dataurl dataUrl from the uploaded file
   * @param filename uploaded file name
   * @returns returns a mime type image file.
   */
  dataURLtoFile(dataurl, filename) {
    var arr = dataurl.split(','),
      mime = arr[0].match(/:(.*?);/)[1],
      bstr = atob(arr[1]),
      n = bstr.length,
      u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  /**
   * downloads the selected image.
   * @param imageUrl image url
   */
  downloadImg(imageUrl) {
    if (imageUrl.includes('data:image/jpeg;base64')) {
      let a = document.createElement('a');
      a.href = imageUrl;
      a.download = 'image_' + Math.floor((Math.random() * 99) * 7) + '.jpg';
      document.body.appendChild(a);
      a.click();
    }
    else {
      this.commonServices.fetchImageData(imageUrl).subscribe(
        imageData => {
          let a: any = document.createElement('a');
          a.href = URL.createObjectURL(imageData);
          let imageName = imageUrl.split('/')
          a.download = imageName[imageName.length - 1];
          document.body.appendChild(a);
          a.click();
        },
        error => {
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {
        }
      )
    }
  }

  /**
   * deleted images uploaded to an action.
   * @param actionId action id
   * @param imageId image id
   */
  deleteActionImage(actionId, imageId) {
    this.action_Id = actionId
    this.image_Id = imageId
    $('#deleteActionDocument').modal('show')
  }
  showConfirmationModal(actionId, imageId) {
    this.action_Id = actionId
    this.image_Id = imageId
  }
  deleteObservation() {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyAndSurveillanceCommonService.deleteActionImage(this.action_Id, this.image_Id).subscribe(data => {
      this.msg = 'File deleted successfully';
      $('#deleteActionDocument').modal('hide')
      this.snackbarService.show(this.msg, false, false, false, false);
      this.getActionsData()
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
   * select images to be displayed.
   * @param obj selected image object
   * @param array images array
   */
  selectImageToDisplay(obj, array) {
    let myArray = obj?.url.split("/");
    myArray.reverse()
    this.arrayOfImages = array
    this.selectedImageName = obj.filename
    this.selectedImage = obj;
    $('#actionImageViewer').modal('show');
    // if (!this.selectedImage.file.includes('pdf')) {
    //   this.initiateDrawing();
    // }
    if (obj.url?.includes('.pdf')) {
      let name = obj?.url.split('/');
      name = name[name.length - 1].split('?')[0];
      name = name.replace('.pdf', '');

      // this.supportDocPdfViewerService.show(name, obj?.file);
    } else {
      // this.supportDocPdfViewerService.show('', '');
    }
  }

  /**
   * on select of an image.
   * @param obj image object.
   */
  onImageSelect(obj) {
    this.selectedImage = obj;

    let myArray = obj?.url.split("/");
    myArray.reverse()
    this.selectedImageName = myArray?.[0]
    // if (!this.selectedImage.file.includes('pdf')) {
    //   this.initiateDrawing();
    // }
    if (obj.url?.includes('.pdf')) {
      let name = obj?.url.split('/');
      name = name[name.length - 1].split('?')[0];
      name = name.replace('.pdf', '');

      // this.supportDocPdfViewerService.show(name, obj?.file);
    } else {
      // this.supportDocPdfViewerService.show('', '');
    }
  }

  /**
   * change start date.
   */
  startDatechanges() {
    // let stDate = moment(this.fromDateFliter) as any
    // let startDate: any = stDate.getDate();
    // if (startDate < 10) {
    //   startDate = '0' + startDate;
    // } else {
    //   startDate = startDate;
    // }
    // let startMonth: any = stDate.getMonth() + 1;
    // if (startMonth < 10) {
    //   startMonth = '0' + startMonth;
    // } else {
    //   startMonth = startMonth;
    // }
    // let startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    // let time = moment().format("HH:mm:ss")
    let startDate1 = moment(this.fromDateFliter).format("YYYY-MM-DD")
    this.fromDateFliter = startDate1

    if (this.fromDateFliter === '' || this.toDateFliter === '' || this.fromDateFliter > this.toDateFliter) {
      this.buttonDis = false;
    } else {
      this.buttonDis = true;
    }

    // this.fromDateFliter = this.formatDate(this.fromDateFliter)
    // const selectedDate = new Date(this.fromDateFliter);
    // const options: Intl.DateTimeFormatOptions = {day: '2-digit', month: 'short', year: 'numeric'}
    // this.fromDateFliter = selectedDate.toLocaleDateString('en-US', options)

  }

  /**
   * change end date.
   */
  endDatechanges() {
    // let stDate = moment(this.toDateFliter) as any
    // let startDate: any = stDate.getDate();
    // if (startDate < 10) {
    //   startDate = '0' + startDate;
    // } else {
    //   startDate = startDate;
    // }
    // let startMonth: any = stDate.getMonth() + 1;
    // if (startMonth < 10) {
    //   startMonth = '0' + startMonth;
    // } else {
    //   startMonth = startMonth;
    // }
    // let startDate1 = stDate.getFullYear() + '-' + startMonth + '-' + startDate
    // let time = moment().format("HH:mm:ss")
    let startDate1 = moment(this.toDateFliter).format("YYYY-MM-DD")
    this.toDateFliter = startDate1

    if (this.fromDateFliter === '' || this.toDateFliter === '' || this.fromDateFliter > this.toDateFliter) {
      this.buttonDis = false;
    } else {
      this.buttonDis = true;
    }
  }

  /**
   * restricts the height to be minimum 20.
   * @returns height of the action.
   */
  getactionHeight() {
    let height = document.getElementById('actionHeight')?.scrollHeight
    if (height > 20) {
      return height
    } else {
      return 20
    }
  }

  /**
   * restricts the height to be minimum 20.
   * @returns height of the description.
   */
  getDescriptionHeight() {
    let height = document.getElementById('descriptionHeight')?.scrollHeight
    if (height > 20) {
      return height
    } else {
      return 20
    }
  }
  /**
     * restricts the height to be minimum 20.
     * @returns height of the main action.
     */
  getMainActionHeight() {
    let height = document.getElementById('mainActionHeight')?.scrollHeight
    if (this.selectAction.id != this.selectedActionId) {
      this.selectedActionId = this.selectAction.id
      return 30
    }
    if (height > 30) {
      return height
    } else {
      return 30
    }
  }

  /**
   * restricts the height to be minimum 20.
   * @returns height of the main description.
   */
  getMainDescriptionHeight() {
    let height = document.getElementById('mainDescriptionHeight')?.scrollHeight
    if (this.selectAction.id != this.selectedDescriptionId) {
      this.selectedDescriptionId = this.selectAction.id
      return 30
    }
    if (height > 30) {
      return height
    } else {
      return 30
    }
  }

  /**
   * Formats dates to be used in apis.
   * @param inputDate date to be formatted
   * @returns formatted date - ${day}-${month}-${year}
   */
  formatDate(inputDate) {
    const date = new Date(inputDate + ' 00:00:00');
    const day = String(date.getDate()).padStart(2, '0');
    const month = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(
      date
    );
    const year = String(date.getFullYear()).slice(-2);

    return `${day}-${month}-${year}`;
  }

   // validating the status dropdown
   validateStatus(action){
    if((action.status == 'Open' && ((action.assignee?.indexOf(this.loginUserId) > -1) || (action.assignor == this.loginUserId))) || action.assignor == this.loginUserId || action?.fault_status == 'closed' || action?.incident_status == 'closed'){
      return false;
    }else{
      return true;
    }
  }

  ngOnDestroy() {
    sessionStorage.removeItem('ActionId');
    sessionStorage.removeItem('selectedPageNum')
    this.safetyAndSurveillanceDataService.passActionsFilter('', true);
    this.subscription.unsubscribe();
  }
}
