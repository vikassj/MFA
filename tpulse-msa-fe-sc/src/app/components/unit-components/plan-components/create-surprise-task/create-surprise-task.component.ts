import { Component, Input, OnInit } from '@angular/core';
import { data } from 'jquery';
import { CommonService } from 'src/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { IssuesService } from '../../../../services/issues.service';
import { ActivityMonitorSCurvePendingService } from '../../../../services/s-curve.service';
import { TaskService } from '../../../../services/task.service';

import { SurpriseTaskModel } from 'src/app/shared/models/all-task.model';

@Component({
  selector: 'app-create-surprise-task',
  templateUrl: './create-surprise-task.component.html',
  styleUrls: ['./create-surprise-task.component.scss']
})
export class CreateSurpriseTaskComponent implements OnInit {
  surpriseTaskModel: SurpriseTaskModel;
  chipTags: any = [];
  surpriseTaskShows: boolean = false;
  timePlaceHolder = "00:00:00"
  emails: any;
  firstEmail: any[] = [];
  loggedUser: any;
  @Input() unit: string = '';
  @Input() equipmentCategory: string = '';
  @Input() department: string = '';
  @Input() secondDepartment: string = '';
  equipments: any;
  taskNames: any[];
  message: any;
  firstEquipment: any;
  compareEquipments: any;
  taskObject: any;
  msg: any;
  d = new Date();
  month = this.d.getMonth() + 1;
  maxDate: any = this.d.getFullYear() + "-" + this.month + "-" + this.d.getDate();
  minDate: any = this.d.getFullYear() + "-" + this.month + "-" + this.d.getDate();
  todayDate: any = this.d.getDate() + "-0" + this.month + "-" + this.d.getFullYear();
  constructor(private issuesService: IssuesService,
    private activityMonitorSCurvePendingService: ActivityMonitorSCurvePendingService,
    private taskService: TaskService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    public commonService: CommonService) { }

  ngOnInit() {
    if (this.month == 10 || this.month == 11 || this.month == 12) {
      this.todayDate = this.d.getDate() + "-" + this.month + "-" + this.d.getFullYear();
    }
    this.surpriseTaskModel = new SurpriseTaskModel({});
    this.issuesService.getLoggedUser().subscribe((data) => {
      this.loggedUser = data
      this.surpriseTaskModel.created_by = this.loggedUser;
      this.surpriseTaskModel.expected_start_time = "00:00:00";
      this.surpriseTaskModel.planned_duration_hours = "00:00:00";
      // this.surpriseTaskModel.planned_duration_days = '0';
      this.surpriseTaskModel.date = this.todayDate;
      this.getUserList()
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }
  ngOnChanges(): void {
    this.getEquipmentCategoryEquipments()
  }
  getEquipmentCategoryEquipments() {
    this.issuesService.getEquipmentlistDependsOnUEF(this.unit, this.equipmentCategory, this.department).subscribe((data) => {
      this.equipments = data;
      this.firstEquipment = this.equipments[0];
      this.surpriseTaskModel.equipment = this.firstEquipment;
      //  this.getTaskOverview()
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
  getTaskOverview() {
    // if(this.department == 'All'){
    //   this.department = '';
    //   this.department = this.secondDepartment
    // }
    this.issuesService.getTaskOverview(this.unit, this.equipmentCategory, this.department).subscribe((data) => {
      this.compareEquipments = []
      this.taskObject = data;
      data['message'].forEach((value) => {
        let compareEquipments = Object.keys(value)
        this.compareEquipments.push(compareEquipments[0])
      });
      this.compareEquipments.forEach((value, index) => {
        if (value == this.firstEquipment) {
          let ival = index;
          this.taskNames = data['message'][ival][this.firstEquipment]['tasks']
          // this.surpriseTaskModel.task_name = this.taskNames[0]['id']
        }
      })
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }
  getUserList() {
    this.issuesService.getUserList().subscribe((data) => {
      this.emails = data
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }
  indexValue(data: any) {
    this.taskNames = [];
    this.compareEquipments.forEach((item, index) => {
      if (data == item) {
        let ival = index;
        this.taskNames = this.taskObject['message'][ival][data]['tasks']
      }
    });
  }
  taskId(data: any) {
    this.surpriseTaskModel.task_name = data;
  }
  surpriseTaskAdd() {
    this.surpriseTaskShows = false;
  }
  removeItem(data: any) {
    let index = this.chipTags.findIndex((item: any) => item == data);
    this.chipTags.splice(index, 1);
  }
  addTag(data: any) {
    this.chipTags.push(data);
  }
  surpriseTask() {
    this.surpriseTaskShows = !this.surpriseTaskShows;
  }
  ResetsurpriseTask() {
    //  this.surpriseTaskModel.date = '';
    this.surpriseTaskModel.expected_start_date = '';
    this.surpriseTaskModel.expected_start_date = '';
    this.surpriseTaskModel.expected_start_time = '00:00:00';
    this.surpriseTaskModel.planned_duration_days = '';
    this.surpriseTaskModel.planned_duration_hours = '00:00:00';
    this.surpriseTaskModel.tag_persons = '';
    this.surpriseTaskModel.task_name = '';
    this.surpriseTaskModel.comments = '';

  }
  submitForm() {
    this.surpriseTaskModel.created_by = this.loggedUser;
    this.surpriseTaskModel.unit = this.unit;
    this.surpriseTaskModel.equipment_category = this.equipmentCategory;
    this.surpriseTaskModel.department = this.department;
    this.surpriseTaskModel.date = this.minDate;
    this.taskService.surpriseTask(this.surpriseTaskModel).subscribe((data) => {
      this.ResetsurpriseTask()
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
    this.msg = 'Sucessfully created the surprise task .';
    this.snackbarService.show(this.msg, false, false, false, false);
  }
}
