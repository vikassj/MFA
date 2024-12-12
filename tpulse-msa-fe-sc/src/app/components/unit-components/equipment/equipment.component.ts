import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-equipment',
  templateUrl: './equipment.component.html',
  styleUrls: ['./equipment.component.scss']
})
export class EquipmentComponent implements OnInit {
  @Input() unit: any;
  @Input() department: string;
  @Input() taskCategory:any;
  selectedTab: any = sessionStorage.getItem('selectedEquipmentTab') ? sessionStorage.getItem('selectedEquipmentTab') : 'equipment';
  constructor() { }

  ngOnInit(): void {
  }

  ngOnChanges() {
    
    console.log(this.department)
    console.log(this.taskCategory)
  }

  getSelectedTab(tabName: string) {
    this.selectedTab = tabName;
    sessionStorage.setItem('selectedEquipmentTab', this.selectedTab);
  }

}
