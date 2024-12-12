import { Component, Input, OnInit, EventEmitter, Output, SimpleChanges, ViewChild, HostListener } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { TaskService } from 'src/app/services/task.service';
import { DataService } from '../../../../../shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
declare var $: any;

import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';

@Component({
  selector: 'app-task-summary',
  templateUrl: './task-summary.component.html',
  styleUrls: ['./task-summary.component.scss'],
})
export class TaskSummaryComponent implements OnInit {
  @Input() selectedUnit: any;
  @Input() equipmentCategory: any;
  @Input() department: any;
  @Input() allTasks: boolean = false;
  @Input() routingData: any;
  @Output() showTaskDetailPage: EventEmitter<any> = new EventEmitter();
  @ViewChild('progressModalClose') progressModalClose;
  @ViewChild('taskCompleteModalClose') taskCompleteModalClose;
  unit;
  unit_id;
  departmentId;
  equipmentCategoryId;
  ColumnMode = ColumnMode;
  SelectionType = SelectionType;

  taskSummaryFilter = [
    { key: 'all_tasks', name: 'All Tasks', count: 0 },
    { key: 'today_tasks', name: 'Todays Tasks', count: 0 },
    { key: 'ongoing_tasks', name: 'Ongoing Tasks', count: 0 },
    { key: 'department_tasks', name: 'Department Tasks', count: 0 },
    { key: 'critical_path_tasks', name: 'Critical Path Tasks', count: 0 },
    { key: 'delayed_tasks', name: 'Delayed Tasks', count: 0 },
    { key: 'my_shift_tasks', name: 'My Shift Tasks', count: 0 },
    { key: 'completed_tasks', name: 'Completed Tasks', count: 0 },
    { key: 'surprise_tasks', name: 'Surprise Tasks', count: 0 },
    { key: 'tasks_going_critical', name: 'Tasks Going Critical', count: 0 }
  ];

  Status: any;
  date: any;
  time: any;
  mannualDateTimeEntry = false;
  rows = [];
  selected = [];
  selectedTaskFilter: any;
  selectedTask: any;
  newTaskProgress: number;
  showTask: boolean = false;
  msg: string;
  updatedPercentage: number;
  pdfData: Object;
  isPdfLoaded: boolean = false;
  taskCount

