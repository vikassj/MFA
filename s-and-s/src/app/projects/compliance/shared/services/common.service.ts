///////////////////////////////////////////////////////////////////////////////
// Filename : common.service.ts
// Description : Functionalities that are used across all the components
// Revision History:
// Version  | Date        |  Change Description
// ---------------------------------------------
// 1.0      | 01-Jul-2019 |  Single Unit First Production Release
// 2.0      | 31-Jul-2019 |  Single Unit Second Production Release
// 3.0      | 01-Nov-2019 |  Multi Unit Production Release
// 4.0      | 06-Jan-2020 |  Release for Copyright
// Copyright : Detect Technologies Pvt Ltd.
///////////////////////////////////////////////////////////////////////////////

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

import { CommonService } from 'src/shared/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class CovidSolutionsCommonService {

  colorMapper = new Map();
  abbreviationMapper = new Map();
  categories: any[] = [];
  colorMap: any[] = [
    [
      "Closed",
      "#28a745"
    ],
    [
      "PPE",
      "#fc5600"
    ],
    [
      "HC",
      "#007183"
    ],
    [
      "W@H",
      "#c24885"
    ],
    [
      "HK",
      "#1c92ff"
    ],
    [
      "CSC",
      "#ff0000"
    ],
    [
      "FO",
      "#dca716"
    ],
    [
      "L&H",
      "#5f5f5f"
    ],
    [
      "VS",
      "#22aeff"
    ],
    [
      "Open",
      "#dc3545"
    ],
    [
      "Flights",
      "#0069d9"
    ]
  ];
  public abbreviationMap: any[] = [
    [
      "PPE",
      "Personal Protective Equipment1"
    ],
    [
      "HC",
      "Job Safety"
    ],
    [
      "W@H",
      "Work at Height"
    ],
    [
      "HK",
      "Housekeeping"
    ],
    [
      "CSC",
      "Confined Space Entry"
    ],
    [
      "FO",
      "Dropped Objects"
    ],
    [
      "L&H",
      "Lifting and Hoisting"
    ],
    [
      "VS",
      "Construction Traffic Interference"
    ]
  ];
  constructor(private http: HttpClient, private commonService: CommonService) {
    this.fetchModuleConfigurationsData();
  }

  fetchModuleConfigurationsData() {
    this.commonService.readModuleConfigurationsData('compliance').subscribe(data => {
      this.colorMap.forEach(item => {
        this.colorMapper.set(item[0], item[1]);
      });
      this.abbreviationMap.forEach(item => {
        this.abbreviationMapper.set(item[0], item[1]);
      });
      this.categories = data['violationCategories'];
    })
  }

  fetchLocations() {
    let url = sessionStorage.getItem('apiUrl') + 'covid/units_list/';
    return this.http.get(url).pipe(map(
      data => {
        return data;
      }
    ));
  }

  getColorValue(category: string) {
    return this.colorMapper.get(category);
  }

  getAbbreviationValue(category) {
    return this.abbreviationMapper.get(category);
  }

  getCategoryDetails(category) {
    let categoryDetails = this.categories.find(item => item.acronym === category);
    return (categoryDetails) ? categoryDetails : category;
  }

}
