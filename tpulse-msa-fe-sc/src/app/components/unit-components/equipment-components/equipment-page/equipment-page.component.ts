import { Component, Input, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { ActivityMonitorSCurvePendingService } from 'src/app/services/s-curve.service';
import { DataService } from 'src/shared/services/data.service';
import { SnackbarService } from 'src/shared/services/snackbar.service';
import { Router } from '@angular/router';
import { ColumnMode, SelectionType } from '@swimlane/ngx-datatable';
import { TaskService } from 'src/app/services/task.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { ActivityMonitorService } from 'src/app/services/activity-monitor.service';

@Component({
  selector: 'app-equipment-page',
  templateUrl: './equipment-page.component.html',
  styleUrls: ['./equipment-page.component.scss']
})
export class EquipmentPageComponent implements OnInit {
  @Input() unitId: number
  @Input() departmentId: number
  @Input() unitName: string;
  @Input() department: string;
  @Input() taskCategory: any;
  @ViewChild('myTable', { static: false }) table: any;

  msg: string = '';
  category = {}
  planCategory: any;
  milestoneCategory: any;

  categoryKeyList = []
  selectedCategoryData = []
  selectedCategory: any;

  ColumnMode = ColumnMode;
  SelectionType = SelectionType;
  selected: any[] = [];
  CategoryWiseIssues = new Map();

  FunctionOverviewEquipmentCategory: any;
  equipmentFunction: any = [];
  functionEq: any;

  progress: number = 88;
  total: number;
  color: string;

  milestoneDropdown: boolean = false;
  planCategoryDropdown: boolean = false;
  planCategoryDataDropdown: boolean = false;
  rows = [];

  categoryDropdownWidth: number = 60;
  planCategoryDropdownWidth: number = 420;
  groupExpansionDefaultStatus = true;
  rowDataNotAvailable = false
  cachedRow: any = {};

  showMap = false

  equipments: any = {
    'HEAT EXCHANGERS': ['EXCHANGER-001', 'EXCHANGER-002', 'EXCHANGER-003', 'EXCHANGER-004', 'EXCHANGER-005', 'EXCHANGER-006'],
    'COLUMNS': ['COLUMN-001', 'COLUMN-002', 'COLUMN-004'],
    'VESSELS': ['Vessles-01', 'Vessles-02']
  };
  selectedEquipmentId: string = 'EXCHANGER-001';

  obsRows = ['EXCHANGER-001', 'EXCHANGER-002', 'EXCHANGER-003', 'EXCHANGER-004', 'EXCHANGER-005', 'EXCHANGER-006']
  observationsRecommendationsToggle = false
  taskSelected: boolean = false;
  selectedEquipmentCategory: any;
  cachedEquipmentRows: any = {};
  isPdfLoaded: boolean = false;
  pdfData: Object;
  selectedEquipmentNumId: any;
  observationRows: any;
  recommendationRows: any;
  observationRecommendationRows: any;
  issues: any;
  equipmentId: number = null;
  availableChecklists: any[] = [];
  selectedChecklistId: number = null;
  selectedChecklist: any = {};
  selectedChecklistColumns: any[] = [];
  selectedChecklistRows: any[] = [];
  userDepartment: any;

  rowsBydepartment
  filteredCategoryKeyList
  searchTerm
  allEquipments
  matchingItems: any = {}
  filteredEquipmentList = {}
  taskHeaders
  equipmentList
  equipmentNames
  equipmentRows
  equipmentNameIdMap: any = {}

  equipmentTaskHeaders = {
    "Feed cut-out and CDU-VDU segregration": [
      'Cooling',
      'Circulation and cooling',
      'Naptha stab bottom level to minimum',
      'Depressurizing LPG loop',
      'Empty out Strippers (CDU column)',
      'Flushing of VD, LVGO, HVGO, VS, VR loops',
      'Vacuum breakby isolating first stage',
      'Steaming and N2 purging of the ejector',
      'Oil push and handover for decontamination',
      'Handing over loop for decontamination',
      'Decontamination (water and rinse phase)',
      'Flare/CDB decontamination',
      'Flare Spading',
    ],
    "Heat Exchangers": [
      "Blinding",
      "Channel cover removal",
      "Bundle pulling",
      "Bundle cleaning",
      "Tube cleaning",
      "Bundle insertion",
      "Tube test",
      "Shell test",
      "Hydro test",
      "Deblinding"
    ],
    "Heaters": [
      "Blinding of heater",
      "Passivation of heater coils",
      "Pigging",
      "Opening of manway",
      "Scaffolding erection",
      "Inspection of heater coils",
      "Refractory repairs & replacement",
      "External tube cleaning",
      "Burner tip checking",
      "Thermocouple checks",
      "Hydro test or pneumatic test",
      "Scaffolding removal",
      "Boxup & Deblinding of heater"
    ],
    "Vessels": [
      "Blinding",
      "Passivation",
      "Manentry",
      "Demister pad Removal",
      "Vessel & Demister pad Cleaning",
      "Cleaning",
      "Demister pad fixup",
      "Inspection",
      "Hydrotest",
      "Deblind"
    ],
    "Columns": [
      "Blinding",
      "Manhole Opening",
      "Eduction & man-entry",
      "Tray Man-way opening",
      "Tray Cleaning",
      "Inspection",
      "Repairs if any",
      "Manway box-up of tray",
      "Manhole Box-Up",
      "Pressure Test",
      "Deblinding"
    ]
  };

  equipmentTaskHeadersWithCount = {
    "Feed cut-out and CDU-VDU segregration": [
      { "label": "Cooling", "total_task_count": null, "completed_task_count": null },
      { "label": "Circulation and cooling", "total_task_count": null, "completed_task_count": null },
      { "label": "Naptha stab bottom level to minimum", "total_task_count": null, "completed_task_count": null },
      { "label": "Depressurizing LPG loop", "total_task_count": null, "completed_task_count": null },
      { "label": "Empty out Strippers (CDU column)", "total_task_count": null, "completed_task_count": null },
      { "label": "Flushing of VD, LVGO, HVGO, VS, VR loops", "total_task_count": null, "completed_task_count": null },
      { "label": "Vacuum breakby isolating first stage", "total_task_count": null, "completed_task_count": null },
      { "label": "Steaming and N2 purging of the ejector", "total_task_count": null, "completed_task_count": null },
      { "label": "Oil push and handover for decontamination", "total_task_count": null, "completed_task_count": null },
      { "label": "Handing over loop for decontamination", "total_task_count": null, "completed_task_count": null },
      { "label": "Decontamination (water and rinse phase)", "total_task_count": null, "completed_task_count": null },
      { "label": "Flare/CDB decontamination", "total_task_count": null, "completed_task_count": null },
      { "label": "Flare Spading", "total_task_count": null, "completed_task_count": null }
    ],
    "Heat Exchangers": [
      { "label": "Blinding", "total_task_count": null, "completed_task_count": null },
      { "label": "Channel cover removal", "total_task_count": null, "completed_task_count": null },
      { "label": "Bundle pulling", "total_task_count": null, "completed_task_count": null },
      { "label": "Bundle cleaning", "total_task_count": null, "completed_task_count": null },
      { "label": "Tube cleaning", "total_task_count": null, "completed_task_count": null },
      { "label": "Bundle insertion", "total_task_count": null, "completed_task_count": null },
      { "label": "Tube test", "total_task_count": null, "completed_task_count": null },
      { "label": "Shell test", "total_task_count": null, "completed_task_count": null },
      { "label": "Hydro test", "total_task_count": null, "completed_task_count": null },
      { "label": "Deblinding", "total_task_count": null, "completed_task_count": null }
    ],
    "Heaters": [
      { "label": "Blinding of heater", "total_task_count": null, "completed_task_count": null },
      { "label": "Passivation of heater coils", "total_task_count": null, "completed_task_count": null },
      { "label": "Pigging", "total_task_count": null, "completed_task_count": null },
      { "label": "Opening of manway", "total_task_count": null, "completed_task_count": null },
      { "label": "Scaffolding erection", "total_task_count": null, "completed_task_count": null },
      { "label": "Inspection of heater coils", "total_task_count": null, "completed_task_count": null },
      { "label": "Refractory repairs & replacement", "total_task_count": null, "completed_task_count": null },
      { "label": "External tube cleaning", "total_task_count": null, "completed_task_count": null },
      { "label": "Burner tip checking", "total_task_count": null, "completed_task_count": null },
      { "label": "Thermocouple checks", "total_task_count": null, "completed_task_count": null },
      { "label": "Hydro test or pneumatic test", "total_task_count": null, "completed_task_count": null },
      { "label": "Scaffolding removal", "total_task_count": null, "completed_task_count": null },
      { "label": "Boxup & Deblinding of heater", "total_task_count": null, "completed_task_count": null }
    ],
    "Vessels": [
      { "label": "Blinding", "total_task_count": null, "completed_task_count": null },
      { "label": "Passivation", "total_task_count": null, "completed_task_count": null },
      { "label": "Manentry", "total_task_count": null, "completed_task_count": null },
      { "label": "Demister pad Removal", "total_task_count": null, "completed_task_count": null },
      { "label": "Vessel & Demister pad Cleaning", "total_task_count": null, "completed_task_count": null },
      { "label": "Cleaning", "total_task_count": null, "completed_task_count": null },
      { "label": "Demister pad fixup", "total_task_count": null, "completed_task_count": null },
      { "label": "Inspection", "total_task_count": null, "completed_task_count": null },
      { "label": "Hydrotest", "total_task_count": null, "completed_task_count": null },
      { "label": "Deblind", "total_task_count": null, "completed_task_count": null }
    ],
    "Columns": [
      { "label": "Blinding", "total_task_count": null, "completed_task_count": null },
      { "label": "Manhole Opening", "total_task_count": null, "completed_task_count": null },
      { "label": "Eduction & man-entry", "total_task_count": null, "completed_task_count": null },
      { "label": "Tray Man-way opening", "total_task_count": null, "completed_task_count": null },
      { "label": "Tray Cleaning", "total_task_count": null, "completed_task_count": null },
      { "label": "Inspection", "total_task_count": null, "completed_task_count": null },
      { "label": "Repairs if any", "total_task_count": null, "completed_task_count": null },
      { "label": "Manway box-up of tray", "total_task_count": null, "completed_task_count": null },
      { "label": "Manhole Box-Up", "total_task_count": null, "completed_task_count": null },
      { "label": "Pressure Test", "total_task_count": null, "completed_task_count": null },
      { "label": "Deblinding", "total_task_count": null, "completed_task_count": null }
    ]
  }


  constructor(private modalService: NgbModal, private ssCurvePendingService: ActivityMonitorSCurvePendingService, private taskService: TaskService, private dataService: DataService, private snackbarService: SnackbarService, private router: Router, private activityMonitorService: ActivityMonitorService) { }

  ngOnInit(): void {
    this.getUserDepartment();
  }



  ngOnChanges(changes: SimpleChanges): void {


    let isUnitChanged = changes['unitName'] &&
      changes['unitName'].currentValue != changes['unitName'].previousValue;
    let isDepartmentChanged = changes['department'] &&
      changes['department'].currentValue != changes['department'].previousValue;
    let isTaskCategoryChanged = changes['taskCategory'] &&
      changes['taskCategory'].currentValue != changes['taskCategory'].previousValue;
    if (isUnitChanged || isDepartmentChanged || isTaskCategoryChanged) {

      if (this.department == 'All Department') {
        this.department = "All"
      }
      // this.getVendorsList()
      // this.getDepartmentList()
      this.cachedRow = {}
      this.observationRecommendationRows = []
      this.getEquipmentCategoryEquipments(this.unitName);



    }
  }

  milestoneDropdownShow() {
    this.milestoneDropdown = !this.milestoneDropdown;
    this.planCategoryDropdown = false;
    this.planCategoryDataDropdown = false;
  }
  planCategoryDropdownShow() {
    this.planCategoryDropdown = !this.planCategoryDropdown;
    this.milestoneDropdown = false;
    this.planCategoryDataDropdown = false;
  }
  planCategoryDataDropdownShow() {
    this.planCategoryDataDropdown = !this.planCategoryDataDropdown;
    this.milestoneDropdown = false;
    this.planCategoryDropdown = false;
  }

  select(milestoneName) {
    let milestone: any;
    this.equipmentFunction.forEach(data => {
      if (data[milestoneName]) {
        milestone = data[milestoneName]
      }

    })
  }
  equipmentListMultiSelect
  getEquipmentCategoryEquipments(unitName) {
    this.dataService.passSpinnerFlag(true, true);
    this.ssCurvePendingService.getEquipmentCategoryEquipments(unitName).subscribe((data) => {
      this.category = data;
      this.filteredEquipmentList = this.category
      this.equipmentListMultiSelect = this.category
      this.keys();

      let categoryKeys = this.keys();
      this.categoryKeyList = categoryKeys.map(categoryName => ({ categoryName, istoggled: false }));
      this.filteredCategoryKeyList = this.categoryKeyList
      let obj = JSON.parse(sessionStorage.getItem('navigatingToTask'))
      let equipment_category_id = Array.isArray(obj) ? obj?.[0]?.equipment_category_id : obj?.equipment_category_id
      let equipment_id = Array.isArray(obj) ? obj?.[0]?.equipment_id : obj?.equipment_id
      this.selectedEquipmentCategory = this.filteredCategoryKeyList[0]?.categoryName
      if (categoryKeys.length > 0) {
        this.planCategory = categoryKeys[0];
        this.milestoneCategory = categoryKeys[0];

        let number = 0;
        let name = '';
        categoryKeys.forEach(element => {
          if (number < element.length) {
            number = element.length;
            name = element;
          }
        });
        let categorywidth: number;
        if (name.toUpperCase() == name) {
          categorywidth = number * 11;
        } else {
          categorywidth = number * 10;
        }
        if (this.categoryDropdownWidth < categorywidth) {
          this.categoryDropdownWidth = categorywidth
        }

        if (equipment_category_id && equipment_id) {
          this.planCategory = equipment_category_id;
          this.milestoneCategory = equipment_category_id;
          this.selectedEquipmentCategory = equipment_category_id
          this.selectedCategory = equipment_id
          let page = sessionStorage.getItem('type')
          if (page == 'recommendation') {
            this.observationsRecommendationsToggle = true
          } else {
            this.observationsRecommendationsToggle = false
          }
          this.filteredCategoryKeyList.forEach((ele, i) => {
            if (ele.categoryName == equipment_category_id) {
              this.filteredCategoryKeyList[i].istoggled = true
            }
          })
          this.selectSidebar(equipment_category_id, equipment_id)
        } else {
          this.selectedEquipmentCategory = this.filteredCategoryKeyList[0]?.categoryName
          this.selectedPlanCategory(this.planCategory);
          this.selectMilestoneCategory(this.milestoneCategory);
        }

      }
      else {
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

  selectMilestoneCategory(milestoneCategory) {
    this.milestoneCategory = milestoneCategory;
    this.milestoneDropdown = false;
    this.getFunctionOverviewByEquipmentCategory(this.unitName, milestoneCategory, this.department)
  }

  getFunctionWiseIssuesCount(unitName, equipment_category, equipment, department) {

    // this.dataService.passSpinnerFlag(true, true);
    this.ssCurvePendingService.getFunctionWiseIssuesCount(unitName, equipment_category, equipment, department).subscribe((data) => {
      if (data) {
        this.CategoryWiseIssues = new Map(Object.entries(data));
      }
      //this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }


  getTasks(unit, equipment_category, equipment, department, equipmentList?, vendor?) {
    this.dataService.passSpinnerFlag(true, true);
    if (this.cachedRow[equipment_category] && equipment) {
      this.getTaskHeaders()
      this.equipmentRows = this.cachedEquipmentRows[equipment_category]
      var equipmentRow = this.cachedRow[equipment_category].filter(row => Object.keys(row).includes(equipment));
      if (equipmentRow.length > 0 && this.taskSelected) {
        this.selectedEquipmentNumId = equipmentRow[0]?.[equipment]?.equipment_id
        this.rows = equipmentRow[0][equipment]['tasks'];
        this.equipmentList = equipmentRow
        this.equipmentId = equipmentRow[0][equipment]['equipment_id']
        this.getEquipmentTaskDetails(unit, equipment)
        this.getEquipmentChecklist();
      }
      else {
        this.dataService.passSpinnerFlag(false, true);
        this.rows = [];
      }
      return;
    }
    this.dataService.passSpinnerFlag(true, true);

    this.taskService.getTasks(unit, equipment_category, null, department, equipmentList, this.taskCategory?.id).subscribe(
      (data: any) => {
        // this.getDepartmentList()
        this.cachedRow[equipment_category] = data.message;
        this.equipmentRows = data.message
        var equipmentRow = this.cachedRow[equipment_category].filter(row => Object.keys(row).includes(equipment));
        this.getTaskHeaders()

        if (equipmentRow.length > 0) {
          this.rows = equipmentRow[0][equipment]['tasks'];
          this.equipmentList = equipmentRow
        }

        if (this.equipmentRows.length > 0) {

          // this.getTaskHeaders()
          // this.equipmentNameIdMap ={}
          var nameIdMappings = []
          this.equipmentRows.forEach((row) => {
            const equipmentName = Object.keys(row)[0];
            const tasks = row[equipmentName].tasks;

            row['equipment'] = equipmentName;
            row['task_by_name'] = {};
            for (const task of tasks) {
              if (!task.equipment_overview_label || task.equipment_overview_label === "other") {
                task['equipment_overview_label'] = task.name.split(' #')[0]
              }
              row['task_by_name'][task.equipment_overview_label] = task;
            }
            row['tasksAvailable'] = tasks.map((task) => task.equipment_overview_label.split(' #')[0]);


            // nameIdMappings.push({name:equipmentName,id:row[equipmentName]?.equipment_id})
            // this.equipmentNameIdMap[equipment_category].push({name:equipmentName,id:row[equipmentName]?.equipment_id})
          });

          // if(!this.equipmentNameIdMap?.[equipment_category]){
          //   this.equipmentNameIdMap[equipment_category] = {};
          // }
          // this.filteredEquipmentIdMap = this.equipmentNameIdMap
          // this.equipmentRows['equipment_name_id_map']=this.equipmentNameIdMap
          this.cachedEquipmentRows[equipment_category] = this.equipmentRows
          console.log(this.equipmentRows)
        }
        else {
          this.rows = [];
        }
        if (this.cachedRow[equipment_category] && equipment) {
          this.getTaskHeaders()
          this.equipmentRows = this.cachedEquipmentRows[equipment_category]
          var equipmentRow = this.cachedRow[equipment_category].filter(row => Object.keys(row).includes(equipment));
          if (equipmentRow.length > 0 && this.taskSelected) {
            this.selectedEquipmentNumId = equipmentRow[0]?.[equipment]?.equipment_id
            this.rows = equipmentRow[0][equipment]['tasks'];
            this.equipmentList = equipmentRow
            this.equipmentId = equipmentRow[0][equipment]['equipment_id']
            this.getEquipmentTaskDetails(unit, equipment)
            this.getEquipmentChecklist();
          }
          else {
            this.dataService.passSpinnerFlag(false, true);
            this.rows = [];
          }
          return;
        }
        this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },

    )


  }

  filteredEquipmentIdMap: any
  getFilteredTaskDetails(unit, equipment_category, equipment, department, equipmentList?, vendor?) {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getTasks(unit, equipment_category, null, department, equipmentList, this.taskCategory?.id, this.selectedVendor?.id).subscribe(
      (data: any) => {
        // this.cachedRow[equipment_category] = data.message;
        this.equipmentRows = data.message
        var equipmentRow = this.cachedRow[equipment_category].filter(row => Object.keys(row).includes(equipment));
        this.getTaskHeaders()

        if (equipmentRow.length > 0) {
          this.rows = equipmentRow[0][equipment]['tasks'];
          this.equipmentList = equipmentRow
        }

        if (this.equipmentRows.length > 0) {
          // this.getTaskHeaders()
          this.equipmentRows.forEach((row) => {
            const equipmentName = Object.keys(row)[0];
            const tasks = row[equipmentName].tasks;

            row['equipment'] = equipmentName;
            row['task_by_name'] = {};
            for (const task of tasks) {
              if (!task.equipment_overview_label || task.equipment_overview_label === "other") {
                task['equipment_overview_label'] = task.name
              }
              row['task_by_name'][task.equipment_overview_label] = task;
            }
            row['tasksAvailable'] = tasks.map((task) => task.equipment_overview_label.split(' #')[0]);


            // nameIdMappings.push({name:equipmentName,id:row[equipmentName]?.equipment_id})
            // this.equipmentNameIdMap[equipment_category].push({name:equipmentName,id:row[equipmentName]?.equipment_id})
          });
          // this.cachedEquipmentRows[equipment_category] = this.equipmentRows
          console.log(this.equipmentRows)
        }
        else {
          this.rows = [];
        }
        this.dataService.passSpinnerFlag(false, true);
      },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },


    )
  }



  getEquipmentTaskDetails(unit, equipment) {
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.getEquipmentTaskDetails(unit, this.selectedEquipmentNumId).subscribe((data) => {
      // const equipmentRow = data["message"][0]
      // this.rows = equipmentRow[equipment]['tasks'];
      const equipmentData = data['message']
      this.issues = equipmentData[0]?.issues
      console.log(equipmentData)
      this.observationRows = equipmentData[0]?.[equipment]?.observations
      this.recommendationRows = equipmentData[0]?.[equipment]?.recommendations
      if (this.observationsRecommendationsToggle) {
        this.observationRecommendationRows = this.recommendationRows
      } else {
        this.observationRecommendationRows = this.observationRows
      }
      sessionStorage.removeItem('navigatingToTask');
      sessionStorage.removeItem('type')
      sessionStorage.removeItem('unit-navigation-id')
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

  selectedEquipment
  onFilterChange() {
    let department;
    if (this.selectedDepartment == "ALL department") {
      department = "All"
    }
    else {
      department = this.selectedDepartment
    }
    this.getFilteredTaskDetails(this.unitName, this.selectedEquipmentCategory, null, department, this.selectedEquipmentIds, this.selectedVendor?.id)
  }

  getFunctionOverviewByEquipmentCategory(unit, equipment_category, department) {
    //this.dataService.passSpinnerFlag(true, true);

    this.ssCurvePendingService.getFunctionOverviewByEquipmentCategory(unit, equipment_category, department).subscribe((data) => {
      this.FunctionOverviewEquipmentCategory = data;
      this.equipmentFunction = [];
      this.functionEq = this.FunctionOverviewEquipmentCategory.message.functions;
      this.functionEq.forEach(equipment => {
        let eq = Object.keys(equipment)[0];
        let value = Object.values(equipment)[0];
        this.equipmentFunction.push({ value, 'equipment': eq });
      })
      //this.dataService.passSpinnerFlag(false, true);
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      },
      () => {
      })
  }

  keys() {
    let data = Object.keys(this.category)
    return Object.keys(this.category);
  }


  selectSidebar(category, id) {
    this.dataService.passSpinnerFlag(true, true);
    this.observationRecommendationRows = []
    this.observationRows = []
    this.recommendationRows = []
    // this.taskSelected = true
    this.selectedPlanCategory(category, id);
  }


  selectedPlanCategory(selectedKey, id?) {

    this.planCategory = selectedKey;
    this.selectedCategoryData = this.category[selectedKey];
    if (id) {
      this.showMap = false
      this.taskSelected = true
      this.selectedPlanCategoryData(id);
    }
    else {
      this.showMap = true
      this.taskSelected = false
      this.selectedPlanCategoryData(this.selectedCategoryData[0]);
    }

  }

  selectedPlanCategoryData(selectedCategory) {
    this.getDepartmentList()
    this.getVendorsList()
    this.selectedCategory = selectedCategory;
    this.getFunctionWiseIssuesCount(this.unitName, this.planCategory, this.selectedCategory, this.department);
    // if(!this.taskSelected){
    this.getTasks(this.unitName, this.planCategory, this.selectedCategory, this.department);

    // }
    // else{
    //   var equipmentRow = this.cachedRow[this.planCategory].filter(row => Object.keys(row).includes(this.selectedCategory));
    //   this.selectedEquipmentNumId = equipmentRow[0]?.[this.selectedCategory]?.equipment_id
    //   this.getEquipmentTaskDetails(this.unitName,this.selectedCategory)
    // }
  }

  onTreeAction(event: any) {
    const index = event.rowIndex;
    const row = event.row;
    if (row.treeStatus === 'collapsed') {
      row.treeStatus = 'expanded';
    } else {
      row.treeStatus = 'collapsed';
    }
    this.rows = [...this.rows];
  }
  toggleExpandGroup(group) {
    // this.groupExpansionDefaultStatus = false;
    // this.table.groupHeader.toggleExpandGroup(group);
  }

  onDetailToggle(event) {
  }

  navigateToTask(row: any, task?: any) {
    console.log(row, task)
    let taskRow
    if (task) {
      taskRow = task
    } else {
      // taskId = row?.id
      taskRow = row
    }

    sessionStorage.setItem('navigatingToTask', JSON.stringify([{ unit_id: taskRow.unit, equipment_category_id: taskRow.equipment_category, department_id: taskRow.department, task_id: taskRow.id }]));
    sessionStorage.setItem('unit-navigation-id', JSON.stringify(taskRow.unit))
    sessionStorage.setItem('selectedTab', 'task')
    this.dataService.passUnitTabs({ 'tab': 'task', 'data': { 'task_id': taskRow.id } })
  }


  navigateToIssues(issue) {
    sessionStorage.setItem('navigatingToIssue', JSON.stringify([{ unit_id: this.unitId, department_id: this.departmentId, issue_number: issue.id }]));
    this.router.navigateByUrl('/schedule-control/issues');
  }


  getEquipmentName(row: any, task) {

    // Assuming there's only one property in the row object
    // return Object.keys(row)[0];
  }

  toggleOnly = false
  onCategoryClick(categoryKey) {
    this.toggleOnly = categoryKey?.categoryName == this.selectedEquipmentCategory ? true : false
    this.taskSelected = false
    this.selectedEquipmentCategory = categoryKey?.categoryName
    // categoryKey.istoggled = !categoryKey.istoggled
    if (!this.toggleOnly) {
      this.selectedPlanCategory(categoryKey?.categoryName);
    }
    this.showMap = true
  }

  onToggleClick(categoryKey) {
    categoryKey.istoggled = !categoryKey.istoggled
    // this.selectedPlanCategory(categoryKey?.categoryName);
  }




  modalHeader
  getSOP(obj, modal) {
    this.isPdfLoaded = false

    this.modalHeader = "Standard operation procedure"
    let equipmentNumId = this.selectedEquipmentNumId
    this.dataService.passSpinnerFlag(true, true);
    this.taskService.gettaskSOP(null, equipmentNumId).subscribe(
      (data: any) => {
        this.pdfData = data
        this.isPdfLoaded = true
        this.open(obj, modal)
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
    this.taskService.getDrawing(this.selectedEquipmentNumId).subscribe(
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


  open(content: any, modalClass?: any) {


    this.modalService
      .open(content, {
        ariaLabelledBy: 'modal-basic-title',
        windowClass: modalClass,
      })
      .result.then((result) => { });


  }

  onRecommendationChange() {

    this.observationsRecommendationsToggle = !this.observationsRecommendationsToggle
    if (this.observationsRecommendationsToggle) {
      this.observationRecommendationRows = this.recommendationRows
    } else {
      this.observationRecommendationRows = this.observationRows
    }
  }

  getEquipmentChecklist() {
    this.dataService.passSpinnerFlag(true, true);
    this.availableChecklists = [];
    this.activityMonitorService.getEquipmentChecklistGroupings(this.equipmentId).subscribe((res: any) => {
      if (res) {
        this.availableChecklists = res;
        this.selectedChecklistId = (res.length > 0) ? ((res[0].checklists.length > 0) ? res[0].checklists[0].id : null) : null;
        if (this.selectedChecklistId != null) {
          this.getSelectedChecklistDetails();
        }
        else {
          // this.dataService.passSpinnerFlag(false, true);
        }
      }
    }, error => {
      this.dataService.passSpinnerFlag(false, true);
      this.msg = 'Unable to fetch equipment checklists.';
      this.snackbarService.show(this.msg, true, false, false, false);
    },
      () => {
        // this.dataService.passSpinnerFlag(false, true);
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
      this.userDepartment = data[0]?.department__name;
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


  departments
  vendors
  selectedVendor
  selectedDepartment
  filterEquipment
  getDepartmentList() {
    this.taskService.getDepartment(this.unitName, this.selectedEquipmentCategory).subscribe((data) => {
      this.departments = data
      this.departments[0] = "ALL department"
      this.selectedDepartment = this.departments[0]
      console.log(this.departments)
    },
      (error) => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      })
  }

  getVendorsList() {

    this.taskService.getVendorList().subscribe({
      next: (data: any) => {
        this.vendors = data
        this.vendors.unshift({ id: "All", name: "All Vendors" })
        this.selectedVendor = this.vendors[0]
        console.log(this.vendors)
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






  onFilter() {
    // case: No search term is there
    if (!this.searchTerm.length) {
      this.filteredCategoryKeyList = this.categoryKeyList
      this.filteredEquipmentList = this.category
      return
    }

    // clear out the filters after everysearch
    this.filteredCategoryKeyList = []
    this.filteredEquipmentList = []
    this.matchingItems = []

    // filter the categoryKey [NOT REQUIRED FOR EQUIPMENT SEARCH]
    this.filteredCategoryKeyList = this.categoryKeyList.filter(item => item.categoryName.toLowerCase().includes(this.searchTerm?.toLowerCase()));

    // Go through all the equipment category and find the matches
    for (const key in this.category) {
      if (Object.prototype.hasOwnProperty.call(this.category, key)) {
        const list: string[] = this.category[key];
        const matchingList = list.filter(item => item.toLowerCase().includes(this.searchTerm.toLowerCase()));
        if (matchingList.length > 0) {
          this.matchingItems[key] = matchingList
        }
      }
    }

    //assign the filtered list
    this.filteredCategoryKeyList = Object.keys(this.matchingItems).map(item => { return { categoryName: item, istoggled: true } })
    this.filteredEquipmentList = this.matchingItems

  }

  navigateToParticularIssue(issue) {
    sessionStorage.setItem('navigatingToIssue', JSON.stringify([{ unit_id: this.unitId, department_id: null, issue_number: issue.issue_number }]));
    sessionStorage.setItem('storeSeletedPage', 'allIsuues');
    this.router.navigateByUrl('schedule-control/issues');
  }

  // checkIfTaskAvailable(row,taskname){
  //
  //   const isTaskAvailable row?.tasksAvailable?.split('#')[0]?.trim().includes(taskname) ? true : false
  //   return isTaskAvailable
  // }
  showDropdown = false
  toggleDropdown() {
    this.showDropdown = !this.showDropdown
  }
  taskHeaderWithCount
  getTaskHeaders() {
    let department;
    if (this.selectedDepartment == "ALL department") {
      department = "All"
    }
    else {
      department = this.selectedDepartment
    }
    this.taskService.getTaskHeaders(this.unitId, this.selectedEquipmentCategory, department, null, this.taskCategory?.id, this.selectedVendor?.id).subscribe((data) => {
      if (data['equipment_overview_headers']?.length) {
        // this.taskHeaders = data['equipment_overview_headers']
        this.taskHeaderWithCount = data['equipment_category_overview_task_count']
      }
      else {
        if (!this.equipmentTaskHeadersWithCount[this.selectedEquipmentCategory]) {
          // this.taskHeaders = this.rows.filter(item => !item.is_surprise).map(item => item.name)
          this.taskHeaderWithCount = this.rows
            .filter(item => !item.is_surprise)
            .map(item => {
              return {
                label: item.name,
                total_task_count: null,
                completed_task_count: null
              };
            });
        }
        else {
          // this.taskHeaders = this.equipmentTaskHeaders[this.selectedEquipmentCategory]
          this.taskHeaderWithCount = this.equipmentTaskHeadersWithCount[this.selectedEquipmentCategory]
        }
      }
      console.log(this.taskHeaderWithCount)
    },
      error => {
        this.dataService.passSpinnerFlag(false, true);
        this.msg = 'Error occured. Please try again.';
        this.snackbarService.show(this.msg, true, false, false, false);
      })
  }

  selectedEquipmentIds: string[] = [];

  onCheckboxChange(event: Event) {

    const checkbox = event.target as HTMLInputElement;
    const equipmentId = checkbox.value;
    // const equipmentId =  this.equipmentList[0]?.[equipment]?.equipment_id


    if (checkbox.checked) {
      if (!this.selectedEquipmentIds.includes(equipmentId)) {
        this.selectedEquipmentIds.push(equipmentId);
      }
    } else {
      const index = this.selectedEquipmentIds.indexOf(equipmentId);
      if (index !== -1) {
        this.selectedEquipmentIds.splice(index, 1);
      }
    }
  }

  onEquipmentFilterApply() {

    this.getFilteredTaskDetails(this.unitName, this.selectedEquipmentCategory, null, this.selectedDepartment, this.selectedEquipmentIds, this.selectedVendor?.id)

  }
  onItemSelect(data) {
    // this.issueTypeIds = [];
    // console.log(data, this.statusFilter)
    // this.statusFilter.forEach((element) => {
    //   this.issueTypeIds.push(element?.id)
    // });
  }

  onItemDeSelect(data) {
    // this.issueTypeIds = []
    // console.log(data, this.statusFilter)
    // this.statusFilter.forEach((element) => {
    //   this.issueTypeIds.push(element?.id)
    // });
  }

}









