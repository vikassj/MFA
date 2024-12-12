import { Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import Fuse from 'fuse.js'
declare var $: any;

import { ActivityMonitorSCurveService } from 'src/app/services/s-curve.service';
import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';
import { TaskService } from 'src/app/services/task.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { Router } from '@angular/router';
import { GlobalResultsPopupService } from 'src/app/shared/services/global-results-popup.service';
import { IssuesService } from 'src/app/shared/services/issues.service';

@Component({
  selector: 'app-unit',
  templateUrl: './unit.component.html',
  styleUrls: ['./unit.component.scss']
})
export class UnitComponent implements OnInit {
  selectedTab: any;
  units = [];
  selectTab: any;
  selectedUnit: any;
  departments: any[] = [];
  selectedDepartment: any;
  equipmentCategory: any[] = [];
  ganttEquipmentCategories: any[] = [];
  selectedEquipmentCategory: any;
  selectedTaskCategory: any
  // selectedVendor: any[] = []
  equipments: any[] = [];
  vendors: any[] = [];
  selectedVendor: any[] = [];
  selectedEquipment: any;
  globalSearchData: any;
  globalSearch: string = '';
  globalSearchOptions = {
    minMatchCharLength: 2,
    threshold: 0.5,
    keys: [
      'equipment_name',
      'name'
    ]
  };
  globalSearchResults: any[] = [];
  globalSearchColumns: any[] = ['equipment_category_name', 'equipment_name', 'name'];
  taskCategories = [{ id: "All", name: "All Tasks" }, { id: "planned_for_last_week", name: "Planned for Last Week" }, { id: "planned_for_next_week", name: "Planned for Next Week" }]
  msg: string = '';
  routingData: any;
  onGanttPage: boolean = false;
  show_hide: boolean = true;
  show_dropdown: boolean;
  loggedUserId: any;
  constructor(private issuesService: IssuesService, private sCurveService: ActivityMonitorSCurveService, private router: Router, private activityService: ActivityMonitorService, private taskService: TaskService, private dataService: DataService, private snackbarService: SnackbarService, private globalResultsPopupService: GlobalResultsPopupService) {
    window.addEventListener('tab-changed', (evt) => {
      let tabName = sessionStorage.getItem('selectedTab') ? sessionStorage.getItem('selectedTab') : 'dashboard';
      this.getSelectedTab(tabName);
    })

    this.selectedTab = sessionStorage.getItem('selectedTab') ? sessionStorage.getItem('selectedTab') : 'dashboard';
    this.dataService.getUnitTabs.subscribe((res) => {
      if (res) {

        this.getSelectedTab(res.tab);
        this.routingData = res.data;
      }
    })

    this.dataService.getPlanTabs.subscribe((res) => {
      if (res) {
        const lastSubTab = sessionStorage.getItem('selectedSubTab');
        if (res.tab != lastSubTab) {
          //this.getUnitNames();
        }
      }
    })
  }

  ngOnInit(): void {
    if (sessionStorage.getItem('selectedTask')) {
      var selectedTask = JSON.parse(sessionStorage.getItem('selectedTask'))
      this.selectedTab = selectedTask.tab
      this.getSelectedTab(this.selectedTab);
    }
    this.getUnitNames();
    // this.getEquipmentCategories()
    this.selectedTaskCategory = this.taskCategories[0]
  }
  getGlobalSearchData() {
    this.dataService.passSpinnerFlag(true, true);
    this.activityService.getGlobalSearchData(this.selectedUnit.id).subscribe((data: any) => {
      let d = data.map(element => { return { 'id': element.id, 'equipment_category_id': element.equipment_category, 'equipment_id': element.equipment, 'equipment_category_name': element.equipment_category_name, 'equipment_name': element.equipment_name, 'name': element.name } })
      this.globalSearchData = new Fuse(d, this.globalSearchOptions);
      let selectIndex = JSON.parse(sessionStorage.getItem('navigatingToTask'))
      if (!selectIndex?.[0]?.task_id) {
        this.dataService.passSpinnerFlag(false, true);
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

  onGlobalSearch() {
    this.globalSearchResults = [];
    this.globalSearchResults = this.globalSearchData.search(this.globalSearch);
    this.globalResultsPopupService.showPopup();
    this.globalResultsPopupService.isPopupVisible$.subscribe((isVisible) => {
      if (!isVisible) {
        this.globalSearch = ''
      }
    });
  }

  onGlobalSearchOptionSelection(event) {
    let index = this.equipmentCategory.findIndex(ele => { return ele.name == event.item.equipment_category_name });
    if (index >= 0) {
      this.selectedEquipmentCategory = this.equipmentCategory[index];
    }
    this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': event.item.id } })
  }

  getUnitNames() {
    this.dataService.passSpinnerFlag(true, true);
    this.activityService.getUnitnames().subscribe((unitList) => {
      this.units = unitList.sort((a, b) => { return a.order - b.order });
      console.log(this.units);
      sessionStorage.setItem('sc_units', JSON.stringify(this.units));

      this.selectedUnit = this.units.filter(item => item.id == parseInt(sessionStorage.getItem('unit-navigation-id')))[0] || this.units.filter(item => item.id == parseInt(sessionStorage.getItem('storedUnitId')))[0] || this.units[0];
      // }

      // this.getLoggeduser()

      // console.log(this.selectedUnit)
      this.getEquipmentCategories();
      this.getVendorsList()
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
    this.selectedVendor = this.vendors[0]?.name
    console.log(this.selectedVendor)

  }



  getEquipmentCategories() {
    this.dataService.passSpinnerFlag(true, true);
    sessionStorage.setItem('storedUnitId', this.selectedUnit.id);
    window.dispatchEvent(new CustomEvent('unitchanged'))
    this.activityService.getEquipmentCategories(this.selectedUnit.id).subscribe((res: any[]) => {
      if (res.length > 0) {
        // if (this.equipmentCategory[0]?.name == 'All') {
        res.unshift({ id: null, name: 'All Equipment' })
        // }
        this.equipmentCategory = res;
        this.selectedEquipmentCategory = res[0];
        this.getAllDepartments();
        console.log(this.equipmentCategory, this.selectedEquipmentCategory)
        let data = JSON.parse(sessionStorage.getItem('navigatingToTask'))
        if (data?.[0]?.equipment_category_id) {
          let index = this.equipmentCategory.findIndex(ele => { return ele.id == data?.[0]?.equipment_category_id });
          if (index >= 0) {
            this.selectedEquipmentCategory = this.equipmentCategory[index];
          } else {
            this.selectedEquipmentCategory = this.equipmentCategory[0];
          }
        } else {
          this.selectedEquipmentCategory = this.equipmentCategory[0];

        }
        console.log(this.selectedEquipmentCategory, this.equipmentCategory)
        this.getEquipments();
      }
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      })
  }
  getSelectTab(data: any) {
    this.show_dropdown = data;
  }
  check() {
    console.log(this.selectedVendor, this.vendors)
  }
  getEquipments() {
    if (this.selectedEquipmentCategory.id == -1) {
      var category_id = null
    }
    else {
      category_id = this.selectedEquipmentCategory.id
    }
    this.activityService.getEquipments(category_id, this.selectedUnit.id).subscribe((res: any[]) => {
      if (res) {
        this.equipments = res;
        this.selectedEquipment = this.equipments[0];
        this.getGlobalSearchData();
      }
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      })
  }

  getAllDepartments() {
    this.activityService.getDepartmentsList().subscribe((res: any[]) => {
      if (res) {
        this.departments = res;
        this.departments.unshift({ id: "All", name: "All Department" })
        let data = JSON.parse(sessionStorage.getItem('navigatingToTask'))
        if (data?.[0]?.department_id) {
          let index = this.departments.findIndex(ele => { return ele.id == data?.[0]?.department_id });
          if (index >= 0) {
            this.selectedDepartment = this.departments[index];
          } else {
            this.selectedDepartment = this.departments[0];
          }
        } else {
          this.selectedDepartment = this.departments[0];
        }
      }
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      })
  }


  getSelectedTab(tabName: string) {
    this.selectedTab = tabName;
    sessionStorage.setItem('selectedTab', this.selectedTab);
    this.show_hide = true;
  }

  ///////////?Filter/////////////
  isRouteClicked: boolean = false;
  filterStatus = ["Test 1", "Test 2", "Test 3"]
  statusFilter: any = '';
  fromDateFliter: any = '';
  toDateFliter: any = '';
  onRouteClicked() {
    this.isRouteClicked = !this.isRouteClicked
  }
  filterIssues() {

  }
  filterReset() {

  }
  toggleTaskPage(data) {
    this.show_hide = data;
    console.log(this.show_hide)
  }
  getDepartmentsList(user_id) {
    this.taskService.getDepartmentsList(user_id, this.selectedUnit.id).subscribe({
      next: (data: any) => {
        this.departments = data
        this.selectedDepartment = this.departments[0];
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
  // getLoggeduser() {
  //   this.issuesService.getLoggedUser().subscribe({
  //     next: (data: any) => {
  //       console.log(data?.user_id)
  //       this.loggedUserId = data?.user_id
  //       this.getAllDepartments();
  //     },
  //     error: () => {
  //       this.dataService.passSpinnerFlag(false, true);
  //       this.msg = 'Error occured. Please try again.';
  //       this.snackbarService.show(this.msg, true, false, false, false);
  //     },
  //     complete: () => {
  //       this.dataService.passSpinnerFlag(false, true);
  //     }
  //   })
  // }
}
