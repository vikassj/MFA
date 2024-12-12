import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { DataService } from '../../../../shared/services/data.service';

@Component({
  selector: 'app-equipment-checklist',
  templateUrl: './equipment-checklist.component.html',
  styleUrls: ['./equipment-checklist.component.scss']
})
export class EquipmentChecklistComponent implements OnInit {

  @Input() availableChecklists: any[] = [];
  @Input() selectedChecklist: any = {};
  @Input() selectedChecklistColumns: any[] = [];
  @Input() selectedChecklistRows: any[] = [];
  @Input() userDepartment: string = '';
  @Output() emitSelectedChecklist: EventEmitter<any> = new EventEmitter();
  @Output() emitChecklistSave: EventEmitter<any> = new EventEmitter();
  @Output() emitChecklistSubmit: EventEmitter<any> = new EventEmitter();
  isStaticEquipmentChecklist: boolean = true;
  isMultiDepartmentChecklist: boolean = false;
  isValueChanged = false
  currentChecklistSaved=false
  @ViewChild('equipmentChecklist') mymodal: ElementRef;
  constructor(private modalService: NgbModal, private dataService: DataService) { }

  ngOnInit(): void {
  }

  ngOnChanges() {

    this.isStaticEquipmentChecklist = this.selectedChecklistColumns.every((column) => column.is_editable === false);
    this.isMultiDepartmentChecklist = this.selectedChecklist?.name?.toUpperCase().includes('BOX') ? true : false;
    this.isValueChanged=false
    this.currentChecklistSaved = false
    let checklist = sessionStorage.getItem('checklist');
    if(checklist == 'checklist'){
      this.open(this.mymodal)
    }
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', windowClass: "largeModal" }).result.then((result) => {
    });
    setTimeout(()=>{
      sessionStorage.removeItem('checklist')
    }, 1000)
  }

  onChecklistSelect(checklistId) {
    this.emitSelectedChecklist.next(checklistId);
  }
  onChecklistSave() {
    if (this.isMultiDepartmentChecklist) {
      let di = this.selectedChecklistColumns.find(column => column.name.toUpperCase() === 'DESCRIPTION').id;
      let fi = this.selectedChecklistColumns.find(column => column.name.toUpperCase() === 'FILLED BY').id;
      this.selectedChecklistRows.forEach(row => {
        if (row[di].toUpperCase() === this.userDepartment?.toUpperCase()) {
          let ec = this.selectedChecklistColumns.filter(item => item.is_editable).map(e => e.id);
          if (ec.some(i => row[i] != null || row[i] != '') && (row[fi] === '' || row[fi] === null)) {
            let email = sessionStorage.getItem('user-email');
            row[fi] = email;
          }
        }
      });
    }
    this.emitChecklistSave.next(this.selectedChecklistRows);
    this.currentChecklistSaved = true
  }

  onChecklistSubmit() {
    this.emitChecklistSubmit.next(true);
  }

  getColumnWidth(column) {
    if (column.is_editable === false && column.data_type === 'string') {
      return 200;
    }
    else if (column.is_editable === false && column.data_type === 'number') {
      return 80;
    }
    else if (column.is_editable === true && column.data_type === 'datetime') {
      return 180;
    }
    else if (column.is_editable === true && column.data_type === 'string') {
      return 150;
    }
    else if (column.is_editable === true && column.data_type === 'dropdown') {
      return 130;
    }
    else if (column.is_editable === true && column.data_type === 'text') {
      return 250;
    }
    else if (column.is_editable === true && column.data_type === 'number') {
      return 80;
    }
  }

  disable(row, isRow) {

    let index = this.selectedChecklistColumns.find(column => column.name.toUpperCase() === 'DESCRIPTION').id;
    if (isRow) {
      if (this.isMultiDepartmentChecklist) {
        if (row[index].toUpperCase() != this.userDepartment?.toUpperCase()) {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        if (this.selectedChecklist?.departments?.map(e => e.toUpperCase()).indexOf(this.userDepartment?.toUpperCase()) === -1) {
          return true;
        }
        else {
          return false;
        }
      }
    }
    else {
      if (this.isMultiDepartmentChecklist) {
        if (this.selectedChecklistRows.every(item => item[index].toUpperCase() != this.userDepartment?.toUpperCase())) {
          return true;
        }
        else {
          return false;
        }
      }
      else {
        if (this.selectedChecklist?.departments?.map(e => e.toUpperCase()).indexOf(this.userDepartment?.toUpperCase()) === -1) {
          return true;
        }
        else {
          return false;
        }
      }
    }
  }

  disableSubmit() {

    if (this.isMultiDepartmentChecklist) {
      let ec = this.selectedChecklistColumns.filter(item => item.is_editable).map(e => e.id);
      let fi = this.selectedChecklistColumns.find(column => column.name.toUpperCase() === 'FILLED BY').id;
      if (!this.selectedChecklistRows.every(row => ec.every(e => row[e] != null && row[e] != ''))) {
        return true;
      }
      else {
        return false;
      }
    }
    else {
      return false;
    }
  }
  isChanged(rowValue){

    this.isValueChanged=true
  }

}
