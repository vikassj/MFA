import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'riskFilter'
})
export class RiskFilterPipe implements PipeTransform {

  transform(masterRecords: any[], filterOptions: any[]): any {
    if (filterOptions?.length === 0) {
      return masterRecords;
    }
    else {
      return masterRecords.filter(item => filterOptions?.indexOf(item.ratingDetails.rating) > -1);
    }
  }

}
