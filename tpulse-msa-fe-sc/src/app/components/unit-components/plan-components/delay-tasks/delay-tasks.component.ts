import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
import { Router } from '@angular/router';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
SnackbarService
@Component({
  selector: 'app-delay-tasks',
  templateUrl: './delay-tasks.component.html',
  styleUrls: ['./delay-tasks.component.scss']
})
export class DelayTasksComponent implements OnInit, OnChanges {
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  tb1_name1: any = "Actual/Scheduled" + '\n' + ' ' + "Start Date"
  tb1_name2: any = "Actual/Scheduled" + '\n' + ' ' + "End Date"
  tb1_name3: any = "Equipment/" + '\n' + ' ' + "Department"
  tb1_name4: any = "Task name" + '\n' + ' ' + "Delay hrs"
  alarmRows: any[] = [];
  alarmRow = [];

  department: any;
  msg: string = '';


  departments: any;



  totalNumberOfTasks: any;
  totalEquipmentNumber: any;
  totalIssuesRaised: any;
  criticalPathDelayedHrs: any;
  gainDelay: string = '';
  numberOfTasksWithNoDelay: any;
  numberOfTasksGain: any;
  numberOfTasksDelayed: any;
  numberOfTasksCriticalPathDelayed: any;
  numberOfTasksCriticalPath: any;
  criticalPathDelayedMin: any;
  numberOfTasksYetToStart: any;
  statusForEquipmentTaskOnly: any;
  completedTasks: any;
  /////////////////////////
  @Input() selectedUnit: any;
  @Input() selectedDepartment: any;
  @Input() selectedVendor: any
  @Input() selectedEquipmentCategory: any;
  escalatedAndDelayedTasks: boolean = false;
  equipments: any[] = [
    {
      'name': 'Vendor002',
      'type': 'vendor'
    },
    {
      'name': 'Vendor1',
      'type': 'vendor'
    },
    {
      'name': 'Heat Exchange',
      'type': 'department'
    },
    {
      'name': 'HK23903',
      'type': 'equipment'
    },
    {
      'name': 'Columns',
      'type': 'equipment'
    }
  ];
  mockDepartments = [
    'All', 'Mechnical', "Engineering"
  ]
  equipmentCategory: any[] = [];
  selectedEquipmentsCategory: string = '';
  escalatedCount:any;
  delayedCount:any;
  constructor(private activityMonitorService: ActivityMonitorService, private router: Router, private dataService: DataService, private snackbarService: SnackbarService) {

  }

  ngOnInit(): void {
    console.log(this.selectedUnit, this.selectedDepartment, this.selectedEquipmentCategory, this.selectedVendor)
    // this.selectedDepartment.id = 'All'
    // this.selectedEquipmentCategory.id = 'All'
    // if(this.selectedEquipmentCategory.id == 'All'){
    //   this.selectedEquipmentCategory.name = 'All'
    // }
    // if(this.selectedDepartment.id && this.selectedEquipmentCategory.id){
    //   this.fetchEquipmentHierarchy();
    //   // this.getDepartment();
    //   this.soonToBeDelay()
    // }
  }


  ngOnChanges() {
    this.delayedCount = undefined
    console.log("msg", this.selectedEquipmentCategory.id, this.selectedDepartment.id)
    if (this.selectedDepartment.name && this.selectedEquipmentCategory.name) {
      this.fetchEquipmentHierarchy();
      // this.getDepartment();
      this.soonToBeDelay()
    }
  }

