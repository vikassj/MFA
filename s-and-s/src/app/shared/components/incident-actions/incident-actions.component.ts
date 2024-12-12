import { Component, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import "moment-timezone";
declare var $: any;

import { SafetyAndSurveillanceCommonService } from '../../service/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { CommonService } from 'src/shared/services/common.service';

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
  selector: 'app-incident-actions',
  templateUrl: './incident-actions.component.html',
  styleUrls: ['./incident-actions.component.css'],
  providers: [
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMAT }
  ],

})
export class IncidentActionsComponent implements OnInit {

  @Input() incidentId: any;
  @Input() rootCauseAnalysis: any;
  @Input() whywhyQuestionAnalysis: any;
  @Input() allUserList: any;
  @Input() allPlantUsers: any;
  @Input() closeAccessList: any;
  @Input() loginUserId: any;
  @Input() selectedFormattedData: any;
  @Output() findOpenStatusActions: EventEmitter<boolean> = new EventEmitter();
  @Output() rca_id_list = new EventEmitter<string>();
  @Output() rcaAndActionCount = new EventEmitter<object>();
  minDate :any;
  columnMode: ColumnMode;
  linkedIssueData = [];
  listOfUsers: any = []
  rca_list:any
  newSubTask = { assignee: null, status: 'Open', summary: '', due_date: '' };
  dropdownList = ['Open', 'Close']
  addingSubObs = -1;
  allRootRcaList: any;
  selectedObjectyptId: any;
  msg: string;
  newDate = new Date();
  actionId: any;
  actionsCount: any;
  loggedInUserDetails: any;
  timeZone : any;

  constructor(private SafetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private commonService: CommonService,
    private renderer: Renderer2,
    private router: Router
  ) {
    window.addEventListener('scroll', this.ngSelectDropdownPosition, true)
   }

  ngOnInit(): void {
    this.timeZone = JSON.parse(sessionStorage.getItem('site-config'))?.time_zone;
    this.minDate = moment(this.minDate).tz(this.timeZone).format("YYYY-MM-DD")
  }

  ngOnChanges(changes: SimpleChanges): void {
    let incidentIdChanged = changes['incidentId'] &&
      changes['incidentId'].currentValue != changes['incidentId'].previousValue;
    let rootCauseAnalysisChanged = changes['rootCauseAnalysis'] &&
      changes['rootCauseAnalysis'].currentValue != changes['rootCauseAnalysis'].previousValue;
    let whywhyQuestionAnalysisChanged = changes['whywhyQuestionAnalysis'] &&
      changes['whywhyQuestionAnalysis'].currentValue != changes['whywhyQuestionAnalysis'].previousValue;
    if (incidentIdChanged || rootCauseAnalysisChanged || whywhyQuestionAnalysisChanged) {

      this.loggedInUserDetails =  this.allPlantUsers.find(user => this.loginUserId == user.id);
      this.getRcaList();
      this.newSubTask = { assignee: this.allUserList[0], status: 'Open', summary: '', due_date: '' }
      this.cancelObs()
    }
  }

  setUserAcronyms() {
    this.allUserList.forEach((user) => {
      user.acronym = this.calculateAcronym(user.name)
    });
    this.allPlantUsers.forEach((user) => {
      user.acronym = this.calculateAcronym(user.name)
    });

  }

  calculateAcronym(name: string): string {
    const words = name.split(' ');
    const acronym = words.map(word => word.charAt(0)).join('').toUpperCase();
    return acronym;
  }

  currentActionAssignees
  changesAssignee() {
  }
  addSubObs() {
    this.newSubTask['summary'] = ''
    this.newSubTask['due_date'] = ''
    this.newSubTask['assignee'] = ''
  }

  /**
   * return class name in ngx-datatable.
   */
  getSoonDelayedRow = (row) => {
    if (row.id) {
      return {
        'open': row['status'] == 'Open',
        'close': row['status'] == 'Close',
      }
    }
  }

