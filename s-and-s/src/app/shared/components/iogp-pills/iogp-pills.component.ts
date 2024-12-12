///////////////////////////////////////////////////////////////////////////////
// Filename : iogp-pills.component.ts
// Description : Renders pill for categories available in Observations
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
  selector: 'app-iogp-pills',
  templateUrl: './iogp-pills.component.html',
  styleUrls: ['./iogp-pills.component.css']
})
export class IogpPillsComponent {

  @Input() category: any;
  @Input() imgHeight: any;
  id: string = '';
  categoryStyle: any;
  categoryDetails: any;

  constructor(private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) { }

  ngOnChanges() {
    console.log(this.category,"this.category");
    
    this.categoryDetails = this.safetyAndSurveillanceCommonService.getCategoryDetails(this.category);
    this.categoryStyle = {
      height: this.imgHeight + 'px'
    }

  }

}
