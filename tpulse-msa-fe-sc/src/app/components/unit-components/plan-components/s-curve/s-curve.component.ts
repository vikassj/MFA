import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { ActivityMonitorSCurveService } from '../../../../services/s-curve.service';
import { Subscription } from 'rxjs';
import { TaskService } from 'src/app/services/task.service';

@Component({
  selector: 'app-s-curve',
  templateUrl: './s-curve.component.html',
  styleUrls: ['./s-curve.component.scss']
})
export class SCurveComponent implements OnInit {

  msg: string = '';
  selectedPSLA = []
  unit: any;
  selectDropdown: any;
  PSLADropdownSelect: string = '';

  sCurveDropdown: boolean = false;

  statsPlanSelect: boolean = false;
  dropdownWidth: number = 150;

  zones = []
  deparment: any;
  selectedZone: string = '';

  departmentDropdownWidth: number = 150;
  departmentDropdown: boolean = false;
  ///////////////////////
  units = [];
  selectedUnit: any;
  scurveDepartments: any[] = [];
  equipmentCategory: any[] = [];
  selectedEquipmentCategory: string = '';
  selectedScurveDepartment: string = '';
  selectedVendor: any;
  vendors: any[] = [];
  data: any;
  subscription: Subscription = new Subscription();
  constructor(private sCurveService: ActivityMonitorSCurveService, private taskService: TaskService, private dataService: DataService, private snackbarService: SnackbarService) { }

  ngOnInit() {
    this.getUnitNames();
    this.subscription.add(this.dataService.getCreateTask.subscribe(createTask => {
      this.data = createTask.values
      console.log(this.data)
    }))
  }

  getUnitNames() {
    this.dataService.passSpinnerFlag(true, true);
    this.sCurveService.getUnitnames().subscribe((unitList) => {
      this.units = unitList;
      //this.selectedUnit = this.units[0];
      this.selectedUnit = this.units.filter(item => item.id == parseInt(sessionStorage.getItem('storedUnitId')))[0] || this.units[0];
      console.log("unitttt", this.selectedUnit);
      this.fetchEquipmentHierarchy(this.selectedUnit.name);
      this.getDepartments();
      this.getVendorsList();

    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  getVendorsList() {
    this.taskService.getVendorList().subscribe({
      next: (data: any) => {
        this.vendors = data
        this.vendors.unshift({ id: "All", name: "All Vendor" })
        this.selectedVendor = this.vendors[0]
        console.log(this.selectedVendor, this.selectedVendor.id)

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
    this.selectedVendor = this.vendors[0]?.id
    console.log(this.selectedVendor)

  }

  fetchEquipmentHierarchy(unitName, isLazyLoad = false) {

    //this.dataService.passSpinnerFlag(true, true);
    this.sCurveService.fetchEquipmentHierarchy(unitName).subscribe(
      data => {
        this.equipmentCategory = Object.keys(data);
        this.selectedEquipmentCategory = this.equipmentCategory[0];
        //this.getAvailableScurveDepartments(unitName);

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

  getDepartments() {
    this.getAvailableScurveDepartments(this.selectedUnit.name);
  }

  selectUnit(unit) {
    this.selectedUnit = unit;
    sessionStorage.setItem('storedUnitId', this.selectedUnit.id);
    sessionStorage.setItem('storeUnit', this.selectedUnit.id);
    this.getDepartments();
  }

  selectDepartment(department) {
    this.selectedScurveDepartment = department;

  }

  selectVendor(vendor) {
    this.selectedVendor = vendor;
    console.log(this.selectedVendor)
    // this.getDepartments()
  }
  getAvailableScurveDepartments(unitName, category?) {
    this.dataService.passSpinnerFlag(true, true);
    this.sCurveService.getAvailableDepartments(unitName, category).subscribe((data) => {
      this.scurveDepartments = data;
      this.selectedScurveDepartment = this.scurveDepartments[0];
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


  dropdownShow() {
    this.sCurveDropdown = !this.sCurveDropdown;
    this.departmentDropdown = false;
  }

  sCurveSelector(statsPlan: any) {
    if (statsPlan == 'stats') {
      this.statsPlanSelect = false;
    } else {
      this.statsPlanSelect = true;
    }
  }
  toggleDropdown(data: any) {
    this.selectDropdown = data
    console.log(this.selectDropdown)
  }
}
