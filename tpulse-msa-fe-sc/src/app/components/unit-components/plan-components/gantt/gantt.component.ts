import { Component, Input, OnChanges, OnInit, OnDestroy } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { AbstractControl, FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { TaskService } from 'src/app/services/task.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { Subscription } from 'rxjs';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';

@Component({
  selector: 'app-gantt',
  templateUrl: './gantt.component.html',
  styleUrls: ['./gantt.component.scss']
})
export class GanttComponent implements OnInit, OnChanges, OnDestroy {
  @Input() selectedUnit: any;
  @Input() selectedEquipmentCategory: any;
  @Input() selectedDepartment: any;
  @Input() selectedVendor: any;
  @Input() equipments: any[] = [];
  taskname: any;
  title = "gfhgf";
  msg: string = '';
  surprise_task_form: FormGroup;
  selectedPeriod: string = '';
  closeResult: string = '';
  isSidebarOpened: boolean = false;
  persons: any[] = ['a@detecttechnologies.com', 'test@detecttechnologies.com', 'support@detecttechnologies.com'];
  predecessorTaskList: any[] = [];
  successorTaskList: any[] = [];
  personList: any[] = [];
  reload: boolean = true;
  data: any;
  depertments: any[] = []
  subscription: Subscription = new Subscription();
  department_id: any;
  showCriticalPathTasks: boolean = false;
  allTasks: boolean = true
  criticalPath: boolean = false
  overShoot: boolean = false
  constructor(private activityService: ActivityMonitorService, private modalService: NgbModal, private formBuilder: FormBuilder, private taskService: TaskService, private dataService: DataService, private snackbarService: SnackbarService) {
  }

  ngOnInit(): void {

  }

  ngOnChanges() {
    if (sessionStorage.getItem('switchToOverShoot') == 'overShoot') {
      this.overShoot = true
      this.criticalPath = false
      this.allTasks = false
    }
    else if (sessionStorage.getItem('switchToOverShoot') == 'critical') {
      this.toggle('criticalPath', true);
    }
    console.log(this.selectedUnit, this.selectedEquipmentCategory, this.selectedDepartment, this.equipments, this.selectedVendor)
    this.initSurpriseTaskForm();
  }

  // checkTaskName(){

  // }

  initSurpriseTaskForm() {
    this.surprise_task_form = this.formBuilder.group({
      equipment_id: ['', Validators.required],
      unit: [this.selectedUnit.id, Validators.required],
      department_id: ['', Validators.required],
      task_name: ['', Validators.required],
      expected_start_date: ['', Validators.required],
      expected_start_time: ['', Validators.required],
      planned_duration_days: [0, Validators.required],
      planned_duration_hours: ['', Validators.required],
      tag_persons: [[], Validators.required],
      comments: ['', Validators.required],
      predecessor_task_id: ['', Validators.required],
      // successor_task_id: ['',Validators.required]
    });
    // this.validation()
  }

  get f(): { [key: string]: AbstractControl } {
    return this.surprise_task_form.controls;
  }

  get tagged_persons(): FormArray {
    return this.surprise_task_form.get("tag_persons") as FormArray;
  }


  addNewPerson() {
    this.tagged_persons.push(this.formBuilder.control(''));
  }

  removePerson(i: number) {
    this.tagged_persons.removeAt(i);
  }

  submitSurpriseTask() {
    // console.log(this.surprise_task_form.value)
    // if (this.surprise_task_form.invalid) {
    //   return;
    // }
    this.surprise_task_form.get('expected_start_time').patchValue(this.surprise_task_form.get('expected_start_time').value + ':00');
    this.surprise_task_form.get('planned_duration_hours').patchValue(this.surprise_task_form.get('planned_duration_hours').value + ':00');
    this.taskService.surpriseTask(this.surprise_task_form.value).subscribe((res) => {
      this.reload = !this.reload;
      this.snackbarService.show('Surprise task created!', false, false, false, false);
      this.toggleSidebar()
      this.initSurpriseTaskForm()
    })
  }

  getTasks() {
    this.dataService.passSpinnerFlag(true, true);

    let selectedEquipmentName = this.equipments.filter(x => x.id == this.f['equipment_id'].value)[0]['name'];
    let selectedEquipmentId = this.equipments.filter(x => x.id == this.f['equipment_id'].value)[0]['id'];
    // console.log(selectedEquipmentId)
    console.log(this.equipments)
    if (this.selectedDepartment.id == 'All') {
      var dept = 'All'
    }
    else {
      dept = this.selectedDepartment.name
    }
    if (this.selectedEquipmentCategory.id == null) {
      var eqpt = 'All'
    }
    else {
      eqpt = this.selectedEquipmentCategory.name
    }
    this.taskService.getTasks(this.selectedUnit.name, eqpt, null, dept, selectedEquipmentId).subscribe(
      (data: any) => {
        console.log(data?.message[0]?.[selectedEquipmentName])
        if (data != undefined) {
          data?.message.forEach((val, ind) => {
            console.log(Object.keys(val))
            if (Object.keys(val)[0] == selectedEquipmentName) {
              console.log(val)
              this.predecessorTaskList = val?.[selectedEquipmentName]?.['tasks'];
              // if(this.predecessorTaskList == []){
              //   this.predecessorTaskList = this.equipments - selectedEquipmentName
              // }
            }
          })
          // this.predecessorTaskList = data?.message[0][selectedEquipmentName]?.['tasks'];
          console.log(this.predecessorTaskList, data)
          this.dataService.passSpinnerFlag(false, true);
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

  getUsers() {
    this.taskService.getUserList().subscribe((data: any[]) => {
      this.personList = data
      console.log(this.personList)
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  getSuccessors() {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getPredecessorSuccessorTasks(this.f['predecessor_task_id'].value).subscribe((res) => {
      if (res) {
        this.successorTaskList = res['successor_tasks'];
      }
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

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
      this.closeResult = `Closed with: ${result}`;
    }, (reason) => {
      this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
    });
  }

  getDismissReason(reason: any): string {
    if (reason === ModalDismissReasons.ESC) {
      return 'by pressing ESC';
    } else if (reason === ModalDismissReasons.BACKDROP_CLICK) {
      return 'by clicking on a backdrop';
    } else {
      return `with: ${reason}`;
    }
  }

  selectPeriod(period) {
    this.selectedPeriod = period;
  }

  toggleSidebar() {
    this.isSidebarOpened = !this.isSidebarOpened;
    if (this.isSidebarOpened) {
      this.getUsers();
      this.initSurpriseTaskForm()
    }
  }

  getAllDepartments() {
    this.activityService.getDepartmentsList().subscribe({
      next: (dept: any) => {
        this.depertments = dept
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

  toggleSurpriseTask(data: any) {
    this.isSidebarOpened = data
    this.getUsers();
    this.initSurpriseTaskForm()
    this.getAllDepartments()
  }
  toggle(name: string, booleanValue: boolean) {
    if (name == 'allTasks') {
      this.allTasks = booleanValue
      this.criticalPath = false
      this.overShoot = false
      this.showCriticalPathTasks = false
      sessionStorage.removeItem('switchToOverShoot')
    }
    else if (name == 'criticalPath') {
      this.criticalPath = booleanValue
      this.allTasks = false
      this.overShoot = false
      this.showCriticalPathTasks = true
      sessionStorage.removeItem('switchToOverShoot')
    }
    else if (name == 'overShoot') {
      this.overShoot = booleanValue
      this.criticalPath = false
      this.allTasks = false
    }
  }
  ngOnDestroy(): void {
    sessionStorage.removeItem('switchToOverShoot')
  }
}
