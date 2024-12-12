import {
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { OverviewService } from 'src/app/shared/services/overview.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
import {
  ColumnMode,
  DatatableComponent,
  SelectionType,
} from '@swimlane/ngx-datatable';
import { Router } from '@angular/router';
import { ModalPdfViewerService } from 'src/shared/services/modal-pdf-viewer.service';
declare var $: any;
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnChanges {
  ColumnMode = ColumnMode;
  selectionType = SelectionType;
  @ViewChild(DatatableComponent) table: DatatableComponent;
  @Input() selectedUnit: any;
  @Input() equipmentCategory: any;
  @Input() department: any;
  @Input() vendor: any;
  last_milestone: any;
  next_milestone: any;
  msg: string = '';
  dashboardDetails: any = {};
  criticalPathIssues: boolean = false;
  overAllUnitData: any;
  filters: any[] = [];
  majorUpdates: any[] = [];
  taskIssuesOverview: any = {};
  milestoneTableData: any[] = [];
  updates: any[] = [
    {
      update:
        '@Ram Kumar has tagged you in the issue#1234 which is in High risk level and it is in critical path number 1 at Task-333',
      location: '120-E-23 Hot Combined Feed Exchanger COLUMN',
      last_updated: '2 hour ago',
    },
    {
      update:
        '@Ram Kumar has tagged you in the issue#1234 which is in High risk level and it is in critical path number 1 at Task-333',
      location: '120-E-23 Hot Combined Feed Exchanger COLUMN',
      last_updated: '2 hour ago',
    },
  ];

  rows: any[] = [
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: true,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: true,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: true,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: false,
    },
    {
      name: 'Heater Jobs',
      planned_start_date: '07 Aug 2023 | 00:00 hrs',
      actual_start_date: 'Yet to start',
      planned_end_date: '31 Aug 2023 | 00:00 hrs',
      actual_end_date: 'Yet to finish',
      actual_percentage: '30%',
      planned_percentage: '40%',
      completed_task: 'Heater Jobs Completed',
      jobsCompletedValue: '3',
      ongoing_task: '1',
      total_task: '7',
      is_critical: true,
    },
  ];
  setInterval: any;
  updatesTotalCount: any = 0;
  updatesOffset: any = 0;
  updatesLimit: any = 7;
  bufferItems: any[] = [];
  overShootingProjectTimeLine: any;
  constructor(
    private router: Router,
    private modalPdfViewerService: ModalPdfViewerService,
    private overviewService: OverviewService,
    private activityService: ActivityMonitorService,
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) { }
  ngOnChanges(changes: SimpleChanges): void {
    this.filters = [this.selectedUnit.name];
    this.getDashboardDetails();
    this.getMilestonesTableData();
    this.getMajorUpdates();
    this.getTasksIssueOverviewData();
    this.getOverShootingProjectTimeLine()
  }

  checkIsCritical({ row, column, value }) {
    if (row.critical) {
      return 'bc-e';
    } else {
      return 'bc-e';
    }
  }

  checkIsCriticalRow({ row, column, value }) {
    if (row.critical) {
      return '';
    } else {
      return '';
    }
  }

  ngOnInit(): void {
    this.selectedUnit = this.selectedUnit
      ? this.selectedUnit
      : JSON.parse(sessionStorage.getItem('units'))[0];
    this.getDashboardDetails();
    this.getMilestonesTableData();
    this.getMajorUpdates();
    this.getTasksIssueOverviewData();
    this.setInterval = setInterval(() => {
      this.getDashboardDetails();
      this.getMilestonesTableData();
      this.getMajorUpdates();
      this.getTasksIssueOverviewData();
    }, 600000);
  }
  getDashboardDetails() {
    this.dataService.passSpinnerFlag(true, true);
    this.activityService
      .getDashboardOverview(
        this.selectedUnit?.name,
        this.equipmentCategory?.name,
        this.department?.name,
        this.vendor.name
      )
      .subscribe({
        next: (res) => {
          if (res) {
            this.dashboardDetails = res['message'];
            this.getLastAndNextMilestone(this.selectedUnit?.id);
          }
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          // this.dataService.passSpinnerFlag(false, true);
        },
      });
  }
  getLastAndNextMilestone(data) {
    this.overviewService.getLastAndNextMilestone(data).subscribe({
      next: (milestone: any) => {
        this.next_milestone = milestone?.next_milestone;
        this.last_milestone = milestone?.last_milestone;
        this.getOverAllUnitData(this.selectedUnit?.id);
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        // this.dataService.passSpinnerFlag(false, true);
      },
    });
  }
  getOverAllUnitData(data) {
    this.overviewService.getOverAllUnitData(data).subscribe({
      next: (UnitData: any) => {
        this.overAllUnitData = UnitData[0];
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      },
    });
  }
  toggle() {
    this.criticalPathIssues = !this.criticalPathIssues;
  }

  getMilestonesTableData() {
    this.milestoneTableData = [];
    this.activityService
      .getMilestoneTableData(this.selectedUnit.id)
      .subscribe((data: any) => {
        this.milestoneTableData = data;
        for (var i = 0; i < this.milestoneTableData.length; i++) {
          this.rows[i] = this.milestoneTableData[i];
        }
      });
  }

  getTasksIssueOverviewData() {
    this.activityService
      .getTaskIssueOverViewData(this.selectedUnit.id)
      .subscribe((data: any) => {
        this.taskIssuesOverview = data;
        this.bufferItems = data.task_overview.slack
      });
  }

  getMajorUpdates() {
    this.activityService
      .getMajorUpdatesData(
        this.selectedUnit.id,
        this.updatesLimit,
        this.updatesOffset
      )
      .subscribe((data: any) => {
        // console.log("major updates :" + JSON.stringify(data))
        this.majorUpdates = data.notifications;
        this.majorUpdates.forEach((ele, i) => {
          let array: any = ele.text
          this.majorUpdates[i].text = array?.split(' ')
        });
        this.majorUpdates = [...this.majorUpdates]
        this.updatesTotalCount = data.total_count;
      });
  }

  updatesPageChanged(event: any) {
    // console.log(event.page)
    this.updatesOffset = (event.page - 1) * this.updatesLimit;
    this.getMajorUpdates();
  }

  navitageToTask(filter) {

    if (filter.page === 'issues') {
      sessionStorage.setItem('storeSeletedPage', filter.navigationDetails.tab);
      sessionStorage.setItem('issuesNavigationFilter', JSON.stringify(filter.navigationDetails));
      //set session navigat to issues.
      sessionStorage.setItem('navigateToAllIssues', JSON.stringify(filter.navigationDetails));
      sessionStorage.setItem('navigateToAllIssuesCount', JSON.stringify(filter.navigationDetails));
      sessionStorage.setItem('selectedUnit', JSON.stringify(this.selectedUnit));
    }
    if (filter.navigationType == 'tab') {
      // if(filter.navigationDetails == 'overall'){
      sessionStorage.setItem(
        'filterTask',
        JSON.stringify(filter.navigationDetails)
      );
      // }

      sessionStorage.setItem('selectedTab', filter.tab);
      sessionStorage.setItem('storeUnit', JSON.stringify(this.selectedUnit));
      if (filter.navigationDetails.key == 'delay-tasks') {
        sessionStorage.setItem('selectedSubTab', filter.navigationDetails.key);
      }
      else if (filter.navigationDetails.key == 'gantt-chart') {
        sessionStorage.setItem('selectedSubTab', filter.navigationDetails.key);
        sessionStorage.setItem('switchToOverShoot', 'critical');
      }
      window.dispatchEvent(new CustomEvent('tab-changed'));
    } 
    else {
      sessionStorage.setItem(
        'dashboard-navigation-filter',
        JSON.stringify(filter.navigationDetails)
      );
      sessionStorage.setItem('storeUnit', JSON.stringify(this.selectedUnit));
      this.router.navigateByUrl('/schedule-control/' + filter.page);
    }
  }

  ngOnDestroy() {
    clearInterval(this.setInterval);
  }

  openPDF(fileUrl: any) {
    let name = fileUrl.split('/');
    name = name[name.length - 1].split('?')[0];
    name = name.replace('.pdf', '');
    this.modalPdfViewerService.show(name, fileUrl);
  }

  getDailyReports() {
    this.dataService.passSpinnerFlag(true, true);
    this.overviewService
      .getDailyExceptionReport(this.selectedUnit.name)
      .subscribe({
        next: (data: any) => {
          if (data.length > 0) {
            this.openPDF(data[0]);
            this.dataService.passSpinnerFlag(false, true);
          } else {
            this.dataService.passSpinnerFlag(false, true);
            this.msg = 'Daily Progress report is not available of this unit.';
            this.snackbarService.show(this.msg, false, false, false, true);
          }
        },
        error: () => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        complete: () => {
          // this.dataService.passSpinnerFlag(false, true);
        },
      });
  }
  returnCountNumber(number) {
    if (number < 0) {
      return -number
    } else {
      return number
    }
  }

  returnFraming(text) {
    let text1 = text.slice(0, 1);
    if (text1 == '$' || text1 == '%') {
      let text2 = text.slice(1, (text.length - 1))
      if (text1 == '$') {
        let returnText = text2.split('_').join(' ')
        return '@' + returnText;
      } else if (text1 == '%') {
        let returnText = text2.split('_').join(' ')
        return returnText;
      }
    } else {
      return text
    }
  }

  styleForNameAndId(text) {
    if (text.includes('$')) {
      return { 'color': '#006699' };
    } else if (text.includes('%')) {
      return { 'color': 'red', 'border-bottom': '1px solid red', 'cursor': 'pointer' }
    }
  }

  navigateToTask(row, text) {
    let text1 = text.slice(0, 1);
    if (text1 == '%') {
      if (row.entity == 'issue') {
        if (text.toLowerCase().includes('issue')) {
          sessionStorage.setItem('storeSeletedPage', 'allIsuues')
          // sessionStorage.setItem('issueCommentId', row.metadata.issue_id)
          sessionStorage.setItem('navigatingToIssue', JSON.stringify([{ unit_id: row.metadata.unit_id, department_id: row.metadata.department_id, issue_number: row.metadata.issue_id }]));
          this.router.navigateByUrl('schedule-control/issues');
        } else {
          sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
          sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
          sessionStorage.setItem('selectedTab', 'task')
          this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': row.metadata.task_id } })
        }
      } else if (row.entity == 'critical_path_task') {
        sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.metadata.unit_id, equipment_category_id: row.metadata.equipment_category_id, department_id: row.metadata.department_id, task_id: row.metadata.task_id }]));
        sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.metadata.unit_id))
        sessionStorage.setItem('selectedTab', 'task')
        this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': row.metadata.task_id } })
      }
      else if (row.entity === 'report') {
        sessionStorage.setItem('reportSelectedUnit', row.metadata.unit_id);
        this.router.navigateByUrl('schedule-control/reports');
      }
    }
  }
  navigateToGanttchart() {
    $('#dateTimeEntryModal').modal('hide');
    this.dataService.passUnitTabs({ 'tab': 'plan', 'data': { 'task_id': '' } })
    sessionStorage.setItem('switchToOverShoot', 'overShoot')
  }
  getOverShootingProjectTimeLine() {
    this.activityService.getOverShootingProjectTimeLine(this.selectedUnit?.id).subscribe({
      next: (data: any) => {
        this.overShootingProjectTimeLine = data
        this.updateFilter()
      },
      error: () => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      complete: () => {
        this.dataService.passSpinnerFlag(false, true);
      }
    })
  }
  updateFilter() {
    this.overShootingProjectTimeLine.equipments = [...this.overShootingProjectTimeLine?.equipments];
    setTimeout(() => {
      this.table.bodyComponent.offsetX = 0;
      this.table.bodyComponent.offsetY = 0;
      this.table.headerComponent.offsetX = 0;
      this.table.offset = 0;
      this.table.recalculateColumns();
      this.overShootingProjectTimeLine.equipments = [...this.overShootingProjectTimeLine?.equipments];
    }, 100);
    /// set rows
    setTimeout(function () { $('datatable-body').scrollTop(1); }, 1);
    setTimeout(function () { $('datatable-body').scrollTop(0); }, 1);
  }
}


export interface TaskOverview {
  task_overview: any;
  task_completion: any;
  inspection_satistics: any;
  issues_statistics: any;
}
