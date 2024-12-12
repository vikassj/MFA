import { Component, OnInit } from '@angular/core';
import { SafetyAndSurveillanceCommonService } from 'src/app/shared/service/common.service';
import { SafetyAndSurveillanceDataService } from 'src/app/shared/service/data.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { trimFormValues } from 'src/shared/services/trimValidatorControl';

@Component({
  selector: 'app-configure-checklist',
  templateUrl: './configure-checklist.component.html',
  styleUrls: ['./configure-checklist.component.css'],
})
export class ConfigureChecklistComponent implements OnInit {
  activitiesandSubActivites: any = [];
  msg: string;
  selectedActivity: string = '';
  PreventiveMeasuresForm: FormGroup;
  selectedSubActivityId: number;
  selectedActivityId: number;
  edit: any = [];
  disableSubmit: boolean = false;
  valid: boolean = false;
  constructor(
    private fb: FormBuilder,
    private safetyService: SafetyAndSurveillanceCommonService,
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {
    this.PreventiveMeasuresForm = this.fb.group({
      PreventiveMeasures: this.fb.array([]),
    });
  }
  selectSubActivity(subActivity, Activity) {
    console.log(subActivity, Activity);
    this.selectedSubActivityId = subActivity.id;
    this.selectedActivityId = Activity.id;
    // for(let i=0;i<this.PreventiveMeasures().value.length;i++)
    // this.PreventiveMeasures().removeAt(i);
    // this.PreventiveMeasuresForm.reset();
    // setTimeout(() => {
    this.getChecklistbySubactivityId();
    // }, 1000);
  }
  private emptyForm(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls)?.forEach((key) => {
        this.emptyForm(control.get(key)!); // Recursively empty each control
        control.removeControl(key); // Remove each control from the FormGroup
      });
    } else if (control instanceof FormArray) {
      while (control.length !== 0) {
        this.emptyForm(control.at(0)); // Recursively empty each control in the FormArray
        control.removeAt(0); // Remove each control from the FormArray
      }
    }
  }
  ngOnInit(): void {
    this.activitiessubactivities();
  }
  addPreventiveMeasure() {
    this.PreventiveMeasures().push(this.newPreventiveMeasure());
    let index = this.PreventiveMeasures().value.length - 1;
    this.edit.push(false);

    // for(let i=0;i<3;i++)
    this.addOption(index, 'Yes');
    this.addOption(index, 'No');
    this.addOption(index, 'Not Applicable');
    this.checkValid();
    setTimeout(() => {
      const element = document.getElementById('save'+ index);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 500);
     
  }
  newPreventiveMeasure(): FormGroup {
    return this.fb.group({
      id: [null],
      description: ['', Validators.required],
      options: this.fb.array([]),
    });
  }
  resetPreventiveMeasure(index) {
    this.PreventiveMeasures().at(index).patchValue({ description: '' });
    this.disableSubmit = this.edit[index] = false;
    const length = this.optionsArray(index).length;
    for (let i = 0; i < length; i++) this.removeOption(index, 0);

    this.addOption(index, 'Yes');
    this.addOption(index, 'No');
    this.addOption(index, 'Not Applicable');
  }
  deleteChecklist(id) {
    this.dataService.passSpinnerFlag(true, true);
    this.safetyService.deleteAuditChecklist(id).subscribe(
      (res: any) => {
        this.snackbarService.show(res.Message, false, false, false, true);

        this.dataService.passSpinnerFlag(false, true);
      },
      (err: any) => {
        this.dataService.passSpinnerFlag(false, true);

        this.msg = err.error.error;
        this.snackbarService.show(this.msg, true, false, false, false);
      }
    );
  }

  trimValue() {
    trimFormValues(this.PreventiveMeasures());
  }

  removePreventiveMeasure(i: number, measure: any) {
    console.log(measure, 'measure');

    if (measure.value.id) this.deleteChecklist(measure.value.id);
    this.PreventiveMeasures().removeAt(i);
    this.edit.splice(i, 1);
    this.checkValid();
  }
  changeEdit(i) {
    this.edit[i] = true;
  }

  newOption(optionKey?): FormGroup {
    // ,"this.PreventiveMeasures().value.options.value.length")
    return this.fb.group({
      option_text: '',
      option_key: [optionKey ? optionKey : '', Validators.required],
      order: null,
    });
  }
  addOption(index: number, optionKey?) {
    this.optionsArray(index).push(this.newOption(optionKey));
  }

  removeOption(index: number, optionIndex: number) {
    this.optionsArray(index).removeAt(optionIndex);
  }
  onSubmit() {
    console.log(this.PreventiveMeasuresForm.value);
  }
  saveChecklist(checklist, index) {
    console.log(checklist, 'checklist');

    this.trimValue();
    this.dataService.passSpinnerFlag(true, true);
    let measures = checklist.value.options.map(
      (option, i) => (option.option_text = 'Option ' + (i + 1))
    );

    let measuress = checklist.value.options.map(
      (option, i) => (option.order = i)
    );
    if (checklist.value.description.length > 0) {
      let params = {
        sub_activity_id: this.selectedSubActivityId,
        activity_id: this.selectedActivityId,
        checklist_item: checklist.value,
      };
      console.log(params, 'params');
      this.safetyService.saveAuditChecklist(params).subscribe(
        (data: any) => {
          this.snackbarService.show(data.Message, false, false, false, true);
          // this.getChecklistbySubactivityId();
          this.PreventiveMeasures()
            .at(index)
            .patchValue({ id: data.checklist_item_id });
          console.log(this.PreventiveMeasures().value);
          this.checkValid();
          this.edit = this.edit.map((item) => (item = false));

          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          console.log(error, 'error');

          this.msg = error.error.error;
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    } else {
      this.snackbarService.show(
        'Description is required',
        true,
        false,
        false,
        false
      );
      this.dataService.passSpinnerFlag(false, true);
    }
  }

  PreventiveMeasures(): FormArray {
    return this.PreventiveMeasuresForm.get('PreventiveMeasures') as FormArray;
  }
  get getPreventiveMeasures(): FormArray {
    return this.PreventiveMeasuresForm.get('PreventiveMeasures') as FormArray;
  }
  optionsArray(index: number): FormArray {
    return this.PreventiveMeasures().at(index).get('options') as FormArray;
  }

  openActivity(index) {
    this.activitiesandSubActivites.map((v) => ({ ...v, open: false }));
    this.activitiesandSubActivites[index].open =
      !this.activitiesandSubActivites[index].open;
    this.selectedActivity = this.activitiesandSubActivites[index].name;
  }
  checkValid() {
    let measures = this.PreventiveMeasures().value;
    this.valid = false;
    this.valid = measures.some((obj) => obj['id'] === null || !('id' in obj));
  }
  submitChecklist() {
    console.log('btn pressed');
    this.trimValue();
    let measures = this.PreventiveMeasures().value;
    // console.log(measures[0],"this.PreventiveMeasures().value");

    for (let i = 0; i < measures.length; i++) {
      if (!measures[i].id) {
        return this.snackbarService.show(
          'Save all preventive measures before submit',
          true,
          false,
          false,
          false
        );
      }
    }
    if (this.PreventiveMeasuresForm.valid) {
      this.dataService.passSpinnerFlag(true, true);
      let measures = this.PreventiveMeasures().value.map((item) =>
        item.options.map(
          (option, i) => (option.option_text = 'Option ' + (i + 1))
        )
      );
      let measuress = this.PreventiveMeasures().value.map((item) =>
        item.options.map((option, i) => (option.order = i))
      );

      let params = {
        sub_activity_id: this.selectedSubActivityId,
        activity_id: this.selectedActivityId,
        checklist: this.PreventiveMeasures().value,
      };
      this.safetyService.addAuditChecklist(params).subscribe(
        (data: any) => {
          this.snackbarService.show(data.Message, false, false, false, true);
          this.getChecklistbySubactivityId();
          this.edit = this.edit.map((item) => (item = false));

          this.dataService.passSpinnerFlag(false, true);
        },
        (error) => {
          this.dataService.passSpinnerFlag(false, true);
          console.log(error, 'error');

          this.msg = error.error.error;
          this.snackbarService.show(this.msg, true, false, false, false);
        },
        () => {}
      );
    } else {
      this.PreventiveMeasuresForm.markAllAsTouched();
    }
  }
  getChecklistbySubactivityId() {
    this.dataService.passSpinnerFlag(true, true);
    let params = 'sub_activity_id=' + this.selectedSubActivityId;
    this.safetyService.getChecklistBySubId(params).subscribe(
      (data: any) => {
        console.log(data.checklist, 'data.checklist');
        this.disableSubmit = false;
        this.PreventiveMeasures().clear();
        if (data.checklist && data.checklist.length > 0) {
          this.patchData(data.checklist);
          if (data.is_saved) this.disableSubmit = true;
          // this.disableAllControls(this.PreventiveMeasures())

          // for(let i=0;i<data.checklist.length-1;i++)
          // this.disableAllControls(this.optionsArray(i))
        }

        // for(let i=0;i<this.PreventiveMeasures().value.length;i++)
        // this.PreventiveMeasures().removeAt(i);
        //     this.patchData(data.checklist);

        // this.PreventiveMeasuresForm.patchValue({PreventiveMeasures:data.checklist})

        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  private disableAllControls(formArray: FormArray): void {
    formArray.controls.forEach((control) => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.disableAllControls(control as FormArray); // Recursively disable controls in nested FormArray/FormGroup
      } else {
        control.disable();
      }
    });
  }
  private patchData(data: any[]): void {
    this.PreventiveMeasures().reset();
    data.forEach((item) => {
      const itemFormGroup = this.fb.group({
        id: [item.id ? item.id : null],
        description: [item.description, Validators.required],
        // order: [item.order],
        options: this.fb.array([]),
      });

      item.options.forEach((option: any) => {
        const optionFormGroup = this.fb.group({
          // id: [option.id],
          option_key: [option.option_key, Validators.required],
          option_text: [option.option_text],
          order: [option.order],
        });
        (itemFormGroup.get('options') as FormArray).push(optionFormGroup);
      });

      this.PreventiveMeasures().push(itemFormGroup);
    });
    setTimeout(() => {
      this.checkValid();
    }, 1000);
  }

  activitiessubactivities() {
    this.dataService.passSpinnerFlag(true, true);
    let params = '';
    this.safetyService.activitiessubactivities(params).subscribe(
      (data: any) => {
        this.activitiesandSubActivites = data.activities;
        if (
          this.activitiesandSubActivites &&
          this.activitiesandSubActivites.length > 0
        )
          this.selectedActivity = this.activitiesandSubActivites[0].name;
        this.selectedSubActivityId =
          this.activitiesandSubActivites[0].sub_activities[0].id;
        this.selectedActivityId = this.activitiesandSubActivites[0].id;
        this.getChecklistbySubactivityId();
        this.activitiesandSubActivites.map((v) => ({ ...v, open: false }));
        this.dataService.passSpinnerFlag(false, true);
      },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {}
    );
  }
  omit_special_char(event) {
    var k;
    k = event.charCode; //         k = event.keyCode;  (Both can be used)
    return (
      (k > 64 && k < 91) ||
      (k > 96 && k < 123) ||
      k == 8 ||
      k == 32 ||
      (k >= 48 && k <= 57)|| // Digits 0-9
      k == 44 || // Comma ,
      k == 46 || // Period .
      k == 33 || // Exclamation mark !
      k == 63 || // Question mark ?
      k == 45 || // Hyphen -
      k == 95 || // Underscore _
      k == 39 || // Single quote '
      k == 64 // At symbol @
    );
  }
}