  fetchEquipmentHierarchy() {
    this.activityMonitorService.fetchEquipmentHierarchy(this.selectedUnit.name).subscribe(
      data => {
        this.equipmentCategory = Object.keys(data);
        this.selectedEquipmentsCategory = this.equipmentCategory[0];
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

  getDepartment() {
    this.activityMonitorService.getDepartment(this.selectedUnit.name).subscribe((data: any) => {
      this.departments = data;

      this.department = this.departments[0];
      this.overviewDetial();
    },
      (error: any) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  selectCategory(category) {
    this.selectedEquipmentCategory = category;
    this.overviewDetial();
  }

  overviewDetial() {
    this.activityMonitorService.overviewDetials(this.selectedUnit.name, this.selectedDepartment.name).subscribe((data: any) => {
      this.totalNumberOfTasks = data['total_number_of_tasks']
      this.totalEquipmentNumber = data['total_equipment_number']
      this.totalIssuesRaised = data['total_issues_raised']
      this.gainDelay = data['gain_or_delay']
      this.criticalPathDelayedHrs = data['critical_path_tasks_delayed']
      // this.criticalPathDelayedMin = data['critical_path_tasks_delayed'].slice(3, 5)
      this.numberOfTasksWithNoDelay = data['number_of_tasks_with_no_delay']
      this.numberOfTasksGain = data['number_of_tasks_gain']
      this.numberOfTasksDelayed = data['number_of_tasks_delayed_']
      this.numberOfTasksCriticalPathDelayed = data['number_of_tasks_critical_path_delayed']
      this.numberOfTasksCriticalPath = data['number_of_tasks_critical_path']
      this.numberOfTasksYetToStart = data['number_of_tasks_yet_to_start']
      this.statusForEquipmentTaskOnly = data['status_for_equipment_task_only']
      this.completedTasks = data['completed_tasks']
      this.soonToBeDelay()
    },
      (error: any) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  soonToBeDelay() {
    console.log("msg", this.selectedEquipmentCategory.id)
    var category_id
    if (this.selectedEquipmentCategory.id == null) {
      category_id = 'All'
    }
    else {
      category_id = this.selectedEquipmentCategory.id
    }
    this.activityMonitorService.soonToBeDelayed(this.selectedUnit.id, this.selectedDepartment.id, category_id, this.selectedVendor.id).subscribe((data: any) => {
      this.alarmRows = data
      if(this.escalatedAndDelayedTasks == true){
        this.getDelayedTasks()
      }
      else if(this.escalatedAndDelayedTasks == false){
        this.esclatedDelay()
        if(this.delayedCount == undefined){
          this.getDelayedTasks()
        }
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

  getSoonDelayedRow = (row: any) => {
    return 'row-color2'
    // 'row-color1': row.taskName == "Task 2",
    // 'row-color2': row.taskName == "Task 1"
  }
  getEscalatedDelayedRow = (row: any) => {
    return 'row-color2'
    // 'row-color2': row.taskName == " "
  }


  onRowSelect($event: any) {
    this.navigateToTask($event.selected[0]);
  }

  selecteDepartment(department: any) {
    this.department = department;
    this.overviewDetial();
  }

  navigateToIssues() {
    if (this.totalIssuesRaised > 0) {
      this.dataService.passCurrentPage('dashboard', true);
      sessionStorage.setItem('issueUnit', JSON.stringify([this.selectedUnit.name, this.department]));
      this.router.navigateByUrl('/activity-monitoring/issues');
    }
  }

  navigateToTask(row: any) {
    this.dataService.passCurrentPage('task', true);
    sessionStorage.setItem('taskFilter', JSON.stringify([this.selectedUnit.name, row.equipment_category, row.department, row.equipment, row.task]));
    this.router.navigateByUrl('/activity-monitoring/task');
  }

  navigateToTaskDetail(row: any) {
    // debugger
    sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: row.unit, equipment_category_id: row.equipment__equipment_category_id, department_id: row.department_id, task_id: row.id }]));
    sessionStorage.setItem('unit-navigation-id', JSON.stringify(row.unit))
    sessionStorage.setItem('selectedTab', 'task')
    this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': row.id } })
  }


  navigateToTaskPage(value: any) {
    if (value > 0) {
      this.dataService.passCurrentPage('task', true);
      sessionStorage.setItem('taskFilter', JSON.stringify([this.selectedUnit.name, undefined, undefined, undefined, undefined]));
      this.router.navigateByUrl('/activity-monitoring/task');
    }
  }
  toggle() {
    this.escalatedAndDelayedTasks = !this.escalatedAndDelayedTasks;
    if(this.escalatedAndDelayedTasks == true){
      this.getDelayedTasks()
    }
    else if(this.escalatedAndDelayedTasks == false){
      this.esclatedDelay()
    }

  }
  esclatedDelay() {
    this.dataService.passSpinnerFlag(true, true);
    var category_id
    if (this.selectedEquipmentCategory.id == null) {
      category_id = 'All'
    }
    else {
      category_id = this.selectedEquipmentCategory.id
    }
    this.activityMonitorService.esclatedDelayed(this.selectedUnit.id, this.selectedDepartment.id, category_id, this.selectedVendor.id).subscribe({
      next:(data:any)=>{
        this.escalatedCount = data?.length
        this.alarmRow = data
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
  getDelayedTasks(){
    this.dataService.passSpinnerFlag(true, true);
    var category_id
    if (this.selectedEquipmentCategory.id == null) {
      category_id = 'All'
    }
    else {
      category_id = this.selectedEquipmentCategory.id
    }
    this.activityMonitorService.getDelayedTasks(this.selectedUnit.id, this.selectedDepartment.id, category_id, this.selectedVendor.id).subscribe({
      next: (data: any) => {
        this.delayedCount = data?.length
        if(this.escalatedAndDelayedTasks == true){
        this.alarmRow = data
        }
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

}
