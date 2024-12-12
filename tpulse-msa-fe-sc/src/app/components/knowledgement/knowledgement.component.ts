import { Component, OnInit } from '@angular/core';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { IssuesService } from 'src/app/shared/services/issues.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { KnowledgeService } from 'src/app/shared/services/knowledge.service';

@Component({
  selector: 'app-knowledgement',
  templateUrl: './knowledgement.component.html',
  styleUrls: ['./knowledgement.component.scss']
})
export class KnowledgementComponent implements OnInit {
  ColumnMode = ColumnMode;
  booleanDataTrue: boolean = false
  // recordRows:any[] =[]
  notificationCategories: any[] = [
    { id: 1, name: 'Inspection' },
    { id: 2, name: 'Scaffolding' },
    { id: 3, name: 'Lighting' },
    { id: 4, name: 'Safety' },
    { id: 5, name: 'Maintenance' },
    { id: 6, name: 'Electrical' },
    { id: 7, name: 'Others' }
  ]
  selectedCategory: any;
  dummy = [1, 2, 3, 4, 5]
  recordRows = []
  unitsList: any;
  selectedUnit_id: any;
  msg: string;
  equipmentCategories: any;
  equipmentCategory_id: any;
  equipmentsList: any[] = [];
  tasks_list: any[] = [];
  equipment_id: any;
  task_id: any;
  selectionType = SelectionType;
  selected: any[] = [];
  linkedIssuesList: any[] = [];
  rowId: any;
  recomondationsAndObservations: any[] = []
  constructor(private knowledgeService: KnowledgeService, private dataService: DataService, private commonService: CommonService, private snackbarService: SnackbarService, private issuesService: IssuesService) { }

  ngOnInit(): void {
    this.selectedCategory = this.notificationCategories[0]?.id
    this.getUnitsList()
  }
  getUnitsList() {
    this.dataService.passSpinnerFlag(true, true)
    this.commonService.getUnitsList().subscribe({
      next: (data: any) => {
        this.unitsList = data;
        // this.selectedUnit_id = this.unitsList?.[0].id
        this.selectedUnit_id = this.unitsList.filter(item => item.id == parseInt(sessionStorage.getItem('storedUnitId')))[0]?.id || this.unitsList[0]?.id;
        this.getEquipmentCategories()
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
  }
  getEquipmentCategories() {
    if (this.selectedUnit_id) {
      sessionStorage.setItem('storedUnitId', this.selectedUnit_id);
      window.dispatchEvent(new CustomEvent('unitchanged'))
      this.dataService.passSpinnerFlag(true, true);
      this.issuesService.getEquipmentCategories(this.selectedUnit_id).subscribe({
        next: (data: any) => {
          if (data.length > 0) {
            this.equipmentCategories = data
            this.equipmentCategory_id = this.equipmentCategories?.[0].id
            this.getEquipments()
          }
          else {
            this.equipmentCategories = []
            this.equipmentsList = []
            this.tasks_list = []
            this.dataService.passSpinnerFlag(false, true);
          }
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
    }
  }
  getEquipments() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getEquipments(this.equipmentCategory_id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.equipmentsList = data
          this.equipment_id = this.equipmentsList?.[0].id
          this.getTasks(this.equipment_id)
        }
        else {
          this.equipmentsList = []
          this.tasks_list = []
          this.dataService.passSpinnerFlag(false, true);
        }
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
  }
  getTasks(equipment_id) {
    this.equipment_id = equipment_id
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getTasks(this.equipment_id).subscribe({
      next: (data: any) => {
        if (data.length > 0) {
          this.tasks_list = data
          this.selected = [this.tasks_list?.[0]]
          this.task_id = this.tasks_list?.[0]?.id
          this.rowId = this.tasks_list?.[0]?.id
          this.getIssuesDependsOnTaskId()
          this.getTaskRecomendationObject()
          this.getlearnings()
        }
        else {
          this.tasks_list = []
          this.dataService.passSpinnerFlag(false, true);
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
  getIssuesDependsOnTaskId() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getIssuesDependsOnTaskId(this.selected?.[0]?.id).subscribe({
      next: (data: any) => {
        this.linkedIssuesList = data
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
  getTaskRecomendationObject() {
    this.dataService.passSpinnerFlag(true, true);
    this.issuesService.getTaskRecomendationObject(this.selected?.[0]?.id).subscribe({
      next: (data: any[]) => {
        this.recomondationsAndObservations = data;
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
  getlearnings() {
    this.knowledgeService.getlearnings(this.selected?.[0]?.id).subscribe({
      next: (data) => {

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
  }
  postlearnings() {
    this.knowledgeService.postlearnings('').subscribe({
      next: () => {

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
  onSelect(data: any) {
    if (this.rowId !== this.selected?.[0]?.id) {
      this.getIssuesDependsOnTaskId()
      this.getTaskRecomendationObject()
    }
    this.rowId = this.selected?.[0]?.id
  }
  getSelectedCategory(id) {
    this.selectedCategory = id
  }
  openpopup() {
    this.booleanDataTrue = true
  }
  closepopup(data: any) {
    this.booleanDataTrue = false
  }
}
