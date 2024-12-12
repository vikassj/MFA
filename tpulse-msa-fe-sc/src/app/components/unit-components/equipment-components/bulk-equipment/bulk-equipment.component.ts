import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-bulk-equipment',
  templateUrl: './bulk-equipment.component.html',
  styleUrls: ['./bulk-equipment.component.scss']
})
export class BulkEquipmentComponent implements OnInit, OnChanges {
  @Input() unit: any;
  msg: string = '';
  selectedEquipmentCategoryId: any = 1;
  // categories: any = {
  //   'PSV': ['PSV-001', 'PSV-002', 'PSV-003', 'PSV-004', 'PSV-005', 'PSV-006', 'PSV-007'],
  //   'ADSV': ['ADSV-001', 'ADSV-002', 'ADSV-003']
  // }
  categories: any = {};
  rawCategories: any[] = [];
  bulkList: any[] = [];
  selectedTask: string = 'Uninstallation';
  status: string = 'open';
  selectedAccordion: any;
  linkedObservations: any[] = [
    {
      "observation": "@Sonu @Samraat Taking action and submitted the related documents",
      "email": "abc@detecttechnologies.com",
      "attachment": ""
    },
    {
      "observation": "@Sonu @Samraat Action taken and submitting the form and did it",
      "email": "abcd@detecttechnologies.com",
      "attachment": ""
    },
    {
      "observation": "@spna Didn't take action and submitted the related documents",
      "email": "abrec@detecttechnologies.com",
      "attachment": ""
    }
  ];
  uploadForm: FormGroup;
  constructor(private formBuilder: FormBuilder, private modalService: NgbModal, private activityService: ActivityMonitorService, private snackbarService: SnackbarService, private dataService: DataService) {

  }

  ngOnInit(): void {
    this.initUploadForm();
  }

  ngOnChanges() {
    this.getSubEquipmentCategories();
  }

  initUploadForm() {
    this.uploadForm = this.formBuilder.group({
      checklist: ['', Validators.required],
      subequipment_category_id: null
    });
  }
  getSubEquipmentCategories() {
    this.dataService.passSpinnerFlag(true, true)
    this.activityService.getBulkEquipmentSubCategories(this.unit['id']).subscribe((res: any[]) => {
      if (res.length > 0) {
        this.rawCategories = res;
        this.selectedEquipmentCategoryId = this.rawCategories[0].id;
        // for (var i = 0; i < res.length; i++) {
        //   this.getEquipments(res[i].name, res[i].id);
        // }
        this.getChecklist();
        //this.dataService.passSpinnerFlag(false, true);
      }
      else {
        this.rawCategories = [];
        this.dataService.passSpinnerFlag(false, true);
      }
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  getEquipments(category_name, category_id) {
    this.activityService.getBulkEquipmentSubCategoryContent(category_id).subscribe((res: any[]) => {
      if (res) {
        this.categories[category_name] = res;
      }
    });
  }

  getChecklist() {
    this.dataService.passSpinnerFlag(true, true);
    this.activityService.getBulkChecklist(this.selectedEquipmentCategoryId).subscribe((res: any[]) => {
      if (res.length > 0) {
        this.bulkList = res;
        this.dataService.passSpinnerFlag(false, true);
      }
      else {
        this.dataService.passSpinnerFlag(false, true);
      }
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  updateChecklist(i) {
    // debugger
    // if(this.bulkList[i].current_equipment_count>)

    const data = {
      'remarks': this.bulkList[i].remarks,
      'current_equipment_count': this.bulkList[i].current_count

    };
    this.dataService.passSpinnerFlag(true, true);
    this.activityService.updateBulkChecklist(this.bulkList[i].id, data).subscribe((res) => {
      this.getChecklist();
      const msg = 'Checklist Successfully Updated!';
      this.dataService.passSpinnerFlag(false, true);
      this.snackbarService.show(msg, false, false, false, false);
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    });
  }

  handleFileInput(files: FileList): void {
    this.uploadForm.get('checklist').setValue(files.item(0));
  }

  clearFileUpload() {

  }
  uploadNewChecklist() {
    this.uploadForm.patchValue({ 'subequipment_category_id': this.selectedEquipmentCategoryId });
    const formData = new FormData();
    formData.append('subequipment_category_id', this.uploadForm.get('subequipment_category_id').value);
    formData.append('checklist', this.uploadForm.get('checklist').value);
    this.dataService.passSpinnerFlag(true, true);
    this.activityService.uploadNewBulkChecklist(formData).subscribe((res) => {
      this.getChecklist();
      this.uploadForm.reset();
      const msg = 'New Checklist Successfully Uploaded!';
      this.dataService.passSpinnerFlag(false, true);
      this.snackbarService.show(msg, false, false, false, false);
    }, (error) => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Error occured. Please try again.';
      this.snackbarService.show(this.msg, true, false, false, false);
    })
  }

  keys(ob) {
    return Object.keys(ob);
  }

  selectSidebar(cat_id) {
    this.selectedEquipmentCategoryId = cat_id;
    this.uploadForm.reset();
    this.getChecklist();
  }

  selectTask(task) {
    this.selectedTask = task.name;
    task['current_count'] = task.current_equipment_count
  }

  open(content: any) {
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', windowClass: "modalClass" }).result.then((result) => {

    }, (reason) => {

    });
  }

  showValidation = false
  validationMsg = ''
  enforceMaxValue(task, event: any): void {

    const currentValue = event.target.valueAsNumber;
    console.log(currentValue)
    if (!currentValue) {
      // this.showValidation=true
      event.target.value = 0;
      this.validationMsg = `Number is required`
    }
    if (currentValue > task.total_equipment_count) {
      this.showValidation = true
      this.validationMsg = `Number should be less than the ${task.total_equipment_count}`
      // task.current_equipment_count = task.current_equipment_count;
    } else {
      this.showValidation = false
    }
  }
}