  /**
   * get RCA list.
   */
  getRcaList() {
    this.setUserAcronyms()
    this.allRootRcaList = [];

    this.rootCauseAnalysis?.forEach(cause => {

      if (cause.mark_as_rca) {
        this.allRootRcaList.push({ object_type_id: cause.id, object_type: 'im_fb_cause_id', text: cause.cause })
      }
      cause.sub_causes.forEach(subCause => {
        if (subCause.mark_as_rca) {
          this.allRootRcaList.push({ object_type_id: subCause.id, object_type: 'im_fb_subcause_id', text: subCause.sub_cause })
        }
      })
    })
    this.whywhyQuestionAnalysis?.forEach(obj => {

      obj.answers.forEach(ans => {
        if (ans.mark_as_rca) {
          this.allRootRcaList.push({ object_type_id: ans.id, object_type: 'im_ww_answer_id', text: ans.answer })
        }
      })
    })
    this.rcaAndActionCount.emit({rca: this.allRootRcaList.length, action: this.actionsCount})
    // this.linkedIssueData = [];
    // allRootRcaList.forEach((obj, i) =>{
    //   this.getAllActions(obj.object_type, obj.object_type_id, obj.text)
    //   if((allRootRcaList.length - 1) == i){
    //   }
    // })
    this.getAllActions('incident_id', this.incidentId);
  }
  linkedIssuesLoaded=false