  equipmentId: number = null;
  availableChecklists: any[] = [];
  selectedChecklistId: number = null;
  selectedChecklist: any = {};
  selectedChecklistColumns: any[] = [];
  selectedChecklistRows: any[] = [];
  userDepartment: any;
  hideSpinner: boolean = false;
  modalHeader
  screenHeight: number;
  noOfRows: number = 0;
  activePage: number = 0;
  rowsLength: number = 0;
  offset: any;
  noTempOfRows: number;
  task_id: any;
  selectedTime: any;
  selectedTaskUpdatingProgress: any;
  constructor(
    private modalService: NgbModal,
    private taskService: TaskService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private sanitizer: DomSanitizer,
    private activityMonitorService: ActivityMonitorService
  ) {
    this.selectedTaskFilter = this.taskSummaryFilter[0];
    this.dataService.getUnitTabs.subscribe((res) => {
      if (res) {
        this.routingData = res.data;
        this.showTask = true;
        // this.dataService.passUnitTabs(null);
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedTaskFilter = this.taskSummaryFilter[0];
    this.selected = [];
    this.unit = this.selectedUnit.name;
    this.unit_id = this.selectedUnit.id;
    this.equipmentCategoryId = this.equipmentCategory?.id;
    this.departmentId = this.department.id;
    let isUnitChanged =
      changes['unit'] &&
      changes['unit'].currentValue != changes['unit'].previousValue;
    let isDepartmentChanged =
      changes['department'] &&
      changes['department'].currentValue != changes['department'].previousValue;
    let isEquipmentCategoryChanged =
      changes['equipmentCategory'] &&
      changes['equipmentCategory'].currentValue !=
      changes['equipmentCategory'].previousValue;
    let isRoutingData =
      changes['routingData'] &&
      changes['routingData'].currentValue !=
      changes['routingData'].previousValue;
      if (
      isUnitChanged ||
      isDepartmentChanged ||
      isEquipmentCategoryChanged ||
      isRoutingData
    ) {
      let selectIndex = JSON.parse(sessionStorage.getItem('navigatingToTask'))

    if (this.task_id != selectIndex?.[0]?.task_id) {
      this.task_id = selectIndex?.[0]?.task_id
      this.taskService.getSelectedFilteredTasks(selectIndex?.[0]?.task_id).subscribe(data => {
        this.onTaskClick(data)
        setTimeout(()=>{
          sessionStorage.removeItem('navigatingToTask')
          sessionStorage.removeItem('selectedTask')
        }, 1000)
      })
    }else{
      if (this.equipmentCategory && this.department) {
        // this.taskSummaryFilter.forEach((task) => {
        //   this.countFilteredTasks(task);
        // });
        this.selectedTaskFilter = sessionStorage.getItem('filterTask') ? JSON.parse(sessionStorage.getItem('filterTask')) : this.taskSummaryFilter[0];
        this.getTaskCount()
        this.getFilteredTasks(this.selectedTaskFilter, false);
        this.dataService.passUnitTabs(null);
      }
    }
    }


  }

  ngOnInit(): void {

    console.log(this.taskSummaryFilter)
    this.selectedTaskFilter = sessionStorage.getItem('filterTask') ? JSON.parse(sessionStorage.getItem('filterTask')) : this.taskSummaryFilter[0];
    sessionStorage.removeItem('filterTask')
    this.getUserDepartment();
  }

  onTaskClick(row) {
    this.showTask = true;
    if (row != null) {
      this.dataService.passUnitTabs({ tab: 'task', data: { task_id: Array.isArray(row) ? row[0].id : row.id } });
      this.showTaskDetailPage.emit(false);
    }
  }


  countFilteredTasks(task) {
    this.dataService.passSpinnerFlag(true, true);
    // this.selectedTaskFilter = task;

    this.taskService.getFilteredTasks(
      this.unit_id,
      task.key,
      this.equipmentCategoryId,
      this.departmentId, this.noOfRows, this.offset
    )
      .subscribe(
        (data: any) => {
          const count = data?.total_count;
          const selectedTaskIndex = this.taskSummaryFilter.findIndex(
            (filter) => filter.key === task.key
          );
          if (selectedTaskIndex !== -1) {
            this.taskSummaryFilter[selectedTaskIndex].count = count;
          }

          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      );
  }

  getFilteredTasks(task, boolean) {
    this.selected = [];
    this.dataService.passSpinnerFlag(true, true);
    this.selectedTaskFilter = task;
    this.taskService.getFilteredTasks(
      this.unit_id,
      task.key,
      this.equipmentCategoryId,
      this.departmentId, 1, 0
    )
      .subscribe(
        (data: any) => {
          // if(task.key==this.selectedTask?.key){
          if (!boolean) {
            this.activePage = 1;
            this.rowsLength = 0;
          }
          this.screenHeight = 0;
          this.offset = -1;
          setTimeout(() => {
            this.rowsLength = data?.total_count
            this.getScreenSize()
          }, 100)
          // this.rows = data.tasks;
          // // Calculate the count based on the length of this.rows
          // const count = data.length;
          // const selectedTaskIndex = this.taskSummaryFilter.findIndex(
          //   (filter) => filter.key === task.key
          // );
          // if (selectedTaskIndex !== -1) {
          //   this.taskSummaryFilter[selectedTaskIndex].count = count;
          // }

          // for (const key in this.taskCount) {
          //   if (Object.prototype.hasOwnProperty.call(this.taskCount, key)) {
          //     const count = this.taskCount[key];
          //     const selectedTaskIndex = this.taskSummaryFilter.findIndex(filter => filter.key === key);

          //     if (selectedTaskIndex !== -1) {
          //       this.taskSummaryFilter[selectedTaskIndex].count = count;
          //     }
          //   }
          // }

          // Object.keys(this.taskCount).forEach(key => {
          //   this.taskSummaryFilter[key].count = this.taskCount[key];

          // });



          // this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      );
  }

  @HostListener('window:resize', ['$event'])
  getScreenSize(event?) {
    let screenSize = window.innerHeight;
    if (this.screenHeight != screenSize) {
      this.screenHeight = screenSize;
      let ss = (this.screenHeight - 225) / 100;
      this.noOfRows = Math.round(ss);
      this.displayActivePage(this.activePage, true);
    }
  }
  displayActivePage(activePageNumber: number, value?: boolean) {
    this.activePage = activePageNumber
    let offset;
    if (this.activePage > 0) {
      offset = Number(this.noOfRows * (this.activePage - 1));
      // end = Number(this.noOfRows * this.activePage) - 1;
      if (this.offset != offset || this.noTempOfRows != this.noOfRows) {
        this.offset = offset == -1 ? 0 : offset
        this.noTempOfRows = this.noOfRows;
        this.getAndDisplayFilteredTasks()
      }
      // if(this.selectedPage == "myIsuues") {
      //   this.getMyIssues()
      // } else {

      // }
    }
  }
  getAndDisplayFilteredTasks() {
    this.selected = [];
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getFilteredTasks(
      this.unit_id,
      this.selectedTaskFilter.key,
      this.equipmentCategoryId,
      this.departmentId, this.noOfRows, this.offset
    )
      .subscribe(
        (data: any) => {
          // if(task.key==this.selectedTask?.key){
          this.rows = data.tasks;

          // Calculate the count based on the length of this.rows
          const count = data?.total_count;
          const selectedTaskIndex = this.taskSummaryFilter.findIndex(
            (filter) => filter.key === this.selectedTaskFilter.key
          );
          if (selectedTaskIndex !== -1) {
            this.taskSummaryFilter[selectedTaskIndex].count = count ? count : 0;
          }

          // for (const key in this.taskCount) {
          //   if (Object.prototype.hasOwnProperty.call(this.taskCount, key)) {
          //     const count = this.taskCount[key];
          //     const selectedTaskIndex = this.taskSummaryFilter.findIndex(filter => filter.key === key);

          //     if (selectedTaskIndex !== -1) {
          //       this.taskSummaryFilter[selectedTaskIndex].count = count;
          //     }
          //   }
          // }

          // Object.keys(this.taskCount).forEach(key => {
          //   this.taskSummaryFilter[key].count = this.taskCount[key];

          // });



          let selectIndex = JSON.parse(sessionStorage.getItem('navigatingToTask'))
          if (!selectIndex?.[0]?.task_id) {
          this.dataService.passSpinnerFlag(false, true);
        }
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = 'Error occured. Please try again.';
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      );
  }

  getAllTaskSummary() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskSummaryFilter.forEach((task) => {
      this.getFilteredTasks(task, false);
      this.dataService.passSpinnerFlag(false, true);
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    });
    this.getFilteredTasks(this.selectedTaskFilter, false);
  }

  selectTaskFilter(task) {
    this.selectedTaskFilter = task;
  }

  getTasks() {
    this.taskService
      .getPrimaryTask(this.unit_id, this.equipmentCategory, this.department.id)
      .subscribe((data) => {
        // this.rows = [data]
      });
  }

  open(content: any, modalClass?: any) {


    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: modalClass,
      })
      .result.then((result) => { });
  }

  onCaptureKnowledge(row) {
    this.dataService.passSpinnerFlag(true, true);
    let captureStatus = !row.is_knowledge_captured;
    this.taskService.captureKnowledge(row.id, captureStatus).subscribe(
      (data) => {
        this.getFilteredTasks(this.selectedTaskFilter, false);
        // this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  onProgressUpdate(row) {
    this.selectedTask = row;
  }

  taskHistory;
  getTaskHistory(row) {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getTaskHistory(row.id).subscribe((data) => {
      this.taskHistory = data;
      this.taskHistory = [...this.taskHistory].reverse()
      this.dataService.passSpinnerFlag(false, true);
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    });
  }

  addToMyShiftTask() {
    const taskIds = this.selected.map((item) => item.id);
    let data = {
      task_ids: taskIds,
    };
    if (taskIds.length > 0) {
      this.taskService.addToMyShiftTask(data).subscribe(
        (data) => {

          // this.taskSummaryFilter.forEach((task) => {
          //   this.getFilteredTasks(task);
          // });
          let myShiftTasks = this.taskSummaryFilter.find(task => task.key === 'my_shift_tasks');
          this.countFilteredTasks(myShiftTasks);
          this.snackbarService.show(
            data['message'],
            false,
            false,
            false,
            false
          );
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = error.error.message;
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      );
    }
  }
  removeFromMyShiftTask() {
    const taskIds = this.selected.map((item) => item.id);
    let data = {
      task_ids: taskIds,
    };
    if (taskIds.length > 0) {
      this.taskService.removeFromMyShiftTask(data).subscribe(
        (data) => {
          this.getFilteredTasks(this.selectedTaskFilter, true);
          this.snackbarService.show(
            'Successfully removed from my shifts!',
            false,
            false,
            false,
            false
          );
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = error.error.message;
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      );
    }
  }



  getSOP(task) {
    this.isPdfLoaded = false

    this.modalHeader = "Standard operation procedure"

    this.dataService.passSpinnerFlag(true, true);
    this.taskService.gettaskSOP(task.id).subscribe(
      (data: any) => {
        this.pdfData = data
        this.isPdfLoaded = true
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    )
  }

  getDrawing(task) {

    this.isPdfLoaded = false
    this.modalHeader = "Drawing"
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getDrawing(task.equipment).subscribe(
      (data) => {

        this.pdfData = data
        this.isPdfLoaded = true
        this.dataService.passSpinnerFlag(false, true);

      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    )
  }


  updateProgress(event: MouseEvent) {

    const progressBarElement: HTMLElement = event.target as HTMLElement;
    const progressBarWidth = progressBarElement.clientWidth;
    const clickPosition = event.offsetX;
    const newProgressPercentage = (clickPosition / progressBarWidth) * 100;

    // Update the progress in your data model
    // this.updatedPercentage = Math.round(Math.min(Math.max(newProgressPercentage, 0), 100))
    this.newTaskProgress = Math.round(Math.min(Math.max(newProgressPercentage, 0), 100))
    // this.selectedTask.actual_percentage_completed = Math.round(Math.min(Math.max(newProgressPercentage, 0), 100));

    // Perform any additional actions, such as sending an API request to update the progress on the server
  }

  updateTaskStatus() {
    this.dataService.passSpinnerFlag(true, true);
    let data;
    let progressData;
    this.time = `${this.selectedTime}:00`

    if (this.selectedTask.actual_percentage_completed > this.newTaskProgress && this.Status != "Reopen") {
      this.snackbarService.show(
        "Progress can't be decreased!",
        true,
        false,
        false,
        false
      );
      this.dataService.passSpinnerFlag(false, true);
      return;
    }
    if(new Date().getTime() < new Date(this.date + ' ' + this.selectedTime).getTime()){
      this.snackbarService.show(
        "Date/Time should not be greater then current date-time",
        true,
        false,
        false,
        false
      );
      this.dataService.passSpinnerFlag(false, true);
      return;
    }
    if (this.Status == 'Start') {
      data = {
        status: this.Status,
        current_date: this.date,
        current_time: this.time,
      };
    } else if (this.Status == 'Update') {

      if (this.newTaskProgress == 100) {
        data = {
          status: "Completed",
          current_date: this.date,
          current_time: this.time,
        };
      } else {
        data = {
          actual_percentage_completed: this.newTaskProgress,
          current_date: this.date,
          current_time: this.time,
        };
      }
    } else if (this.Status == "Reopen") {
      data = {
        status: "Reopen",
        actual_percentage_completed: this.newTaskProgress,
        current_date: this.date,
        current_time: this.time,
      }

      //  progressData = {
      //   actual_percentage_completed: 0,
      // }

      this.taskService.updateTaskProgress(this.selectedTask.id, progressData).subscribe(
        (res) => {
          this.date = null;
          this.time = null;
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = error.error.message;
          this.snackbarService.show(this.msg, true, false, false, false);
        })

    }
    this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe(
      (res) => {
        // this.mannualDateTimeEntry = false
        this.date = this.getFormattedDate();
        this.time = this.getFormattedTime();
        this.getFilteredTasks(this.selectedTaskFilter, true);
        this.progressModalClose.nativeElement.click();
        this.taskCompleteModalClose.nativeElement.click();
        this.snackbarService.show(
          'Successfully updated the progress!',
          false,
          false,
          false,
          false
        );
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  updateTask() {
    const data = {
      status: this.Status,
      current_date: this.date,
      current_time: this.time,
    };
    this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe(
      (res) => {
        this.mannualDateTimeEntry = false;
        this.date = null;
        this.time = null;
        this.getFilteredTasks(this.selectedTaskFilter, true);
        this.progressModalClose.nativeElement.click();
        this.snackbarService.show(
          'Successfully updated the progress!',
          false,
          false,
          false,
          false
        );
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = error.error.message;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  onTaskUpdate(taskStatus, task) {
    this.selectedTask = task;
    this.selectedTaskUpdatingProgress = task;

    if (taskStatus == "Reopen") {
      this.newTaskProgress = 90;
    } else {
      this.newTaskProgress = task.actual_percentage_completed;
    }

    this.Status = taskStatus;
    this.date = this.getFormattedDate()
    this.time = this.getFormattedTime()
  }

  ////////////// Task progress /////////////////
  updateTaskProgress() {
    this.dataService.passSpinnerFlag(true, true);
    if (this.selectedTask.actual_percentage_completed > this.newTaskProgress) {
      this.snackbarService.show(
        "Progress can't be decreased!",
        true,
        false,
        false,
        false
      );
      this.dataService.passSpinnerFlag(false, true);
      return;
    }
    if (this.newTaskProgress) {
      const data = {
        actual_percentage_completed: this.newTaskProgress,
      };
      this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe(
        (res) => {
          // this.getPrimaryTask(this.selectedTask.id);
          this.updateTask();
          // this.getFilteredTasks(this.selectedTaskFilter)
          // this.progressModalClose.nativeElement.click();
          // this.snackbarService.show('Successfully updated the progress!', false, false, false, false);
          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          this.msg = error.error.message;
          this.snackbarService.show(this.msg, true, false, false, false);
        }
      );
    } else {
      this.updateTask();
    }
  }

  // startTask() {
  //   //this.snackbarService.show("Do you want to start this task?", false, false, true, false);
  //   const data = {
  //     "status": this.Status,
  //     "current_date": this.date,
  //     "current_time": this.time
  //   }
  //   this.taskService.updateTaskProgress(this.selectedTask.id, data).subscribe((res) => {
  //     this.mannualDateTimeEntry = false
  //     this.date = null;
  //     this.time = null;
  //     this.getFilteredTasks(this.selectedTaskFilter)
  //     this.snackbarService.show('Successfully started the task!', false, false, false, false);
  //   }, error => {
  //     this.dataService.passSpinnerFlag(false, true);
  //     this.msg = error.error.message;
  //     this.snackbarService.show(this.msg, true, false, false, false);
  //   })
  // }


  getTaskCount() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getTaskCount(this.unit_id,
      this.selectedUnit,
      this.equipmentCategoryId,
      this.departmentId).subscribe((data) => {
        this.taskCount = data

        for (const key in this.taskCount) {
          if (Object.prototype.hasOwnProperty.call(this.taskCount, key)) {
            const count = this.taskCount[key];
            const selectedTaskIndex = this.taskSummaryFilter.findIndex(filter => filter.key === key);
            if (selectedTaskIndex !== -1) {
              this.taskSummaryFilter[selectedTaskIndex].count = count;
            }
          }
        }
      }, error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Unable to fetch equipment checklists.';
        this.snackbarService.show(this.msg, true, false, false, false);
      })
  }


  mannualUpdationOfDateAndTime(booleanValue, task_status, task) {
    if (
      task &&
      task.actual_percentage_completed == 100 &&
      task_status == 'Update'
    ) {
      task_status = 'Completed';
    } else {
      task_status = 'Start';
    }
    this.selectedTask = task;
    this.mannualDateTimeEntry = booleanValue;
    this.Status = task_status;
  }
  taskStatus;

  // taskUpdation(booleanValue,task_status,task){
  //   this.selectedTask = task
  //   this.mannualDateTimeEntry = booleanValue;
  //   this.Status = task_status
  // }

  onSelect({ selected }) {
    console.log('Select Event', selected, this.selected);

    this.selected.splice(0, this.selected.length);
    this.selected.push(...selected);
  }

  toggleTaskPage(booleanVal) {
    this.showTask = booleanVal;
    this.showTaskDetailPage.emit(true);
    if (!this.showTask) {
      this.getFilteredTasks(this.selectedTaskFilter, true)

    }
  }

  onActivate(event) {
    console.log('Activate Event', event);
    console.log(this.selected);
  }

  cellClassRules = {
    'ps-2': () => true, // Always apply the class 'ps-2'
    'custom-border': (params) => params.data.slack == 0, // Apply the class 'custom-border' if cp = 0
  };

  check(pdf) {
    console.log(pdf)
  }

  getEquipmentChecklist(row) {
    this.dataService.passSpinnerFlag(true, true);
    this.equipmentId = row.equipment;
    this.availableChecklists = [];
    this.activityMonitorService.getEquipmentChecklistGroupings(this.equipmentId).subscribe((res: any) => {
      if (res) {
        this.availableChecklists = res;
        this.selectedChecklistId = (res.length > 0) ? ((res[0].checklists.length > 0) ? res[0].checklists[0].id : null) : null;
        if (this.selectedChecklistId != null) {
          this.getSelectedChecklistDetails();
        }
        else {
          this.dataService.passSpinnerFlag(false, true);
        }
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to fetch equipment checklists.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  getSelectedChecklistDetails() {
    this.selectedChecklist = {};
    this.selectedChecklistColumns = [];
    this.selectedChecklistRows = [];
    this.activityMonitorService.getEquipmentChecklistData(this.selectedChecklistId).subscribe((res: any) => {
      if (res) {
        this.selectedChecklist = res[0];
        this.selectedChecklistColumns = this.selectedChecklist.columns.sort((a, b) => a.order - b.order);
        let rows = this.selectedChecklist.rows;
        let keys = Object.keys(rows).map(item => Number(item));
        keys.sort(function (a, b) {
          return a - b;
        });
        keys.forEach(key => {
          let row = {};
          this.selectedChecklistColumns.forEach(column => {
            row[column.id] = rows[key].find(e => e.checklist_column_id === column.id).value;
            row['master_data'] = rows[key];
          });
          this.selectedChecklistRows.push(row);
        });
        this.selectedChecklistRows = [...this.selectedChecklistRows];
        this.dataService.passSpinnerFlag(false, true);
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to fetch equipment data.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  onSelectChecklist(event) {
    this.dataService.passSpinnerFlag(true, true);
    this.selectedChecklistId = Number(event);
    this.getSelectedChecklistDetails();
  }

  onChecklistSave(event) {
    this.dataService.passSpinnerFlag(true, true);
    let data = [];
    event.forEach(item => {
      item.master_data.forEach(element => {
        let obj = {};
        obj['checklist_id'] = element.checklist_value_id;
        obj['value'] = item[element.checklist_column_id];
        data.push(obj);
      });
    });
    this.activityMonitorService.saveEquipmentChecklistData(data).subscribe((res) => {
      if (res) {
        this.getSelectedChecklistDetails();
        this.snackbarService.show('Checklist saved successfully.', false, false, false, false);
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to save equipment checklist data.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  onChecklistSubmit(event) {
    this.dataService.passSpinnerFlag(true, true);
    this.activityMonitorService.submitEquipmentChecklistData(this.selectedChecklistId, event).subscribe((res) => {
      if (res) {
        this.getSelectedChecklistDetails();
        this.snackbarService.show('Checklist submitted successfully.', false, false, false, false);
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to submit equipment checklist.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  getUserDepartment() {
    this.activityMonitorService.getUserDepartment().subscribe((data: any[]) => {
      this.userDepartment = data[0]?.department_name;
      // this.userDepartment = 'Operation';
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  getFormattedTime(): string {
    this.time = new Date()
    const hours = this.time.getHours();
    const minutes = this.time.getMinutes();
    const formattedHours = this.padZero(hours);
    const formattedMinutes = this.padZero(minutes);
    return `${formattedHours}:${formattedMinutes}`;
  }

  private padZero(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }


  getFormattedDate(): string {
    this.date = new Date()
    const year = this.date.getFullYear();
    const month = this.padZero(this.date.getMonth() + 1);
    const day = this.padZero(this.date.getDate());
    return `${year}-${month}-${day}`;

  }

  setValue(event){
    if(event.target.value > 100 ){
      console.log(event)
      console.log(event.target.value)
      this.newTaskProgress = 100
    }
    if(event.target.value < 0 ){
      console.log(event)
      console.log(event.target.value)
      this.newTaskProgress = 0
    }
  }

  checkTimeElapsed(task){

    let plannedDateOfCompletion = `${task.planned_date_to_complete} ${task.planned_time_to_complete}`
    const plannedDate = new Date(plannedDateOfCompletion)
    if(new Date()>plannedDate ||task.status=="COMPLETED"){
      return true
    }else{
      return false
    }

  }

  inputDateDisabled() {
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

    $('#update').attr('max', minDate);
    // $('#endDate').attr('max', maxDate);
  }

  inputDateTimeDisabled(event){
    this.selectedTime = event.target.value;
    let dtToday = new Date();
    var hrs: any = dtToday.getHours();
    var min: any = dtToday.getMinutes();
    var sec: any = dtToday.getSeconds();
    if (hrs < 10)
    hrs = '0' + hrs.toString();
    if (min < 10)
    min = '0' + min.toString();
    if (sec < 10)
    sec = '0' + sec.toString();

    let minDate = ''
    minDate = hrs + ':' + min;
    console.log(minDate)
    $('#updateTime').attr('max', minDate);
  }


}
