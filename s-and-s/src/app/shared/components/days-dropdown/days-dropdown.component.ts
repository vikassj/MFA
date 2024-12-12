import { Component, EventEmitter, Input, OnInit, Output, Renderer2, SimpleChanges } from '@angular/core';

import { SafetyAndSurveillanceDataService } from '../../service/data.service';

@Component({
  selector: 'app-days-dropdown',
  templateUrl: './days-dropdown.component.html',
  styleUrls: ['./days-dropdown.component.css']
})
export class DaysDropdownComponent implements OnInit {

  @Input() dropdownList: any[] = [];
  @Input() selectedInterval: string = '';
  @Output() selectedDropdown: EventEmitter<any> = new EventEmitter();
  sCurveDropdown: boolean = false;
  menuBtnClick: boolean = false;
  dropdownSelect: string = '';
  dropdownWidth: number = 100;
  disableDropdown: boolean = true;
  constructor(private renderer: Renderer2, private safetyAndSurveillanceDataService: SafetyAndSurveillanceDataService) {

    window.addEventListener('disable-inputs', (evt) => {
      this.disableDropdown = false
    })

    window.addEventListener('enable-inputs', (evt) => {
      this.disableDropdown = true
    })

    this.renderer.listen('window', 'click', (e: Event) => {
      if (!this.menuBtnClick) {
        this.sCurveDropdown = false;
      }
      this.menuBtnClick = false;
    });
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.selectedInterval && this.dropdownList.includes(this.selectedInterval)) {
      this.unitNameSelect(this.selectedInterval, false)
    }
    else {
      this.unitNameSelect(this.dropdownList[0], false)
    }
  }

  preventCloseOnClick() {
    this.menuBtnClick = true;
  }

  /**
   * show and hide the unit dropdown.
   */
  dropdownShow() {
    this.sCurveDropdown = !this.sCurveDropdown;
  }

  /**
   * select unit from units dropdown list.
   */
  unitNameSelect(unitName, boolean) {
    if (unitName == "Custom") {
      let selectedDate = {}
      this.safetyAndSurveillanceDataService.getSelectedDates.subscribe(selectedDates => {
        selectedDate = selectedDates;
      })
      if (!(selectedDate['startDate'] && selectedDate['endDate']) || boolean) {
        this.safetyAndSurveillanceDataService.passSelectedDates("", "");
      }
    }
    this.dropdownSelect = unitName;
    if (this.dropdownSelect) {

      this.selectedDropdown.emit(this.dropdownSelect)
    }

    let number = 0;
    this.dropdownList.forEach(element => {
      if (number < element.length) {
        number = element.length;
      }
    });
    let width = number * 12;
    if (this.dropdownWidth < width) {
      this.dropdownWidth = width;
    }
    this.sCurveDropdown = false;
  }

}