  /**
   * get all actions for selected incident.
   */
  getAllActions(type, id) {
    this.linkedIssuesLoaded=false
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.getActions(type, id, '', '', '', '', '','').subscribe(actions => {

      let listOfArray: any = actions;
      this.actionsCount = listOfArray.length;
      let linkedIssueData = [];
      let listOfIds = [];

      this.rcaAndActionCount.emit({rca: this.allRootRcaList.length, action: this.actionsCount})
      // get the causes and subcauses with actions

      this.rca_list={}
      listOfArray.forEach(item => {
        const objectType = item.object_type;
        if (!this.rca_list[objectType]) {
          this.rca_list[objectType] = [];
        }
        if(item.id){
          this.rca_list[objectType].push(item.object_type_id);
        }
      });

      this.rca_id_list.emit(this.rca_list)
      this.allRootRcaList.forEach(ele => {
        let index = listOfIds.findIndex(list => { return list.object_type_id == ele.object_type_id })
        if (index == -1) {
          listOfIds.push(ele)
        }
      })
      let boolean = true;
      if(listOfArray.length==0){
        boolean = false
      }
      console.log('allPlantUsers ',this.allPlantUsers)
      listOfArray.forEach((action, i) => {
        if (action.status == 'Open') {
          boolean = false;
        }
        action.assigneeList = [];
        action.assignee.forEach(ele =>{
          let index = this.allPlantUsers.findIndex( user =>{return ele == user.id});
          if(index >= 0){
            action.assigneeList.push(this.allPlantUsers[index])
          }
        })
        // action.assigneeList = this.allPlantUsers.filter(user => action.assignee?.includes(user.id));
        console.log('assignor ',action.assignor)
        action.assignor = this.allPlantUsers.find(user=>action.assignor==user.id)
        console.log('assignor 1',action.assignor)
        console.log('assignor 1',this.allPlantUsers)
        let index = this.allRootRcaList.findIndex(item => { return (item.object_type_id == action.object_type_id && item.object_type == action.object_type) });
        if (index >= 0) {
          listOfArray[i].text = this.allRootRcaList[index].text;
          linkedIssueData.push(listOfArray[i])
        }
      });

      this.findOpenStatusActions.emit(boolean);
      linkedIssueData.sort((id1, id2) => { return id2.id - id1.id })
      linkedIssueData.sort((id1, id2) => { return id2.object_type_id - id1.object_type_id })
      listOfIds.forEach(list => {
        linkedIssueData.push(
          {
            "summary": "",
            "created_by": null,
            "created_at": "",
            "updated_by": 0,
            "updated_at": null,
            "assignee": null,
            "due_date": "",
            "status": "",
            "image_id": null,
            "description": "",
            "object_type": list.object_type,
            "object_type_id": list.object_type_id,
            "text": list.text,
            "zone": null,
            "unit_name": "",
            "zone_name": ""
          },
        )
      })

      this.linkedIssueData = [...linkedIssueData]
      this.linkedIssuesLoaded = true

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

  getAssigneeTooltip(assigneeList): string {
    return assigneeList.map(user => user.name).join(', ');
  }

  /**
   * create new action.
   */
  creatingAction(object_type, object_type_id, summary, description, assignee, due_date, status) {
    this.dataService.passSpinnerFlag(true, true);
    let currentActionAssignees = assignee.map((ele) => ele.id)
    // let stDate = new Date(this.newSubTask.due_date + ' 00:00:00')
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
    // let dues_date = startDate1
    this.newSubTask['due_date'] = moment(this.newSubTask['due_date']).format('YYYY-MM-DD')  as any

    this.SafetyAndSurveillanceCommonService.creatingAction(object_type, object_type_id, summary, description, currentActionAssignees, this.newSubTask['due_date'], status, this.newSubTask['assignor']).subscribe(actions => {
      this.msg = 'Action created successfully.';
      this.snackbarService.show(this.msg, false, false, false, false);
      this.getAllActions('incident_id', this.incidentId);
      this.selectedObjectyptId = -1;
      this.newSubTask['summary'] = ''
      this.newSubTask['due_date'] = ''
      this.newSubTask['assignee'] = ''

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
   * update action details.
   */
  updateAction(action_id, object_type_id, summary, description, assignee, due_date, status) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.actionUpdate(action_id, object_type_id, summary, description, assignee, due_date, status, '', '').subscribe(actions => {
      this.msg = 'Action updated successfully.';
      this.snackbarService.show(this.msg, false, false, false, false);
      this.getAllActions('incident_id', this.incidentId);
      this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.getAllActions('incident_id', this.incidentId);
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
   * display confirmation popup for delete action.
   */
  removeAction(action_id) {
    this.actionId = action_id;
    $('#deleteIncidentActionModel').modal('show')
  }

  /**
   * delete action.
   */
  deleteAction(){
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.deleteAction(this.actionId).subscribe(data => {
      this.msg = 'Action deleted successfully.';
      $('#deleteIncidentActionModel').modal('hide')
      this.snackbarService.show(this.msg, false, false, false, false);
      this.getAllActions('incident_id', this.incidentId);
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
   * find user having close access or not.
   */
  getUserHaveCloseAccess(){
    return (this.closeAccessList?.findIndex(user =>{return user.id == this.loginUserId}) >= 0)
  }

  /**
   * navigate to action page with selected action id.
   */
  navigateToActions(actionId) {
    this.dataService.passSpinnerFlag(true, true);
    this.SafetyAndSurveillanceCommonService.sendMatomoEvent('Action navigation from observations page', 'Action');
    sessionStorage.setItem('ActionId', JSON.stringify(actionId));
    this.router.navigateByUrl('/safety-and-surveillance/actions');
  }

  /**
   * display options for create new action.
   */
  addNewAction(row) {
    this.selectedObjectyptId = row.object_type_id
    this.newSubTask['summary'] = ''
    this.newSubTask['due_date'] = ''
    this.newSubTask['assignee'] = ''
    this.newSubTask['assignor'] = this.loginUserId
  }

  /**
   * cancel create action.
   */
  cancelObs() {
    this.selectedObjectyptId = -1;
    this.newSubTask['summary'] = ''
    this.newSubTask['due_date'] = ''
    this.newSubTask['assignee'] = ''
  }

  /**
   * disabled the date inputs.
   */
  inputDisabled() {
    var dtToday:any = new Date();
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
  /**
   * set the height of the textarea height.
   */
  getCauseTaskTextHeight(){
    let height = document.getElementById('actionSummary')?.scrollHeight
    if(height > 20){
      return height
    }else{
      return 20
    }
  }
  ngSelectDropdownPosition=(s)=>{
    const elem = document.getElementById("selectUser");
    if(elem?.getBoundingClientRect()){
      const rect = elem.getBoundingClientRect();
      if(rect.top && rect.top > 0){

        let top = rect.top - 240
        let topPosition = top + 'px'

        let bottom = rect.top
        let bottomPosition = bottom + 'px'
        let dropdownPopup = document.getElementsByTagName('ng-dropdown-panel');
        if(dropdownPopup?.length > 0){
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'max-height', '180px')
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'height', '180px')
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'top', topPosition)
          this.renderer?.setStyle(document.getElementsByTagName('ng-dropdown-panel')[0], 'bottom', bottomPosition)
        }
      }
    }

  }
}
