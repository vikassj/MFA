import { Pipe, PipeTransform } from '@angular/core';

import { SafetyAndSurveillanceCommonService } from '../service/common.service';

@Pipe({
  name: 'iogpName'
})
export class IogpNamePipe implements PipeTransform {

  constructor(private safetyAndSurveillanceCommonService: SafetyAndSurveillanceCommonService) {
  }

  transform(category: any): any {
    if (category) {
      let categoryName = this.safetyAndSurveillanceCommonService.getCategoryDetails(category).name;
      return (categoryName) ? categoryName : category;
    }
    else {
      return category;
    }
  }

}
