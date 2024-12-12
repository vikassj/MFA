import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterData'
})
export class FilterPipe implements PipeTransform {

  transform(masterRecords: any[], searchString: string, searchParams: any[]): any {
    if (masterRecords?.length === 0) {
      return [];
    }
    else if (searchString === "") {
      return masterRecords;
    }
    else {
      return masterRecords?.filter(item => searchParams.some(data => (item[data] === null || item[data] === undefined) ? '' : item[data].toString().toLowerCase().includes(searchString.toLowerCase())));
    }
  }

}
