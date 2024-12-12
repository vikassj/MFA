import { Component, EventEmitter, Input, OnInit, Output, Pipe, PipeTransform, SimpleChanges, Renderer2 } from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() dropdownList: any[] = [];
  @Input() selectedUnit: string = '';
  @Output() selectedDropdown: EventEmitter<any> = new EventEmitter();
  sCurveDropdown: boolean = false;
  menuBtnClick: boolean = false;
  dropdownSelect: string = '';
  dropdownWidth: number = 100;
  constructor(private renderer: Renderer2) {
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
    if (this.selectedUnit && this.dropdownList.includes(this.selectedUnit)) {
      this.unitNameSelect(this.selectedUnit)
    }
    else {
      this.unitNameSelect(this.dropdownList[0])
    }
  }


  preventCloseOnClick() {
    this.menuBtnClick = true;
  }

  /**
   * show and hide the unit dropdown list.
   */
  dropdownShow() {
    this.sCurveDropdown = !this.sCurveDropdown;
  }

  /**
   * select unit from units dropdown list.
   */
  unitNameSelect(unitName) {
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

@Pipe({
  name: 'dropdownFideInfo',
  pure: true,
})
export class DropdownHideInfoPipe implements PipeTransform {
  locale: string;
  transform(value: any, ...args: any) {
    if (value) {
      let val: string = value + '';
      if (val && val.length >= 15) {
        val = val.slice(0, 14) + "...";
      }
      return val;
    }
    else {
      return '';
    }
  }
}
