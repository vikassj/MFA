import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { DataService } from 'src/shared/services/data.service';
@Component({
  selector: 'app-plan',
  templateUrl: './plan.component.html',
  styleUrls: ['./plan.component.scss']
})
export class PlanComponent implements OnInit {
  @Input() selectedUnit: any;
  @Input() selectedDepartment: any;
  @Input() selectedEquipmentCategory: any;
  @Input() selectedEquipment: any;
  @Input() equipments: any[];
  @Input() selectedVendor: any[];
  @Output() tabSelect: EventEmitter<any> = new EventEmitter()

  selectedTab: any = sessionStorage.getItem('selectedSubTab') ? sessionStorage.getItem('selectedSubTab') : 'gantt-chart';
  constructor(private dataService: DataService) {
    // this.dataService.passCreateTask('no',true)
  }

  ngOnInit(): void {
    this.getSelectedTab(this.selectedTab);
  }
  // createSurprise(){
  //   this.dataService.passCreateTask('yes',true)
  // }

  ngOnChanges() {
    console.log(this.selectedVendor)
  }
  getSelectedTab(tabName: string) {
    this.selectedTab = tabName;

    this.dataService.passPlanTabs({ 'tab': tabName, 'data': {} });
    sessionStorage.setItem('selectedSubTab', this.selectedTab);
    if (tabName == 's-curve') {
      this.tabSelect.emit(false)
    }
    else {
      this.tabSelect.emit(true)
    }

    console.log(this.selectedTab)
  }

}
