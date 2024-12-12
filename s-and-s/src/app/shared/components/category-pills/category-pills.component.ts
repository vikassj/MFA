///////////////////////////////////////////////////////////////////////////////
// Filename : category-pills.component.ts
// Description : Renders pill for categories available in Housekeeping, Work at Height and Inspection
// Revision History:
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Component, Input } from '@angular/core';

import { SafetyAndSurveillanceCommonService } from '../../service/common.service';

@Component({
  selector: 'app-category-pills',
  templateUrl: './category-pills.component.html',
  styleUrls: ['./category-pills.component.css']
})
export class CategoryPillsComponent {

  @Input() category: any;
  categoryStyle: any;
  pillTitle: any;

  constructor(private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) {
   }

  ngOnChanges() {
    this.pillTitle = this.safetyAndSurveillanceCommonService.getAbbreviationValue(this.category);
    let color = this.safetyAndSurveillanceCommonService.getColorValue(this.category);
    this.categoryStyle = {
      color: color,
      border: '1px solid ' + color
    }

  }

}
